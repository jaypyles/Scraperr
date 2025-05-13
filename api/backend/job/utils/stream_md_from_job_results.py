from typing import Any

from api.backend.utils import clean_text


def stream_md_from_job_results(jobs: list[dict[str, Any]]):
    md = "# Job Results Summary\n\n"
    for i, job in enumerate(jobs, start=1):
        md += f"## Job #{i}\n"
        yield f"- **Job URL:** {job.get('url', 'N/A')}\n"
        yield f"- **Timestamp:** {job.get('time_created', 'N/A')}\n"
        yield f"- **ID:** {job.get('id', 'N/A')}\n"
        yield "### Extracted Results:\n"

        for res in job.get("result", []):
            for url, elements in res.items():
                yield f"\n#### URL: {url}\n"
                for element_name, values in elements.items():
                    for value in values:
                        text = clean_text(value.get("text", "")).strip()
                        if text:
                            yield f"- **Element:** `{element_name}`\n"
                            yield f"  - **Text:** {text}\n"
        yield "\n---\n"
