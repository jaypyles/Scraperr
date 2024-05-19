# STL
import logging

# PDM
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

LOG = logging.getLogger(__name__)

app = FastAPI(title="api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="./build/static"), name="static")


@app.get("/")
def read_root():
    return FileResponse("./build/index.html")


@app.get("/api/endpoint")
async def test_endpoint():
    return {"hello": "world"}
