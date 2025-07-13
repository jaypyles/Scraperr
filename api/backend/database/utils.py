# STL
import json
from typing import Any
from datetime import datetime


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
        if isinstance(item, (dict, list)):
            formatted_item = json.dumps(item)
            items[idx] = formatted_item


def parse_datetime(dt_str: str) -> datetime:
    if dt_str.endswith("Z"):
        dt_str = dt_str.replace("Z", "+00:00")  # valid ISO format for UTC
    return datetime.fromisoformat(dt_str)
