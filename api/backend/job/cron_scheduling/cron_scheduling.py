# STL
import uuid
import logging
import datetime
from typing import Any, List

# PDM
from apscheduler.triggers.cron import CronTrigger
from apscheduler.schedulers.asyncio import AsyncIOScheduler

# LOCAL
from api.backend.job import insert as insert_job
from api.backend.database.base import SessionLocal
from api.backend.database.models import Job, CronJob

LOG = logging.getLogger("Cron")


def insert_cron_job(cron_job: CronJob) -> bool:
    with SessionLocal() as session:
        session.add(cron_job)
        session.commit()
    return True


def delete_cron_job(id: str, user_email: str) -> bool:
    with SessionLocal() as session:
        cron_job = (
            session.query(CronJob).filter_by(id=id, user_email=user_email).first()
        )
        if cron_job:
            session.delete(cron_job)
            session.commit()
    return True


def get_cron_jobs(user_email: str) -> List[CronJob]:
    with SessionLocal() as session:
        return session.query(CronJob).filter_by(user_email=user_email).all()


def get_all_cron_jobs() -> List[CronJob]:
    with SessionLocal() as session:
        return session.query(CronJob).all()


async def insert_job_from_cron_job(job: dict[str, Any]):
    await insert_job(
        {
            **job,
            "id": uuid.uuid4().hex,
            "status": "Queued",
            "result": "",
            "chat": None,
            "time_created": datetime.datetime.now(datetime.timezone.utc),
            "time_updated": datetime.datetime.now(datetime.timezone.utc),
        }
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


def start_cron_scheduler(scheduler: AsyncIOScheduler):
    with SessionLocal() as session:
        cron_jobs = session.query(CronJob).all()

        LOG.info(f"Cron jobs: {cron_jobs}")

        for cron_job in cron_jobs:
            queried_job = session.query(Job).filter_by(id=cron_job.job_id).first()

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
