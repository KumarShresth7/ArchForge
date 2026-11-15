from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from models import User, UserProblemProgress

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])


@router.get("")
def get_leaderboard(
    problem_slug: str | None = Query(None),
    limit: int = Query(20, le=50),
    db: Session = Depends(get_db),
):
    query = (
        db.query(
            User.name,
            UserProblemProgress.problem_slug,
            UserProblemProgress.best_score,
            UserProblemProgress.status,
        )
        .join(User, User.id == UserProblemProgress.user_id)
        .filter(UserProblemProgress.best_score.isnot(None))
    )

    if problem_slug:
        query = query.filter(UserProblemProgress.problem_slug == problem_slug)

    rows = query.order_by(UserProblemProgress.best_score.desc()).limit(limit).all()

    return [
        {
            "rank": i + 1,
            "name": row.name,
            "problem_slug": row.problem_slug,
            "best_score": row.best_score,
            "status": row.status,
        }
        for i, row in enumerate(rows)
    ]
