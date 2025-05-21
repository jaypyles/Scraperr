# STL
import logging
from collections.abc import Iterable, AsyncGenerator

# PDM
from ollama import Message
from fastapi import APIRouter
from fastapi.responses import JSONResponse, StreamingResponse
from openai.types.chat import ChatCompletionMessageParam

# LOCAL
from api.backend.ai.clients import (
    llama_model,
    open_ai_key,
    llama_client,
    open_ai_model,
    openai_client,
)
from api.backend.ai.schemas import AI

LOG = logging.getLogger(__name__)

ai_router = APIRouter()


async def llama_chat(chat_messages: list[Message]) -> AsyncGenerator[str, None]:
    if llama_client and llama_model:
        try:
            async for part in await llama_client.chat(
                model=llama_model, messages=chat_messages, stream=True
            ):
                yield part["message"]["content"]
        except Exception as e:
            LOG.error(f"Error during chat: {e}")
            yield "An error occurred while processing your request."


async def openai_chat(
    chat_messages: Iterable[ChatCompletionMessageParam],
) -> AsyncGenerator[str, None]:
    if openai_client and not open_ai_model:
        LOG.error("OpenAI model is not set")
        yield "An error occurred while processing your request."

    if not openai_client:
        LOG.error("OpenAI client is not set")
        yield "An error occurred while processing your request."

    if openai_client and open_ai_model:
        try:
            response = openai_client.chat.completions.create(
                model=open_ai_model, messages=chat_messages, stream=True
            )
            for part in response:
                yield part.choices[0].delta.content or ""
        except Exception as e:
            LOG.error(f"Error during OpenAI chat: {e}")
            yield "An error occurred while processing your request."


chat_function = llama_chat if llama_client else openai_chat


@ai_router.post("/ai")
async def ai(c: AI):
    return StreamingResponse(
        chat_function(chat_messages=c.messages), media_type="text/plain"
    )


@ai_router.get("/ai/check")
async def check():
    return JSONResponse(content={"ai_enabled": bool(open_ai_key or llama_model)})
