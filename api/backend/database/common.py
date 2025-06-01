# STL
import logging
import sqlite3
from typing import Any, Optional

# LOCAL
from api.backend.constants import DATABASE_PATH
from api.backend.database.utils import format_json, format_sql_row_to_python

LOG = logging.getLogger("Database")


def connect():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.set_trace_callback(print)
    cursor = connection.cursor()
    return cursor


def insert(query: str, values: tuple[Any, ...]):
    connection = sqlite3.connect(DATABASE_PATH)
    cursor = connection.cursor()
    copy = list(values)
    format_json(copy)

    try:
        _ = cursor.execute(query, copy)
        connection.commit()

    except sqlite3.Error as e:
        LOG.error(f"An error occurred: {e}")

    finally:
        cursor.close()
        connection.close()


def query(query: str, values: Optional[tuple[Any, ...]] = None):
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()
    rows = []
    try:
        if values:
            _ = cursor.execute(query, values)
        else:
            _ = cursor.execute(query)

        rows = cursor.fetchall()

    finally:
        cursor.close()
        connection.close()

    formatted_rows: list[dict[str, Any]] = []

    for row in rows:
        row = dict(row)
        formatted_row = format_sql_row_to_python(row)
        formatted_rows.append(formatted_row)

    return formatted_rows


def update(query: str, values: Optional[tuple[Any, ...]] = None):
    connection = sqlite3.connect(DATABASE_PATH)
    cursor = connection.cursor()

    copy = None

    if values:
        copy = list(values)
        format_json(copy)

    try:
        if copy:
            res = cursor.execute(query, copy)
        else:
            res = cursor.execute(query)
        connection.commit()
        return res.rowcount
    except sqlite3.Error as e:
        LOG.error(f"An error occurred: {e}")

    finally:
        cursor.close()
        connection.close()

    return 0
