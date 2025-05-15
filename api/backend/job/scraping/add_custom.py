from typing import Any, Optional
from urllib.parse import urlparse

from playwright.async_api import Page

import logging

LOG = logging.getLogger(__name__)


async def add_custom_cookies(
    custom_cookies: list[dict[str, Any]],
    url: str,
    page: Page,
) -> None:
    for cookie in custom_cookies:
        domain = cookie.get("domain", "")

        if "domain" not in cookie:
            parsed_url = urlparse(url)
            domain = parsed_url.netloc

        cookie["domain"] = domain
        cookie["path"] = "/"
        cookie["name"] = cookie.get("name", "")
        cookie["value"] = cookie.get("value", "")
        cookie["expires"] = cookie.get("expires", 0)
        cookie["httpOnly"] = cookie.get("httpOnly", False)
        cookie["secure"] = cookie.get("secure", False)
        same_site = cookie.get("sameSite", "Lax")

        if same_site is None:
            same_site = "Lax"

        cookie["sameSite"] = (
            same_site.capitalize() if same_site.lower() in ["lax", "strict"] else "Lax"
        )
        LOG.info(f"Adding cookie: {cookie}")
        await page.context.add_cookies([cookie])  # type: ignore


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
        await add_custom_cookies(cookies, url, page)

    if headers:
        await add_custom_headers(headers, page)
