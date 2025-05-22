# STL
import asyncio
import logging
from typing import Set, Tuple
from urllib.parse import urlparse

# PDM
from lxml import etree
from playwright.async_api import Page

# LOCAL
from api.backend.job.scraping.collect_media import collect_media as collect_media_utils

LOG = logging.getLogger("Job")


async def scrape_content(
    id: str, page: Page, pages: Set[Tuple[str, str]], collect_media: bool
) -> str:
    last_height = await page.evaluate("document.body.scrollHeight")

    while True:
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight);")
        await asyncio.sleep(3)
        new_height = await page.evaluate("document.body.scrollHeight")

        if new_height == last_height:
            break

        last_height = new_height

    html = await page.content()
    pages.add((html, page.url))

    if collect_media:
        LOG.info("Collecting media")
        await collect_media_utils(id, page)

    return html


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
