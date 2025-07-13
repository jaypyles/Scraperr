# STL
from typing import Any

# LOCAL
from api.backend.job.utils.text_utils import clean_text


def clean_job_format(jobs: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Convert a single job to a dictionary format.
    """
    headers = ["id", "url", "element_name", "xpath", "text", "user", "time_created"]

    cleaned_rows = []

    for job in jobs:
        for res in job["result"]:
            for url, elements in res.items():
                for element_name, values in elements.items():
                    for value in values:
                        text = clean_text(value.get("text", "")).strip()
                        if text:
                            cleaned_rows.append(
                                {
                                    "id": job.get("id", ""),
                                    "url": url,
                                    "element_name": element_name,
                                    "xpath": value.get("xpath", ""),
                                    "text": text,
                                    "user": job.get("user", ""),
                                    "time_created": job.get(
                                        "time_created", ""
                                    ).isoformat(),
                                }
                            )

    return {
        "headers": headers,
        "rows": cleaned_rows,
    }
