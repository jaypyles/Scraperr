import os

from openai import OpenAI
from ollama import AsyncClient


# Load environment variables
open_ai_key = os.getenv("OPENAI_KEY")
open_ai_model = os.getenv("OPENAI_MODEL")
llama_url = os.getenv("OLLAMA_URL")
llama_model = os.getenv("OLLAMA_MODEL")

# Initialize clients
openai_client = OpenAI(api_key=open_ai_key) if open_ai_key else None
llama_client = AsyncClient(host=llama_url) if llama_url else None


async def ask_open_ai(prompt: str) -> str:
    if not openai_client:
        raise ValueError("OpenAI client not initialized")

    response = openai_client.chat.completions.create(
        model=open_ai_model or "gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}],
    )

    return response.choices[0].message.content or ""


async def ask_ollama(prompt: str) -> str:
    if not llama_client:
        raise ValueError("Ollama client not initialized")

    response = await llama_client.chat(
        model=llama_model or "", messages=[{"role": "user", "content": prompt}]
    )

    return response.message.content or ""
