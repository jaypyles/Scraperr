# STL
import os
import logging
import asyncio
from typing import AsyncGenerator, List, Dict, Any, Optional, cast

# PDM
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, BaseMessage
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI
from langchain_community.chat_models import ChatOllama
from langchain.callbacks.streaming_aiter import AsyncIteratorCallbackHandler
from langchain_core.exceptions import LangChainException

# LOCAL
from api.backend.models import AI as AIRequestModel

LOG = logging.getLogger(__name__)
ai_router = APIRouter()


AI_PROVIDER_BACKEND = os.getenv("AI_PROVIDER_BACKEND")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL_NAME = os.getenv("OPENAI_MODEL_NAME")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL")
OLLAMA_MODEL_NAME = os.getenv("OLLAMA_MODEL_NAME")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL_NAME = os.getenv("OPENROUTER_MODEL_NAME")

# Global State
llm_instance: Optional[BaseChatModel] = None
provider_info: Dict[str, Any] = {
    "name": "None", 
    "model": None, 
    "configured": False, 
    "error": None
}

class ChatOpenRouter(ChatOpenAI):    
    def __init__(self, openai_api_key: Optional[str] = None, **kwargs):
        api_key = openai_api_key or os.environ.get("OPENROUTER_API_KEY")
        super().__init__(
            base_url="https://openrouter.ai/api/v1",
            openai_api_key=api_key,
            **kwargs
        )


def create_openai_provider() -> tuple[Optional[BaseChatModel], Dict[str, Any]]:
    if not OPENAI_API_KEY or not OPENAI_MODEL_NAME:
        error_msg = "OpenAI API key or model name not provided."
        return None, {"name": "OpenAI", "configured": False, "error": error_msg}
    
    try:
        llm = ChatOpenAI(
            model=OPENAI_MODEL_NAME,
            api_key=OPENAI_API_KEY,
            streaming=True,
            temperature=0.7,
        )
        info = {"name": "OpenAI", "model": OPENAI_MODEL_NAME, "configured": True}
        LOG.info(f"Initialized OpenAI provider. Model: {OPENAI_MODEL_NAME}")
        return llm, info
    except Exception as e:
        error_msg = f"Failed to initialize OpenAI provider: {e}"
        LOG.error(error_msg)
        return None, {"name": "OpenAI", "configured": False, "error": error_msg}


def create_ollama_provider() -> tuple[Optional[BaseChatModel], Dict[str, Any]]:
    if not OLLAMA_BASE_URL or not OLLAMA_MODEL_NAME:
        error_msg = "Ollama base URL or model name not provided."
        return None, {"name": "Ollama", "configured": False, "error": error_msg}
    
    try:
        llm = ChatOllama(
            base_url=OLLAMA_BASE_URL,
            model=OLLAMA_MODEL_NAME,
            temperature=0.7,
        )
        info = {"name": "Ollama", "model": OLLAMA_MODEL_NAME, "configured": True}
        LOG.info(f"Initialized Ollama provider. Model: {OLLAMA_MODEL_NAME}, URL: {OLLAMA_BASE_URL}")
        return llm, info
    except Exception as e:
        error_msg = f"Failed to initialize Ollama provider: {e}"
        LOG.error(error_msg)
        return None, {"name": "Ollama", "configured": False, "error": error_msg}


def create_openrouter_provider() -> tuple[Optional[BaseChatModel], Dict[str, Any]]:
    if not OPENROUTER_API_KEY or not OPENROUTER_MODEL_NAME:
        error_msg = "OpenRouter API key or model name not provided."
        return None, {"name": "OpenRouter", "configured": False, "error": error_msg}
    
    try:
        llm = ChatOpenRouter(
            model=OPENROUTER_MODEL_NAME, 
            openai_api_key=OPENROUTER_API_KEY,
            streaming=True,
            temperature=0.7,
        )
        info = {"name": "OpenRouter", "model": OPENROUTER_MODEL_NAME, "configured": True}
        LOG.info(f"Initialized OpenRouter provider. Model: {OPENROUTER_MODEL_NAME}")
        return llm, info
    except Exception as e:
        error_msg = f"Failed to initialize OpenRouter provider: {e}"
        LOG.error(error_msg)
        return None, {"name": "OpenRouter", "configured": False, "error": error_msg}


def initialize_ai_provider() -> None:
    global llm_instance, provider_info
    
    if not AI_PROVIDER_BACKEND:
        provider_info.update({"configured": False, "error": "No AI provider specified"})
        return
    
    LOG.info(f"Initializing AI provider: {AI_PROVIDER_BACKEND}")
    
    provider_factories = {
        "openai": create_openai_provider,
        "ollama": create_ollama_provider, 
        "openrouter": create_openrouter_provider,
    }
    
    factory = provider_factories.get(AI_PROVIDER_BACKEND)
    if not factory:
        error_msg = f"Unsupported AI provider: {AI_PROVIDER_BACKEND}"
        LOG.error(error_msg)
        provider_info.update({"configured": False, "error": error_msg})
        return
    
    try:
        llm_instance, provider_info = factory()
    except ImportError as e:
        error_msg = f"Missing dependencies for {AI_PROVIDER_BACKEND}: {e}"
        LOG.error(error_msg)
        provider_info.update({"configured": False, "error": error_msg})
    except Exception as e:
        error_msg = f"Unexpected error initializing {AI_PROVIDER_BACKEND}: {e}"
        LOG.error(error_msg, exc_info=True)
        provider_info.update({"configured": False, "error": error_msg})


def convert_to_langchain_messages(messages: List[Dict[str, Any]]) -> List[BaseMessage]:
    lc_messages: List[BaseMessage] = []
    
    for msg_dict in messages:
        role = str(msg_dict.get("role", "user")).lower()
        content = str(msg_dict.get("content", ""))
        
        if role == "user":
            lc_messages.append(HumanMessage(content=content))
        elif role in ("assistant", "ai"):
            lc_messages.append(AIMessage(content=content))
        elif role == "system":
            lc_messages.append(SystemMessage(content=content))
        else:
            LOG.warning(f"Unknown message role '{role}', treating as user message")
            lc_messages.append(HumanMessage(content=content))
    
    return lc_messages


async def setup_llm_streaming(
    llm: BaseChatModel, 
    messages: List[BaseMessage]
) -> AsyncGenerator[str, None]:
    callback_handler = AsyncIteratorCallbackHandler()
    run_config = RunnableConfig(callbacks=[callback_handler])
    
    async def stream_llm_task():
        try:
            async for _ in llm.astream(messages, config=run_config):
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
        # Cleanup
        if not stream_task.done():
            stream_task.cancel()
            try:
                await stream_task
            except asyncio.CancelledError:
                LOG.debug("Stream task cancelled successfully")
            except Exception as e:
                LOG.error(f"Error during stream task cleanup: {e}")


@ai_router.post("/ai")
async def chat_endpoint(request_data: AIRequestModel):
    if not llm_instance or not provider_info.get("configured", False):
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
            setup_llm_streaming(llm_instance, lc_messages),
            media_type="text/plain"
        )
    
    except Exception as e:
        LOG.error(f"Error processing AI request: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@ai_router.get("/ai/check")
async def check_ai_status():
    """Check AI provider status and configuration."""
    print(f"llm_instance: {llm_instance} and provider_info: {provider_info}")
    return JSONResponse(content={
        "ai_system_enabled": bool(llm_instance and provider_info.get("configured", False)),
        "configured_backend_provider": AI_PROVIDER_BACKEND,
        "active_provider_details": provider_info
    })


initialize_ai_provider()