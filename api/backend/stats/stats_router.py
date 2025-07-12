# STL
import logging

# PDM
from fastapi import Depends, APIRouter
from sqlalchemy.ext.asyncio import AsyncSession

# LOCAL
from api.backend.auth.schemas import User
from api.backend.database.base import get_db
from api.backend.auth.auth_utils import get_current_user
from api.backend.routers.handle_exceptions import handle_exceptions
from api.backend.database.queries.statistics.statistic_queries import (
    get_jobs_per_day,
    average_elements_per_link,
)

LOG = logging.getLogger("Statistics")

stats_router = APIRouter()


@stats_router.get("/statistics/get-average-element-per-link")
@handle_exceptions(logger=LOG)
async def get_average_element_per_link(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    return await average_elements_per_link(db, user.email)


@stats_router.get("/statistics/get-average-jobs-per-day")
@handle_exceptions(logger=LOG)
async def average_jobs_per_day(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    data = await get_jobs_per_day(db, user.email)
    return data
