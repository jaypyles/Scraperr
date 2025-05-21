# STL
import os
from pathlib import Path

DATABASE_PATH = "data/database.db"
RECORDINGS_DIR = Path("media/recordings")
RECORDINGS_ENABLED = os.getenv("RECORDINGS_ENABLED", "true").lower() == "true"
MEDIA_DIR = Path("media")
MEDIA_TYPES = [
    "audio",
    "documents",
    "images",
    "pdfs",
    "presentations",
    "spreadsheets",
    "videos",
]

REGISTRATION_ENABLED = os.getenv("REGISTRATION_ENABLED", "true").lower() == "true"
DEFAULT_USER_EMAIL = os.getenv("DEFAULT_USER_EMAIL")
DEFAULT_USER_PASSWORD = os.getenv("DEFAULT_USER_PASSWORD")
DEFAULT_USER_FULL_NAME = os.getenv("DEFAULT_USER_FULL_NAME")

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
