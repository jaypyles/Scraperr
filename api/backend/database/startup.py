# STL
import logging
import sqlite3

# LOCAL
from api.backend.constants import (
    DEFAULT_USER_EMAIL,
    REGISTRATION_ENABLED,
    DEFAULT_USER_PASSWORD,
    DEFAULT_USER_FULL_NAME,
)
from api.backend.auth.auth_utils import get_password_hash
from api.backend.database.common import insert, connect
from api.backend.database.schema import INIT_QUERY

LOG = logging.getLogger("Startup Scripts")


def execute_startup_query():
    cursor = connect()

    for query in INIT_QUERY.strip().split(";"):
        query = query.strip()

        if not query:
            continue

        try:
            LOG.info(f"Executing query: {query}")
            _ = cursor.execute(query)

        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                LOG.warning(f"Skipping duplicate column error: {e}")
                continue
            else:
                LOG.error(f"Error executing query: {query}")
                raise

    cursor.close()


def init_database():
    execute_startup_query()

    if not REGISTRATION_ENABLED:
        default_user_email = DEFAULT_USER_EMAIL
        default_user_password = DEFAULT_USER_PASSWORD
        default_user_full_name = DEFAULT_USER_FULL_NAME

        if (
            not default_user_email
            or not default_user_password
            or not default_user_full_name
        ):
            LOG.error(
                "DEFAULT_USER_EMAIL, DEFAULT_USER_PASSWORD, or DEFAULT_USER_FULL_NAME is not set!"
            )
            exit(1)

        query = "INSERT INTO users (email, hashed_password, full_name) VALUES (?, ?, ?)"
        _ = insert(
            query,
            (
                default_user_email,
                get_password_hash(default_user_password),
                default_user_full_name,
            ),
        )
