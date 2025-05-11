import logging
import time
from typing import Any, Optional
import random

from bs4 import BeautifulSoup, Tag
from lxml import etree
from seleniumwire import webdriver
from lxml.etree import _Element
from fake_useragent import UserAgent
from selenium.webdriver.chrome.options import Options as ChromeOptions
from urllib.parse import urlparse, urljoin
from api.backend.models import Element, CapturedElement
from api.backend.job.site_mapping.site_mapping import (
    handle_site_mapping,
)
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from api.backend.job.scraping.scraping_utils import scrape_content

LOG = logging.getLogger(__name__)


class HtmlElement(_Element): ...


def is_same_domain(url: str, original_url: str) -> bool:
    parsed_url = urlparse(url)
    parsed_original_url = urlparse(original_url)
    return parsed_url.netloc == parsed_original_url.netloc or parsed_url.netloc == ""


def clean_xpath(xpath: str) -> str:
    parts = xpath.split("/")
    clean_parts: list[str] = []
    for part in parts:
        if part == "":
            clean_parts.append("/")
        else:
            clean_parts.append(part)
    clean_xpath = "//".join(clean_parts).replace("////", "//")
    clean_xpath = clean_xpath.replace("'", "\\'")
    LOG.info(f"Cleaned xpath: {clean_xpath}")
    return clean_xpath


def sxpath(context: _Element, xpath: str) -> list[HtmlElement]:
    return context.xpath(xpath)  # pyright: ignore [reportReturnType]


def interceptor(headers: dict[str, Any]):
    def _interceptor(request: Any):
        for key, val in headers.items():
            if request.headers.get(key):
                del request.headers[key]
            request.headers[key] = val

        if "sec-ch-ua" in request.headers:
            original_value = request.headers["sec-ch-ua"]
            del request.headers["sec-ch-ua"]
            modified_value = original_value.replace("HeadlessChrome", "Chrome")
            request.headers["sec-ch-ua"] = modified_value

        LOG.debug(f"Request headers: {request.headers}")

    return _interceptor


def create_driver(proxies: Optional[list[str]] = []):
    ua = UserAgent()
    chrome_options = ChromeOptions()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument(f"user-agent={ua.random}")

    sw_options = {}

    if proxies:
        selected_proxy = random.choice(proxies)
        LOG.info(f"Using proxy: {selected_proxy}")

        sw_options = {
            "proxy": {
                "https": f"https://{selected_proxy}",
                "http": f"http://{selected_proxy}",
                "no_proxy": "localhost,127.0.0.1",
            }
        }

    service = Service(ChromeDriverManager().install())

    driver = webdriver.Chrome(
        service=service,
        options=chrome_options,
        seleniumwire_options=sw_options,
    )

    return driver


async def make_site_request(
    url: str,
    headers: Optional[dict[str, Any]],
    multi_page_scrape: bool = False,
    visited_urls: set[str] = set(),
    pages: set[tuple[str, str]] = set(),
    original_url: str = "",
    proxies: Optional[list[str]] = [],
    site_map: Optional[dict[str, Any]] = None,
    collect_media: bool = False,
) -> None:
    """Make basic `GET` request to site using Selenium."""
    # Check if URL has already been visited
    if url in visited_urls:
        return

    driver = create_driver(proxies)
    driver.implicitly_wait(10)

    if headers:
        driver.request_interceptor = interceptor(headers)

    try:
        LOG.info(f"Visiting URL: {url}")
        driver.get(url)

        time.sleep(10)  # Let content load

        final_url = driver.current_url
        visited_urls.add(url)
        visited_urls.add(final_url)

        page_source = scrape_content(driver, pages, collect_media)

        LOG.debug(f"Page source: {page_source}")

        if site_map:
            LOG.info("Site map: %s", site_map)
            _ = await handle_site_mapping(
                site_map,
                driver,
                pages,
            )
    finally:
        driver.quit()

    if not multi_page_scrape:
        return

    soup = BeautifulSoup(page_source, "html.parser")

    for a_tag in soup.find_all("a"):
        if not isinstance(a_tag, Tag):
            continue

        link = str(a_tag.get("href", ""))

        if link:
            if not urlparse(link).netloc:
                base_url = "{0.scheme}://{0.netloc}".format(urlparse(final_url))
                link = urljoin(base_url, link)

            if link not in visited_urls and is_same_domain(link, original_url):
                await make_site_request(
                    link,
                    headers=headers,
                    multi_page_scrape=multi_page_scrape,
                    visited_urls=visited_urls,
                    pages=pages,
                    original_url=original_url,
                )


async def collect_scraped_elements(page: tuple[str, str], xpaths: list[Element]):
    soup = BeautifulSoup(page[0], "lxml")
    root = etree.HTML(str(soup))

    elements: dict[str, list[CapturedElement]] = dict()

    for elem in xpaths:
        el = sxpath(root, elem.xpath)

        for e in el:
            if isinstance(e, etree._Element):  # type: ignore
                text = "\t".join(str(t) for t in e.itertext())
            else:
                text = str(e)
            captured_element = CapturedElement(
                xpath=elem.xpath, text=text, name=elem.name
            )

            if elem.name in elements:
                elements[elem.name].append(captured_element)
                continue

            elements[elem.name] = [captured_element]

    return {page[1]: elements}


async def scrape(
    url: str,
    xpaths: list[Element],
    headers: Optional[dict[str, Any]],
    multi_page_scrape: bool = False,
    proxies: Optional[list[str]] = [],
    site_map: Optional[dict[str, Any]] = None,
    collect_media: bool = False,
):
    visited_urls: set[str] = set()
    pages: set[tuple[str, str]] = set()

    _ = await make_site_request(
        url,
        headers,
        multi_page_scrape=multi_page_scrape,
        visited_urls=visited_urls,
        pages=pages,
        original_url=url,
        proxies=proxies,
        site_map=site_map,
        collect_media=collect_media,
    )

    elements: list[dict[str, dict[str, list[CapturedElement]]]] = list()

    for page in pages:
        elements.append(await collect_scraped_elements(page, xpaths))

    return elements
