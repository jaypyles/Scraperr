# STL
import logging
import datetime
from typing import Any

# PDM
from sqlalchemy import delete as sql_delete
from sqlalchemy import select
from sqlalchemy import update as sql_update
from sqlalchemy.ext.asyncio import AsyncSession

# LOCAL
from api.backend.database.base import AsyncSessionLocal
from api.backend.database.models import Job

LOG = logging.getLogger("Job")


async def insert(item: dict[str, Any], db: AsyncSession) -> None:
    existing = await db.get(Job, item["id"])
    if existing:
        await multi_field_update_job(
            item["id"],
            {
                "agent_mode": item["agent_mode"],
                "prompt": item["prompt"],
                "job_options": item["job_options"],
                "elements": item["elements"],
                "status": "Queued",
                "result": [],
                "time_created": datetime.datetime.now(datetime.timezone.utc),
                "chat": None,
            },
            db,
        )
        return

    job = Job(
        id=item["id"],
        url=item["url"],
        elements=item["elements"],
        user=item["user"],
        time_created=datetime.datetime.now(datetime.timezone.utc),
        result=item["result"],
        status=item["status"],
        chat=item["chat"],
        job_options=item["job_options"],
        agent_mode=item["agent_mode"],
        prompt=item["prompt"],
    )

    db.add(job)
    await db.commit()
    LOG.debug(f"Inserted item: {item}")


async def check_for_job_completion(id: str) -> dict[str, Any]:
    async with AsyncSessionLocal() as session:
        job = await session.get(Job, id)
        return job.__dict__ if job else {}


async def get_queued_job():
    async with AsyncSessionLocal() as session:
        stmt = (
            select(Job)
            .where(Job.status == "Queued")
            .order_by(Job.time_created.desc())
            .limit(1)
        )
        result = await session.execute(stmt)
        job = result.scalars().first()
        LOG.debug(f"Got queued job: {job}")
        return job.__dict__ if job else None


async def update_job(ids: list[str], field: str, value: Any):
    async with AsyncSessionLocal() as session:
        stmt = sql_update(Job).where(Job.id.in_(ids)).values({field: value})
        res = await session.execute(stmt)
        await session.commit()
        LOG.debug(f"Updated job count: {res.rowcount}")


async def multi_field_update_job(
    id: str, fields: dict[str, Any], session: AsyncSession | None = None
):
    close_session = False
    if not session:
        session = AsyncSessionLocal()
        close_session = True

    try:
        stmt = sql_update(Job).where(Job.id == id).values(**fields)
        await session.execute(stmt)
        await session.commit()
        LOG.debug(f"Updated job {id} fields: {fields}")
    finally:
        if close_session:
            await session.close()


async def delete_jobs(jobs: list[str]):
    if not jobs:
        LOG.debug("No jobs to delete.")
        return False

    async with AsyncSessionLocal() as session:
        stmt = sql_delete(Job).where(Job.id.in_(jobs))
        res = await session.execute(stmt)
        await session.commit()
        LOG.debug(f"Deleted jobs: {res.rowcount}")
        return res.rowcount > 0
