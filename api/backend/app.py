# STL
import os
import logging
from contextlib import asynccontextmanager

# PDM
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

# LOCAL
from api.backend.utils import get_log_level
from api.backend.scheduler import scheduler
from api.backend.ai.ai_router import ai_router
from api.backend.job.job_router import job_router
from api.backend.auth.auth_router import auth_router
from api.backend.stats.stats_router import stats_router
from api.backend.job.cron_scheduling.cron_scheduling import start_cron_scheduler

log_level = os.getenv("LOG_LEVEL")
LOG_LEVEL = get_log_level(log_level)

logging.basicConfig(
    level=LOG_LEVEL,
    format="%(levelname)s:     %(asctime)s - [%(name)s] - %(message)s",
    handlers=[logging.StreamHandler()],
)

LOG = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Startup
    LOG.info("Starting application...")

    LOG.info("Starting cron scheduler...")
    await start_cron_scheduler(scheduler)
    scheduler.start()

    LOG.info("Cron scheduler started successfully")

    yield

    # Shutdown
    LOG.info("Shutting down application...")
    LOG.info("Stopping cron scheduler...")
    scheduler.shutdown(wait=False)  # Set wait=False to not block shutdown
    LOG.info("Cron scheduler stopped")
    LOG.info("Application shutdown complete")


app = FastAPI(title="api", root_path="/api", lifespan=lifespan)

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
app.include_router(stats_router)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    exc_str = f"{exc}".replace("\n", " ").replace("   ", " ")
    logging.error(f"{request}: {exc_str}")
    content = {"status_code": 10422, "message": exc_str, "data": None}
    return JSONResponse(
        content=content, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
    )
