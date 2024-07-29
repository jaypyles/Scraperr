# STL
import logging
from collections.abc import AsyncGenerator

# PDM
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

# LOCAL
from ollama import Message, AsyncClient
from api.backend.models import AI

LOG = logging.getLogger(__name__)

ai_router = APIRouter()

ollama_client = AsyncClient(host="http://ollama:11434")


async def chat(chat_messages: list[Message]) -> AsyncGenerator[str, None]:
    try:
        async for part in await ollama_client.chat(
            model="llama3.1", messages=chat_messages, stream=True
        ):
            yield part["message"]["content"]
    except Exception as e:
        LOG.error(f"Error during chat: {e}")
        yield "An error occurred while processing your request."


@ai_router.post("/ai")
async def ai(c: AI):
    return StreamingResponse(chat(chat_messages=c.messages), media_type="text/plain")
