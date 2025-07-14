from fastapi import APIRouter, HTTPException, Depends, Request, Query
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from app.core.admin_auth import get_admin_user
from app.core.feedback_service import feedback_service, FeedbackType, FeedbackStatus
from slowapi import Limiter
from slowapi.util import get_remote_address
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

class CreateFeedbackRequest(BaseModel):
    feedback_type: str
    message: str
    email: Optional[str] = None
    page_url: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: str
    feedback_type: str
    message: str
    user_email: Optional[str]
    user_uid: Optional[str]
    user_agent: Optional[str]
    ip_address: Optional[str]
    page_url: Optional[str]
    status: str
    created_at: str
    updated_at: str
    is_anonymous: bool

class FeedbackListResponse(BaseModel):
    feedback: List[FeedbackResponse]
    total_count: int
    stats: Dict[str, Any]

class FeedbackStatsResponse(BaseModel):
    total_feedback: int
    by_type: Dict[str, int]
    by_status: Dict[str, int]
    recent_feedback: int
    anonymous_feedback: int

@router.post("/feedback", response_model=FeedbackResponse)
@limiter.limit("10/minute")
async def create_feedback(
    request: CreateFeedbackRequest,
    http_request: Request
):
    """Create new feedback (public endpoint)"""
    try:
        # Validate feedback type
        try:
            feedback_type = FeedbackType(request.feedback_type)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid feedback type")

        # Get user info from request
        user_agent = http_request.headers.get("User-Agent")
        ip_address = http_request.client.host if http_request.client else None
        
        # Create feedback
        feedback = await feedback_service.create_feedback(
            feedback_type=feedback_type,
            message=request.message,
            user_email=request.email,
            user_agent=user_agent,
            ip_address=ip_address,
            page_url=request.page_url
        )
        
        return FeedbackResponse(**feedback.to_dict())
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to create feedback")

@router.get("/admin/feedback", response_model=FeedbackListResponse)
@limiter.limit("30/minute")
async def get_feedback(
    limit: int = Query(100, ge=1, le=500),
    feedback_type: Optional[str] = Query(None),
    current_admin: dict = Depends(get_admin_user)
):
    """Get feedback list (admin only)"""
    try:
        # Parse feedback type filter
        filter_type = None
        if feedback_type:
            try:
                filter_type = FeedbackType(feedback_type)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid feedback type")

        # Get feedback
        feedback_list = await feedback_service.get_feedback(limit=limit, feedback_type=filter_type)
        
        # Get stats
        stats = await feedback_service.get_feedback_stats()
        
        # Convert to response format
        feedback_responses = [
            FeedbackResponse(**feedback.to_dict())
            for feedback in feedback_list
        ]
        
        return FeedbackListResponse(
            feedback=feedback_responses,
            total_count=len(feedback_responses),
            stats=stats
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to get feedback")

@router.delete("/admin/feedback/{feedback_id}")
@limiter.limit("30/minute")
async def delete_feedback(
    feedback_id: str,
    current_admin: dict = Depends(get_admin_user)
):
    """Delete feedback (admin only)"""
    try:
        success = await feedback_service.delete_feedback(feedback_id)
        
        if success:
            return {"success": True, "message": "Feedback deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Feedback not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete feedback")

@router.put("/admin/feedback/{feedback_id}/status")
@limiter.limit("30/minute")
async def update_feedback_status(
    feedback_id: str,
    status: str,
    current_admin: dict = Depends(get_admin_user)
):
    """Update feedback status (admin only)"""
    try:
        # Validate status
        try:
            feedback_status = FeedbackStatus(status)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status")

        success = await feedback_service.update_feedback_status(feedback_id, feedback_status)
        
        if success:
            return {"success": True, "message": f"Status updated to {status}"}
        else:
            raise HTTPException(status_code=404, detail="Feedback not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating feedback status: {e}")
        raise HTTPException(status_code=500, detail="Failed to update feedback status")

@router.get("/admin/feedback/stats", response_model=FeedbackStatsResponse)
@limiter.limit("30/minute")
async def get_feedback_stats(
    current_admin: dict = Depends(get_admin_user)
):
    """Get feedback statistics (admin only)"""
    try:
        stats = await feedback_service.get_feedback_stats()
        return FeedbackStatsResponse(**stats)
        
    except Exception as e:
        logger.error(f"Error getting feedback stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get feedback statistics")

@router.post("/admin/feedback/test")
@limiter.limit("5/minute")
async def create_test_feedback(
    current_admin: dict = Depends(get_admin_user)
):
    """Create a test feedback (admin only)"""
    try:
        feedback = await feedback_service.create_feedback(
            feedback_type=FeedbackType.BUG,
            message="This is a test feedback to verify the system is working correctly.",
            user_email="test@ytsbyai.com",
            user_agent="Test Agent",
            ip_address="127.0.0.1",
            page_url="https://ytsbyai.com/test"
        )
        
        return {
            "success": True,
            "message": "Test feedback created successfully",
            "feedback": FeedbackResponse(**feedback.to_dict())
        }
        
    except Exception as e:
        logger.error(f"Error creating test feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to create test feedback") 