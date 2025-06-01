# STL
import os
import logging
from typing import Optional, Dict, Any, List

# PDM
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage, AIMessage
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_openai import ChatOpenAI
from langchain_community.chat_models import ChatOllama

LOG = logging.getLogger(__name__)

# Environment variables
AI_PROVIDER_BACKEND = os.getenv("AI_PROVIDER_BACKEND")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL_NAME = os.getenv("OPENAI_MODEL_NAME")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL")
OLLAMA_MODEL_NAME = os.getenv("OLLAMA_MODEL_NAME")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL_NAME = os.getenv("OPENROUTER_MODEL_NAME")

# Global state
llm_instance: Optional[BaseChatModel] = None
provider_info: Dict[str, Any] = {
    "name": "None", 
    "model": None, 
    "configured": False, 
    "error": None
}


class ChatOpenRouter(ChatOpenAI):
    """Custom OpenRouter client extending ChatOpenAI."""
    
    def __init__(self, openai_api_key: Optional[str] = None, **kwargs):
        api_key = openai_api_key or os.environ.get("OPENROUTER_API_KEY")
        super().__init__(
            base_url="https://openrouter.ai/api/v1",
            openai_api_key=api_key,
            **kwargs
        )


def create_openai_provider() -> tuple[Optional[BaseChatModel], Dict[str, Any]]:
    """Create OpenAI provider instance."""
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


async def ask_llm(prompt: str) -> str:
    """Simple non-streaming LLM query (similar to your old ask_open_ai/ask_ollama)."""
    if not llm_instance:
        raise ValueError("LLM client not initialized")
    
    try:
        messages = [HumanMessage(content=prompt)]
        response = await llm_instance.ainvoke(messages)
        
        content = response.content
        if not content:
            return ""
        
        if not isinstance(content, list):
            return str(content)
        
        text_parts: List[str] = []
        for item in content:
            if not isinstance(item, dict):
                text_parts.append(str(item))
            else:
                text_value = item.get("text")
                if text_value is not None:
                    text_parts.append(str(text_value))
                    
        return " ".join(text_parts) if text_parts else ""
            
    except Exception as e:
        LOG.error(f"Error in LLM query: {e}")
        raise


initialize_ai_provider()