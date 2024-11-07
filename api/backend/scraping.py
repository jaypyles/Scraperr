import logging
from typing import Any, Optional
import time

from bs4 import BeautifulSoup
from lxml import etree
from seleniumwire import webdriver
from lxml.etree import _Element  # type: ignore [reportPrivateImport]
from fake_useragent import UserAgent
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.chrome.service import Service
from urllib.parse import urlparse, urljoin

from api.backend.models import Element, CapturedElement

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

    return _interceptor


def create_driver():
    ua = UserAgent()
    chrome_options = ChromeOptions()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument(f"user-agent={ua.random}")

    return webdriver.Chrome(options=chrome_options)


async def make_site_request(
    url: str,
    headers: Optional[dict[str, Any]],
    multi_page_scrape: bool = False,
    visited_urls: set[str] = set(),
    pages: set[tuple[str, str]] = set(),
    original_url: str = "",
) -> None:
    """Make basic `GET` request to site using Selenium."""
    # Check if URL has already been visited
    if url in visited_urls:
        return

    driver = create_driver()
    driver.implicitly_wait(10)

    if headers:
        driver.request_interceptor = interceptor(headers)

    try:
        LOG.info(f"Visiting URL: {url}")
        driver.get(url)
        final_url = driver.current_url
        visited_urls.add(url)
        visited_urls.add(final_url)
        _ = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

        last_height = driver.execute_script("return document.body.scrollHeight")
        while True:
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")

            time.sleep(2)  # Wait for the page to load
            new_height = driver.execute_script("return document.body.scrollHeight")

            if new_height == last_height:
                break

            last_height = new_height

        driver.execute_script("return document.body.scrollHeight")
        page_source = driver.page_source

        LOG.debug(f"Page source for url: {url}\n{page_source}")
        pages.add((page_source, final_url))
    finally:
        driver.quit()

    if not multi_page_scrape:
        return

    soup = BeautifulSoup(page_source, "html.parser")

    for a_tag in soup.find_all("a"):
        link = a_tag.get("href")

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
            text = "\t".join(str(t) for t in e.itertext())
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
    )

    elements: list[dict[str, dict[str, list[CapturedElement]]]] = list()

    for page in pages:
        elements.append(await collect_scraped_elements(page, xpaths))

    return elements
