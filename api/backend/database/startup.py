from api.backend.database.common import connect, QUERIES
import logging

LOG = logging.getLogger(__name__)


def init_database():
    cursor = connect()

    for query in QUERIES["init"].strip().split(";"):
        if query.strip():
            LOG.info(f"Executing query: {query}")
            _ = cursor.execute(query)

    cursor.close()
