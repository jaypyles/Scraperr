# STL
import os
from gc import disable
from queue import Empty
from typing import Any, Optional
from datetime import datetime, timedelta

# PDM
from jose import JWTError, jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer

# LOCAL
from api.backend.schemas import User, UserInDB, TokenData
from api.backend.database import get_user_collection

_ = load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY") or ""
ALGORITHM = os.getenv("ALGORITHM") or ""
ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

EMPTY_USER = User(email="", full_name="", disabled=False)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str):
    return pwd_context.hash(password)


async def get_user(email: str):
    user_collection = get_user_collection()
    user = await user_collection.find_one({"email": email})

    if not user:
        return

    return UserInDB(**user)


async def authenticate_user(email: str, password: str):
    user = await get_user(email)

    if not user:
        return False

    if not verify_password(password, user.hashed_password):
        return False

    return user


def create_access_token(
    data: dict[str, Any], expires_delta: Optional[timedelta] = None
):
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=15)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload: Optional[dict[str, Any]] = jwt.decode(
            token, SECRET_KEY, algorithms=[ALGORITHM]
        )
        if not payload:
            return EMPTY_USER

        email = payload.get("sub")

        if email is None:
            return EMPTY_USER

        token_data = TokenData(email=email)

    except JWTError:
        return EMPTY_USER

    user = await get_user(email=token_data.email)

    if user is None:
        return EMPTY_USER

    return user


async def require_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload: Optional[dict[str, Any]] = jwt.decode(
            token, SECRET_KEY, algorithms=[ALGORITHM]
        )
        if not payload:
            raise credentials_exception

        email = payload.get("sub")

        if email is None:
            raise credentials_exception

        token_data = TokenData(email=email)

    except JWTError:
        raise credentials_exception

    user = await get_user(email=token_data.email)

    if user is None:
        raise credentials_exception

    return user
