# STL
import logging
from typing import Any

# LOCAL
from api.backend.database import get_job_collection

LOG = logging.getLogger(__name__)


async def insert(item: dict[str, Any]) -> None:
    collection = get_job_collection()
    i = await collection.insert_one(item)
    LOG.info(f"Inserted item: {i}")


async def query(filter: dict[str, Any]) -> list[dict[str, Any]]:
    collection = get_job_collection()
    cursor = collection.find(filter)
    results: list[dict[str, Any]] = []

    async for document in cursor:
        del document["_id"]
        results.append(document)

    return results


async def delete_jobs(jobs: list[str]):
    collection = get_job_collection()
    result = await collection.delete_many({"id": {"$in": jobs}})
    LOG.info(f"RESULT: {result.deleted_count} documents deleted")

    return True if result.deleted_count > 0 else False
