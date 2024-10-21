# STL
import os
import logging

# PDM
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# LOCAL
from api.backend.ai.ai_router import ai_router
from api.backend.auth.auth_router import auth_router
from api.backend.utils import get_log_level
from api.backend.routers.job_router import job_router
from api.backend.routers.log_router import log_router
from api.backend.routers.stats_router import stats_router

log_level = os.getenv("LOG_LEVEL")
LOG_LEVEL = get_log_level(log_level)

logging.basicConfig(
    level=LOG_LEVEL,
    format="%(levelname)s:     %(asctime)s - %(name)s - %(message)s",
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


app.include_router(auth_router)
app.include_router(ai_router)
app.include_router(job_router)
app.include_router(log_router)
app.include_router(stats_router)
