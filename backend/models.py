from sqlalchemy import JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Problem(Base):
    __tablename__ = "problems"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)
    title: Mapped[str] = mapped_column(String)
    difficulty: Mapped[str] = mapped_column(String)  # easy | medium | hard
    tags: Mapped[list] = mapped_column(JSON, default=list)
    description: Mapped[str] = mapped_column(Text)
    functional_requirements: Mapped[list] = mapped_column(JSON, default=list)
    non_functional_requirements: Mapped[list] = mapped_column(JSON, default=list)
    hints: Mapped[list] = mapped_column(JSON, default=list)
    starter_graph: Mapped[dict] = mapped_column(JSON, default=dict)
