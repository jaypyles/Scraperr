# STL
import uuid
import logging
import datetime
from typing import Any, List

# PDM
from sqlalchemy import select
from apscheduler.triggers.cron import CronTrigger
from apscheduler.schedulers.asyncio import AsyncIOScheduler

# LOCAL
from api.backend.job import insert as insert_job
from api.backend.database.base import AsyncSessionLocal
from api.backend.database.models import Job, CronJob

LOG = logging.getLogger("Cron")


async def insert_cron_job(cron_job: CronJob) -> bool:
    async with AsyncSessionLocal() as session:
        session.add(cron_job)
        await session.commit()
    return True


async def delete_cron_job(id: str, user_email: str) -> bool:
    async with AsyncSessionLocal() as session:
        stmt = select(CronJob).where(CronJob.id == id, CronJob.user_email == user_email)
        result = await session.execute(stmt)
        cron_job = result.scalars().first()
        if cron_job:
            await session.delete(cron_job)
            await session.commit()
    return True


async def get_cron_jobs(user_email: str) -> List[CronJob]:
    async with AsyncSessionLocal() as session:
        stmt = select(CronJob).where(CronJob.user_email == user_email)
        result = await session.execute(stmt)
        return list(result.scalars().all())


async def get_all_cron_jobs() -> List[CronJob]:
    async with AsyncSessionLocal() as session:
        stmt = select(CronJob)
        result = await session.execute(stmt)
        return list(result.scalars().all())


async def insert_job_from_cron_job(job: dict[str, Any]):
    async with AsyncSessionLocal() as session:
        await insert_job(
            {
                **job,
                "id": uuid.uuid4().hex,
                "status": "Queued",
                "result": "",
                "chat": None,
                "time_created": datetime.datetime.now(datetime.timezone.utc),
                "time_updated": datetime.datetime.now(datetime.timezone.utc),
            },
            session,
        )


def get_cron_job_trigger(cron_expression: str):
    expression_parts = cron_expression.split()

    if len(expression_parts) != 5:
        LOG.warning(f"Invalid cron expression: {cron_expression}")
        return None

    minute, hour, day, month, day_of_week = expression_parts

    return CronTrigger(
        minute=minute, hour=hour, day=day, month=month, day_of_week=day_of_week
    )


async def start_cron_scheduler(scheduler: AsyncIOScheduler):
    async with AsyncSessionLocal() as session:
        stmt = select(CronJob)
        result = await session.execute(stmt)
        cron_jobs = result.scalars().all()

        LOG.info(f"Cron jobs: {cron_jobs}")

        for cron_job in cron_jobs:
            stmt = select(Job).where(Job.id == cron_job.job_id)
            result = await session.execute(stmt)
            queried_job = result.scalars().first()

            LOG.info(f"Adding job: {queried_job}")

            trigger = get_cron_job_trigger(cron_job.cron_expression)  # type: ignore
            if not trigger:
                continue

            job_dict = (
                {
                    c.key: getattr(queried_job, c.key)
                    for c in queried_job.__table__.columns
                }
                if queried_job
                else {}
            )

            scheduler.add_job(
                insert_job_from_cron_job,
                trigger,
                id=cron_job.id,
                args=[job_dict],
            )
