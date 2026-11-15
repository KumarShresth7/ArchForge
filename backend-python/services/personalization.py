from collections import defaultdict
from datetime import date, datetime, timedelta, timezone

from sqlalchemy.orm import Session

from models import Problem, Submission, User, UserProblemProgress

DIFFICULTY_RANK = {"easy": 0, "medium": 1, "hard": 2}
SOLVED_THRESHOLD = 70


def update_user_streak(db: Session, user: User) -> None:
    today = date.today()
    last = user.last_active_date.date() if user.last_active_date else None

    if last == today:
        return

    if last == today - timedelta(days=1):
        user.current_streak = (user.current_streak or 0) + 1
    else:
        user.current_streak = 1

    user.longest_streak = max(user.longest_streak or 0, user.current_streak)
    user.last_active_date = datetime.now(timezone.utc)


def compute_skill_profile(
    db: Session, user_id: str
) -> dict[str, int]:
    """Average submission score per tag."""
    submissions = db.query(Submission).filter(Submission.user_id == user_id).all()
    if not submissions:
        return {}

    problems = {p.slug: p for p in db.query(Problem).all()}
    tag_scores: dict[str, list[int]] = defaultdict(list)

    for sub in submissions:
        problem = problems.get(sub.problem_slug)
        if not problem:
            continue
        for tag in problem.tags:
            tag_scores[tag].append(sub.score)

    return {
        tag: round(sum(scores) / len(scores))
        for tag, scores in tag_scores.items()
    }


def get_user_level(solved_count: int) -> str:
    if solved_count >= 8:
        return "hard"
    if solved_count >= 3:
        return "medium"
    return "easy"


def recommend_problems(
    db: Session, user_id: str, limit: int = 4
) -> list[dict]:
    all_problems = db.query(Problem).all()
    progress_rows = (
        db.query(UserProblemProgress)
        .filter(UserProblemProgress.user_id == user_id)
        .all()
    )
    solved_slugs = {p.problem_slug for p in progress_rows if p.status == "solved"}
    skill = compute_skill_profile(db, user_id)

    weak_tags = sorted(skill.items(), key=lambda x: x[1])[:2]
    weak_tag_names = {t for t, _ in weak_tags}
    user_level = get_user_level(len(solved_slugs))

    candidates = [p for p in all_problems if p.slug not in solved_slugs]
    if not candidates:
        return []

    def rank_key(problem: Problem) -> tuple:
        tag_overlap = len(set(problem.tags) & weak_tag_names)
        diff_penalty = abs(DIFFICULTY_RANK.get(problem.difficulty, 1) - DIFFICULTY_RANK.get(user_level, 1))
        return (tag_overlap, -diff_penalty, -DIFFICULTY_RANK.get(problem.difficulty, 0))

    ranked = sorted(candidates, key=rank_key, reverse=True)

    results = []
    for problem in ranked[:limit]:
        overlap = set(problem.tags) & weak_tag_names
        if overlap and skill:
            weakest = min(overlap, key=lambda t: skill.get(t, 100))
            reason = f"Strengthen your {weakest.replace('-', ' ')} skills"
        elif problem.difficulty == user_level:
            reason = f"Good {problem.difficulty} challenge for your level"
        else:
            reason = "Expand your system design breadth"

        results.append({"slug": problem.slug, "reason": reason})

    return results


def similar_problems(
    db: Session, slug: str, limit: int = 3
) -> list[str]:
    all_problems = db.query(Problem).all()
    source = next((p for p in all_problems if p.slug == slug), None)
    if not source:
        return []

    scored: list[tuple[Problem, int]] = []
    source_tags = set(source.tags)
    for p in all_problems:
        if p.slug == slug:
            continue
        overlap = len(source_tags & set(p.tags))
        if overlap > 0:
            scored.append((p, overlap))

    scored.sort(key=lambda x: (x[1], -DIFFICULTY_RANK.get(x[0].difficulty, 0)), reverse=True)
    return [p.slug for p, _ in scored[:limit]]


def hints_are_unlocked(progress: UserProblemProgress | None) -> bool:
    if not progress:
        return False
    if progress.hints_unlocked:
        return True
    return (
        progress.attempt_count >= 1
        and progress.best_score is not None
        and progress.best_score < SOLVED_THRESHOLD
    )
