from models import Problem
from seed import PROBLEMS


def seed_problems(db):
    if db.query(Problem).count() > 0:
        return

    for data in PROBLEMS:
        db.add(Problem(**data))
    db.commit()
