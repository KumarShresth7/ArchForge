# ArchForge Backend (Spring Boot 3.3.4 / Java 21)

This is the Spring Boot rewrite of the ArchForge architecture design evaluation engine.

## Prerequisites

- **Java 21+** (`java -version`)
- **Maven 3.9+** (or use the included `./mvnw` wrapper)

## Architecture Overview

- **Web & WebSockets**: Spring Web MVC with WebSocket support on `/ws/{sessionId}`.
- **Security & JWT**: Stateless Spring Security with HMAC-SHA256 (`HS256`) tokens.
- **Database**: SQLite with Spring Data JPA and Hibernate Community Dialect.
- **AI Engine**: Groq API integration (`llama-3.3-70b-versatile`) with qualitative architecture feedback and offline deterministic fallback.
- **Rule-based Rubric Evaluator**: Deterministic component detection, must-have & should-have scoring, and reference architecture alignment.

## Running the Application

### Using Maven:
```bash
mvn clean spring-boot:run
```

### Using Maven Wrapper:
```bash
./mvnw clean spring-boot:run
```

### Running Tests:
```bash
mvn test
```

### Packaging into Executable JAR:
```bash
mvn clean package
java -jar target/archforge-backend-1.0.0.jar
```

The server starts on port `8000` by default.

## API Endpoints

### Public Endpoints:
- `GET /api/problems` — List all system design problems (summary).
- `GET /api/problems/{slug}` — Retrieve problem details and starter graph.
- `GET /api/problems/{slug}/context` — Problem metadata, attempts, unlocked hints, similar problems.
- `POST /api/users/sync` — NextAuth user synchronization (returns JWT access token).
- `GET /api/leaderboard` — Leaderboard rankings with optional `problem_slug` and `limit`.
- `POST /api/evaluate` — Submit architecture graph for evaluation.
- `GET /ws/{sessionId}` — WebSocket connection for real-time evaluation streaming.

### Authenticated Endpoints (`Authorization: Bearer <token>`):
- `GET /api/users/me` — Current user profile.
- `POST /api/users/me/sync-local` — Sync local storage drafts & progress to database.
- `GET /api/dashboard` — Dashboard metrics, streak, skill breakdown, recommendations.
- `GET /api/progress` — Problem progress list for current user.
- `GET /api/drafts/{problem_slug}` — Retrieve current canvas draft.
- `PUT /api/drafts/{problem_slug}` — Save/update canvas draft.
- `DELETE /api/drafts/{problem_slug}` — Clear canvas draft.
- `GET /api/submissions` — User's submission history.
- `GET /api/submissions/{id}` — Specific submission detail with graph JSON.
- `GET /api/notes/{problem_slug}` — User notes for problem.
- `PUT /api/notes/{problem_slug}` — Save user notes for problem.

## Configuration

Settings are configured via `src/main/resources/application.yml` and can be overridden with environment variables:

| Variable | Default | Description |
|---|---|---|
| `SERVER_PORT` | `8000` | HTTP/WS server port |
| `AUTH_SECRET` | `dev-secret-change-in-production` | Secret for HMAC-SHA256 JWT validation |
| `GROQ_API_KEY` | *(empty)* | Optional Groq API key for LLM analysis |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | LLM model name |
| `SPRING_DATASOURCE_URL` | `jdbc:sqlite:./archforge.db` | SQLite JDBC connection string |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Allowed CORS origins |
