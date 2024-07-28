# STL
from datetime import timedelta

# PDM
from fastapi import Depends, APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

# LOCAL
from api.backend.schemas import User, Token, UserCreate
from api.backend.database import get_user_collection
from api.backend.auth.auth_utils import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user,
    authenticate_user,
    get_password_hash,
    create_access_token,
)

auth_router = APIRouter()


@auth_router.post("/auth/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
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
async def create_user(user: UserCreate):
    users_collection = get_user_collection()
    hashed_password = get_password_hash(user.password)
    user_dict = user.model_dump()
    user_dict["hashed_password"] = hashed_password
    del user_dict["password"]
    _ = await users_collection.insert_one(user_dict)
    return user_dict


@auth_router.get("/auth/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
