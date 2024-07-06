# STL
import logging

# PDM
from fastapi import FastAPI
from fastapi.encoders import jsonable_encoder
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# LOCAL
from api.backend.amazon import test_dyanmo
from api.backend.models import SubmitScrapeJob
from api.backend.scraping import scrape

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


@app.get("/api/endpoint")
async def test_endpoint():
    test_dyanmo()
    return "Hello World!"


@app.post("/api/submit-scrape-job")
async def submit_scrape_job(job: SubmitScrapeJob):
    try:
        scraped = await scrape(job.url, job.elements)
        print(scraped)
        json_scraped = jsonable_encoder(scraped)
        print(json_scraped)
        return JSONResponse(content=json_scraped)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
