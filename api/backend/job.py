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
