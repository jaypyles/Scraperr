# STL
import os
import sys
from logging.config import fileConfig

# PDM
from dotenv import load_dotenv
from sqlalchemy import pool, engine_from_config

# LOCAL
from alembic import context
from api.backend.database.base import Base
from api.backend.database.models import Job, User, CronJob  # type: ignore

load_dotenv()

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "api")))

# Load the raw async database URL
raw_database_url = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///data/database.db")

# Map async dialects to sync ones
driver_downgrade_map = {
    "sqlite+aiosqlite": "sqlite",
    "postgresql+asyncpg": "postgresql",
    "mysql+aiomysql": "mysql",
}

# Extract scheme and convert if async
for async_driver, sync_driver in driver_downgrade_map.items():
    if raw_database_url.startswith(async_driver + "://"):
        sync_database_url = raw_database_url.replace(async_driver, sync_driver, 1)
        break

else:
    # No async driver detected — assume it's already sync
    sync_database_url = raw_database_url


# Apply it to Alembic config
config = context.config
config.set_main_option("sqlalchemy.url", sync_database_url)

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
