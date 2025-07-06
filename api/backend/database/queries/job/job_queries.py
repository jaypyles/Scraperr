# STL
import logging
from typing import Any

# PDM
from sqlalchemy import delete as sql_delete
from sqlalchemy import select
from sqlalchemy import update as sql_update

# LOCAL
from api.backend.database.base import SessionLocal
from api.backend.database.models import Job

LOG = logging.getLogger("Database")


def insert_job(item: dict[str, Any]) -> None:
    with SessionLocal() as session:
        job = Job(
            id=item["id"],
            url=item["url"],
            elements=item["elements"],
            user=item["user"],
            time_created=item["time_created"],
            result=item["result"],
            status=item["status"],
            chat=item["chat"],
            job_options=item["job_options"],
            agent_mode=item["agent_mode"],
            prompt=item["prompt"],
        )
        session.add(job)
        session.commit()
        LOG.info(f"Inserted item: {item}")


async def get_queued_job():
    with SessionLocal() as session:
        stmt = (
            select(Job)
            .where(Job.status == "Queued")
            .order_by(Job.time_created.desc())
            .limit(1)
        )
        result = session.execute(stmt).scalars().first()
        LOG.info(f"Got queued job: {result}")
        return result


async def update_job(ids: list[str], updates: dict[str, Any]):
    if not updates:
        return

    with SessionLocal() as session:
        stmt = sql_update(Job).where(Job.id.in_(ids)).values(**updates)
        result = session.execute(stmt)
        session.commit()
        LOG.debug(f"Updated job count: {result.rowcount}")


async def delete_jobs(jobs: list[str]):
    if not jobs:
        LOG.info("No jobs to delete.")
        return False

    with SessionLocal() as session:
        stmt = sql_delete(Job).where(Job.id.in_(jobs))
        result = session.execute(stmt)
        session.commit()
        LOG.info(f"Deleted jobs count: {result.rowcount}")
        return result.rowcount
