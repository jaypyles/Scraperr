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

LOG = logging.getLogger(__name__)
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
async def ai(request_data: AIRequestModel):
    if not chat_function or not provider_info.get("configured", False):
        error_detail = provider_info.get("error") or "AI provider not configured"
        LOG.error(f"AI request failed: {error_detail}")
        raise HTTPException(status_code=503, detail=error_detail)
    
    if not request_data.messages:
        raise HTTPException(status_code=400, detail="No messages provided")
    
    if not all(isinstance(msg, dict) for msg in request_data.messages):
        raise HTTPException(
            status_code=400, 
            detail="Invalid message format. Expected list of message dictionaries."
        )
    
    try:
        lc_messages = convert_to_langchain_messages(
            cast(List[Dict[str, Any]], request_data.messages)
        )
        
        LOG.info(
            f"Processing AI request. Provider: {provider_info.get('name')}, "
            f"Model: {provider_info.get('model')}, Messages: {len(lc_messages)}"
        )
        
        return StreamingResponse(
            chat_function(lc_messages),
            media_type="text/plain"
        )
    
    except Exception as e:
        LOG.error(f"Error processing AI request: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@ai_router.get("/ai/check")
async def check():
    return JSONResponse(content={
        "ai_system_enabled": bool(llm_instance and provider_info.get("configured", False)),
        "configured_backend_provider": AI_PROVIDER_BACKEND,
        "active_provider_details": provider_info
    })