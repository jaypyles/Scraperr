import pytest
import logging
from typing import Dict
from playwright.async_api import async_playwright, Cookie, Route
from api.backend.job.scraping.add_custom import add_custom_items

logging.basicConfig(level=logging.DEBUG)
LOG = logging.getLogger(__name__)


@pytest.mark.asyncio
async def test_add_custom_items():
    test_cookies = [{"name": "big", "value": "cookie"}]
    test_headers = {"User-Agent": "test-agent", "Accept": "application/json"}

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        # Set up request interception
        captured_headers: Dict[str, str] = {}

        async def handle_route(route: Route) -> None:
            nonlocal captured_headers
            captured_headers = route.request.headers
            await route.continue_()

        await page.route("**/*", handle_route)

        await add_custom_items(
            url="http://example.com",
            page=page,
            cookies=test_cookies,
            headers=test_headers,
        )

        # Navigate to example.com
        await page.goto("http://example.com")

        # Verify cookies were added
        cookies: list[Cookie] = await page.context.cookies()
        test_cookie = next((c for c in cookies if c.get("name") == "big"), None)

        assert test_cookie is not None
        assert test_cookie.get("value") == "cookie"
        assert test_cookie.get("path") == "/"  # Default path should be set
        assert test_cookie.get("sameSite") == "Lax"  # Default sameSite should be set

        # Verify headers were added
        assert captured_headers.get("user-agent") == "test-agent"

        await browser.close()
