JOB_INSERT_QUERY = """
INSERT INTO jobs 
(id, url, elements, user, time_created, result, status, chat, job_options, agent_mode, prompt)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
"""

DELETE_JOB_QUERY = """
DELETE FROM jobs WHERE id IN ()
"""
