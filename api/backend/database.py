# STL
import os
from typing import Any

# PDM
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

_ = load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")


def get_user_collection():
    client: AsyncIOMotorClient[dict[str, Any]] = AsyncIOMotorClient(MONGODB_URI)
    db = client["scrape"]
    return db["users"]


def get_job_collection():
    client: AsyncIOMotorClient[dict[str, Any]] = AsyncIOMotorClient(MONGODB_URI)
    db = client["scrape"]
    return db["jobs"]
