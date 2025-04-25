# STL
import os
import logging
import apscheduler  # type: ignore

# PDM
import apscheduler.schedulers
import apscheduler.schedulers.background
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

# LOCAL
from api.backend.ai.ai_router import ai_router
from api.backend.auth.auth_router import auth_router
from api.backend.utils import get_log_level
from api.backend.routers.job_router import job_router
from api.backend.routers.log_router import log_router
from api.backend.routers.stats_router import stats_router
from api.backend.database.startup import init_database
from fastapi.responses import JSONResponse

from api.backend.job.cron_scheduling.cron_scheduling import start_cron_scheduler
from api.backend.scheduler import scheduler

log_level = os.getenv("LOG_LEVEL")
LOG_LEVEL = get_log_level(log_level)

logging.basicConfig(
    level=LOG_LEVEL,
    format="%(levelname)s:     %(asctime)s - %(name)s - %(message)s",
    handlers=[logging.StreamHandler()],
)

LOG = logging.getLogger(__name__)

app = FastAPI(title="api", root_path="/api")

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


@app.on_event("startup")
async def startup_event():
    start_cron_scheduler(scheduler)
    scheduler.start()

    if os.getenv("ENV") != "test":
        init_database()
        LOG.info("Starting up...")


@app.on_event("shutdown")
def shutdown_scheduler():
    scheduler.shutdown(wait=False)  # Set wait=False to not block shutdown


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    exc_str = f"{exc}".replace("\n", " ").replace("   ", " ")
    logging.error(f"{request}: {exc_str}")
    content = {"status_code": 10422, "message": exc_str, "data": None}
    return JSONResponse(
        content=content, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
    )
