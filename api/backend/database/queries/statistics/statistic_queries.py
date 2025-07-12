# PDM
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

# LOCAL
from api.backend.database.models import Job


async def average_elements_per_link(session: AsyncSession, user_email: str):
    date_func = func.date(Job.time_created)

    stmt = (
        select(
            date_func.label("date"),
            func.avg(func.json_array_length(Job.elements)).label("average_elements"),
            func.count().label("count"),
        )
        .where(Job.status == "Completed", Job.user == user_email)
        .group_by(date_func)
        .order_by("date")
    )

    result = await session.execute(stmt)
    rows = result.all()
    return [dict(row._mapping) for row in rows]


async def get_jobs_per_day(session: AsyncSession, user_email: str):
    date_func = func.date(Job.time_created)

    stmt = (
        select(
            date_func.label("date"),
            func.count().label("job_count"),
        )
        .where(Job.status == "Completed", Job.user == user_email)
        .group_by(date_func)
        .order_by("date")
    )

    result = await session.execute(stmt)
    rows = result.all()
    return [dict(row._mapping) for row in rows]
