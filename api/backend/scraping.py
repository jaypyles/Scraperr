import logging
import random
from typing import Any, Optional, cast

from bs4 import BeautifulSoup, Tag
from lxml import etree
from camoufox import AsyncCamoufox
from playwright.async_api import Page
from urllib.parse import urlparse, urljoin

from api.backend.models import Element, CapturedElement
from api.backend.job.scraping.scraping_utils import scrape_content
from api.backend.job.site_mapping.site_mapping import handle_site_mapping

from api.backend.job.scraping.add_custom import add_custom_items

from api.backend.constants import RECORDINGS_ENABLED

LOG = logging.getLogger(__name__)


def is_same_domain(url: str, original_url: str) -> bool:
    parsed_url = urlparse(url)
    parsed_original_url = urlparse(original_url)
    return parsed_url.netloc == parsed_original_url.netloc or parsed_url.netloc == ""


def clean_xpath(xpath: str) -> str:
    parts = xpath.split("/")
    clean_parts = ["/" if part == "" else part for part in parts]
    clean_xpath = "//".join(clean_parts).replace("////", "//").replace("'", "\\'")
    LOG.info(f"Cleaned xpath: {clean_xpath}")

    return clean_xpath


def sxpath(context: etree._Element, xpath: str):
    return context.xpath(xpath)


async def make_site_request(
    id: str,
    url: str,
    headers: Optional[dict[str, Any]],
    multi_page_scrape: bool = False,
    visited_urls: set[str] = set(),
    pages: set[tuple[str, str]] = set(),
    original_url: str = "",
    proxies: Optional[list[str]] = None,
    site_map: Optional[dict[str, Any]] = None,
    collect_media: bool = False,
    custom_cookies: Optional[list[dict[str, Any]]] = None,
):
    if url in visited_urls:
        return

    proxy = None

    if proxies:
        proxy = random.choice(proxies)
        LOG.info(f"Using proxy: {proxy}")

    async with AsyncCamoufox(headless=not RECORDINGS_ENABLED, proxy=proxy) as browser:
        page: Page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1080})

        # Add cookies and headers
        await add_custom_items(url, page, custom_cookies, headers)

        LOG.info(f"Visiting URL: {url}")

        try:
            await page.goto(url, timeout=60000)

            final_url = page.url

            visited_urls.add(url)
            visited_urls.add(final_url)

            html_content = await scrape_content(id, page, pages, collect_media)

            html_content = await page.content()
            pages.add((html_content, final_url))

            if site_map:
                await handle_site_mapping(
                    site_map, page, pages, collect_media=collect_media
                )

        finally:
            await page.close()
            await browser.close()

    if not multi_page_scrape:
        return

    soup = BeautifulSoup(html_content, "html.parser")

    for a_tag in soup.find_all("a"):
        if not isinstance(a_tag, Tag):
            continue

        link = cast(str, a_tag.get("href", ""))

        if not link:
            continue

        if not urlparse(link).netloc:
            base_url = "{0.scheme}://{0.netloc}".format(urlparse(final_url))
            link = urljoin(base_url, link)

        if link not in visited_urls and is_same_domain(link, original_url):
            await make_site_request(
                id,
                link,
                headers=headers,
                multi_page_scrape=multi_page_scrape,
                visited_urls=visited_urls,
                pages=pages,
                original_url=original_url,
                proxies=proxies,
                site_map=site_map,
                collect_media=collect_media,
                custom_cookies=custom_cookies,
            )


async def collect_scraped_elements(page: tuple[str, str], xpaths: list[Element]):
    soup = BeautifulSoup(page[0], "lxml")
    root = etree.HTML(str(soup))

    elements: dict[str, list[CapturedElement]] = {}

    for elem in xpaths:
        el = sxpath(root, elem.xpath)

        for e in el:  # type: ignore
            text = (
                " ".join(str(t) for t in e.itertext())
                if isinstance(e, etree._Element)
                else str(e)  # type: ignore
            )

            text = text.strip()
            text = text.replace("\n", " ")
            text = text.replace("\t", " ")
            text = text.replace("\r", " ")
            text = text.replace("\f", " ")
            text = text.replace("\v", " ")
            text = text.replace("\b", " ")
            text = text.replace("\a", " ")

            captured_element = CapturedElement(
                xpath=elem.xpath, text=text, name=elem.name
            )

            if elem.name in elements:
                elements[elem.name].append(captured_element)
            else:
                elements[elem.name] = [captured_element]

    return {page[1]: elements}


async def scrape(
    id: str,
    url: str,
    xpaths: list[Element],
    headers: Optional[dict[str, Any]] = None,
    multi_page_scrape: bool = False,
    proxies: Optional[list[str]] = None,
    site_map: Optional[dict[str, Any]] = None,
    collect_media: bool = False,
    custom_cookies: Optional[list[dict[str, Any]]] = None,
):
    visited_urls: set[str] = set()
    pages: set[tuple[str, str]] = set()

    await make_site_request(
        id,
        url,
        headers=headers,
        multi_page_scrape=multi_page_scrape,
        visited_urls=visited_urls,
        pages=pages,
        original_url=url,
        proxies=proxies,
        site_map=site_map,
        collect_media=collect_media,
        custom_cookies=custom_cookies,
    )

    elements: list[dict[str, dict[str, list[CapturedElement]]]] = []

    for page in pages:
        elements.append(await collect_scraped_elements(page, xpaths))

    return elements
