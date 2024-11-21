from typing import Any, Optional
import logging
import json

LOG = logging.getLogger(__name__)


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


def format_list_for_query(ids: list[str]):
    return (
        f"({','.join(['?' for _ in ids])})"  # Returns placeholders, e.g., "(?, ?, ?)"
    )


def format_sql_row_to_python(row: dict[str, Any]):
    new_row: dict[str, Any] = {}
    for key, value in row.items():
        if isinstance(value, str):
            try:
                new_row[key] = json.loads(value)
            except json.JSONDecodeError:
                new_row[key] = value
        else:
            new_row[key] = value

    return new_row


def format_json(items: list[Any]):
    for idx, item in enumerate(items):
        LOG.info(f"Formatting item: {item}")
        if isinstance(item, (dict, list)):
            formatted_item = json.dumps(item)
            LOG.info(f"Formatted item: {formatted_item}")
            LOG.info(f"Formatted item class: {type(formatted_item)}")
            items[idx] = formatted_item
