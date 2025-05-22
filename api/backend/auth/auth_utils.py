# STL
import os
import logging
from typing import Any, Optional
from datetime import datetime, timedelta

# PDM
from jose import JWTError, jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer

# LOCAL
from api.backend.auth.schemas import User, UserInDB, TokenData
from api.backend.database.common import query

LOG = logging.getLogger("Auth")

_ = load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY") or "secret"
ALGORITHM = os.getenv("ALGORITHM") or "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES") or 600

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

EMPTY_USER = User(email="", full_name="", disabled=False)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str):
    return pwd_context.hash(password)


async def get_user(email: str):
    user_query = "SELECT * FROM users WHERE email = ?"
    user = query(user_query, (email,))[0]

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
    LOG.debug(f"Getting current user with token: {token}")

    if not token:
        LOG.debug("No token provided")
        return EMPTY_USER

    if len(token.split(".")) != 3:
        LOG.error(f"Malformed token: {token}")
        return EMPTY_USER

    try:
        LOG.debug(
            f"Decoding token: {token} with secret key: {SECRET_KEY} and algorithm: {ALGORITHM}"
        )

        if token.startswith("Bearer "):
            token = token.split(" ")[1]

        payload: Optional[dict[str, Any]] = jwt.decode(
            token, SECRET_KEY, algorithms=[ALGORITHM]
        )

        if not payload:
            LOG.error("No payload found in token")
            return EMPTY_USER

        email = payload.get("sub")

        if email is None:
            LOG.error("No email found in payload")
            return EMPTY_USER

        token_data = TokenData(email=email)

    except JWTError as e:
        LOG.error(f"JWTError occurred: {e}")
        return EMPTY_USER

    except Exception as e:
        LOG.error(f"Exception occurred: {e}")
        return EMPTY_USER

    user = await get_user(email=token_data.email or "")

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

    user = await get_user(email=token_data.email or "")

    if user is None:
        raise credentials_exception

    return user
