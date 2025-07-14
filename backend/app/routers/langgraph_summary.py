from fastapi import APIRouter, HTTPException, Depends, Request, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import asyncio
from app.core.config import settings
from app.core.auth import get_current_user, get_device_id, create_trial_token, is_trial_valid
from app.core.firebase import save_summary, get_user_record
from app.routers.summary import extract_video_id, get_youtube_transcript, get_video_metadata
from app.langgraph.workflow import run_workflow, get_workflow_status, list_workflow_threads, clear_workflow_thread
from app.langgraph.neo4j_service import neo4j_service
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

class LangGraphSummaryRequest(BaseModel):
    youtube_url: str
    tone: str = "professional"
    use_checkpointing: bool = False
    thread_id: Optional[str] = None

class LangGraphSummaryResponse(BaseModel):
    success: bool
    video_id: str
    summary: Optional[str] = None
    title: Optional[str] = None
    topic: Optional[str] = None
    category: Optional[str] = None
    confidence: Optional[float] = None
    key_points: List[str] = []
    tags: List[str] = []
    pinecone_id: Optional[str] = None
    neo4j_id: Optional[str] = None
    thread_id: Optional[str] = None
    error: Optional[str] = None
    error_step: Optional[str] = None
    processing_time: Optional[float] = None

class WorkflowStatusResponse(BaseModel):
    thread_id: str
    completed: bool
    error: Optional[str] = None
    error_step: Optional[str] = None
    video_id: Optional[str] = None
    summary: Optional[str] = None
    topic: Optional[str] = None
    category: Optional[str] = None
    pinecone_id: Optional[str] = None
    neo4j_id: Optional[str] = None

async def run_workflow_background(
    youtube_url: str,
    video_id: str,
    transcript: str,
    user_id: str,
    tone: str,
    thread_id: Optional[str] = None
):
    """Background task to run the LangGraph workflow"""
    try:
        await run_workflow(
            youtube_url=youtube_url,
            video_id=video_id,
            transcript=transcript,
            user_id=user_id,
            tone=tone
        )
    except Exception as e:
        print(f"Background workflow error: {e}")

@router.post("/langgraph-summary", response_model=LangGraphSummaryResponse)
@limiter.limit("5/minute")
async def create_langgraph_summary(
    request: LangGraphSummaryRequest,
    background_tasks: BackgroundTasks,
    req: Request,
    current_user: dict = Depends(get_current_user)
):
    """Create summary using LangGraph workflow with dual storage"""
    
    # Check subscription/trial status
    if current_user.get("auth_type") == "firebase":
        user_record = await get_user_record(current_user["uid"])
        if not user_record or user_record.get("subscription_status") not in ["active", "trial"]:
            raise HTTPException(status_code=403, detail="Subscription required")
    else:
        if not is_trial_valid(current_user):
            raise HTTPException(status_code=403, detail="Trial expired")
    
    try:
        # Extract video ID and get transcript
        video_id = extract_video_id(request.youtube_url)
        transcript = await get_youtube_transcript(video_id)
        metadata = await get_video_metadata(video_id)
        
        # Get user ID
        user_id = current_user.get("uid") if current_user.get("auth_type") == "firebase" else "trial_user"
        
        # Run workflow
        workflow_result = await run_workflow(
            youtube_url=request.youtube_url,
            video_id=video_id,
            transcript=transcript,
            user_id=user_id,
            tone=request.tone
        )
        
        # Check for errors
        if workflow_result.error:
            return LangGraphSummaryResponse(
                success=False,
                video_id=video_id,
                error=workflow_result.error,
                error_step=workflow_result.error_step
            )
        
        # Save to Firebase as well
        if current_user.get("auth_type") == "firebase":
            await save_summary(current_user["uid"], {
                "video_id": video_id,
                "video_title": metadata.get("title"),
                "summary": workflow_result.summary,
                "tone": workflow_result.tone,
                "cta": "Check out this summary!",
                "transcript_length": len(transcript),
                "vector_id": workflow_result.pinecone_id,
                "graph_id": workflow_result.neo4j_id,
                "key_points": workflow_result.key_points,
                "tags": workflow_result.tags,
                "topic": workflow_result.topic,
                "category": workflow_result.category,
                "confidence": workflow_result.confidence
            })
        
        return LangGraphSummaryResponse(
            success=True,
            video_id=video_id,
            summary=workflow_result.summary,
            title=workflow_result.title,
            topic=workflow_result.topic,
            category=workflow_result.category,
            confidence=workflow_result.confidence,
            key_points=workflow_result.key_points,
            tags=workflow_result.tags,
            pinecone_id=workflow_result.pinecone_id,
            neo4j_id=workflow_result.neo4j_id,
            thread_id=f"workflow_{video_id}",
            processing_time=workflow_result.processing_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Workflow error: {str(e)}")

@router.get("/workflow-status/{thread_id}", response_model=WorkflowStatusResponse)
async def get_workflow_status_endpoint(thread_id: str):
    """Get the status of a workflow thread"""
    status = get_workflow_status(thread_id)
    return WorkflowStatusResponse(**status)

@router.get("/workflow-threads")
async def list_workflow_threads_endpoint():
    """List all workflow threads"""
    threads = list_workflow_threads()
    return {"threads": threads}

@router.delete("/workflow-thread/{thread_id}")
async def clear_workflow_thread_endpoint(thread_id: str):
    """Clear a workflow thread from memory"""
    success = clear_workflow_thread(thread_id)
    return {"success": success, "thread_id": thread_id}

@router.get("/neo4j/user-summaries")
@limiter.limit("30/minute")
async def get_neo4j_user_summaries(
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Get user summaries from Neo4j"""
    
    if current_user.get("auth_type") != "firebase":
        raise HTTPException(status_code=401, detail="Authentication required")
    
    summaries = await neo4j_service.get_user_summaries(
        user_id=current_user["uid"],
        limit=limit
    )
    
    return {"summaries": summaries}

@router.get("/neo4j/topic-search/{topic}")
@limiter.limit("20/minute")
async def search_by_topic(topic: str, limit: int = 20):
    """Search summaries by topic in Neo4j"""
    summaries = await neo4j_service.search_by_topic(topic, limit)
    return {"summaries": summaries, "topic": topic}

@router.get("/neo4j/statistics")
async def get_neo4j_statistics():
    """Get Neo4j graph statistics"""
    stats = await neo4j_service.get_topic_statistics()
    return stats

@router.delete("/neo4j/summary/{video_id}")
async def delete_neo4j_summary(
    video_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a summary from Neo4j"""
    
    if current_user.get("auth_type") != "firebase":
        raise HTTPException(status_code=401, detail="Authentication required")
    
    success = await neo4j_service.delete_summary(video_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Summary not found")
    
    return {"message": "Summary deleted successfully", "video_id": video_id} 