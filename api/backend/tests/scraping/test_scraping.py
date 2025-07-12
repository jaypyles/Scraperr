# STL
import logging
from typing import Dict
from datetime import datetime

# PDM
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from fastapi.testclient import TestClient
from playwright.async_api import Route, Cookie, async_playwright
from sqlalchemy.ext.asyncio import AsyncSession

# LOCAL
from api.backend.app import app
from api.backend.job.models import Proxy, Element, JobOptions
from api.backend.schemas.job import Job
from api.backend.database.models import Job as JobModel
from api.backend.job.scraping.add_custom import add_custom_items

logging.basicConfig(level=logging.DEBUG)
LOG = logging.getLogger(__name__)

client = TestClient(app)


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


@pytest.mark.asyncio
async def test_proxies(client: AsyncClient, db_session: AsyncSession):
    job = Job(
        url="https://example.com",
        elements=[Element(xpath="//div", name="test")],
        job_options=JobOptions(
            proxies=[
                Proxy(
                    server="127.0.0.1:8080",
                    username="user",
                    password="pass",
                )
            ],
        ),
        time_created=datetime.now().isoformat(),
    )

    response = await client.post("/submit-scrape-job", json=job.model_dump())
    assert response.status_code == 200

    stmt = select(JobModel)
    result = await db_session.execute(stmt)
    jobs = result.scalars().all()

    assert len(jobs) > 0
    job_from_db = jobs[0]

    job_dict = job_from_db.__dict__
    job_dict.pop("_sa_instance_state", None)

    assert job_dict is not None
    assert job_dict["job_options"]["proxies"] == [
        {
            "server": "127.0.0.1:8080",
            "username": "user",
            "password": "pass",
        }
    ]

    # Verify the job was stored correctly in the database
    assert job_dict["url"] == "https://example.com"
    assert job_dict["status"] == "Queued"
    assert len(job_dict["elements"]) == 1
    assert job_dict["elements"][0]["xpath"] == "//div"
    assert job_dict["elements"][0]["name"] == "test"
