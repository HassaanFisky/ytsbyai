from fastapi import FastAPI, Request, HTTPException
from app.routers import summary, subscription, webhook, smart_summary, langgraph_summary, recommendation, voice, demo, admin, alerts, feedback, feature_request
from app.core.config import settings
from app.core.auth import get_current_user
from app.core.firebase import initialize_firebase
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app):
    initialize_firebase()
    yield
    # Shutdown
    pass

app = FastAPI(
    title="YTS by AI API",
    description="AI-powered YouTube and voice summarization service",
    version="1.0.0",
    lifespan=lifespan
)
# Add rate limiter
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from fastapi.responses import JSONResponse

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

def _rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded."},
    )

app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# CORS middleware

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(summary.router, prefix="/api/v1", tags=["summary"])
app.include_router(smart_summary.router, prefix="/api/v1", tags=["smart-summary"])
app.include_router(langgraph_summary.router, prefix="/api/v1", tags=["langgraph-summary"])
app.include_router(recommendation.router, prefix="/api/v1", tags=["recommendation"])
app.include_router(voice.router, prefix="/api/v1", tags=["voice"])
app.include_router(subscription.router, prefix="/api/v1", tags=["subscription"])
app.include_router(webhook.router, prefix="/api/v1", tags=["webhook"])
app.include_router(demo.router, prefix="/api/v1", tags=["demo"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(alerts.router, prefix="/api/v1/admin", tags=["alerts"])
app.include_router(feedback.router, prefix="/api/v1", tags=["feedback"])
app.include_router(feature_request.router, prefix="/api/v1", tags=["feature-requests"])

@app.get("/")
async def root():
    return {"message": "YTS by AI API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)