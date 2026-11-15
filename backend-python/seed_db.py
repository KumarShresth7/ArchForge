from models import Problem
from problem_seeds import PROBLEMS
from rubrics_data import get_rubric_for_slug


def _apply_rubric(problem_data: dict) -> dict:
    rubric_data = get_rubric_for_slug(problem_data["slug"])
    ref = rubric_data.pop("reference_solution", None)
    return {
        **problem_data,
        "evaluation_rubric": {
            "must_have": rubric_data["must_have"],
            "should_have": rubric_data["should_have"],
            "anti_patterns": rubric_data["anti_patterns"],
        },
        "reference_solution": ref,
    }


def seed_problems(db):
    if db.query(Problem).count() == 0:
        for data in PROBLEMS:
            db.add(Problem(**_apply_rubric(data)))
        db.commit()
        return

    # Backfill rubrics on existing problems that lack them
    updated = False
    for problem in db.query(Problem).all():
        if not problem.evaluation_rubric:
            rubric_data = get_rubric_for_slug(problem.slug)
            ref = rubric_data.pop("reference_solution", None)
            problem.evaluation_rubric = {
                "must_have": rubric_data["must_have"],
                "should_have": rubric_data["should_have"],
                "anti_patterns": rubric_data["anti_patterns"],
            }
            problem.reference_solution = ref
            updated = True
    if updated:
        db.commit()
