# STL
import os
import logging
from datetime import timedelta

# PDM
from fastapi import Depends, APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

# LOCAL
from api.backend.auth.schemas import User, Token, UserCreate
from api.backend.database.base import AsyncSessionLocal, get_db
from api.backend.auth.auth_utils import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user,
    authenticate_user,
    get_password_hash,
    create_access_token,
)
from api.backend.database.models import User as DatabaseUser
from api.backend.routers.handle_exceptions import handle_exceptions

auth_router = APIRouter()

LOG = logging.getLogger("Auth")


@auth_router.post("/auth/token", response_model=Token)
@handle_exceptions(logger=LOG)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(form_data.username, form_data.password, db)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    expire_minutes = (
        int(ACCESS_TOKEN_EXPIRE_MINUTES) if ACCESS_TOKEN_EXPIRE_MINUTES else 60
    )

    access_token_expires = timedelta(minutes=expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@auth_router.post("/auth/signup", response_model=User)
@handle_exceptions(logger=LOG)
async def create_user(user: UserCreate):
    hashed_password = get_password_hash(user.password)
    user_dict = user.model_dump()
    user_dict["hashed_password"] = hashed_password
    del user_dict["password"]

    async with AsyncSessionLocal() as session:
        new_user = DatabaseUser(
            email=user.email,
            hashed_password=user_dict["hashed_password"],
            full_name=user.full_name,
        )

        session.add(new_user)
        await session.commit()

    return user_dict


@auth_router.get("/auth/users/me", response_model=User)
@handle_exceptions(logger=LOG)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@auth_router.get("/auth/check")
@handle_exceptions(logger=LOG)
async def check_auth():
    return {
        "registration": os.environ.get("REGISTRATION_ENABLED", "True") == "True",
        "recordings_enabled": os.environ.get("RECORDINGS_ENABLED", "true").lower()
        == "true",
    }
