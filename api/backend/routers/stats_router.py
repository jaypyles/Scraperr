# STL
import logging

# PDM
from fastapi import APIRouter, Depends

# LOCAL
from api.backend.job import (
    get_jobs_per_day,
    average_elements_per_link,
)
from api.backend.auth.auth_utils import get_current_user
from api.backend.schemas import User


LOG = logging.getLogger(__name__)

stats_router = APIRouter()


@stats_router.get("/statistics/get-average-element-per-link")
async def get_average_element_per_link(user: User = Depends(get_current_user)):
    return await average_elements_per_link(user.email)


@stats_router.get("/statistics/get-average-jobs-per-day")
async def average_jobs_per_day(user: User = Depends(get_current_user)):
    data = await get_jobs_per_day(user.email)
    return data
