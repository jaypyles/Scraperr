# STL
from functools import partial
import uuid
import logging
from io import StringIO

# PDM
import pandas as pd
from fastapi import BackgroundTasks, FastAPI
from fastapi.encoders import jsonable_encoder
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# LOCAL
from api.backend.job import query, insert, delete_jobs, update_job
from api.backend.models import (
    DownloadJob,
    SubmitScrapeJob,
    DeleteScrapeJobs,
    RetrieveScrapeJobs,
)
from api.backend.scraping import scrape
from api.backend.auth.auth_router import auth_router
from seleniumwire.thirdparty.mitmproxy.master import traceback

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s:     %(asctime)s - %(name)s - %(message)s",
    handlers=[logging.StreamHandler()],
)

LOG = logging.getLogger(__name__)

app = FastAPI(title="api")
app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/_next/static", StaticFiles(directory="./dist/_next/static"), name="static")


@app.get("/")
def read_root():
    return FileResponse("./dist/index.html")


@app.get("/favicon.ico")
def read_favicon():
    return FileResponse("dist/favicon.ico")


@app.post("/api/submit-scrape-job")
async def submit_scrape_job(job: SubmitScrapeJob, background_tasks: BackgroundTasks):
    LOG.info(f"Recieved job: {job}")
    try:
        job.id = uuid.uuid4().hex

        if job.user:
            await insert(jsonable_encoder(job))

        return JSONResponse(content=f"Job queued for scraping: {job.id}")
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.post("/api/retrieve-scrape-jobs")
async def retrieve_scrape_jobs(retrieve: RetrieveScrapeJobs):
    LOG.info(f"Retrieving jobs for account: {retrieve.user}")
    try:
        results = await query({"user": retrieve.user})
        return JSONResponse(content=results[::-1])
    except Exception as e:
        LOG.error(f"Exception occurred: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.post("/api/download")
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
                            flattened_results.append(
                                {
                                    "id": result.get("id", None),
                                    "url": url,
                                    "element_name": element_name,
                                    "xpath": value.get("xpath", ""),
                                    "text": value.get("text", ""),
                                    "user": result.get("user", ""),
                                    "time_created": result.get("time_created", ""),
                                }
                            )

        df = pd.DataFrame(flattened_results)

        csv_buffer = StringIO()
        df.to_csv(csv_buffer, index=False)
        _ = csv_buffer.seek(0)
        response = StreamingResponse(csv_buffer, media_type="text/csv")
        response.headers["Content-Disposition"] = "attachment; filename=export.csv"
        return response

    except Exception as e:
        LOG.error(f"Exception occurred: {e}")
        traceback.print_exc()
        return {"error": str(e)}


@app.post("/api/delete-scrape-jobs")
async def delete(delete_scrape_jobs: DeleteScrapeJobs):
    result = await delete_jobs(delete_scrape_jobs.ids)
    return (
        JSONResponse(content={"message": "Jobs successfully deleted."})
        if result
        else JSONResponse({"error": "Jobs not deleted."})
    )
