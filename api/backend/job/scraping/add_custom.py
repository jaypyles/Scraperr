# STL
import logging
from typing import Any, Optional
from urllib.parse import urlparse

# PDM
from playwright.async_api import Page, BrowserContext

LOG = logging.getLogger("Job")


async def add_custom_cookies(
    custom_cookies: list[dict[str, Any]],
    url: str,
    context: BrowserContext,
) -> None:
    parsed_url = urlparse(url)
    domain = parsed_url.netloc

    for cookie in custom_cookies:
        cookie_dict = {
            "name": cookie.get("name", ""),
            "value": cookie.get("value", ""),
            "domain": domain,
            "path": "/",
        }

        LOG.info(f"Adding cookie: {cookie_dict}")
        await context.add_cookies([cookie_dict])  # type: ignore


async def add_custom_headers(
    custom_headers: dict[str, Any],
    page: Page,
) -> None:
    await page.set_extra_http_headers(custom_headers)


async def add_custom_items(
    url: str,
    page: Page,
    cookies: Optional[list[dict[str, Any]]] = None,
    headers: Optional[dict[str, Any]] = None,
) -> None:
    if cookies:
        await add_custom_cookies(cookies, url, page.context)

    if headers:
        await add_custom_headers(headers, page)
