"""Apply lightweight schema migrations for SQLite dev databases."""

from sqlalchemy import inspect, text

from database import engine


def run_migrations():
    inspector = inspect(engine)

    if "users" in inspector.get_table_names():
        user_cols = {c["name"] for c in inspector.get_columns("users")}
        with engine.begin() as conn:
            if "current_streak" not in user_cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN current_streak INTEGER DEFAULT 0"))
            if "longest_streak" not in user_cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN longest_streak INTEGER DEFAULT 0"))
            if "last_active_date" not in user_cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN last_active_date DATETIME"))

    if "user_problem_progress" in inspector.get_table_names():
        prog_cols = {c["name"] for c in inspector.get_columns("user_problem_progress")}
        with engine.begin() as conn:
            if "hints_unlocked" not in prog_cols:
                conn.execute(
                    text(
                        "ALTER TABLE user_problem_progress "
                        "ADD COLUMN hints_unlocked BOOLEAN DEFAULT 0"
                    )
                )

    if "problems" in inspector.get_table_names():
        prob_cols = {c["name"] for c in inspector.get_columns("problems")}
        with engine.begin() as conn:
            if "evaluation_rubric" not in prob_cols:
                conn.execute(text("ALTER TABLE problems ADD COLUMN evaluation_rubric JSON"))
            if "reference_solution" not in prob_cols:
                conn.execute(text("ALTER TABLE problems ADD COLUMN reference_solution JSON"))

    if "submissions" in inspector.get_table_names():
        sub_cols = {c["name"] for c in inspector.get_columns("submissions")}
        with engine.begin() as conn:
            if "rubric_score" not in sub_cols:
                conn.execute(text("ALTER TABLE submissions ADD COLUMN rubric_score INTEGER"))
            if "ai_score" not in sub_cols:
                conn.execute(text("ALTER TABLE submissions ADD COLUMN ai_score INTEGER"))
            if "rubric_feedback" not in sub_cols:
                conn.execute(text("ALTER TABLE submissions ADD COLUMN rubric_feedback JSON"))
