import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import User, UserProblemProgress
from schemas import ProgressResponse

router = APIRouter(prefix="/api/progress", tags=["progress"])


@router.get("", response_model=list[ProgressResponse])
def get_all_progress(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(UserProblemProgress).filter(UserProblemProgress.user_id == user.id).all()
    return rows
