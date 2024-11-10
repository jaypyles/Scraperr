import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from api.backend.tests.factories.job_factory import create_job
from api.backend.models import JobOptions
from api.backend.scraping import create_driver


mocked_job = create_job(
    job_options=JobOptions(
        multi_page_scrape=False, custom_headers={}, proxies=["127.0.0.1:8080"]
    )
).model_dump()


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

    # Check if the proxy header is set correctly
    if response:
        assert response.headers["Proxy"] == "127.0.0.1:8080"

    driver.quit()
