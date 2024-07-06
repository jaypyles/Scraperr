# STL
import uuid
import logging
from io import StringIO

# PDM
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from boto3.dynamodb.conditions import Key

# LOCAL
from api.backend.amazon import query, insert, query_by_id, connect_to_dynamo
from api.backend.models import DownloadJob, SubmitScrapeJob, RetrieveScrapeJobs
from api.backend.scraping import scrape

logging.basicConfig(
    level=logging.INFO,
    format="[%(levelname)s]     %(asctime)s - %(name)s - %(message)s",
    handlers=[logging.StreamHandler()],
)

LOG = logging.getLogger(__name__)

app = FastAPI(title="api")

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


@app.post("/api/submit-scrape-job")
async def submit_scrape_job(job: SubmitScrapeJob):
    LOG.info(f"Recieved job: {job}")
    try:
        scraped = await scrape(job.url, job.elements)

        LOG.info(
            f"Scraped result for url: {job.url}, with elements: {job.elements}\n{scraped}"
        )

        json_scraped = jsonable_encoder(scraped)
        table = connect_to_dynamo()
        job.result = json_scraped
        job.id = uuid.uuid4().hex
        insert(table, jsonable_encoder(job))
        return JSONResponse(content=json_scraped)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.post("/api/retrieve-scrape-jobs")
async def retrieve_scrape_jobs(retrieve: RetrieveScrapeJobs):
    LOG.info(f"Retrieving jobs for account: {retrieve.user}")
    try:
        table = connect_to_dynamo()
        results = query(table, "user", Key("user").eq(retrieve.user))
        return JSONResponse(content=results)
    except Exception as e:
        LOG.error(f"Exception occurred: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.post("/api/download")
async def download(download_job: DownloadJob):
    LOG.info(f"Downloading job with id: {download_job.id}")
    try:
        table = connect_to_dynamo()
        results = query_by_id(table, Key("id").eq(download_job.id))

        df = pd.DataFrame(results)

        csv_buffer = StringIO()
        df.to_csv(csv_buffer, index=False)
        _ = csv_buffer.seek(0)
        response = StreamingResponse(csv_buffer, media_type="text/csv")
        response.headers["Content-Disposition"] = "attachment; filename=export.csv"
        return response

    except Exception as e:
        LOG.error(f"Exception occurred: {e}")
