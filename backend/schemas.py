from pydantic import BaseModel, Field


class ProblemSummary(BaseModel):
    id: str
    slug: str
    title: str
    difficulty: str
    tags: list[str]

    model_config = {"from_attributes": True}


class ProblemDetail(BaseModel):
    id: str
    slug: str
    title: str
    difficulty: str
    tags: list[str]
    description: str
    functional_requirements: list[str]
    non_functional_requirements: list[str]
    hints: list[str]
    starter_graph: dict

    model_config = {"from_attributes": True}


class EvaluationRubric(BaseModel):
    score: int = Field(description="Score from 0 to 100")
    bottlenecks: list[str] = Field(description="List of performance bottlenecks")
    suggestions: list[str] = Field(description="Actionable steps to improve the architecture")


class EvaluationRequest(BaseModel):
    session_id: str
    problem_slug: str
    graph: dict
