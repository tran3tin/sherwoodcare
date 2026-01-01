# Sherwoodcare

Admin dashboard for Sherwoodcare management system.

## Structure

- `backend/` — Node.js + Express API with MySQL support
- `frontend/` — React + Vite frontend with akkhor-inspired UI
- `akkhor/` — Reference template files

Quick start

1. Backend

```bash
cd backend
npm install
# create .env from .env.example
cp .env.example .env
npm run dev   # requires nodemon or use npm start
```

2. Frontend

```bash
cd frontend
npm install
# create .env from .env.example
cp .env.example .env
npm run dev
```

Env notes

- Backend: `backend/.env.example` includes `PORT`, `CORS_ORIGIN`, `DATABASE_URL`, `API_KEY`.
- Frontend: `frontend/.env.example` uses `VITE_API_BASE_URL` (must start with `VITE_` to be exposed to client).

Security

- Do NOT commit your real `.env` files to source control. Use `.env.example` as a template.

Production

1. Build frontend

```bash
cd frontend
npm run build
```

2. Serve built frontend from backend

Set environment variable `SERVE_STATIC=true` and start the backend. Example (PowerShell):

```powershell
$env:SERVE_STATIC = 'true'
cd backend
npm start
```

The backend will serve files from `frontend/dist` when `SERVE_STATIC=true`.

Docker (optional)

Build and run with Docker Compose:

```bash
docker-compose build
docker-compose up
```

Run smoke test for backend (after starting backend):

```bash
cd backend
npm run smoke
```
