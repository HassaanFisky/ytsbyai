from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import logging

from app.core.auth import get_current_user
from app.core.feature_request_service import feature_request_service, FeatureRequest, UserProfile
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/features", tags=["Feature Requests"])
security = HTTPBearer()

# Request/Response Models
class CreateFeatureRequest(BaseModel):
    title: str
    description: str
    feature_type: str  # "enhancement", "bug_fix", "new_feature", "ui_improvement"
    category: str  # "beginner", "pro", "everyone"
    tags: List[str] = []
    screenshot_url: Optional[str] = None
    audio_url: Optional[str] = None
    video_url: Optional[str] = None
    priority: str = "medium"
    estimated_effort: Optional[str] = None
    difficulty_level: str = "easy"  # "easy", "medium", "hard"
    target_audience: List[str] = []  # ["kids", "beginners", "pros", "elderly"]

class VoteRequest(BaseModel):
    vote_type: str  # "upvote" or "downvote"
    user_type: str = "unknown"  # "beginner", "pro", "unknown"

class UpdateFeatureStatus(BaseModel):
    status: str  # "pending", "planned", "in_progress", "completed", "rejected"
    assigned_to: Optional[str] = None
    estimated_effort: Optional[str] = None

class FeatureResponse(BaseModel):
    id: str
    title: str
    description: str
    feature_type: str
    category: str
    author_id: str
    author_email: str
    author_type: str
    created_at: str
    updated_at: str
    vote_count: int
    upvotes: int
    downvotes: int
    status: str
    tags: List[str]
    screenshot_url: Optional[str]
    audio_url: Optional[str]
    video_url: Optional[str]
    priority: str
    estimated_effort: Optional[str]
    assigned_to: Optional[str]
    comments_count: int
    helpful_count: int
    difficulty_level: str
    target_audience: List[str]
    user_vote: Optional[str] = None  # Current user's vote

class UserProfileResponse(BaseModel):
    user_id: str
    user_type: str
    created_at: str
    feature_count: int
    vote_count: int
    helpful_votes: int
    badges: List[str]

class FeatureStats(BaseModel):
    total_features: int
    status_counts: dict
    category_counts: dict
    difficulty_counts: dict
    audience_counts: dict
    total_votes: int
    avg_votes_per_feature: float

class TopVoter(BaseModel):
    user_id: str
    vote_count: int

# Feature Request Endpoints
@router.post("/", response_model=FeatureResponse, status_code=status.HTTP_201_CREATED)
async def create_feature_request(
    request: CreateFeatureRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a new feature request with universal design support"""
    try:
        # Validate feature type
        valid_types = ["enhancement", "bug_fix", "new_feature", "ui_improvement"]
        if request.feature_type not in valid_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid feature type. Must be one of: {valid_types}"
            )

        # Validate category
        valid_categories = ["beginner", "pro", "everyone"]
        if request.category not in valid_categories:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid category. Must be one of: {valid_categories}"
            )

        # Validate priority
        valid_priorities = ["low", "medium", "high", "critical"]
        if request.priority not in valid_priorities:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid priority. Must be one of: {valid_priorities}"
            )

        # Validate difficulty level
        valid_difficulties = ["easy", "medium", "hard"]
        if request.difficulty_level not in valid_difficulties:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid difficulty level. Must be one of: {valid_difficulties}"
            )

        # Validate target audience
        valid_audiences = ["kids", "beginners", "pros", "elderly"]
        for audience in request.target_audience:
            if audience not in valid_audiences:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid target audience: {audience}. Must be one of: {valid_audiences}"
                )

        # Get user profile to determine author type
        user_profile = feature_request_service.get_user_profile(current_user["uid"])
        author_type = user_profile.user_type if user_profile else "unknown"

        feature = feature_request_service.create_feature_request(
            title=request.title,
            description=request.description,
            feature_type=request.feature_type,
            category=request.category,
            author_id=current_user["uid"],
            author_email=current_user.get("email", ""),
            author_type=author_type,
            tags=request.tags,
            screenshot_url=request.screenshot_url,
            audio_url=request.audio_url,
            video_url=request.video_url,
            priority=request.priority,
            estimated_effort=request.estimated_effort,
            difficulty_level=request.difficulty_level,
            target_audience=request.target_audience
        )

        # Convert to response model
        response = FeatureResponse(**feature.dict())
        response.user_vote = feature_request_service.get_user_vote(
            feature.id, current_user["uid"]
        )

        logger.info(f"Feature request created: {feature.id} by {current_user['uid']} (category: {request.category})")
        return response

    except Exception as e:
        logger.error(f"Error creating feature request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create feature request"
        )

@router.get("/", response_model=List[FeatureResponse])
async def list_feature_requests(
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
    sort_by: str = Query("votes", regex="^(votes|recent|priority)$"),
    category: Optional[str] = Query(None),
    difficulty_level: Optional[str] = Query(None),
    target_audience: Optional[str] = Query(None),
    user_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    current_user: Optional[dict] = Depends(get_current_user)
):
    """List feature requests with universal design filtering"""
    try:
        # Determine user type for filtering
        user_type_filter = None
        if current_user:
            user_profile = feature_request_service.get_user_profile(current_user["uid"])
            user_type_filter = user_profile.user_type if user_profile else "unknown"
        elif user_type:
            user_type_filter = user_type

        features = feature_request_service.list_feature_requests(
            limit=limit,
            offset=offset,
            sort_by=sort_by,
            category=category,
            difficulty_level=difficulty_level,
            target_audience=target_audience,
            user_type=user_type_filter,
            status=status,
            priority=priority
        )

        # Add user vote information if user is authenticated
        responses = []
        for feature in features:
            response = FeatureResponse(**feature.dict())
            if current_user:
                response.user_vote = feature_request_service.get_user_vote(
                    feature.id, current_user["uid"]
                )
            responses.append(response)

        return responses

    except Exception as e:
        logger.error(f"Error listing feature requests: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list feature requests"
        )

@router.get("/search", response_model=List[FeatureResponse])
async def search_feature_requests(
    q: str = Query(..., min_length=1),
    limit: int = Query(50, ge=1, le=100),
    user_type: Optional[str] = Query(None),
    current_user: Optional[dict] = Depends(get_current_user)
):
    """Search feature requests by title and description with user type filtering"""
    try:
        # Determine user type for filtering
        user_type_filter = None
        if current_user:
            user_profile = feature_request_service.get_user_profile(current_user["uid"])
            user_type_filter = user_profile.user_type if user_profile else "unknown"
        elif user_type:
            user_type_filter = user_type

        features = feature_request_service.search_feature_requests(
            query=q,
            limit=limit,
            user_type=user_type_filter
        )

        # Add user vote information if user is authenticated
        responses = []
        for feature in features:
            response = FeatureResponse(**feature.dict())
            if current_user:
                response.user_vote = feature_request_service.get_user_vote(
                    feature.id, current_user["uid"]
                )
            responses.append(response)

        return responses

    except Exception as e:
        logger.error(f"Error searching feature requests: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search feature requests"
        )

@router.get("/{feature_id}", response_model=FeatureResponse)
async def get_feature_request(
    feature_id: str,
    current_user: Optional[dict] = Depends(get_current_user)
):
    """Get a specific feature request"""
    try:
        feature = feature_request_service.get_feature_request(feature_id)
        if not feature:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Feature request not found"
            )

        response = FeatureResponse(**feature.dict())
        if current_user:
            response.user_vote = feature_request_service.get_user_vote(
                feature.id, current_user["uid"]
            )

        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting feature request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get feature request"
        )

@router.post("/{feature_id}/vote")
async def vote_feature_request(
    feature_id: str,
    vote_request: VoteRequest,
    current_user: dict = Depends(get_current_user)
):
    """Vote on a feature request with user type tracking"""
    try:
        # Validate vote type
        if vote_request.vote_type not in ["upvote", "downvote"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vote type must be 'upvote' or 'downvote'"
            )

        # Validate user type
        valid_user_types = ["beginner", "pro", "unknown"]
        if vote_request.user_type not in valid_user_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User type must be one of: {valid_user_types}"
            )

        success, message = feature_request_service.vote_feature_request(
            feature_id=feature_id,
            user_id=current_user["uid"],
            vote_type=vote_request.vote_type,
            user_type=vote_request.user_type
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
            )

        # Get updated feature
        feature = feature_request_service.get_feature_request(feature_id)
        response = FeatureResponse(**feature.dict())
        response.user_vote = feature_request_service.get_user_vote(
            feature.id, current_user["uid"]
        )

        logger.info(f"User {current_user['uid']} ({vote_request.user_type}) voted {vote_request.vote_type} on feature {feature_id}")
        return {
            "message": message,
            "feature": response
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error voting on feature request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to vote on feature request"
        )

@router.get("/user/profile", response_model=UserProfileResponse)
async def get_user_profile(
    current_user: dict = Depends(get_current_user)
):
    """Get current user's profile with badges and stats"""
    try:
        profile = feature_request_service.get_user_profile(current_user["uid"])
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )

        return UserProfileResponse(**profile.dict())

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user profile"
        )

# Admin Endpoints
@router.get("/admin/stats", response_model=FeatureStats)
async def get_feature_stats(
    current_user: dict = Depends(get_current_user)
):
    """Get feature request statistics with universal design metrics"""
    try:
        stats = feature_request_service.get_feature_stats()
        return FeatureStats(**stats)

    except Exception as e:
        logger.error(f"Error getting feature stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get feature statistics"
        )

@router.get("/admin/top-voters", response_model=List[TopVoter])
async def get_top_voters(
    limit: int = Query(10, ge=1, le=50),
    current_user: dict = Depends(get_current_user)
):
    """Get top voters (admin only)"""
    try:
        top_voters = feature_request_service.get_top_voters(limit=limit)
        return [TopVoter(**voter) for voter in top_voters]

    except Exception as e:
        logger.error(f"Error getting top voters: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get top voters"
        )

@router.put("/admin/{feature_id}/status")
async def update_feature_status(
    feature_id: str,
    status_update: UpdateFeatureStatus,
    current_user: dict = Depends(get_current_user)
):
    """Update feature request status (admin only)"""
    try:
        # Validate status
        valid_statuses = ["pending", "planned", "in_progress", "completed", "rejected"]
        if status_update.status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {valid_statuses}"
            )

        success = feature_request_service.update_feature_status(
            feature_id=feature_id,
            status=status_update.status,
            assigned_to=status_update.assigned_to,
            estimated_effort=status_update.estimated_effort
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Feature request not found"
            )

        # Get updated feature
        feature = feature_request_service.get_feature_request(feature_id)
        response = FeatureResponse(**feature.dict())

        logger.info(f"Admin {current_user['uid']} updated feature {feature_id} status to {status_update.status}")
        return {
            "message": "Feature status updated successfully",
            "feature": response
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating feature status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update feature status"
        )

@router.delete("/admin/{feature_id}")
async def delete_feature_request(
    feature_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a feature request (admin only)"""
    try:
        success = feature_request_service.delete_feature_request(feature_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Feature request not found"
            )

        logger.info(f"Admin {current_user['uid']} deleted feature request {feature_id}")
        return {"message": "Feature request deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting feature request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete feature request"
        )

@router.get("/admin/all", response_model=List[FeatureResponse])
async def get_all_feature_requests_admin(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    difficulty_level: Optional[str] = Query(None),
    target_audience: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get all feature requests for admin (with universal design filters)"""
    try:
        features = feature_request_service.list_feature_requests(
            limit=limit,
            offset=offset,
            sort_by="recent",  # Admin view shows recent first
            status=status,
            category=category,
            difficulty_level=difficulty_level,
            target_audience=target_audience,
            priority=priority
        )

        responses = []
        for feature in features:
            response = FeatureResponse(**feature.dict())
            response.user_vote = feature_request_service.get_user_vote(
                feature.id, current_user["uid"]
            )
            responses.append(response)

        return responses

    except Exception as e:
        logger.error(f"Error getting admin feature requests: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get feature requests"
        ) 