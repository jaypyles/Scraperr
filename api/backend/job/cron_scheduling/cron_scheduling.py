# STL
import uuid
import logging
import datetime
from typing import Any

# PDM
from apscheduler.triggers.cron import CronTrigger
from apscheduler.schedulers.background import BackgroundScheduler

# LOCAL
from api.backend.job import insert as insert_job
from api.backend.schemas.cron import CronJob
from api.backend.database.common import query, insert

LOG = logging.getLogger("Cron Scheduler")


def insert_cron_job(cron_job: CronJob):
    query = """
    INSERT INTO cron_jobs (id, user_email, job_id, cron_expression, time_created, time_updated)
    VALUES (?, ?, ?, ?, ?, ?)
    """
    values = (
        cron_job.id,
        cron_job.user_email,
        cron_job.job_id,
        cron_job.cron_expression,
        cron_job.time_created,
        cron_job.time_updated,
    )

    insert(query, values)

    return True


def delete_cron_job(id: str, user_email: str):
    query = """
    DELETE FROM cron_jobs
    WHERE id = ? AND user_email = ?
    """
    values = (id, user_email)
    insert(query, values)

    return True


def get_cron_jobs(user_email: str):
    cron_jobs = query("SELECT * FROM cron_jobs WHERE user_email = ?", (user_email,))

    return cron_jobs


def get_all_cron_jobs():
    cron_jobs = query("SELECT * FROM cron_jobs")

    return cron_jobs


def insert_job_from_cron_job(job: dict[str, Any]):
    insert_job(
        {
            **job,
            "id": uuid.uuid4().hex,
            "status": "Queued",
            "result": "",
            "chat": None,
            "time_created": datetime.datetime.now(),
            "time_updated": datetime.datetime.now(),
        }
    )


def get_cron_job_trigger(cron_expression: str):
    expression_parts = cron_expression.split()

    if len(expression_parts) != 5:
        print(f"Invalid cron expression: {cron_expression}")
        return None

    minute, hour, day, month, day_of_week = expression_parts

    return CronTrigger(
        minute=minute, hour=hour, day=day, month=month, day_of_week=day_of_week
    )


def start_cron_scheduler(scheduler: BackgroundScheduler):
    cron_jobs = get_all_cron_jobs()

    LOG.info(f"Cron jobs: {cron_jobs}")

    for job in cron_jobs:
        queried_job = query("SELECT * FROM jobs WHERE id = ?", (job["job_id"],))

        LOG.info(f"Adding job: {queried_job}")

        scheduler.add_job(
            insert_job_from_cron_job,
            get_cron_job_trigger(job["cron_expression"]),
            id=job["id"],
            args=[queried_job[0]],
        )
