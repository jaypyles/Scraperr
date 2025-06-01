import os
from api.backend.database.common import connect, QUERIES, insert
import logging
import sqlite3

from api.backend.auth.auth_utils import get_password_hash

LOG = logging.getLogger(__name__)


def init_database():
    cursor = connect()

    for query in QUERIES["init"].strip().split(";"):
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

    if os.environ.get("REGISTRATION_ENABLED", "true").lower() == "false":
        default_user_email = os.environ.get("DEFAULT_USER_EMAIL")
        default_user_password = os.environ.get("DEFAULT_USER_PASSWORD")
        default_user_full_name = os.environ.get("DEFAULT_USER_FULL_NAME")

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

    cursor.close()
