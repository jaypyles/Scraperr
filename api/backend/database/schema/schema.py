INIT_QUERY = """
CREATE TABLE IF NOT EXISTS jobs (
    id STRING PRIMARY KEY NOT NULL,
    url STRING NOT NULL,
    elements JSON NOT NULL,
    user STRING,
    time_created DATETIME NOT NULL,
    result JSON NOT NULL,
    status STRING NOT NULL,
    chat JSON,
    job_options JSON
);

CREATE TABLE IF NOT EXISTS users (
    email STRING PRIMARY KEY NOT NULL,
    hashed_password STRING NOT NULL,
    full_name STRING,
    disabled BOOLEAN
);

CREATE TABLE IF NOT EXISTS cron_jobs (
    id STRING PRIMARY KEY NOT NULL,
    user_email STRING NOT NULL,
    job_id STRING NOT NULL,
    cron_expression STRING NOT NULL,
    time_created DATETIME NOT NULL,
    time_updated DATETIME NOT NULL,
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);
"""
