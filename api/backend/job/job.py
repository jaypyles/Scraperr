# STL
import logging
from typing import Any

# LOCAL
from api.backend.utils import format_list_for_query
from api.backend.database.common import (
    insert as common_insert,
    query as common_query,
    QUERIES,
    update as common_update,
)

LOG = logging.getLogger(__name__)


def insert(item: dict[str, Any]) -> None:
    common_insert(
        QUERIES["insert_job"],
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
        ),
    )
    LOG.info(f"Inserted item: {item}")


async def get_queued_job():
    query = (
        "SELECT * FROM jobs WHERE status = 'Queued' ORDER BY time_created DESC LIMIT 1"
    )
    res = common_query(query)
    LOG.info(f"Got queued job: {res}")
    return res[0] if res else None


async def update_job(ids: list[str], field: str, value: Any):
    query = f"UPDATE jobs SET {field} = ? WHERE id IN {format_list_for_query(ids)}"
    res = common_update(query, tuple([value] + ids))
    LOG.info(f"Updated job: {res}")


async def delete_jobs(jobs: list[str]):
    if not jobs:
        LOG.info("No jobs to delete.")
        return False

    query = f"DELETE FROM jobs WHERE id IN {format_list_for_query(jobs)}"
    res = common_update(query, tuple(jobs))

    return res > 0


async def average_elements_per_link(user: str):
    job_query = """
    SELECT 
        DATE(time_created) AS date,
        AVG(json_array_length(elements)) AS average_elements,
        COUNT(*) AS count
    FROM 
        jobs
    WHERE 
        status = 'Completed' AND user = ?
    GROUP BY 
        DATE(time_created)
    ORDER BY 
        date ASC;
    """
    results = common_query(job_query, (user,))

    return results


async def get_jobs_per_day(user: str):
    job_query = """
    SELECT 
        DATE(time_created) AS date,
        COUNT(*) AS job_count
    FROM 
        jobs
    WHERE 
        status = 'Completed' AND user = ?
    GROUP BY 
        DATE(time_created)
    ORDER BY 
        date ASC;
    """
    results = common_query(job_query, (user,))

    return results
