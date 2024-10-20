import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
from api.backend.app import app
from api.backend.models import DownloadJob
from api.backend.tests.factories.job_factory import create_completed_job

client = TestClient(app)

mocked_job = create_completed_job().model_dump()
mock_results = [mocked_job]


@pytest.mark.asyncio
@patch("api.backend.app.query")
async def test_download(mock_query: AsyncMock):
    mock_query.return_value = mock_results
    download_job = DownloadJob(ids=[mocked_job["id"]])

    # Make a POST request to the /download endpoint
    response = client.post("/download", json=download_job.model_dump())

    # Assertions
    assert response.status_code == 200
    assert response.headers["Content-Disposition"] == "attachment; filename=export.csv"

    # Check the content of the CSV
    csv_content = response.content.decode("utf-8")
    expected_csv = f"id,url,element_name,xpath,text,user,time_created\r\n{mocked_job['id']},https://example.com,element_name,//div,example,{mocked_job['user']},{mocked_job['time_created']}\r\n"
    assert csv_content == expected_csv
