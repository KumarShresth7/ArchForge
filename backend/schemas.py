from datetime import datetime

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


class UserSyncRequest(BaseModel):
    email: str
    name: str
    image: str | None = None


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    image: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ProgressResponse(BaseModel):
    problem_slug: str
    status: str
    best_score: float | None
    attempt_count: int
    last_attempt_at: datetime | None

    model_config = {"from_attributes": True}


class DraftResponse(BaseModel):
    problem_slug: str
    graph_json: dict
    updated_at: datetime

    model_config = {"from_attributes": True}


class DraftUpsertRequest(BaseModel):
    graph_json: dict


class SubmissionResponse(BaseModel):
    id: str
    problem_slug: str
    score: int
    bottlenecks: list[str]
    suggestions: list[str]
    submitted_at: datetime

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    problems_attempted: int
    problems_solved: int
    total_submissions: int
    average_score: float | None
    current_streak: int = 0
    longest_streak: int = 0


class SkillProfileEntry(BaseModel):
    tag: str
    score: int


class RecommendedProblem(BaseModel):
    slug: str
    reason: str


class DashboardResponse(BaseModel):
    user: UserResponse
    stats: DashboardStats
    progress: list[ProgressResponse]
    recent_submissions: list[SubmissionResponse]
    recommended: list[RecommendedProblem]
    skill_profile: list[SkillProfileEntry]


class ProblemContextResponse(BaseModel):
    problem_slug: str
    hints_unlocked: bool
    attempt_count: int
    best_score: float | None
    status: str
    similar_slugs: list[str]


class LocalSyncRequest(BaseModel):
    progress: dict[str, dict]
    drafts: dict[str, dict]
