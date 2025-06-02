# LOCAL
from api.backend.database.common import query


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
    results = query(job_query, (user,))

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
    results = query(job_query, (user,))

    return results
