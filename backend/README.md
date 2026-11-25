# Anime Store - Backend REST API

Production-style asynchronous REST API for the Anime Store E-Commerce and Admin Dashboard, built with **Python 3.12+**, **FastAPI**, **PostgreSQL**, **SQLAlchemy 2.0 (Async)**, and **Pydantic v2**.

---

## 🚀 Features

- **Fast & Modern**: Built with FastAPI, Pydantic v2, and Python 3.12+ type hints.
- **Async Database**: Full async support using SQLAlchemy 2.0 Async and `asyncpg` with PostgreSQL.
- **JWT Authentication & RBAC**: Secure access and refresh tokens, bcrypt password hashing, and role-based permissions (`admin` vs `customer`).
- **Product & Category Management**: Dynamic catalog with filtering, sorting, full-text search, pagination, and multi-image uploads.
- **Transactional Order Processing**: Inventory is safely checked and decremented on order creation and automatically restored upon cancellation.
- **Cart & Wishlist**: Session-based guest carts and user-authenticated shopping carts and wishlists.
- **Warehouse Inventory**: Stock In / Stock Out management with complete audit transaction logging and low-stock alerts.
- **Dashboard Analytics**: Revenue, customer metrics, sales overview chart points, order status distributions, and top-selling products.
- **Review Moderation**: Customer product reviews and admin approval workflow.
- **Store Settings**: Real-time configurable store policies, shipping tiers, taxes, and contact details.

---

## 📁 Project Architecture

```
backend/
├── app/
│   ├── main.py                    # Application entrypoint & lifespan
│   ├── core/
│   │   ├── config.py              # Pydantic BaseSettings & environment variables
│   │   ├── database.py            # Async engine, sessionmaker, and Base
│   │   ├── security.py            # Bcrypt hashing, JWT encode/decode
│   │   ├── dependencies.py        # Current user & admin dependencies
│   │   └── init_db.py             # Automatic database seeding
│   ├── models/                    # 14 SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── category.py
│   │   ├── product.py
│   │   ├── product_image.py
│   │   ├── order.py
│   │   ├── order_item.py
│   │   ├── cart.py
│   │   ├── cart_item.py
│   │   ├── wishlist.py
│   │   ├── review.py
│   │   ├── payment.py
│   │   ├── inventory.py
│   │   └── site_setting.py
│   ├── schemas/                   # Pydantic v2 input/output DTOs
│   ├── repositories/              # Async repository pattern
│   ├── services/                  # Clean business logic layer
│   ├── api/v1/
│   │   ├── router.py              # Aggregated v1 router
│   │   └── endpoints/             # Specialized endpoints for all modules
│   └── utils/
│       ├── pagination.py          # PaginatedResponse generic schema
│       └── responses.py
├── migrations/                    # Alembic async migration scripts
├── tests/                         # Pytest asynchronous test suite
├── .env.example
├── alembic.ini
├── requirements.txt
├── Dockerfile
└── README.md
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- Python 3.12 or 3.13
- PostgreSQL 14+ (or Docker)

### 2. Setup Virtual Environment & Install Dependencies
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Environment Configuration
Copy `.env.example` to `.env` and configure your credentials:
```bash
cp .env.example .env
```

Key configuration options in `.env`:
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/anime_store_db
SECRET_KEY=your_production_secret_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:3001","http://localhost:3002","http://localhost:5173"]
```

### 4. Database Initialization
When running the FastAPI server, the application's lifespan automatically verifies tables and seeds initial administrative accounts, categories, catalog items, and store settings.

Alternatively, generate and run Alembic migrations:
```bash
alembic revision --autogenerate -m "initial_schema"
alembic upgrade head
```

### 5. Running the Backend Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🔑 Default Credentials

- **Admin Account**:
  - Email: `admin@animestore.com`
  - Password: `Admin123456!`
  - Role: `admin`

- **Customer Demo Account**:
  - Email: `john.doe@email.com`
  - Password: `Password123!`
  - Role: `customer`

---

## 🧪 Running Tests

Execute the automated test suite with `pytest`:
```bash
pytest -v
```

---

## 🐳 Docker Deployment

Build and run using Docker:
```bash
docker build -t anime-store-backend .
docker run -p 8000:8000 --env-file .env anime-store-backend
```
