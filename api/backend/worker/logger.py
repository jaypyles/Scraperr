import logging
import os
import sys

from api.backend.utils import get_log_level

logging.basicConfig(stream=sys.stdout, level=get_log_level(os.getenv("LOG_LEVEL")))
LOG = logging.getLogger(__name__)
