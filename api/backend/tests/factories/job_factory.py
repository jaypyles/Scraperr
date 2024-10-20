from api.backend.models import Element, Job, JobOptions, CapturedElement
import uuid
from faker import Faker

fake = Faker()


def create_job():
    return Job(
        id=uuid.uuid4().hex,
        url="https://example.com",
        elements=[Element(name="test", xpath="xpath")],
        job_options=JobOptions(multi_page_scrape=False, custom_headers={}),
    )


def create_completed_job() -> Job:
    return Job(
        id=uuid.uuid4().hex,
        url="http://example.com",
        elements=[
            Element(
                name="element_name",
                xpath="//div",
                url="https://example.com",
            )
        ],
        job_options=JobOptions(multi_page_scrape=False, custom_headers={}),
        user=fake.name(),
        time_created=fake.date(),
        result=[
            {
                "https://example.com": {
                    "element_name": [
                        CapturedElement(
                            xpath="//div", text="example", name="element_name"
                        )
                    ]
                }
            }
        ],
    )
