import json
from typing import Dict

from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from sqlalchemy.orm import Session

from database import Base, SessionLocal, engine, get_db
from models import Problem
from routers import problems
from schemas import EvaluationRequest, EvaluationRubric
from seed_db import seed_problems

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


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
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
    problem: Problem,
    graph: dict,
):
    try:
        await manager.send_json_payload(
            session_id,
            {"status": "processing", "message": "Analyzing system constraints..."},
        )

        llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.1)
        structured_llm = llm.with_structured_output(EvaluationRubric)

        prompt = ChatPromptTemplate.from_messages([
            (
                "system",
                "You are an expert Principal Cloud Architect. Evaluate the submitted "
                "high-level system design against the problem requirements. Be specific "
                "about missing components, scalability issues, and single points of failure.",
            ),
            (
                "human",
                "Problem: {title}\n\n"
                "Description: {description}\n\n"
                "Functional requirements:\n{functional}\n\n"
                "Non-functional requirements:\n{non_functional}\n\n"
                "Submitted architecture graph:\n{graph_data}\n\n"
                "Score 0-100 and provide bottlenecks and actionable suggestions.",
            ),
        ])

        chain = prompt | structured_llm
        result = await chain.ainvoke({
            "title": problem.title,
            "description": problem.description,
            "functional": "\n".join(f"- {r}" for r in problem.functional_requirements),
            "non_functional": "\n".join(f"- {r}" for r in problem.non_functional_requirements),
            "graph_data": json.dumps(graph),
        })

        await manager.send_json_payload(session_id, {
            "status": "completed",
            "score": result.score,
            "bottlenecks": result.bottlenecks,
            "suggestions": result.suggestions,
            "problem_slug": problem.slug,
        })

    except Exception as e:
        await manager.send_json_payload(session_id, {
            "status": "failed",
            "message": f"AI Engine evaluation error: {str(e)}",
        })


@app.post("/api/evaluate")
async def evaluate_architecture(
    request: EvaluationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    problem = db.query(Problem).filter(Problem.slug == request.problem_slug).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    background_tasks.add_task(
        process_and_emit_evaluation,
        request.session_id,
        problem,
        request.graph,
    )
    return {"status": "queued", "problem_slug": problem.slug}
