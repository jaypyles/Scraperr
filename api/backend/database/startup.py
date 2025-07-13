# STL
import logging

# PDM
from sqlalchemy.exc import IntegrityError

# LOCAL
from api.backend.constants import (
    DEFAULT_USER_EMAIL,
    REGISTRATION_ENABLED,
    DEFAULT_USER_PASSWORD,
    DEFAULT_USER_FULL_NAME,
)
from api.backend.database.base import Base, AsyncSessionLocal, engine
from api.backend.auth.auth_utils import get_password_hash
from api.backend.database.models import User

LOG = logging.getLogger("Database")

async def init_database():
    LOG.info("Creating database schema...")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    if not REGISTRATION_ENABLED:
        default_user_email = DEFAULT_USER_EMAIL
        default_user_password = DEFAULT_USER_PASSWORD
        default_user_full_name = DEFAULT_USER_FULL_NAME

        if not (default_user_email and default_user_password and default_user_full_name):
            LOG.error("DEFAULT_USER_* env vars are not set!")
            exit(1)

        async with AsyncSessionLocal() as session:
            user = await session.get(User, default_user_email)
            if user:
                LOG.info("Default user already exists. Skipping creation.")
                return

            LOG.info("Creating default user...")
            new_user = User(
                email=default_user_email,
                hashed_password=get_password_hash(default_user_password),
                full_name=default_user_full_name,
                disabled=False,
            )

            try:
                session.add(new_user)
                await session.commit()
                LOG.info(f"Created default user: {default_user_email}")
            except IntegrityError as e:
                await session.rollback()
                LOG.warning(f"Could not create default user (already exists?): {e}")

