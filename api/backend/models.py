# PDM
import pydantic


class Element(pydantic.BaseModel):
    name: str
    url: str
    xpath: str


class CapturedElement(pydantic.BaseModel):
    xpath: str
    text: str
    name: str


class SubmitScrapeJob(pydantic.BaseModel):
    url: str
    elements: list[Element]
