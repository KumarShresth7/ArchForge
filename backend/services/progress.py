import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from models import Submission, User, UserProblemProgress
from services.personalization import SOLVED_THRESHOLD, update_user_streak


def update_progress_after_submission(
    db: Session,
    user_id: str,
    problem_slug: str,
    score: int,
    graph: dict,
    bottlenecks: list[str],
    suggestions: list[str],
):
    submission = Submission(
        id=str(uuid.uuid4()),
        user_id=user_id,
        problem_slug=problem_slug,
        graph_json=graph,
        score=score,
        bottlenecks=bottlenecks,
        suggestions=suggestions,
        submitted_at=datetime.now(timezone.utc),
    )
    db.add(submission)

    progress = (
        db.query(UserProblemProgress)
        .filter(
            UserProblemProgress.user_id == user_id,
            UserProblemProgress.problem_slug == problem_slug,
        )
        .first()
    )

    now = datetime.now(timezone.utc)
    status = "solved" if score >= SOLVED_THRESHOLD else "attempted"

    if progress:
        progress.attempt_count += 1
        progress.last_attempt_at = now
        progress.best_score = max(progress.best_score or 0, score)
        if progress.best_score >= SOLVED_THRESHOLD:
            progress.status = "solved"
        elif progress.status == "not_started":
            progress.status = status
        if score < SOLVED_THRESHOLD:
            progress.hints_unlocked = True
    else:
        db.add(
            UserProblemProgress(
                id=str(uuid.uuid4()),
                user_id=user_id,
                problem_slug=problem_slug,
                status=status if score >= SOLVED_THRESHOLD else "attempted",
                best_score=score,
                attempt_count=1,
                last_attempt_at=now,
                hints_unlocked=score < SOLVED_THRESHOLD,
            )
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user:
        update_user_streak(db, user)

    db.commit()
