# STL
import logging

# LOCAL
from api.backend.app import LOG_LEVEL

logging.basicConfig(
    level=LOG_LEVEL,
    format="%(levelname)s:     %(asctime)s - [%(name)s] - %(message)s",
    handlers=[logging.StreamHandler()],
)

LOG = logging.getLogger("Job Worker")
