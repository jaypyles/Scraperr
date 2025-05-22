# STL
import os
import sqlite3
from typing import Generator
from unittest.mock import patch

# PDM
import pytest
from proxy import Proxy

# LOCAL
from api.backend.database.schema import INIT_QUERY
from api.backend.tests.constants import TEST_DB_PATH


@pytest.fixture(scope="session", autouse=True)
def running_proxy():
    proxy = Proxy(["--hostname", "127.0.0.1", "--port", "8080"])
    proxy.setup()
    yield proxy
    proxy.shutdown()


@pytest.fixture(scope="session", autouse=True)
def patch_database_path():
    with patch("api.backend.database.common.DATABASE_PATH", TEST_DB_PATH):
        yield


@pytest.fixture(scope="session", autouse=True)
def patch_recordings_enabled():
    with patch("api.backend.job.scraping.scraping.RECORDINGS_ENABLED", False):
        yield


@pytest.fixture(scope="session")
def test_db_path() -> str:
    return TEST_DB_PATH


@pytest.fixture(scope="session", autouse=True)
def test_db(test_db_path: str) -> Generator[str, None, None]:
    """Create a fresh test database for each test function."""
    os.makedirs(os.path.dirname(test_db_path), exist_ok=True)

    if os.path.exists(test_db_path):
        os.remove(test_db_path)

    conn = sqlite3.connect(test_db_path)
    cursor = conn.cursor()

    for query in INIT_QUERY.strip().split(";"):
        query = query.strip()
        if query:
            cursor.execute(query)

    conn.commit()
    conn.close()

    yield test_db_path

    if os.path.exists(test_db_path):
        os.remove(test_db_path)
