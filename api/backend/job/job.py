# STL
import logging
import datetime
from typing import Any

# LOCAL
from api.backend.database.utils import format_list_for_query
from api.backend.database.common import query as common_query
from api.backend.database.common import insert as common_insert
from api.backend.database.common import update as common_update
from api.backend.database.queries.job.job_queries import JOB_INSERT_QUERY

LOG = logging.getLogger("Job")


async def insert(item: dict[str, Any]) -> None:
    if check_for_job_completion(item["id"]):
        await multi_field_update_job(
            item["id"],
            {
                "status": "Queued",
                "result": [],
                "time_created": datetime.datetime.now().isoformat(),
                "chat": None,
            },
        )
        return

    common_insert(
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

    LOG.debug(f"Inserted item: {item}")


def check_for_job_completion(id: str) -> dict[str, Any]:
    query = f"SELECT * FROM jobs WHERE id = ?"
    res = common_query(query, (id,))
    return res[0] if res else {}


async def get_queued_job():
    query = (
        "SELECT * FROM jobs WHERE status = 'Queued' ORDER BY time_created DESC LIMIT 1"
    )
    res = common_query(query)
    LOG.debug(f"Got queued job: {res}")
    return res[0] if res else None


async def update_job(ids: list[str], field: str, value: Any):
    query = f"UPDATE jobs SET {field} = ? WHERE id IN {format_list_for_query(ids)}"
    res = common_update(query, tuple([value] + ids))
    LOG.debug(f"Updated job: {res}")


async def multi_field_update_job(id: str, fields: dict[str, Any]):
    query = f"UPDATE jobs SET {', '.join(f'{field} = ?' for field in fields.keys())} WHERE id = ?"
    res = common_update(query, tuple(list(fields.values()) + [id]))
    LOG.debug(f"Updated job: {res}")


async def delete_jobs(jobs: list[str]):
    if not jobs:
        LOG.debug("No jobs to delete.")
        return False

    query = f"DELETE FROM jobs WHERE id IN {format_list_for_query(jobs)}"
    res = common_update(query, tuple(jobs))

    return res > 0
