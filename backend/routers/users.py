import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import create_access_token, get_current_user
from database import get_db
from models import User
from schemas import LocalSyncRequest, TokenResponse, UserResponse, UserSyncRequest

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("/sync", response_model=TokenResponse)
def sync_user(body: UserSyncRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        user = User(
            id=str(uuid.uuid4()),
            email=body.email,
            name=body.name,
            image=body.image,
        )
        db.add(user)
    else:
        user.name = body.name
        user.image = body.image
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id, user.email)
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    return user


@router.post("/me/sync-local")
def sync_local_data(
    body: LocalSyncRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from models import Draft, UserProblemProgress

    for slug, prog in body.progress.items():
        existing = (
            db.query(UserProblemProgress)
            .filter(UserProblemProgress.user_id == user.id, UserProblemProgress.problem_slug == slug)
            .first()
        )
        if existing:
            if prog.get("bestScore") is not None:
                existing.best_score = max(
                    existing.best_score or 0,
                    prog["bestScore"],
                )
            existing.attempt_count = max(existing.attempt_count, prog.get("attemptCount", 0))
            if prog.get("status") == "solved" or (existing.best_score and existing.best_score >= 70):
                existing.status = "solved"
            elif existing.status == "not_started":
                existing.status = prog.get("status", "attempted")
        else:
            db.add(
                UserProblemProgress(
                    id=str(uuid.uuid4()),
                    user_id=user.id,
                    problem_slug=slug,
                    status=prog.get("status", "attempted"),
                    best_score=prog.get("bestScore"),
                    attempt_count=prog.get("attemptCount", 0),
                    last_attempt_at=datetime.now(timezone.utc) if prog.get("lastAttemptAt") else None,
                )
            )

    for slug, draft in body.drafts.items():
        existing = (
            db.query(Draft)
            .filter(Draft.user_id == user.id, Draft.problem_slug == slug)
            .first()
        )
        if existing:
            existing.graph_json = draft
            existing.updated_at = datetime.now(timezone.utc)
        else:
            db.add(
                Draft(
                    id=str(uuid.uuid4()),
                    user_id=user.id,
                    problem_slug=slug,
                    graph_json=draft,
                )
            )

    db.commit()
    return {"status": "synced"}
