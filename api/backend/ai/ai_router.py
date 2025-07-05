# STL
import logging
import asyncio
from typing import AsyncGenerator, List, Dict, Any, cast

# PDM
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from langchain_core.messages import BaseMessage
from langchain_core.runnables import RunnableConfig
from langchain.callbacks.streaming_aiter import AsyncIteratorCallbackHandler
from langchain_core.exceptions import LangChainException

# LOCAL
from api.backend.models import AI as AIRequestModel
from api.backend.ai.clients import (
    llm_instance,
    provider_info,
    AI_PROVIDER_BACKEND,
    convert_to_langchain_messages,
)
from api.backend.ai.schemas import AI
from api.backend.routers.handle_exceptions import handle_exceptions

LOG = logging.getLogger("AI")
ai_router = APIRouter()

async def langchain_chat(messages: List[BaseMessage]) -> AsyncGenerator[str, None]:
    if not llm_instance:
        LOG.error("LLM instance not available")
        yield "An error occurred: LLM not configured."
        return
    
    callback_handler = AsyncIteratorCallbackHandler()
    run_config = RunnableConfig(callbacks=[callback_handler])
    
    async def stream_llm_task():
        try:
            async for _ in llm_instance.astream(messages, config=run_config):
                pass  # Callback handler processes the chunks
        except LangChainException as e:
            LOG.error(f"LangChain error during streaming: {e}")
            raise
        except Exception as e:
            LOG.error(f"Unexpected error during LLM streaming: {e}", exc_info=True)
            raise
        finally:
            if not callback_handler.done.is_set():
                callback_handler.done.set()
    
    stream_task = asyncio.create_task(stream_llm_task())
    
    try:
        async for token in callback_handler.aiter():
            yield token
    except Exception as e:
        LOG.error(f"Error in streaming response: {e}", exc_info=True)
        yield f"Streaming error: {str(e)}"
    finally:
        if not stream_task.done():
            stream_task.cancel()
            try:
                await stream_task
            except asyncio.CancelledError:
                LOG.debug("Stream task cancelled successfully")
            except Exception as e:
                LOG.error(f"Error during stream task cleanup: {e}")


chat_function = langchain_chat if llm_instance else None

@ai_router.post("/ai")
@handle_exceptions(logger=LOG)
async def ai(c: AI):
    return StreamingResponse(
        chat_function(chat_messages=c.messages), media_type="text/plain"
    )


@ai_router.get("/ai/check")
@handle_exceptions(logger=LOG)
async def check():
    return JSONResponse(content={
        "ai_system_enabled": bool(llm_instance and provider_info.get("configured", False)),
        "configured_backend_provider": AI_PROVIDER_BACKEND,
        "active_provider_details": provider_info
    })