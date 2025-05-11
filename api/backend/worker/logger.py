import logging
import os

from api.backend.utils import get_log_level

logging.basicConfig(
    level=get_log_level(os.getenv("LOG_LEVEL")),
    format="%(levelname)s:     %(asctime)s - %(name)s - %(message)s",
    handlers=[logging.StreamHandler()],
)

LOG = logging.getLogger(__name__)
