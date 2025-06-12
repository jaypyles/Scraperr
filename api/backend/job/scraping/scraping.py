# STL
import random
import logging
from typing import Any, cast
from urllib.parse import urljoin, urlparse

# PDM
from bs4 import Tag, BeautifulSoup
from lxml import etree
from camoufox import AsyncCamoufox
from playwright.async_api import Page

# LOCAL
from api.backend.constants import RECORDINGS_ENABLED
from api.backend.job.models import Element, CapturedElement
from api.backend.job.utils.text_utils import clean_text
from api.backend.job.scraping.add_custom import add_custom_items
from api.backend.job.scraping.scraping_utils import (
    sxpath,
    is_same_domain,
    scrape_content,
)
from api.backend.job.site_mapping.site_mapping import handle_site_mapping

LOG = logging.getLogger("Job")


async def make_site_request(
    id: str,
    url: str,
    job_options: dict[str, Any],
    visited_urls: set[str] = set(),
    pages: set[tuple[str, str]] = set(),
    original_url: str = "",
):
    headers = job_options["custom_headers"]
    multi_page_scrape = job_options["multi_page_scrape"]
    proxies = job_options["proxies"]
    site_map = job_options["site_map"]
    collect_media = job_options["collect_media"]
    custom_cookies = job_options["custom_cookies"]

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
            await page.wait_for_load_state("networkidle")

            final_url = page.url

            visited_urls.add(url)
            visited_urls.add(final_url)

            html_content = await scrape_content(id, page, pages, collect_media)

            html_content = await page.content()
            pages.add((html_content, final_url))

            if site_map:
                await handle_site_mapping(
                    id, site_map, page, pages, collect_media=collect_media
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
                job_options=job_options,
                visited_urls=visited_urls,
                pages=pages,
                original_url=original_url,
            )


async def collect_scraped_elements(
    page: tuple[str, str], xpaths: list[Element], return_html: bool
):
    soup = BeautifulSoup(page[0], "lxml")
    root = etree.HTML(str(soup))

    elements: dict[str, list[CapturedElement]] = {}

    for elem in xpaths:
        el = sxpath(root, elem.xpath)

        for e in el:  # type: ignore
            if return_html:
                elements[elem.name] = [
                    CapturedElement(
                        xpath=elem.xpath,
                        text=page[0],
                        name=elem.name,
                    )
                ]
                continue

            text = (
                " ".join(str(t) for t in e.itertext())
                if isinstance(e, etree._Element)
                else str(e)  # type: ignore
            )

            text = clean_text(text)

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
    job_options: dict[str, Any],
):
    visited_urls: set[str] = set()
    pages: set[tuple[str, str]] = set()

    await make_site_request(
        id,
        url,
        job_options=job_options,
        visited_urls=visited_urls,
        pages=pages,
        original_url=url,
    )

    elements: list[dict[str, dict[str, list[CapturedElement]]]] = []

    for page in pages:
        elements.append(
            await collect_scraped_elements(
                page, xpaths, job_options.get("return_html", False)
            )
        )

    return elements
