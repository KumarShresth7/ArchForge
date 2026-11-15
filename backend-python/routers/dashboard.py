from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth import get_current_user, get_optional_user
from database import get_db
from models import Problem, Submission, User, UserProblemProgress
from schemas import (
    DashboardResponse,
    DashboardStats,
    ProblemContextResponse,
    ProgressResponse,
    RecommendedProblem,
    SkillProfileEntry,
    SubmissionResponse,
    UserResponse,
)
from services.personalization import (
    compute_skill_profile,
    hints_are_unlocked,
    recommend_problems,
    similar_problems,
)

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse)
def get_dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    progress_rows = (
        db.query(UserProblemProgress)
        .filter(UserProblemProgress.user_id == user.id)
        .order_by(UserProblemProgress.last_attempt_at.desc().nullslast())
        .all()
    )

    submissions = (
        db.query(Submission)
        .filter(Submission.user_id == user.id)
        .order_by(Submission.submitted_at.desc())
        .limit(5)
        .all()
    )

    total_submissions = (
        db.query(func.count(Submission.id))
        .filter(Submission.user_id == user.id)
        .scalar()
        or 0
    )

    solved = sum(1 for p in progress_rows if p.status == "solved")
    attempted = sum(1 for p in progress_rows if p.status in ("attempted", "solved"))
    scores = [p.best_score for p in progress_rows if p.best_score is not None]
    avg = round(sum(scores) / len(scores), 1) if scores else None

    skill = compute_skill_profile(db, user.id)
    recommended = recommend_problems(db, user.id, limit=4)

    return DashboardResponse(
        user=UserResponse.model_validate(user),
        stats=DashboardStats(
            problems_attempted=attempted,
            problems_solved=solved,
            total_submissions=total_submissions,
            average_score=avg,
            current_streak=user.current_streak or 0,
            longest_streak=user.longest_streak or 0,
        ),
        progress=[ProgressResponse.model_validate(p) for p in progress_rows],
        recent_submissions=[SubmissionResponse.model_validate(s) for s in submissions],
        recommended=[RecommendedProblem(**r) for r in recommended],
        skill_profile=[
            SkillProfileEntry(tag=tag, score=score) for tag, score in skill.items()
        ],
    )
