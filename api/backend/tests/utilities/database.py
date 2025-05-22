# STL
import sqlite3

# LOCAL
from api.backend.database.schema import INIT_QUERY
from api.backend.tests.constants import TEST_DB_PATH


def connect_to_db():
    conn = sqlite3.connect(TEST_DB_PATH)
    cur = conn.cursor()

    for query in INIT_QUERY.split(";"):
        cur.execute(query)

    conn.commit()
    return conn, cur
