# STL
import os
import logging

# LOCAL
from api.backend.utils import get_log_level

logging.basicConfig(
    level=get_log_level(os.getenv("LOG_LEVEL")),
    format="%(levelname)s:     %(asctime)s - [%(name)s] - %(message)s",
    handlers=[logging.StreamHandler()],
)

LOG = logging.getLogger("Job Worker")
