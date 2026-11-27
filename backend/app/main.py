import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from app.core.config import settings
from app.core.database import engine, Base, AsyncSessionLocal
from app.core.init_db import init_db
from app.api.v1.router import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("anime_store")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Connecting to database and creating tables...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            if engine.dialect.name == "postgresql":
                for stmt in (
                    "ALTER TABLE products ALTER COLUMN image_url TYPE TEXT",
                    "ALTER TABLE product_images ALTER COLUMN image_url TYPE TEXT",
                    "ALTER TABLE categories ALTER COLUMN image TYPE TEXT",
                    "ALTER TABLE customers ALTER COLUMN avatar TYPE TEXT",
                    "ALTER TABLE order_items ALTER COLUMN image_url TYPE TEXT",
                ):
                    await conn.execute(text(stmt))
        logger.info("Database tables verified.")

        # Seed initial data
        async with AsyncSessionLocal() as session:
            await init_db(session)
    except Exception as e:
        logger.warning(f"Database initialization notice: {e}")
        logger.info("If using external PostgreSQL, ensure postgres server and database are reachable.")

    yield

    logger.info("Shutting down database connection...")
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production REST API for Anime Store E-commerce & Admin Dashboard",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled error on {request.method} {request.url.path}")
    origin = request.headers.get("origin")
    headers = {}
    if origin:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
        headers=headers,
    )

# API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health"])
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR,
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}
