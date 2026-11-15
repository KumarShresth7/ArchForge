import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import ProblemNote, User
from schemas import NoteResponse, NoteUpsertRequest

router = APIRouter(prefix="/api/notes", tags=["notes"])


@router.get("/{problem_slug}", response_model=NoteResponse)
def get_note(
    problem_slug: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = (
        db.query(ProblemNote)
        .filter(ProblemNote.user_id == user.id, ProblemNote.problem_slug == problem_slug)
        .first()
    )
    if not note:
        return NoteResponse(problem_slug=problem_slug, content="", updated_at=None)
    return NoteResponse(
        problem_slug=note.problem_slug,
        content=note.content,
        updated_at=note.updated_at,
    )


@router.put("/{problem_slug}", response_model=NoteResponse)
def upsert_note(
    problem_slug: str,
    body: NoteUpsertRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = (
        db.query(ProblemNote)
        .filter(ProblemNote.user_id == user.id, ProblemNote.problem_slug == problem_slug)
        .first()
    )
    now = datetime.now(timezone.utc)
    if note:
        note.content = body.content
        note.updated_at = now
    else:
        note = ProblemNote(
            id=str(uuid.uuid4()),
            user_id=user.id,
            problem_slug=problem_slug,
            content=body.content,
            updated_at=now,
        )
        db.add(note)
    db.commit()
    db.refresh(note)
    return NoteResponse(
        problem_slug=note.problem_slug,
        content=note.content,
        updated_at=note.updated_at,
    )
