# DevCollab Lite

DevCollab Lite is a full-stack developer collaboration app with a React frontend, an Express backend, PostgreSQL persistence, JWT auth, and bcrypt password hashing.

## Project Structure

- `backend/` - Node.js + Express API
- `frontend/` - React app with Tailwind CSS
- `backend/src/db/schema.sql` - PostgreSQL schema

Additional DevOps files:

- `backend/Dockerfile`
- `frontend/Dockerfile`
- `docker-compose.yml`
- `.github/workflows/ci-cd.yml`

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Docker + Docker Compose (for containerized run)

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
DATABASE_URL=postgres://postgres:password@localhost:5432/devcollab_lite
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:3000
```

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Create root `.env` for Docker Compose (copy from `.env.example`):

```env
POSTGRES_DB=devcollab_lite
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
BACKEND_PORT=5000
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:5000/api
```

## Install

Install dependencies in each app folder:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Database Setup

1. Create the database.

```bash
createdb devcollab_lite
```

2. Apply the schema.

```bash
psql "$DATABASE_URL" -f backend/src/db/schema.sql
```

If you prefer, run the SQL in `backend/src/db/schema.sql` through pgAdmin or another PostgreSQL client.

## Run

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm start
```

## Run With Docker Compose

1. Create `.env` in the project root using `.env.example` values.
2. Start all services:

```bash
docker-compose up --build
```

Services and ports:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- PostgreSQL: `localhost:5432`

Compose services:

- `frontend` serves the React production build on port `3000`
- `backend` runs `node src/server.js` on port `5000`
- `postgres` initializes schema from `backend/src/db/schema.sql`

## API Endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/tasks/:projectId`
- `POST /api/tasks`
- `PUT /api/tasks/:id`

Health checks:

- `GET /` (service metadata)
- `GET /api/health`

## CI/CD (GitHub Actions)

Workflow file: `.github/workflows/ci-cd.yml`

Trigger:

- Push to `main`

Pipeline steps:

- Install backend dependencies (`npm ci`)
- Run backend syntax check (`node --check src/server.js`)
- Install frontend dependencies (`npm ci`)
- Build frontend (`npm run build`)
- Build Docker image for backend
- Build Docker image for frontend
- Optional Docker Hub push when `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` secrets are configured

## Notes

- JWT is stored in `localStorage` on the client after login.
- Protected API routes require `Authorization: Bearer <token>`.
- Tasks support drag and drop in the board UI, plus direct status updates.
- Backend CORS uses `CLIENT_URL` (supports comma-separated origins).
