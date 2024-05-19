# STL
import logging

# PDM
from fastapi import FastAPI
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


@app.route("/api/endpoint")
async def test_route():
    return {"hello": "world"}
