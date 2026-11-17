🏗️ ArchForge

An Interactive, AI-Powered System Design Practice Platform

ArchForge is a stateful educational sandbox where software engineers can actively practice system design. Instead of passively watching tutorials, users architect distributed systems (like URL Shorteners, Netflix, or Web Crawlers) on a live, drag-and-drop canvas.

The platform features a Hybrid Evaluation Engine built in Java Spring Boot that combines deterministic structural validation with generative AI (Groq LLM) to grade architectures and stream feedback in real-time via WebSockets.

🚀 Enterprise Architecture

ArchForge was originally prototyped in Python/FastAPI and has been fully migrated to a Java 21 Spring Boot backend. This transition leverages Java Virtual Threads to handle massive WebSocket concurrency and strict, annotation-driven domain modeling for enterprise-grade scalability.

Core Innovations

High-Performance Visual State Management: Utilizes React Flow within Next.js to handle complex DOM repaints and continuous JSON serialization of 50+ interactive infrastructure nodes while maintaining 60 FPS.

Hybrid Intelligence Pipeline: AI wrappers are prone to hallucinations. ArchForge prevents this by executing a deterministic, hardcoded rubric check before handing the sanitized architecture graph to a Groq LLM for abstract semantic grading.

Real-Time WebSocket Streaming: Evaluation feedback isn't buffered; it streams token-by-token directly from the LLM, through the Spring Boot WebSocket handler, and down to the client canvas in <300ms.

Stateless Cross-Stack JWT Bridge: Integrates a seamless, stateless JWT authentication bridge between NextAuth (Frontend) and Spring Security (Backend), eliminating database session lookups and reducing cross-stack authorization latency.

🛠️ Tech Stack

Client & Visual Plane (Frontend)

Framework: Next.js (App Router), React, TypeScript

Canvas: React Flow (Stateful drag-and-drop node graphs)

Auth & State: NextAuth.js, TailwindCSS, Recharts

Orchestration & Intelligence Plane (Backend)

Framework: Java 21, Spring Boot 3

Concurrency: Java Virtual Threads (spring.threads.virtual.enabled=true)

Persistence: Spring Data JPA, PostgreSQL (Users, Submissions, Drafts)

Real-Time: Spring WebSockets (TextWebSocketHandler)

AI Integration: Groq Inference API

🧠 System Design Flow

graph TD
    %% Frontend Components
    subgraph Client [Next.js Client]
        Auth[NextAuth Session]
        Canvas[React Flow Canvas]
        Dashboard[Progress Dashboard]
    end

    %% Network Layer
    subgraph Network [API Gateway / Network]
        REST[HTTP/REST API]
        WS[WebSocket Stream]
    end

    %% Backend Components
    subgraph Backend [Spring Boot Backend]
        AuthFilter[JWT Auth Filter]
        StateCtrl[Drafts & Submissions Controller]
        EvalHandler[Evaluation WebSocket Handler]
    end

    %% AI Engine
    subgraph Intelligence [Hybrid Evaluation Engine]
        DetRubric[Deterministic Rubric Engine]
        Groq[Groq LLM Semantic Analysis]
    end

    %% Database
    subgraph Database [Persistence Layer]
        PG[(PostgreSQL)]
    end

    %% Connections
    Auth <--> REST
    Canvas <--> WS
    Canvas <--> REST
    Dashboard <--> REST

    REST <--> AuthFilter
    AuthFilter <--> StateCtrl
    WS <--> EvalHandler

    StateCtrl <--> PG
    
    EvalHandler --> DetRubric
    DetRubric --> Groq
    Groq -. "Streamed LLM Tokens" .-> EvalHandler


💻 Local Development Setup

1. Prerequisites

Node.js 18+

Java 21 (JDK 21)

Maven

PostgreSQL running locally on port 5432

2. Backend Setup (Spring Boot)

Ensure you have a PostgreSQL database named archforge running.

cd backend
cp .env.example .env 
# Add your GROQ_API_KEY and configure DB credentials

# Run the Spring Boot application
./mvnw spring-boot:run


Note: The legacy Python backend is preserved in backend-python/ for architectural reference but is not actively used in the V2 deployment.

3. Frontend Setup (Next.js)

cd frontend
cp .env.example .env.local
# Ensure NEXT_PUBLIC_API_URL points to http://localhost:8080
# Set NEXTAUTH_SECRET to match the JWT secret in Spring Boot

npm install
npm run dev


Navigate to http://localhost:3000 to start architecting.

📈 Platform Features

Curated Problem Sets: Practice standard interview designs (URL Shortener, Distributed Cache, Chat Application).

Component Palette: Drag and drop load balancers, databases, message queues, and API gateways.

Save & Replay: JSON state serialization allows you to save drafts and replay historical submission attempts.

Skill Radar & Gamification: A dynamic Next.js dashboard tracks your proficiency across different architectural domains (Databases, Networking, Async Processing).

📄 License

MIT License
