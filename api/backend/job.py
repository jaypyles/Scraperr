# STL
import logging
from typing import Any, Optional

# PDM
from pymongo import DESCENDING

# LOCAL
from api.backend.models import FetchOptions
from api.backend.database import get_job_collection

LOG = logging.getLogger(__name__)


async def insert(item: dict[str, Any]) -> None:
    collection = get_job_collection()
    i = await collection.insert_one(item)
    LOG.info(f"Inserted item: {i}")


async def get_queued_job():
    collection = get_job_collection()
    return await collection.find_one(
        {"status": "Queued"}, sort=[("created_at", DESCENDING)]
    )


async def query(
    filter: dict[str, Any], fetch_options: Optional[FetchOptions] = None
) -> list[dict[str, Any]]:
    collection = get_job_collection()
    cursor = collection.find(filter)
    results: list[dict[str, Any]] = []

    async for document in cursor:
        del document["_id"]

        if fetch_options and not fetch_options.chat and document.get("chat"):
            del document["chat"]

        results.append(document)

    return results


async def update_job(ids: list[str], field: str, value: Any):
    collection = get_job_collection()
    for id in ids:
        _ = await collection.update_one(
            {"id": id},
            {"$set": {field: value}},
        )


async def delete_jobs(jobs: list[str]):
    collection = get_job_collection()
    result = await collection.delete_many({"id": {"$in": jobs}})
    LOG.info(f"{result.deleted_count} documents deleted")

    return True if result.deleted_count > 0 else False


async def average_elements_per_link(user: str):
    collection = get_job_collection()
    pipeline = [
        {"$match": {"status": "Completed", "user": user}},
        {
            "$project": {
                "date": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$time_created"}
                },
                "num_elements": {"$size": "$elements"},
            }
        },
        {
            "$group": {
                "_id": "$date",
                "average_elements": {"$avg": "$num_elements"},
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id": 1}},
    ]
    cursor = collection.aggregate(pipeline)
    results: list[dict[str, Any]] = []

    async for document in cursor:
        results.append(
            {
                "date": document["_id"],
                "average_elements": document["average_elements"],
                "count": document["count"],
            }
        )

    return results


async def get_jobs_per_day(user: str):
    collection = get_job_collection()
    pipeline = [
        {"$match": {"status": "Completed", "user": user}},
        {
            "$project": {
                "date": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$time_created"}
                }
            }
        },
        {"$group": {"_id": "$date", "job_count": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
    ]
    cursor = collection.aggregate(pipeline)

    results: list[dict[str, Any]] = []
    async for document in cursor:
        results.append({"date": document["_id"], "job_count": document["job_count"]})

    return results
