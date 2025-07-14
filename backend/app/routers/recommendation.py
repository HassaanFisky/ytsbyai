from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.core.config import settings
from app.core.auth import get_current_user, get_device_id, create_trial_token, is_trial_valid
from app.core.firebase import get_user_record
from app.core.graphrag_service import graphrag_service
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

class RecommendationRequest(BaseModel):
    query: str
    limit: int = 10
    include_user_history: bool = True
    filter_by_topic: Optional[str] = None

class TopicRecommendationRequest(BaseModel):
    topic: str
    limit: int = 20
    include_user_videos: bool = True

class UserRecommendationRequest(BaseModel):
    limit: int = 10
    include_topics: bool = True

class RecommendationResponse(BaseModel):
    success: bool
    recommendations: List[Dict[str, Any]]
    explanation: str
    topics: List[str]
    confidence: float
    total_videos_analyzed: int
    graph_videos: int
    vector_videos: int
    personalization_level: str
    user_id: Optional[str] = None
    error: Optional[str] = None

class TopicRecommendationResponse(BaseModel):
    topic: str
    videos: List[Dict[str, Any]]
    user_videos: List[Dict[str, Any]]
    stats: Optional[Dict[str, Any]]
    total_videos: int
    user_video_count: int
    error: Optional[str] = None

class UserRecommendationResponse(BaseModel):
    user_id: str
    recommendations: List[Dict[str, Any]]
    explanation: str
    topics: List[str]
    confidence: float
    user_topics: Dict[str, int]
    error: Optional[str] = None

@router.post("/recommend", response_model=RecommendationResponse)
@limiter.limit("20/minute")
async def get_recommendations(
    request: RecommendationRequest,
    req: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get GraphRAG-based recommendations combining Neo4j graph and Pinecone vectors"""
    
    # Check subscription/trial status
    if current_user.get("auth_type") == "firebase":
        user_record = await get_user_record(current_user["uid"])
        if not user_record or user_record.get("subscription_status") not in ["active", "trial"]:
            raise HTTPException(status_code=403, detail="Subscription required")
    else:
        if not is_trial_valid(current_user):
            raise HTTPException(status_code=403, detail="Trial expired")
    
    try:
        # Get user ID
        user_id = current_user.get("uid") if current_user.get("auth_type") == "firebase" else None
        
        # Get graph context from Neo4j
        graph_context = await graphrag_service.get_graph_context(
            query=request.query,
            user_id=user_id if request.include_user_history else None
        )
        
        # Get vector similarity from Pinecone
        if graph_context.get("query_embedding"):
            vector_results = await graphrag_service.get_vector_similarity(
                query_embedding=graph_context["query_embedding"],
                user_id=user_id if request.include_user_history else None
            )
        else:
            vector_results = []
        
        # Merge graph and vector results
        merged_results = await graphrag_service.merge_graph_and_vector_results(
            graph_context=graph_context,
            vector_results=vector_results
        )
        
        # Filter by topic if specified
        if request.filter_by_topic:
            filtered_results = [
                video for video in merged_results.get("merged_results", [])
                if video.get("topic") == request.filter_by_topic
            ]
            merged_results["merged_results"] = filtered_results
        
        # Limit results
        merged_results["merged_results"] = merged_results.get("merged_results", [])[:request.limit]
        
        # Generate AI-powered recommendations
        recommendations = await graphrag_service.generate_recommendations(
            query=request.query,
            merged_results=merged_results,
            user_id=user_id
        )
        
        return RecommendationResponse(
            success=True,
            recommendations=recommendations.get("recommendations", []),
            explanation=recommendations.get("explanation", ""),
            topics=recommendations.get("topics", []),
            confidence=recommendations.get("confidence", 0.0),
            total_videos_analyzed=recommendations.get("total_videos_analyzed", 0),
            graph_videos=recommendations.get("graph_videos", 0),
            vector_videos=recommendations.get("vector_videos", 0),
            personalization_level=recommendations.get("personalization_level", "low"),
            user_id=user_id
        )
        
    except Exception as e:
        return RecommendationResponse(
            success=False,
            recommendations=[],
            explanation=f"Error generating recommendations: {str(e)}",
            topics=[],
            confidence=0.0,
            total_videos_analyzed=0,
            graph_videos=0,
            vector_videos=0,
            personalization_level="low",
            error=str(e)
        )

@router.post("/recommend/topic", response_model=TopicRecommendationResponse)
@limiter.limit("30/minute")
async def get_topic_recommendations(
    request: TopicRecommendationRequest,
    current_user: dict = Depends(get_current_user)
):
    """Get recommendations based on a specific topic"""
    
    # Check subscription/trial status
    if current_user.get("auth_type") == "firebase":
        user_record = await get_user_record(current_user["uid"])
        if not user_record or user_record.get("subscription_status") not in ["active", "trial"]:
            raise HTTPException(status_code=403, detail="Subscription required")
    else:
        if not is_trial_valid(current_user):
            raise HTTPException(status_code=403, detail="Trial expired")
    
    try:
        # Get user ID
        user_id = current_user.get("uid") if current_user.get("auth_type") == "firebase" else None
        
        # Get topic recommendations
        topic_recs = await graphrag_service.get_topic_recommendations(
            topic=request.topic,
            user_id=user_id if request.include_user_videos else None
        )
        
        return TopicRecommendationResponse(
            topic=request.topic,
            videos=topic_recs.get("videos", [])[:request.limit],
            user_videos=topic_recs.get("user_videos", []),
            stats=topic_recs.get("stats"),
            total_videos=topic_recs.get("total_videos", 0),
            user_video_count=topic_recs.get("user_video_count", 0)
        )
        
    except Exception as e:
        return TopicRecommendationResponse(
            topic=request.topic,
            videos=[],
            user_videos=[],
            stats=None,
            total_videos=0,
            user_video_count=0,
            error=str(e)
        )

@router.post("/recommend/user", response_model=UserRecommendationResponse)
@limiter.limit("30/minute")
async def get_user_recommendations(
    request: UserRecommendationRequest,
    current_user: dict = Depends(get_current_user)
):
    """Get personalized recommendations for the current user"""
    
    # Check subscription/trial status
    if current_user.get("auth_type") == "firebase":
        user_record = await get_user_record(current_user["uid"])
        if not user_record or user_record.get("subscription_status") not in ["active", "trial"]:
            raise HTTPException(status_code=403, detail="Subscription required")
    else:
        if not is_trial_valid(current_user):
            raise HTTPException(status_code=403, detail="Trial expired")
    
    try:
        # Get user ID
        user_id = current_user.get("uid")
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID required for personalized recommendations")
        
        # Get user recommendations
        user_recs = await graphrag_service.get_user_recommendations(
            user_id=user_id,
            limit=request.limit
        )
        
        return UserRecommendationResponse(
            user_id=user_id,
            recommendations=user_recs.get("recommendations", []),
            explanation=user_recs.get("explanation", ""),
            topics=user_recs.get("topics", []),
            confidence=user_recs.get("confidence", 0.0),
            user_topics=user_recs.get("user_topics", {})
        )
        
    except Exception as e:
        return UserRecommendationResponse(
            user_id=current_user.get("uid", "unknown"),
            recommendations=[],
            explanation=f"Error generating user recommendations: {str(e)}",
            topics=[],
            confidence=0.0,
            user_topics={},
            error=str(e)
        )

@router.get("/recommend/topics")
@limiter.limit("30/minute")
async def get_available_topics():
    """Get list of available topics for recommendations"""
    try:
        stats = await graphrag_service.get_graph_context("", None)
        topics = [topic["topic"] for topic in stats.get("topics", [])]
        return {"topics": list(set(topics))}
    except Exception as e:
        return {"topics": [], "error": str(e)}

@router.get("/recommend/stats")
@limiter.limit("30/minute")
async def get_recommendation_stats():
    """Get recommendation system statistics"""
    try:
        stats = await graphrag_service.get_graph_context("", None)
        return {
            "total_videos": stats.get("stats", {}).get("total_videos", 0),
            "total_users": stats.get("stats", {}).get("total_users", 0),
            "top_topics": stats.get("stats", {}).get("top_topics", []),
            "top_categories": stats.get("stats", {}).get("top_categories", [])
        }
    except Exception as e:
        return {"error": str(e)} 