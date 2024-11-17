from pydantic import BaseModel
from typing import Literal


class Action(BaseModel):
    type: Literal["click", "input"]
    xpath: str
    name: str
    input: str = ""
    do_once: bool = True


class SiteMap(BaseModel):
    actions: list[Action]
