# STL
import logging
from typing import Any

# LOCAL
from api.backend.database.utils import format_list_for_query
from api.backend.database.common import query, insert, update

JOB_INSERT_QUERY = """
INSERT INTO jobs 
(id, url, elements, user, time_created, result, status, chat, job_options, agent_mode, prompt)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
"""

DELETE_JOB_QUERY = """
DELETE FROM jobs WHERE id IN ()
"""

LOG = logging.getLogger("Database")


def insert_job(item: dict[str, Any]) -> None:
    insert(
        JOB_INSERT_QUERY,
        (
            item["id"],
            item["url"],
            item["elements"],
            item["user"],
            item["time_created"],
            item["result"],
            item["status"],
            item["chat"],
            item["job_options"],
            item["agent_mode"],
            item["prompt"],
        ),
    )
    LOG.info(f"Inserted item: {item}")


async def get_queued_job():
    queued_job_query = (
        "SELECT * FROM jobs WHERE status = 'Queued' ORDER BY time_created DESC LIMIT 1"
    )

    res = query(queued_job_query)
    LOG.info(f"Got queued job: {res}")
    return res[0] if res else None


async def update_job(ids: list[str], updates: dict[str, Any]):
    if not updates:
        return

    set_clause = ", ".join(f"{field} = ?" for field in updates.keys())
    query = f"UPDATE jobs SET {set_clause} WHERE id IN {format_list_for_query(ids)}"
    values = list(updates.values()) + ids
    res = update(query, tuple(values))
    LOG.debug(f"Updated job: {res}")


async def delete_jobs(jobs: list[str]):
    if not jobs:
        LOG.info("No jobs to delete.")
        return False

    query = f"DELETE FROM jobs WHERE id IN {format_list_for_query(jobs)}"
    res = update(query, tuple(jobs))

    LOG.info(f"Deleted jobs: {res}")

    return res
