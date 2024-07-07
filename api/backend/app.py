# STL
import uuid
import logging
from io import StringIO

# PDM
import pandas as pd
from fastapi import FastAPI
from fastapi.encoders import jsonable_encoder
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# LOCAL
from api.backend.job import query, insert
from api.backend.models import DownloadJob, SubmitScrapeJob, RetrieveScrapeJobs
from api.backend.scraping import scrape
from api.backend.auth.auth_router import auth_router

logging.basicConfig(
    level=logging.DEBUG,
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
async def submit_scrape_job(job: SubmitScrapeJob):
    LOG.info(f"Recieved job: {job}")
    try:
        scraped = await scrape(job.url, job.elements)

        LOG.info(
            f"Scraped result for url: {job.url}, with elements: {job.elements}\n{scraped}"
        )

        json_scraped = jsonable_encoder(scraped)
        job.result = json_scraped
        job.id = uuid.uuid4().hex

        if job.user:
            await insert(jsonable_encoder(job))

        return JSONResponse(content=json_scraped)
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
    LOG.info(f"Downloading job with id: {download_job.id}")
    try:
        results = await query({"id": download_job.id})

        flattened_results = []
        for result in results:
            for key, values in result["result"].items():
                for value in values:
                    flattened_results.append(
                        {
                            "id": result["id"],
                            "url": result["url"],
                            "element_name": key,
                            "xpath": value["xpath"],
                            "text": value["text"],
                            "user": result["user"],
                            "time_created": result["time_created"],
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
        return {"error": str(e)}
