# STL
import os
import uuid
import logging
import traceback
from io import BytesIO
from typing import Optional

# PDM
from fastapi import Depends, FastAPI, HTTPException, BackgroundTasks
from openpyxl import Workbook
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

# LOCAL
import docker
from api.backend.job import (
    query,
    insert,
    update_job,
    delete_jobs,
    get_jobs_per_day,
    average_elements_per_link,
)
from api.backend.models import (
    UpdateJobs,
    DownloadJob,
    SubmitScrapeJob,
    DeleteScrapeJobs,
)
from api.backend.schemas import User
from api.backend.ai.ai_router import ai_router
from api.backend.auth.auth_utils import get_current_user
from api.backend.auth.auth_router import auth_router

client = docker.from_env()


def get_log_level(level_name: Optional[str]) -> int:
    level = logging.INFO

    if level_name:
        level_name = level_name.upper()
        level = getattr(logging, level_name, logging.INFO)

    return level


log_level = os.getenv("LOG_LEVEL")
LOG_LEVEL = get_log_level(log_level)

logging.basicConfig(
    level=LOG_LEVEL,
    format="%(levelname)s:     %(asctime)s - %(name)s - %(message)s",
    handlers=[logging.StreamHandler()],
)

LOG = logging.getLogger(__name__)

app = FastAPI(title="api")
app.include_router(auth_router)
app.include_router(ai_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/update")
async def update(update_jobs: UpdateJobs, user: User = Depends(get_current_user)):
    """Used to update jobs"""
    await update_job(update_jobs.ids, update_jobs.field, update_jobs.value)


@app.post("/submit-scrape-job")
async def submit_scrape_job(job: SubmitScrapeJob, background_tasks: BackgroundTasks):
    LOG.info(f"Recieved job: {job}")
    try:
        job.id = uuid.uuid4().hex

        if job.user:
            job_dict = job.model_dump()
            await insert(job_dict)

        return JSONResponse(content=f"Job queued for scraping: {job.id}")
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.post("/retrieve-scrape-jobs")
async def retrieve_scrape_jobs(user: User = Depends(get_current_user)):
    LOG.info(f"Retrieving jobs for account: {user.email}")
    try:
        results = await query({"user": user.email})
        return JSONResponse(content=jsonable_encoder(results[::-1]))
    except Exception as e:
        LOG.error(f"Exception occurred: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


def clean_text(text: str):
    text = text.replace("\r\n", "\n")  # Normalize newlines
    text = text.replace("\n", "\\n")  # Escape newlines
    text = text.replace('"', '\\"')  # Escape double quotes
    return text


@app.post("/download")
async def download(download_job: DownloadJob):
    LOG.info(f"Downloading job with ids: {download_job.ids}")
    try:
        results = await query({"id": {"$in": download_job.ids}})

        flattened_results = []
        for result in results:
            for res in result["result"]:
                for url, elements in res.items():
                    for element_name, values in elements.items():
                        for value in values:
                            text = clean_text(value.get("text", ""))
                            flattened_results.append(
                                {
                                    "id": result.get("id", None),
                                    "url": url,
                                    "element_name": element_name,
                                    "xpath": value.get("xpath", ""),
                                    "text": text,
                                    "user": result.get("user", ""),
                                    "time_created": result.get("time_created", ""),
                                }
                            )

        # Create an Excel workbook and sheet
        workbook = Workbook()
        sheet = workbook.active
        assert sheet
        sheet.title = "Results"

        # Write the header
        headers = ["id", "url", "element_name", "xpath", "text", "user", "time_created"]
        sheet.append(headers)

        # Write the rows
        for row in flattened_results:
            sheet.append(
                [
                    row["id"],
                    row["url"],
                    row["element_name"],
                    row["xpath"],
                    row["text"],
                    row["user"],
                    row["time_created"],
                ]
            )

        # Save the workbook to a BytesIO buffer
        excel_buffer = BytesIO()
        workbook.save(excel_buffer)
        _ = excel_buffer.seek(0)

        # Create the response
        response = StreamingResponse(
            excel_buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response.headers["Content-Disposition"] = "attachment; filename=export.xlsx"
        return response

    except Exception as e:
        LOG.error(f"Exception occurred: {e}")
        traceback.print_exc()
        return {"error": str(e)}


@app.post("/delete-scrape-jobs")
async def delete(delete_scrape_jobs: DeleteScrapeJobs):
    result = await delete_jobs(delete_scrape_jobs.ids)
    return (
        JSONResponse(content={"message": "Jobs successfully deleted."})
        if result
        else JSONResponse({"error": "Jobs not deleted."})
    )


@app.get("/initial_logs")
async def get_initial_logs():
    container_id = "scraperr_api"

    try:
        container = client.containers.get(container_id)
        log_stream = container.logs(stream=False).decode("utf-8")
        return JSONResponse(content={"logs": log_stream})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")


@app.get("/logs")
async def get_own_logs():
    container_id = "scraperr_api"

    try:
        container = client.containers.get(container_id)
        log_stream = container.logs(stream=True, follow=True)

        def log_generator():
            try:
                for log in log_stream:
                    yield f"data: {log.decode('utf-8')}\n\n"
            except Exception as e:
                yield f"data: {str(e)}\n\n"

        return StreamingResponse(log_generator(), media_type="text/event-stream")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/statistics/get-average-element-per-link")
async def get_average_element_per_link(user: User = Depends(get_current_user)):
    return await average_elements_per_link(user.email)


@app.get("/statistics/get-average-jobs-per-day")
async def average_jobs_per_day(user: User = Depends(get_current_user)):
    data = await get_jobs_per_day(user.email)
    return data
