# STL
import logging
import datetime
from typing import Any

# PDM
from sqlalchemy import delete as sql_delete
from sqlalchemy import select
from sqlalchemy import update as sql_update
from sqlalchemy.orm import Session

# LOCAL
from api.backend.database.base import SessionLocal
from api.backend.database.models import Job

LOG = logging.getLogger("Job")


async def insert(item: dict[str, Any]) -> None:
    with SessionLocal() as session:
        existing = session.get(Job, item["id"])
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
                session,
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

        session.add(job)
        session.commit()
        LOG.debug(f"Inserted item: {item}")


def check_for_job_completion(id: str) -> dict[str, Any]:
    with SessionLocal() as session:
        job = session.get(Job, id)
        return job.__dict__ if job else {}


async def get_queued_job():
    with SessionLocal() as session:
        stmt = (
            select(Job)
            .where(Job.status == "Queued")
            .order_by(Job.time_created.desc())
            .limit(1)
        )
        result = session.execute(stmt).scalars().first()
        LOG.debug(f"Got queued job: {result}")
        return result.__dict__ if result else None


async def update_job(ids: list[str], field: str, value: Any):
    with SessionLocal() as session:
        stmt = sql_update(Job).where(Job.id.in_(ids)).values({field: value})
        res = session.execute(stmt)
        session.commit()
        LOG.debug(f"Updated job count: {res.rowcount}")


async def multi_field_update_job(
    id: str, fields: dict[str, Any], session: Session | None = None
):
    close_session = False
    if not session:
        session = SessionLocal()
        close_session = True

    try:
        stmt = sql_update(Job).where(Job.id == id).values(**fields)
        session.execute(stmt)
        session.commit()
        LOG.debug(f"Updated job {id} fields: {fields}")
    finally:
        if close_session:
            session.close()


async def delete_jobs(jobs: list[str]):
    if not jobs:
        LOG.debug("No jobs to delete.")
        return False

    with SessionLocal() as session:
        stmt = sql_delete(Job).where(Job.id.in_(jobs))
        res = session.execute(stmt)
        session.commit()
        LOG.debug(f"Deleted jobs: {res.rowcount}")
        return res.rowcount > 0
