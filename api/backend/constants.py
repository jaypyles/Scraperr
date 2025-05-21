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

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
