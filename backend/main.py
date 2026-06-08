import asyncio
import json
import uuid
from typing import Dict

from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

app = FastAPI(title="ArchForge Engine")

# Enable CORS for standard HTTP routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# 1. Connection Manager for WebSockets
# ---------------------------------------------------------
class ConnectionManager:
    def __init__(self):
        # Maps job_id or user_id to their active WebSocket connection
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, client_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        print(f"[WebSocket] Client {client_id} connected.")

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            print(f"[WebSocket] Client {client_id} disconnected.")

    async def send_json_payload(self, client_id: str, message: dict):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_json(message)

manager = ConnectionManager()

# ---------------------------------------------------------
# 2. Pydantic Data Contracts
# ---------------------------------------------------------
class EvaluationRubric(BaseModel):
    score: int = Field(description="Score from 0 to 100")
    bottlenecks: list[str] = Field(description="List of performance bottlenecks")
    suggestions: list[str] = Field(description="Actionable steps to improve the architecture")

class Node(BaseModel):
    id: str
    type: str
    label: str | None = None
    config: dict = Field(default_factory=dict)

class Edge(BaseModel):
    source: str
    target: str

class EvaluationRequest(BaseModel):
    problem_id: str
    graph: dict

# ---------------------------------------------------------
# 3. WebSocket Endpoint
# ---------------------------------------------------------
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(client_id, websocket)
    try:
        while True:
            # Keep the connection alive; listen for incoming client heartbeats/messages if necessary
            data = await websocket.receive_text()
            print(f"[WebSocket] Received from {client_id}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(client_id)

# ---------------------------------------------------------
# 4. Asynchronous Evaluation Worker Task
# ---------------------------------------------------------
async def process_and_emit_evaluation(client_id: str, payload: EvaluationRequest):
    """ Runs LangChain evaluation and pushes result back via WebSockets """
    try:
        # Notify frontend that evaluation has started
        await manager.send_json_payload(client_id, {"status": "processing", "message": "Analyzing system constraints..."})

        llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.1)
        structured_llm = llm.with_structured_output(EvaluationRubric)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert Principal Cloud Architect. Analyze this architecture map against performance constraints. Return JSON format only."),
            ("human", "Evaluate this graph data: {graph_data}")
        ])
        
        chain = prompt | structured_llm
        
        # Invoke AI model asynchronously
        result = await chain.ainvoke({"graph_data": json.dumps(payload.graph)})
        
        # Stream the structured payload directly back to the client canvas
        await manager.send_json_payload(client_id, {
            "status": "completed",
            "score": result.score,
            "bottlenecks": result.bottlenecks,
            "suggestions": result.suggestions
        })

    except Exception as e:
        await manager.send_json_payload(client_id, {
            "status": "failed",
            "message": f"AI Engine evaluation error: {str(e)}"
        })

# ---------------------------------------------------------
# 5. HTTP Submission Trigger
# ---------------------------------------------------------
@app.post("/api/evaluate")
async def evaluate_architecture(request: EvaluationRequest, background_tasks: BackgroundTasks):
    # Pass a persistent client_id or job_id parameter from the frontend to match connections
    client_id = request.problem_id # For initial testing, map directly to your connection ID
    background_tasks.add_task(process_and_emit_evaluation, client_id, request)
    return {"status": "queued"}