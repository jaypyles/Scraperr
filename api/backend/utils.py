# STL
import logging
from typing import Optional

LOG = logging.getLogger(__name__)


def get_log_level(level_name: Optional[str]) -> int:
    level = logging.INFO

    if level_name:
        level_name = level_name.upper()
        level = getattr(logging, level_name, logging.INFO)

    return level
