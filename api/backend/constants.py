from pathlib import Path
import os

DATABASE_PATH = "data/database.db"
RECORDINGS_DIR = Path("media/recordings")
RECORDINGS_ENABLED = os.getenv("RECORDINGS_ENABLED", "true").lower() == "true"
