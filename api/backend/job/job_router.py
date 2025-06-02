# STL
import csv
import uuid
import random
import logging
import datetime
from io import StringIO

# PDM
from fastapi import Depends, APIRouter
from fastapi.encoders import jsonable_encoder
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from apscheduler.triggers.cron import CronTrigger  # type: ignore

# LOCAL
from api.backend.job import insert, update_job, delete_jobs
from api.backend.constants import MEDIA_DIR, MEDIA_TYPES, RECORDINGS_DIR
from api.backend.scheduler import scheduler
from api.backend.schemas.job import Job, UpdateJobs, DownloadJob, DeleteScrapeJobs
from api.backend.auth.schemas import User
from api.backend.schemas.cron import CronJob, DeleteCronJob
from api.backend.database.utils import format_list_for_query
from api.backend.auth.auth_utils import get_current_user
from api.backend.database.common import query
from api.backend.job.utils.text_utils import clean_text
from api.backend.job.models.job_options import FetchOptions
from api.backend.routers.handle_exceptions import handle_exceptions
from api.backend.job.utils.clean_job_format import clean_job_format
from api.backend.job.cron_scheduling.cron_scheduling import (
    get_cron_jobs,
    delete_cron_job,
    insert_cron_job,
    get_cron_job_trigger,
    insert_job_from_cron_job,
)
from api.backend.job.utils.stream_md_from_job_results import stream_md_from_job_results

LOG = logging.getLogger("Job")

job_router = APIRouter()


@job_router.post("/update")
@handle_exceptions(logger=LOG)
async def update(update_jobs: UpdateJobs, _: User = Depends(get_current_user)):
    """Used to update jobs"""
    await update_job(update_jobs.ids, update_jobs.field, update_jobs.value)

    return JSONResponse(content={"message": "Jobs updated successfully."})


@job_router.post("/submit-scrape-job")
@handle_exceptions(logger=LOG)
async def submit_scrape_job(job: Job):
    LOG.info(f"Recieved job: {job}")

    job.id = uuid.uuid4().hex
    job_dict = job.model_dump()
    insert(job_dict)

    return JSONResponse(
        content={"id": job.id, "message": "Job submitted successfully."}
    )


@job_router.post("/retrieve-scrape-jobs")
@handle_exceptions(logger=LOG)
async def retrieve_scrape_jobs(
    fetch_options: FetchOptions, user: User = Depends(get_current_user)
):
    LOG.info(f"Retrieving jobs for account: {user.email}")
    ATTRIBUTES = "chat" if fetch_options.chat else "*"
    job_query = f"SELECT {ATTRIBUTES} FROM jobs WHERE user = ?"
    results = query(job_query, (user.email,))
    return JSONResponse(content=jsonable_encoder(results[::-1]))


@job_router.get("/job/{id}")
@handle_exceptions(logger=LOG)
async def job(id: str, user: User = Depends(get_current_user)):
    LOG.info(f"Retrieving jobs for account: {user.email}")
    job_query = "SELECT * FROM jobs WHERE user = ? AND id = ?"
    results = query(job_query, (user.email, id))
    return JSONResponse(content=jsonable_encoder(results))


@job_router.post("/download")
@handle_exceptions(logger=LOG)
async def download(download_job: DownloadJob):
    LOG.info(f"Downloading job with ids: {download_job.ids}")
    job_query = (
        f"SELECT * FROM jobs WHERE id IN {format_list_for_query(download_job.ids)}"
    )
    results = query(job_query, tuple(download_job.ids))

    if download_job.job_format == "csv":
        csv_buffer = StringIO()
        csv_writer = csv.writer(csv_buffer, quotechar='"', quoting=csv.QUOTE_ALL)

        headers = [
            "id",
            "url",
            "element_name",
            "xpath",
            "text",
            "user",
            "time_created",
        ]
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

    elif download_job.job_format == "md":
        response = StreamingResponse(
            stream_md_from_job_results(results),
            media_type="text/markdown",
        )

        response.headers["Content-Disposition"] = "attachment; filename=export.md"
        return response


@job_router.get("/job/{id}/convert-to-csv")
@handle_exceptions(logger=LOG)
async def convert_to_csv(id: str):
    job_query = f"SELECT * FROM jobs WHERE id = ?"
    results = query(job_query, (id,))
    return JSONResponse(content=clean_job_format(results))


@job_router.post("/delete-scrape-jobs")
@handle_exceptions(logger=LOG)
async def delete(delete_scrape_jobs: DeleteScrapeJobs):
    result = await delete_jobs(delete_scrape_jobs.ids)
    return (
        JSONResponse(content={"message": "Jobs successfully deleted."})
        if result
        else JSONResponse(content={"error": "Jobs not deleted."})
    )


@job_router.post("/schedule-cron-job")
@handle_exceptions(logger=LOG)
async def schedule_cron_job(cron_job: CronJob):
    if not cron_job.id:
        cron_job.id = uuid.uuid4().hex

    if not cron_job.time_created:
        cron_job.time_created = datetime.datetime.now()

    if not cron_job.time_updated:
        cron_job.time_updated = datetime.datetime.now()

    insert_cron_job(cron_job)

    queried_job = query("SELECT * FROM jobs WHERE id = ?", (cron_job.job_id,))

    scheduler.add_job(
        insert_job_from_cron_job,
        get_cron_job_trigger(cron_job.cron_expression),
        id=cron_job.id,
        args=[queried_job[0]],
    )

    return JSONResponse(content={"message": "Cron job scheduled successfully."})


@job_router.post("/delete-cron-job")
@handle_exceptions(logger=LOG)
async def delete_cron_job_request(request: DeleteCronJob):
    if not request.id:
        return JSONResponse(
            content={"error": "Cron job id is required."}, status_code=400
        )

    delete_cron_job(request.id, request.user_email)
    scheduler.remove_job(request.id)

    return JSONResponse(content={"message": "Cron job deleted successfully."})


@job_router.get("/cron-jobs")
@handle_exceptions(logger=LOG)
async def get_cron_jobs_request(user: User = Depends(get_current_user)):
    cron_jobs = get_cron_jobs(user.email)
    return JSONResponse(content=jsonable_encoder(cron_jobs))


@job_router.get("/recordings/{id}")
@handle_exceptions(logger=LOG)
async def get_recording(id: str):
    path = RECORDINGS_DIR / f"{id}.mp4"
    if not path.exists():
        return JSONResponse(content={"error": "Recording not found."}, status_code=404)

    return FileResponse(
        path, headers={"Content-Type": "video/mp4", "Accept-Ranges": "bytes"}
    )


@job_router.get("/get-media")
@handle_exceptions(logger=LOG)
async def get_media(id: str):
    files: dict[str, list[str]] = {}

    for media_type in MEDIA_TYPES:
        path = MEDIA_DIR / media_type / f"{id}"
        files[media_type] = [file.name for file in path.glob("*")]

    return JSONResponse(content={"files": files})


@job_router.get("/media")
@handle_exceptions(logger=LOG)
async def get_media_file(id: str, type: str, file: str):
    path = MEDIA_DIR / type / f"{id}" / file

    if not path.exists():
        return JSONResponse(content={"error": "Media file not found."}, status_code=404)

    return FileResponse(path)
