import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Draft, User
from schemas import DraftResponse, DraftUpsertRequest

router = APIRouter(prefix="/api/drafts", tags=["drafts"])


@router.get("/{problem_slug}", response_model=DraftResponse | None)
def get_draft(
    problem_slug: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    draft = (
        db.query(Draft)
        .filter(Draft.user_id == user.id, Draft.problem_slug == problem_slug)
        .first()
    )
    if not draft:
        return None
    return draft


@router.put("/{problem_slug}", response_model=DraftResponse)
def upsert_draft(
    problem_slug: str,
    body: DraftUpsertRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    draft = (
        db.query(Draft)
        .filter(Draft.user_id == user.id, Draft.problem_slug == problem_slug)
        .first()
    )
    now = datetime.now(timezone.utc)
    if draft:
        draft.graph_json = body.graph_json
        draft.updated_at = now
    else:
        draft = Draft(
            id=str(uuid.uuid4()),
            user_id=user.id,
            problem_slug=problem_slug,
            graph_json=body.graph_json,
            updated_at=now,
        )
        db.add(draft)
    db.commit()
    db.refresh(draft)
    return draft


@router.delete("/{problem_slug}")
def delete_draft(
    problem_slug: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    draft = (
        db.query(Draft)
        .filter(Draft.user_id == user.id, Draft.problem_slug == problem_slug)
        .first()
    )
    if draft:
        db.delete(draft)
        db.commit()
    return {"status": "deleted"}
