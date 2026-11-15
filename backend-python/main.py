import json
from typing import Dict

from dotenv import load_dotenv
from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from sqlalchemy.orm import Session

from auth import get_optional_user
from database import Base, SessionLocal, engine, get_db
from migrate import run_migrations
from models import Problem, User
from routers import dashboard, drafts, leaderboard, notes, problems, progress, submissions, users
from schemas import EvaluationRequest, EvaluationRubric
from seed_db import seed_problems
from rubrics_data import get_rubric_for_slug
from services.progress import update_progress_after_submission
from services.rubric import combine_scores, evaluate_rubric

load_dotenv()

app = FastAPI(title="ArchForge Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(problems.router)
app.include_router(users.router)
app.include_router(drafts.router)
app.include_router(submissions.router)
app.include_router(dashboard.router)
app.include_router(progress.router)
app.include_router(leaderboard.router)
app.include_router(notes.router)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    run_migrations()
    db = SessionLocal()
    try:
        seed_problems(db)
    finally:
        db.close()


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, client_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        self.active_connections.pop(client_id, None)

    async def send_json_payload(self, client_id: str, message: dict):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_json(message)


manager = ConnectionManager()


@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(session_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(session_id)


async def process_and_emit_evaluation(
    session_id: str,
    user_id: str | None,
    problem: Problem,
    graph: dict,
):
    db = SessionLocal()
    try:
        # Step 1: Rule-based rubric (fast, deterministic)
        rubric_config = problem.evaluation_rubric or get_rubric_for_slug(problem.slug)
        if problem.reference_solution:
            rubric_config = {**rubric_config, "reference_solution": problem.reference_solution}

        rubric_result = evaluate_rubric(graph, rubric_config)

        await manager.send_json_payload(session_id, {
            "status": "processing",
            "message": f"Rubric score: {rubric_result.score}/100 — running AI analysis…",
            "rubric_score": rubric_result.score,
        })

        # Step 2: AI evaluation
        llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.1)
        structured_llm = llm.with_structured_output(EvaluationRubric)

        prompt = ChatPromptTemplate.from_messages([
            (
                "system",
                "You are an expert Principal Cloud Architect. Evaluate the submitted "
                "high-level system design against the problem requirements. Be specific "
                "about missing components, scalability issues, and single points of failure. "
                "The rule-based rubric already scored {rubric_score}/100 — focus on qualitative "
                "analysis the rubric cannot capture.",
            ),
            (
                "human",
                "Problem: {title}\n\n"
                "Description: {description}\n\n"
                "Functional requirements:\n{functional}\n\n"
                "Non-functional requirements:\n{non_functional}\n\n"
                "Rubric feedback:\n{rubric_feedback}\n\n"
                "Submitted architecture graph:\n{graph_data}\n\n"
                "Score 0-100 for qualitative architecture quality and provide bottlenecks and suggestions.",
            ),
        ])

        chain = prompt | structured_llm
        ai_result = await chain.ainvoke({
            "title": problem.title,
            "description": problem.description,
            "functional": "\n".join(f"- {r}" for r in problem.functional_requirements),
            "non_functional": "\n".join(f"- {r}" for r in problem.non_functional_requirements),
            "rubric_score": rubric_result.score,
            "rubric_feedback": "\n".join(f"- {f}" for f in rubric_result.feedback),
            "graph_data": json.dumps(graph),
        })

        # Step 3: Hybrid score
        final_score = combine_scores(rubric_result.score, ai_result.score)

        if user_id:
            update_progress_after_submission(
                db,
                user_id,
                problem.slug,
                final_score,
                graph,
                ai_result.bottlenecks,
                ai_result.suggestions,
                rubric_score=rubric_result.score,
                ai_score=ai_result.score,
                rubric_feedback=rubric_result.feedback,
            )

        await manager.send_json_payload(session_id, {
            "status": "completed",
            "score": final_score,
            "rubric_score": rubric_result.score,
            "ai_score": ai_result.score,
            "rubric_feedback": rubric_result.feedback,
            "must_have_met": rubric_result.must_have_met,
            "must_have_missing": rubric_result.must_have_missing,
            "should_have_met": rubric_result.should_have_met,
            "reference_match_pct": rubric_result.reference_match_pct,
            "bottlenecks": ai_result.bottlenecks,
            "suggestions": ai_result.suggestions,
            "problem_slug": problem.slug,
        })

    except Exception as e:
        await manager.send_json_payload(session_id, {
            "status": "failed",
            "message": f"AI Engine evaluation error: {str(e)}",
        })
    finally:
        db.close()


@app.post("/api/evaluate")
async def evaluate_architecture(
    request: EvaluationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    problem = db.query(Problem).filter(Problem.slug == request.problem_slug).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    background_tasks.add_task(
        process_and_emit_evaluation,
        request.session_id,
        user.id if user else None,
        problem,
        request.graph,
    )
    return {"status": "queued", "problem_slug": problem.slug}
