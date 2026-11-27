# Anime Store

Full-stack e-commerce platform for anime figures, manga, plushies, and collectibles, consisting of three apps:

- `frontend/` — Customer Storefront (React + TypeScript + Vite + Tailwind CSS + Firebase Auth)
- `admin-dashboard/` — Admin Dashboard (React + TypeScript + Vite + Tailwind CSS)
- `backend/` — REST API & Database Layer (FastAPI + SQLAlchemy Async + PostgreSQL / SQLite + Telegram Notifications)

## Quick Start

### 1. Configure Environment Variables

Copy the root template `.env.example` to `.env` and fill in your local values:

```bash
cp .env.example .env
```

- Set `DATABASE_URL` and `SECRET_KEY` for the FastAPI backend.
- Set `VITE_FIREBASE_*` keys from Firebase Console (`Project Settings -> General -> Your apps`) for storefront authentication.
- Optionally configure `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` for order notifications.

### 2. Run Backend (`http://localhost:8000`)

```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Run Customer Storefront (`http://localhost:3000`)

```bash
cd frontend
npm install
npm run dev
```

### 4. Run Admin Dashboard (`http://localhost:3001`)

```bash
cd admin-dashboard
npm install
npm run dev
```

## Verification Commands

- **Frontend**: `cd frontend && npm run lint && npm run build`
- **Admin Dashboard**: `cd admin-dashboard && npm run build`
- **Backend Tests**: `cd backend && python -m pytest -v`
