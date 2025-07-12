# STL
import os
import asyncio
from typing import Any, Generator, AsyncGenerator
from unittest.mock import patch

# PDM
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from proxy import Proxy
from sqlalchemy.pool import NullPool
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# LOCAL
from api.backend.app import app
from api.backend.database.base import get_db  # your original get_db
from api.backend.database.models import Base
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
def patch_db_path():
    with patch("api.backend.database.base.DATABASE_PATH", TEST_DB_PATH):
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

    # Create async engine for test database
    test_db_url = f"sqlite+aiosqlite:///{test_db_path}"
    engine = create_async_engine(test_db_url, echo=False)

    async def setup_db():
        async with engine.begin() as conn:
            # Create tables
            # LOCAL
            from api.backend.database.models import Base

            await conn.run_sync(Base.metadata.create_all)

    # Run setup
    asyncio.run(setup_db())

    yield test_db_path

    if os.path.exists(test_db_path):
        os.remove(test_db_path)


@pytest_asyncio.fixture(scope="session")
async def test_engine():
    test_db_url = f"sqlite+aiosqlite:///{TEST_DB_PATH}"
    engine = create_async_engine(test_db_url, poolclass=NullPool)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(test_engine: Any) -> AsyncGenerator[AsyncSession, None]:
    async_session = async_sessionmaker(
        bind=test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with async_session() as session:
        yield session


@pytest.fixture()
def override_get_db(db_session: AsyncSession):
    async def _override() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    return _override


@pytest_asyncio.fixture()
async def client(override_get_db: Any) -> AsyncGenerator[AsyncClient, None]:
    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

    app.dependency_overrides.clear()
