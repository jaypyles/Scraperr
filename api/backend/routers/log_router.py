# STL
import logging
import docker

# PDM
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse


LOG = logging.getLogger(__name__)

log_router = APIRouter()

client = docker.from_env()


@log_router.get("/initial_logs")
async def get_initial_logs():
    container_id = "scraperr_api"

    try:
        container = client.containers.get(container_id)
        log_stream = container.logs(stream=False).decode("utf-8")
        return JSONResponse(content={"logs": log_stream})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")


@log_router.get("/logs")
async def get_own_logs():
    container_id = "scraperr_api"

    try:
        container = client.containers.get(container_id)
        log_stream = container.logs(stream=True, follow=True)

        def log_generator():
            try:
                for log in log_stream:
                    yield f"data: {log.decode('utf-8')}\n\n"
            except Exception as e:
                yield f"data: {str(e)}\n\n"

        return StreamingResponse(log_generator(), media_type="text/event-stream")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
