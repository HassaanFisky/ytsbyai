from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from app.core.admin_auth import get_admin_user
from app.core.admin_analytics import admin_analytics
from app.core.alerts_service import alerts_service
from slowapi import Limiter
from slowapi.util import get_remote_address
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

class DemoStatsResponse(BaseModel):
    total_sessions: int
    active_sessions: int
    quota_exceeded_counts: Dict[str, int]
    conversion_clicks: Dict[str, int]
    session_sources: Dict[str, int]
    top_ips: List[str]
    recent_sessions: List[Dict[str, Any]]
    timestamp: str

class UsageTimelineResponse(BaseModel):
    summary: List[int]
    transcription: List[int]
    labels: List[str]

class LeaderboardResponse(BaseModel):
    leaderboard: List[Dict[str, Any]]

class ConversionFunnelResponse(BaseModel):
    demo_started: int
    quota_exceeded: int
    modal_shown: int
    signup_clicked: int
    checkout_clicked: int
    signup_completed: int
    checkout_completed: int

@router.get("/demo-stats", response_model=DemoStatsResponse)
@limiter.limit("30/minute")
async def get_demo_stats(
    current_admin: dict = Depends(get_admin_user)
):
    """Get comprehensive demo portal statistics with alert monitoring"""
    try:
        stats = await admin_analytics.get_demo_stats()
        
        # Check for alerts based on thresholds
        alerts = await alerts_service.check_usage_thresholds(stats)
        if alerts:
            logger.info(f"Generated {len(alerts)} alerts from demo stats")
        
        return DemoStatsResponse(**stats)
    except Exception as e:
        logger.error(f"Error getting demo stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get demo statistics")

@router.get("/usage-timeline", response_model=UsageTimelineResponse)
@limiter.limit("30/minute")
async def get_usage_timeline(
    hours: int = Query(24, ge=1, le=168),  # 1 hour to 1 week
    current_admin: dict = Depends(get_admin_user)
):
    """Get usage timeline for charts"""
    try:
        timeline = await admin_analytics.get_usage_timeline(hours)
        return UsageTimelineResponse(**timeline)
    except Exception as e:
        logger.error(f"Error getting usage timeline: {e}")
        raise HTTPException(status_code=500, detail="Failed to get usage timeline")

@router.get("/leaderboard", response_model=LeaderboardResponse)
@limiter.limit("30/minute")
async def get_leaderboard(
    current_admin: dict = Depends(get_admin_user)
):
    """Get leaderboard of most active sessions"""
    try:
        leaderboard = await admin_analytics.get_leaderboard()
        return LeaderboardResponse(leaderboard=leaderboard)
    except Exception as e:
        logger.error(f"Error getting leaderboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to get leaderboard")

@router.get("/conversion-funnel", response_model=ConversionFunnelResponse)
@limiter.limit("30/minute")
async def get_conversion_funnel(
    current_admin: dict = Depends(get_admin_user)
):
    """Get conversion funnel data"""
    try:
        funnel = await admin_analytics.get_conversion_funnel()
        return ConversionFunnelResponse(**funnel)
    except Exception as e:
        logger.error(f"Error getting conversion funnel: {e}")
        raise HTTPException(status_code=500, detail="Failed to get conversion funnel")

@router.get("/health")
@limiter.limit("60/minute")
async def admin_health_check(
    current_admin: dict = Depends(get_admin_user)
):
    """Health check for admin endpoints"""
    return {
        "status": "healthy",
        "admin_user": current_admin.get("email"),
        "timestamp": "2024-01-01T00:00:00Z"
    } 