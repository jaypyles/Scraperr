# STL
import random
from datetime import datetime, timezone

# PDM
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

# LOCAL
from api.backend.schemas.job import DownloadJob
from api.backend.database.models import Job

mocked_random_int = 123456


@pytest.mark.asyncio
async def test_download(client: AsyncClient, db_session: AsyncSession):
    # Insert a test job into the DB
    job_id = "test-job-id"
    test_job = Job(
        id=job_id,
        url="https://example.com",
        elements=[],
        user="test@example.com",
        time_created=datetime.now(timezone.utc),
        result=[
            {
                "https://example.com": {
                    "element_name": [{"xpath": "//div", "text": "example"}]
                }
            }
        ],
        status="Completed",
        chat=None,
        job_options={},
        agent_mode=False,
        prompt="",
        favorite=False,
    )
    db_session.add(test_job)
    await db_session.commit()

    # Force predictable randint
    random.seed(0)

    # Build request
    download_job = DownloadJob(ids=[job_id], job_format="csv")
    response = await client.post("/download", json=download_job.model_dump())

    assert response.status_code == 200
    assert response.headers["Content-Disposition"] == "attachment; filename=export.csv"

    # Validate CSV contents
    csv_content = response.content.decode("utf-8")
    lines = csv_content.strip().split("\n")

    assert (
        lines[0].strip()
        == '"id","url","element_name","xpath","text","user","time_created"'
    )
    assert '"https://example.com"' in lines[1]
    assert '"element_name"' in lines[1]
    assert '"//div"' in lines[1]
    assert '"example"' in lines[1]
