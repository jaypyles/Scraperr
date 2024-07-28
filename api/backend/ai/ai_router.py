# STL
import asyncio
import logging
from typing import Any, AsyncGenerator
from collections.abc import AsyncGenerator

# PDM
from fastapi import Depends, FastAPI, APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

# LOCAL
from ollama import Message, AsyncClient
from api.backend.models import AI

LOG = logging.getLogger(__name__)

ai_router = APIRouter()

ollama_client = AsyncClient(host="http://ollama:11434")


async def chat(message: str) -> AsyncGenerator[str, None]:
    m: Message = {"role": "user", "content": message}
    try:
        async for part in await ollama_client.chat(
            model="llama3.1", messages=[m], stream=True
        ):
            yield part["message"]["content"]
    except Exception as e:
        LOG.error(f"Error during chat: {e}")
        yield "An error occurred while processing your request."


@ai_router.post("/ai")
async def ai(c: AI):
    return StreamingResponse(chat(message=c.message), media_type="text/plain")
