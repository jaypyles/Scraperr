# STL
import uuid
import traceback
from io import StringIO
import csv
import logging
import random

# PDM
from fastapi import Depends, APIRouter
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, StreamingResponse

# LOCAL
from api.backend.job import (
    query,
    insert,
    update_job,
    delete_jobs,
)
from api.backend.models import (
    UpdateJobs,
    DownloadJob,
    FetchOptions,
    DeleteScrapeJobs,
    Job,
)
from api.backend.schemas import User
from api.backend.auth.auth_utils import get_current_user
from api.backend.utils import clean_text

LOG = logging.getLogger(__name__)

job_router = APIRouter()


@job_router.post("/update")
async def update(update_jobs: UpdateJobs, _: User = Depends(get_current_user)):
    """Used to update jobs"""
    await update_job(update_jobs.ids, update_jobs.field, update_jobs.value)


@job_router.post("/submit-scrape-job")
async def submit_scrape_job(job: Job):
    LOG.info(f"Recieved job: {job}")
    try:
        job.id = uuid.uuid4().hex

        job_dict = job.model_dump()
        await insert(job_dict)

        return JSONResponse(content=f"Job queued for scraping: {job.id}")
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


@job_router.post("/retrieve-scrape-jobs")
async def retrieve_scrape_jobs(
    fetch_options: FetchOptions, user: User = Depends(get_current_user)
):
    LOG.info(f"Retrieving jobs for account: {user.email}")
    try:
        results = await query({"user": user.email}, fetch_options=fetch_options)
        return JSONResponse(content=jsonable_encoder(results[::-1]))
    except Exception as e:
        LOG.error(f"Exception occurred: {e}")
        return JSONResponse(content=[], status_code=500)


@job_router.get("/job/{id}")
async def job(id: str, user: User = Depends(get_current_user)):
    LOG.info(f"Retrieving jobs for account: {user.email}")
    try:
        filter = {"user": user.email, "id": id}
        results = await query(filter)
        return JSONResponse(content=jsonable_encoder(results))
    except Exception as e:
        LOG.error(f"Exception occurred: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@job_router.post("/download")
async def download(download_job: DownloadJob):
    LOG.info(f"Downloading job with ids: {download_job.ids}")

    try:
        results = await query({"id": {"$in": download_job.ids}})

        csv_buffer = StringIO()
        csv_writer = csv.writer(csv_buffer, quotechar='"', quoting=csv.QUOTE_ALL)

        headers = ["id", "url", "element_name", "xpath", "text", "user", "time_created"]
        csv_writer.writerow(headers)

        for result in results:
            for res in result["result"]:
                for url, elements in res.items():
                    for element_name, values in elements.items():
                        for value in values:
                            text = clean_text(value.get("text", "")).strip()
                            if text:
                                csv_writer.writerow(
                                    [
                                        result.get("id", "")
                                        + "-"
                                        + str(random.randint(0, 1000000)),
                                        url,
                                        element_name,
                                        value.get("xpath", ""),
                                        text,
                                        result.get("user", ""),
                                        result.get("time_created", ""),
                                    ]
                                )

        _ = csv_buffer.seek(0)
        response = StreamingResponse(
            csv_buffer,
            media_type="text/csv",
        )
        response.headers["Content-Disposition"] = "attachment; filename=export.csv"
        return response

    except Exception as e:
        LOG.error(f"Exception occurred: {e}")
        traceback.print_exc()
        return {"error": str(e)}


@job_router.post("/delete-scrape-jobs")
async def delete(delete_scrape_jobs: DeleteScrapeJobs):
    result = await delete_jobs(delete_scrape_jobs.ids)
    return (
        JSONResponse(content={"message": "Jobs successfully deleted."})
        if result
        else JSONResponse({"error": "Jobs not deleted."})
    )
