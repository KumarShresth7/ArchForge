from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Submission, User
from schemas import SubmissionResponse

router = APIRouter(prefix="/api/submissions", tags=["submissions"])


@router.get("", response_model=list[SubmissionResponse])
def list_submissions(
    problem_slug: str | None = Query(None),
    limit: int = Query(20, le=50),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Submission).filter(Submission.user_id == user.id)
    if problem_slug:
        query = query.filter(Submission.problem_slug == problem_slug)
    return query.order_by(Submission.submitted_at.desc()).limit(limit).all()
