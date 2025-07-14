from fastapi import APIRouter, HTTPException, Depends, Response
from pydantic import BaseModel
from typing import Dict, List, Any
from app.core.admin_auth import get_admin_user
from app.core.alerts_service import alerts_service, Alert
from slowapi import Limiter
from slowapi.util import get_remote_address
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

class AlertResponse(BaseModel):
    id: str
    alert_type: str
    level: str
    title: str
    message: str
    data: Dict[str, Any]
    created_at: str
    expires_at: str
    is_dismissed: bool

class AlertsResponse(BaseModel):
    alerts: List[AlertResponse]
    total_count: int
    active_count: int

class TestAlertResponse(BaseModel):
    success: bool
    alert: AlertResponse
    message: str

@router.get("/alerts", response_model=AlertsResponse)
@limiter.limit("60/minute")
async def get_active_alerts(
    current_admin: dict = Depends(get_admin_user)
):
    """Get all active alerts"""
    try:
        alerts = await alerts_service.get_active_alerts()
        
        # Convert to response format
        alert_responses = [
            AlertResponse(
                id=alert.id,
                alert_type=alert.alert_type.value,
                level=alert.level.value,
                title=alert.title,
                message=alert.message,
                data=alert.data,
                created_at=alert.created_at.isoformat(),
                expires_at=alert.expires_at.isoformat(),
                is_dismissed=alert.is_dismissed
            )
            for alert in alerts
        ]
        
        active_count = len([a for a in alerts if not a.is_dismissed])
        
        return AlertsResponse(
            alerts=alert_responses,
            total_count=len(alerts),
            active_count=active_count
        )
        
    except Exception as e:
        logger.error(f"Error getting active alerts: {e}")
        raise HTTPException(status_code=500, detail="Failed to get alerts")

@router.post("/alerts/test", response_model=TestAlertResponse)
@limiter.limit("10/minute")
async def create_test_alert(
    current_admin: dict = Depends(get_admin_user)
):
    """Create a test alert for testing purposes"""
    try:
        alert = await alerts_service.create_test_alert()
        
        alert_response = AlertResponse(
            id=alert.id,
            alert_type=alert.alert_type.value,
            level=alert.level.value,
            title=alert.title,
            message=alert.message,
            data=alert.data,
            created_at=alert.created_at.isoformat(),
            expires_at=alert.expires_at.isoformat(),
            is_dismissed=alert.is_dismissed
        )
        
        return TestAlertResponse(
            success=True,
            alert=alert_response,
            message="Test alert created successfully"
        )
        
    except Exception as e:
        logger.error(f"Error creating test alert: {e}")
        raise HTTPException(status_code=500, detail="Failed to create test alert")

@router.delete("/alerts/{alert_id}")
@limiter.limit("30/minute")
async def dismiss_alert(
    alert_id: str,
    current_admin: dict = Depends(get_admin_user)
):
    """Dismiss an alert"""
    try:
        success = await alerts_service.dismiss_alert(alert_id)
        
        if success:
            return {"success": True, "message": "Alert dismissed successfully"}
        else:
            raise HTTPException(status_code=404, detail="Alert not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error dismissing alert: {e}")
        raise HTTPException(status_code=500, detail="Failed to dismiss alert")

@router.post("/alerts/clear-expired")
@limiter.limit("10/minute")
async def clear_expired_alerts(
    current_admin: dict = Depends(get_admin_user)
):
    """Clear expired alerts"""
    try:
        cleared_count = await alerts_service.clear_expired_alerts()
        
        return {
            "success": True,
            "message": f"Cleared {cleared_count} expired alerts",
            "cleared_count": cleared_count
        }
        
    except Exception as e:
        logger.error(f"Error clearing expired alerts: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear expired alerts")

@router.get("/alerts/stats")
@limiter.limit("30/minute")
async def get_alerts_stats(
    current_admin: dict = Depends(get_admin_user)
):
    """Get alerts statistics"""
    try:
        alerts = await alerts_service.get_active_alerts()
        
        # Count by level
        level_counts = {}
        type_counts = {}
        
        for alert in alerts:
            level = alert.level.value
            alert_type = alert.alert_type.value
            
            level_counts[level] = level_counts.get(level, 0) + 1
            type_counts[alert_type] = type_counts.get(alert_type, 0) + 1
        
        return {
            "total_alerts": len(alerts),
            "active_alerts": len([a for a in alerts if not a.is_dismissed]),
            "dismissed_alerts": len([a for a in alerts if a.is_dismissed]),
            "level_distribution": level_counts,
            "type_distribution": type_counts
        }
        
    except Exception as e:
        logger.error(f"Error getting alerts stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get alerts statistics") 