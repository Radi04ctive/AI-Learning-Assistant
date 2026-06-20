# AI Learning Assistant

A full-stack learning platform that turns uploaded PDF study materials into interactive AI-powered tools. Upload a document, chat with it, generate flashcards and quizzes, and track your progress from a single dashboard.

## Features

### Authentication & profile
- User registration and login with short-lived JWT access tokens + rotating refresh tokens
- Token blacklist via Redis enables true logout (single device and "logout everywhere") and password-change invalidation
- Protected routes for all learning features
- Profile management (update profile, change password)

### Document management
- Upload PDF documents (text is extracted and chunked automatically)
- View documents in an embedded PDF viewer
- Browse, open, and delete your document library
- Processing status tracking (`processing` → `ready`)

### AI-powered learning (Google Gemini)
All AI features run against the content of your uploaded documents:

| Feature | Description |
|--------|-------------|
| **Chat** | Ask questions about a document; answers use relevant text chunks and chat history is saved per document |
| **Summary** | Generate a concise summary of the full document |
| **Explain concept** | Get a targeted explanation of any concept from the document |
| **Flashcards** | Auto-generate question/answer flashcards with difficulty levels |
| **Quizzes** | Auto-generate multiple-choice quizzes with explanations |

### Flashcards
- Flip-card study UI per document
- Mark cards as reviewed and star important cards
- Delete flashcard sets

### Quizzes
- Take AI-generated quizzes with timed sessions
- Submit answers and view scored results with explanations
- Delete quizzes you no longer need

### Dashboard & progress
- Overview stats: documents, flashcards, quizzes, average score
- Recent documents and quiz activity at a glance

---

## Tech stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, Vite 8, React Router 7, Tailwind CSS 4, Axios, react-markdown |
| **Backend** | Node.js 24, Express 5, Mongoose, JWT (access + refresh), bcrypt, Multer |
| **AI** | Google Gemini API (`@google/genai`) |
| **Database** | MongoDB 7 |
| **Cache / token blacklist** | Redis 7 (ioredis) |
| **PDF processing** | pdf-parse, custom text chunker for RAG-style context |
| **Deployment** | Docker, Docker Compose, nginx (reverse proxy + static SPA) |
| **Package manager** | pnpm |

---

## Project structure

```
AiLearningAssitant/
├── backend/          # Express API, models, Gemini integration
├── frontend/         # React SPA (Vite)
├── docker-compose.yml   # Full-stack production-style stack
├── .env.example         # Root env template (Docker + shared secrets)
└── README.md
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) 20+ (24 recommended)
- [pnpm](https://pnpm.io/) (`corepack enable`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for Docker deployment or local MongoDB)
- A [Google Gemini API key](https://aistudio.google.com/apikey)

---

## Run locally (development)

### 1. Start MongoDB and Redis

From the project root, start MongoDB and Redis (plus the optional Mongo Express admin UI):

```bash
cd backend
docker compose up -d
```

MongoDB runs on `localhost:27017`, Redis on `localhost:6379`. Mongo Express (optional) is at `http://localhost:8081`.

### 2. Configure environment

**Root `.env`** — copy the example and fill in values (used by MongoDB Docker and can be referenced by the backend):

```bash
cp .env.example .env
```

**Backend** — create `backend/.env` (or export these variables before starting the server):

```env
MONGO_ROOT_USER=root
MONGO_ROOT_PASSWORD=changeme
MONGO_HOST=localhost
MONGO_PORT=27017
PORT=3000
NODE_ENV=development
JWT_SECRET=your-long-random-secret
JWT_EXPIRE=7d
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
JWT_REFRESH_SECRET=your-long-random-refresh-secret
REDIS_URL=redis://localhost:6379
MAX_FILE_SIZE=10485760
GEMINI_API_KEY=your-gemini-api-key
PUBLIC_BASE_URL=http://localhost:3000
```

**Frontend** — create `frontend/.env`:

```bash
cp frontend/.env.example frontend/.env
```

Default content:

```env
VITE_API_URL=http://localhost:3000
```

### 3. Install dependencies and start services

**Terminal 1 — backend:**

```bash
cd backend
pnpm install
pnpm dev
```

API available at `http://localhost:3000`.

**Terminal 2 — frontend:**

```bash
cd frontend
pnpm install
pnpm dev
```

Open the URL shown by Vite (typically `http://localhost:5173`).

---

## Deploy with Docker

The root `docker-compose.yml` runs the full stack: MongoDB, Mongo Express, backend API, and frontend (nginx).

### 1. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set strong values for `MONGO_ROOT_PASSWORD`, `JWT_SECRET`, and `GEMINI_API_KEY`.

### 2. Build and start

From the project root:

```bash
docker compose up --build -d
```

### 3. Access the app

| Service | URL |
|---------|-----|
| **App (frontend + API proxy)** | `http://localhost` |
| **Mongo Express** (optional DB admin) | `http://localhost:8081` |

In Docker mode, nginx serves the React app on port **80** and proxies `/api/` and `/uploads/` to the backend. The frontend is built with an empty `VITE_API_URL` so all API calls are same-origin.

### Architecture (Docker)

```
Browser → nginx (:80) → static React files
                      → /api/*, /uploads/* → backend (:3000) → MongoDB
```

Uploaded PDFs are stored in the `uploads_data` Docker volume.

### Useful commands

```bash
docker compose logs -f          # follow logs
docker compose down             # stop containers
docker compose down -v          # stop and remove volumes (deletes DB + uploads)
```

---

## Environment variables

### Root `.env` (Docker Compose)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_ROOT_USER` | MongoDB root username | `root` |
| `MONGO_ROOT_PASSWORD` | MongoDB root password | strong password |
| `ME_WEB_USER` | Mongo Express login username | `me_admin` |
| `ME_WEB_PASSWORD` | Mongo Express login password | strong password |
| `PORT` | Backend listen port | `3000` |
| `NODE_ENV` | Runtime mode | `production` |
| `JWT_SECRET` | Secret for signing access tokens | long random string |
| `JWT_EXPIRE` | Legacy access-token lifetime (kept for compatibility) | `7d` |
| `JWT_ACCESS_EXPIRE` | Short-lived access-token lifetime | `15m` |
| `JWT_REFRESH_EXPIRE` | Refresh-token lifetime | `7d` |
| `JWT_REFRESH_SECRET` | Separate secret reserved for signed refresh tokens | long random string |
| `REDIS_URL` | Redis connection (token blacklist) | `redis://redis:6379` (Docker), `redis://localhost:6379` (local) |
| `MAX_FILE_SIZE` | Max upload size in bytes | `10485760` (10 MB) |
| `GEMINI_API_KEY` | Google Gemini API key | from AI Studio |
| `PUBLIC_BASE_URL` | Base URL for uploaded file links; leave empty in Docker for relative URLs | `http://localhost:3000` locally |

Docker Compose also sets `MONGO_HOST=mongo` and `REDIS_URL=redis://redis:6379` on the backend service (internal network hostnames).

### Frontend `frontend/.env`

| Variable | Description | Local dev | Docker build |
|----------|-------------|-----------|--------------|
| `VITE_API_URL` | Backend base URL for API requests | `http://localhost:3000` | empty (same-origin via nginx) |

> **Note:** Never commit `.env` files. They are listed in `.gitignore`. Use `.env.example` as a template.

---

## API overview

| Prefix | Purpose |
|--------|---------|
| `/api/auth` | Register, login, refresh, logout, profile, change password |
| `/api/documents` | Upload, list, get, delete PDFs |
| `/api/ai` | Chat, summary, flashcards, quizzes, explain concept |
| `/api/flashcards` | Manage and study flashcard sets |
| `/api/quizzes` | Create, take, submit, and view quiz results |
| `/api/progress` | Dashboard statistics |

---

## License

ISC
