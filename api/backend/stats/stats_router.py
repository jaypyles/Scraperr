# STL
import logging

# PDM
from fastapi import Depends, APIRouter

# LOCAL
from api.backend.auth.schemas import User
from api.backend.auth.auth_utils import get_current_user
from api.backend.database.queries.statistics.statistic_queries import (
    get_jobs_per_day,
    average_elements_per_link,
)

LOG = logging.getLogger(__name__)

stats_router = APIRouter()


@stats_router.get("/statistics/get-average-element-per-link")
async def get_average_element_per_link(user: User = Depends(get_current_user)):
    return await average_elements_per_link(user.email)


@stats_router.get("/statistics/get-average-jobs-per-day")
async def average_jobs_per_day(user: User = Depends(get_current_user)):
    data = await get_jobs_per_day(user.email)
    return data
