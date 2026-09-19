# VoiceMate Backend

This is the backend for VoiceMate, a voice-first AI inventory operating system.

## Tech Stack
- **Python**: 3.11+
- **Framework**: FastAPI (high performance, asynchronous web framework)
- **ASGI Server**: Uvicorn
- **Database**: PostgreSQL (currently configured to use SQLite `voicemate.db` for local development)
- **ORM**: SQLAlchemy 2.x
- **Migrations**: Alembic
- **Validation & Serialization**: Pydantic

## Getting Started

### 1. Set up a virtual environment
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Database Migrations
Ensure your database is up to date with the latest schema.
```bash
alembic upgrade head
```
*Note: This will create a `voicemate.db` file in the backend directory for local development.*

### 4. Run the Development Server
```bash
uvicorn app.main:app --reload
# OR if running from within app/
uvicorn api.router:app --reload
```
*(Currently the main entry point is `app/api/router.py` serving as the FastAPI app).*

The server will start at `http://127.0.0.1:8000`.

### 5. Access Documentation
FastAPI automatically generates interactive API documentation.
- **Swagger UI**: `http://127.0.0.1:8000/docs`
- **ReDoc**: `http://127.0.0.1:8000/redoc`

## Project Structure
- `app/api/`: FastAPI routers and endpoints
- `app/models/`: SQLAlchemy database models
- `app/schemas/`: Pydantic models for data validation and API payloads
- `app/repositories/`: Database interaction layer (CRUD operations)
- `app/services/`: Business logic and orchestration
- `alembic/`: Database migration scripts
