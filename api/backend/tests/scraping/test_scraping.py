import pytest
import logging
from playwright.async_api import async_playwright, Error

logging.basicConfig(level=logging.DEBUG)
LOG = logging.getLogger(__name__)


@pytest.mark.asyncio
async def test_proxy():
    proxy = "127.0.0.1:8080"

    async with async_playwright() as p:
        browser = await p.firefox.launch(
            headless=True, proxy={"server": f"http://{proxy}"}
        )
        context = await browser.new_context()
        page = await context.new_page()

        with pytest.raises(Error) as excinfo:
            await page.goto("http://example.com")

        assert "NS_ERROR_PROXY_CONNECTION_REFUSED" in str(excinfo.value)

        await browser.close()
