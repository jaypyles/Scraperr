# STL
import os
from pathlib import Path

NOTIFICATION_CHANNEL = os.getenv("NOTIFICATION_CHANNEL", "")
NOTIFICATION_WEBHOOK_URL = os.getenv("NOTIFICATION_WEBHOOK_URL", "")
SCRAPERR_FRONTEND_URL = os.getenv("SCRAPERR_FRONTEND_URL", "")
EMAIL = os.getenv("EMAIL", "")
TO = os.getenv("TO", "")
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
USE_TLS = os.getenv("USE_TLS", "false").lower() == "true"

RECORDINGS_ENABLED = os.getenv("RECORDINGS_ENABLED", "true").lower() == "true"
RECORDINGS_DIR = Path("/project/app/media/recordings")
