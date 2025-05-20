import os
import logging
import asyncio 
from typing import AsyncGenerator, List, Dict, Any, Optional, cast
from pydantic import Field, SecretStr

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse

from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, BaseMessage
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI
from langchain_community.chat_models import ChatOllama
from langchain.callbacks.streaming_aiter import AsyncIteratorCallbackHandler

from api.backend.models import AI as AIRequestModel

LOG = logging.getLogger(__name__)
ai_router = APIRouter()

AI_PROVIDER_BACKEND = os.getenv("AI_PROVIDER_BACKEND", "openai").lower()

OPENAI_API_KEY_ENV = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL_NAME_ENV = os.getenv("OPENAI_MODEL_NAME", "gpt-4o") 

OLLAMA_BASE_URL_ENV = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434") # Common default
OLLAMA_MODEL_NAME_ENV = os.getenv("OLLAMA_MODEL_NAME", "llama3")

OPENROUTER_API_KEY_ENV = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL_NAME_ENV = os.getenv("OPENROUTER_MODEL_NAME", "mistralai/mistral-7b-instruct")
OPENROUTER_API_BASE_ENV = os.getenv("OPENROUTER_API_BASE", "https://openrouter.ai/api/v1")
OPENROUTER_SITE_URL_ENV = os.getenv("OPENROUTER_SITE_URL", "http://localhost:3000")
OPENROUTER_APP_NAME_ENV = os.getenv("OPENROUTER_APP_NAME", "Scraperr")

chat_llm: Optional[BaseChatModel] = None
current_provider_info: Dict[str, Any] = {"name": "None", "model": None, "configured": False, "error": None}

class ChatOpenRouter(ChatOpenAI):
    openai_api_key: Optional[SecretStr] = Field(
        alias=OPENROUTER_API_KEY_ENV,
        default_factory=OPENROUTER_API_KEY_ENV
    )
    @property
    def lc_secrets(self) -> dict[str, str]:
        return {"openai_api_key": "OPENROUTER_API_KEY"}

    def __init__(self,
                 openai_api_key: Optional[str] = None,
                 **kwargs):
        openai_api_key = (
            openai_api_key or os.environ.get("OPENROUTER_API_KEY")
        )
        super().__init__(
            base_url="https://openrouter.ai/api/v1",
            openai_api_key=openai_api_key,
            **kwargs
        )

try:
    LOG.info(f"Attempting to initialize AI provider: {AI_PROVIDER_BACKEND}")

    if AI_PROVIDER_BACKEND == "openai": # This is for backward compatibility with people who may have already cloned this repo
        if OPENAI_API_KEY_ENV and OPENAI_MODEL_NAME_ENV:
            chat_llm = ChatOpenAI(
                model=OPENAI_MODEL_NAME_ENV,
                api_key=OPENAI_API_KEY_ENV,
                streaming=True, 
                temperature=0.7,
                # max_tokens= Can be set if desired
            )
            current_provider_info = {"name": "OpenAI", "model": OPENAI_MODEL_NAME_ENV, "configured": True}
            LOG.info(f"Langchain initialized with OpenAI provider. Model: {OPENAI_MODEL_NAME_ENV}")
        else:
            err_msg = "OpenAI API key or model name not provided for Langchain ChatOpenAI."
            LOG.error(err_msg)
            current_provider_info.update({"name": "OpenAI", "configured": False, "error": err_msg})

    elif AI_PROVIDER_BACKEND == "ollama": # This is for backward compatibility with people who may have already cloned this repo
        if OLLAMA_BASE_URL_ENV and OLLAMA_MODEL_NAME_ENV:
            chat_llm = ChatOllama(
                base_url=OLLAMA_BASE_URL_ENV,
                model=OLLAMA_MODEL_NAME_ENV,
                temperature=0.7,
                # Callbacks for streaming are passed during the .astream call
            )
            current_provider_info = {"name": "Ollama", "model": OLLAMA_MODEL_NAME_ENV, "configured": True}
            LOG.info(f"Langchain initialized with Ollama provider. Model: {OLLAMA_MODEL_NAME_ENV}, URL: {OLLAMA_BASE_URL_ENV}")
        else:
            err_msg = "Ollama base URL or model name not provided for Langchain ChatOllama."
            LOG.error(err_msg)
            current_provider_info.update({"name": "Ollama", "configured": False, "error": err_msg})

    elif AI_PROVIDER_BACKEND == "openrouter":
        if OPENROUTER_API_KEY_ENV and OPENROUTER_MODEL_NAME_ENV:
            chat_llm = ChatOpenRouter(
                model=OPENAI_MODEL_NAME_ENV
            )
            current_provider_info = {"name": "OpenRouter", "model": OPENROUTER_MODEL_NAME_ENV, "configured": True}
            LOG.info(f"Langchain initialized with OpenRouter provider. Model: {OPENROUTER_MODEL_NAME_ENV}")
        else:
            err_msg = "OpenRouter API key or model name not provided for Langchain (via OpenRouter)."
            LOG.error(err_msg)
            current_provider_info.update({"name": "OpenRouter", "configured": False, "error": err_msg})
    else:
        err_msg = f"Unsupported AI_PROVIDER_BACKEND: {AI_PROVIDER_BACKEND}. AI features will be disabled."
        LOG.error(err_msg)
        current_provider_info.update({"name": "Unknown", "configured": False, "error": err_msg})

except ImportError as e:
    err_msg = f"Failed to import Langchain modules. Ensure langchain, langchain-openai, langchain-community are installed: {e}"
    LOG.critical(err_msg, exc_info=True) 
    chat_llm = None
    current_provider_info.update({"configured": False, "error": err_msg})
except Exception as e:
    err_msg = f"Generic error initializing Langchain chat model: {e}"
    LOG.critical(err_msg, exc_info=True)
    chat_llm = None
    current_provider_info.update({"configured": False, "error": err_msg})

# --- Helper Functions ---
def convert_to_langchain_messages(messages: List[Dict[str, Any]]) -> List[BaseMessage]:
    lc_messages: List[BaseMessage] = []
    for msg_dict in messages:
        role = str(msg_dict.get("role", "user")).lower() 
        content = str(msg_dict.get("content", ""))     

        if role == "user":
            lc_messages.append(HumanMessage(content=content))
        elif role == "assistant" or role == "ai": # 'ai' is also a common alias
            lc_messages.append(AIMessage(content=content))
        elif role == "system":
            lc_messages.append(SystemMessage(content=content))
        else:
            LOG.warning(f"Unknown message role '{role}' found in input. Treating as human message.")
            lc_messages.append(HumanMessage(content=content)) # Default to HumanMessage
    return lc_messages

async def langchain_chat_stream_generator(
    llm_to_use: BaseChatModel, # Explicitly pass the LLM instance
    lc_input_messages: List[BaseMessage]
) -> AsyncGenerator[str, None]:
    """
    Streams responses from the Langchain LLM using AsyncIteratorCallbackHandler.
    A new callback handler is created for each request.
    """
    callback_handler = AsyncIteratorCallbackHandler() # Create a new handler for this specific request
    run_config = RunnableConfig(callbacks=[callback_handler]) # Modern way to pass callbacks

    async def llm_astream_task_wrapper():
        """Wraps the llm.astream call to handle its lifecycle."""
        try:
            # astream directly with the list of messages and the config containing callbacks
            # The astream method itself iterates and invokes callbacks.
            # We just need to ensure this coroutine runs to completion.
            # The result of astream is an AsyncIterator of AIMessageChunk or similar.
            # We don't directly consume it here; the callback handler does.
            async for _ in llm_to_use.astream(lc_input_messages, config=run_config):
                pass # The callback handler is being populated by this iteration.
        except Exception as e:
            LOG.error(f"Error during LLM astream execution: {e}", exc_info=True)
            # Attempt to signal error to the callback handler if it has a way to receive it
            # For AsyncIteratorCallbackHandler, errors during generation are often picked up
            # by the consumer of callback_handler.aiter() if the callback itself raises.
            # If the astream call itself fails before yielding, the task will have an exception.
            # Ensure the callback's done event is set so aiter() doesn't hang.
            if not callback_handler.done.is_set():
                callback_handler.done.set() # Signal completion/error to stop aiter()
            raise # Re-raise to mark the task as failed
        finally:
            # Ensure the callback handler's done event is set when streaming finishes or errors.
            if not callback_handler.done.is_set():
                callback_handler.done.set()

    # Start the LLM streaming in a background task
    # This allows us to concurrently iterate over callback_handler.aiter()
    background_llm_task = asyncio.create_task(llm_astream_task_wrapper())

    try:
        async for token in callback_handler.aiter():
            yield token
    except Exception as e:
        LOG.error(f"Error iterating over Langchain callback handler: {e}", exc_info=True)
        yield f"An error occurred while streaming the response: {str(e)}"
    finally:
        if not background_llm_task.done():
            LOG.info("Cancelling background LLM task as streaming response generator is ending.")
            background_llm_task.cancel()
            try:
                await background_llm_task
            except asyncio.CancelledError:
                LOG.info("Background LLM task was successfully cancelled.")
            except Exception as task_ex:
                LOG.error(f"Exception in background LLM task during cleanup: {task_ex}", exc_info=True)
        elif background_llm_task.exception():
            LOG.error(f"Background LLM task completed with an exception: {background_llm_task.exception()}", exc_info=True)
        else:
            LOG.info("Background LLM task completed successfully.")


@ai_router.post("/ai")
async def unified_ai_chat_endpoint(request_data: AIRequestModel):
    if not chat_llm or not current_provider_info.get("configured", False):
        error_detail = current_provider_info.get("error") or f"AI Provider '{AI_PROVIDER_BACKEND}' not configured or LLM initialization failed."
        LOG.error(error_detail)
        raise HTTPException(status_code=503, detail=error_detail)

    if not request_data.messages:
        LOG.warning("Received AI request with no messages.")
        raise HTTPException(status_code=400, detail="No messages provided in the request.")

    if not all(isinstance(msg, dict) for msg in request_data.messages):
        LOG.error("Invalid message format: messages should be a list of dictionaries.")
        raise HTTPException(status_code=400, detail="Invalid message format. Expected a list of message dictionaries.")

    langchain_formatted_messages = convert_to_langchain_messages(cast(List[Dict[str, Any]], request_data.messages))

    LOG.info(
        f"Processing AI request via Langchain. Provider: {current_provider_info.get('name')}, "
        f"Model: {current_provider_info.get('model')}"
    )

    assert chat_llm is not None

    return StreamingResponse(
        langchain_chat_stream_generator(chat_llm, langchain_formatted_messages),
        media_type="text/plain"
    )

@ai_router.get("/ai/check")
async def check_ai_provider_status():
    return JSONResponse(content={
        "ai_system_enabled": bool(chat_llm and current_provider_info.get("configured", False)),
        "configured_backend_provider": AI_PROVIDER_BACKEND, 
        "active_provider_details": current_provider_info 
    })