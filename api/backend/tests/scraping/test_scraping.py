import pytest
import logging
from unittest.mock import AsyncMock, patch, MagicMock
from api.backend.scraping import create_driver

logging.basicConfig(level=logging.DEBUG)
LOG = logging.getLogger(__name__)


@pytest.mark.asyncio
@patch("seleniumwire.webdriver.Chrome.get")
async def test_proxy(mock_get: AsyncMock):
    # Mock the response of the requests.get call
    mock_response = MagicMock()
    mock_get.return_value = mock_response

    driver = create_driver(proxies=["127.0.0.1:8080"])
    assert driver is not None

    # Simulate a request
    driver.get("http://example.com")
    response = driver.last_request

    if response:
        assert response.headers["Proxy-Connection"] == "keep-alive"

    driver.quit()
