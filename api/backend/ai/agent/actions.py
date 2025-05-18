from typing_extensions import TypedDict


class Action(TypedDict):
    type: str
    url: str


class AgentJob(TypedDict):
    id: str
    url: str
    prompt: str
