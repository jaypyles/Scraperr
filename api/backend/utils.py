from typing import Optional
import logging


def clean_text(text: str):
    text = text.replace("\r\n", "\n")  # Normalize newlines
    text = text.replace("\n", "\\n")  # Escape newlines
    text = text.replace('"', '\\"')  # Escape double quotes
    return text


def get_log_level(level_name: Optional[str]) -> int:
    level = logging.INFO

    if level_name:
        level_name = level_name.upper()
        level = getattr(logging, level_name, logging.INFO)

    return level
