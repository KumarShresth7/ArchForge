from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import get_optional_user
from database import get_db
from models import Problem, User, UserProblemProgress
from schemas import ProblemContextResponse, ProblemDetail, ProblemSummary
from services.personalization import hints_are_unlocked, similar_problems

router = APIRouter(prefix="/api/problems", tags=["problems"])


@router.get("", response_model=list[ProblemSummary])
def list_problems(db: Session = Depends(get_db)):
    return db.query(Problem).order_by(Problem.difficulty, Problem.title).all()


@router.get("/{slug}/context", response_model=ProblemContextResponse)
def get_problem_context(
    slug: str,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    problem = db.query(Problem).filter(Problem.slug == slug).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    progress = None
    if user:
        progress = (
            db.query(UserProblemProgress)
            .filter(
                UserProblemProgress.user_id == user.id,
                UserProblemProgress.problem_slug == slug,
            )
            .first()
        )

    return ProblemContextResponse(
        problem_slug=slug,
        hints_unlocked=hints_are_unlocked(progress),
        attempt_count=progress.attempt_count if progress else 0,
        best_score=progress.best_score if progress else None,
        status=progress.status if progress else "not_started",
        similar_slugs=similar_problems(db, slug),
    )


@router.get("/{slug}", response_model=ProblemDetail)
def get_problem(slug: str, db: Session = Depends(get_db)):
    problem = db.query(Problem).filter(Problem.slug == slug).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem
