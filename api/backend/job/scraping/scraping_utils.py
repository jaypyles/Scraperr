import asyncio
from typing import Set, Tuple
from playwright.async_api import Page

from api.backend.utils import LOG

from api.backend.job.scraping.collect_media import collect_media as collect_media_utils


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


def clean_format_characters(text: str) -> str:
    text = text.strip()
    text = text.replace("\n", " ")
    text = text.replace("\t", " ")
    text = text.replace("\r", " ")
    text = text.replace("\f", " ")
    text = text.replace("\v", " ")
    text = text.replace("\b", " ")
    text = text.replace("\a", " ")

    return text
