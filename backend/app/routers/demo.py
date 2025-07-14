from fastapi import APIRouter, HTTPException, Depends, Request, UploadFile, File, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import json
import io
from app.core.config import settings
from app.core.demo_service import demo_service
from app.core.voice_service import voice_service
from app.langgraph.workflow import run_langgraph_workflow
from slowapi import Limiter
from slowapi.util import get_remote_address
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

class DemoSummaryRequest(BaseModel):
    youtube_url: str
    tone: str = "professional"
    max_length: int = 500

class DemoTranscriptionRequest(BaseModel):
    language: Optional[str] = None
    auto_summarize: bool = True

class DemoSummaryResponse(BaseModel):
    summary: str
    title: str
    tone: str
    video_script: Optional[str] = None
    cta: str
    quota_info: Dict[str, Any]
    session_id: str

class DemoTranscriptionResponse(BaseModel):
    transcription: str
    language: str
    language_probability: float
    duration: float
    segments: list
    summary: Optional[str] = None
    quota_info: Dict[str, Any]
    session_id: str
    error: Optional[str] = None

class DemoStatsResponse(BaseModel):
    guest_id: str
    session_id: str
    created_at: str
    ip_address: str
    usage: Dict[str, Any]
    total_used: int
    total_limit: int
    has_any_quota: bool

class DemoLimitsResponse(BaseModel):
    summary: Dict[str, Any]
    transcription: Dict[str, Any]
    audio_max_duration: int
    session_duration_hours: int

def get_client_ip(request: Request) -> str:
    """Extract client IP address"""
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host

def get_session_id(request: Request) -> Optional[str]:
    """Extract session ID from cookies"""
    return request.cookies.get("demo_session_id")

def set_session_cookie(response: Response, session_id: str):
    """Set demo session cookie"""
    response.set_cookie(
        key="demo_session_id",
        value=session_id,
        max_age=settings.DEMO_SESSION_DURATION,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax"
    )

@router.get("/session", response_model=DemoStatsResponse)
@limiter.limit("30/minute")
async def get_demo_session(request: Request):
    """Get or create demo session for guest user"""
    try:
        ip_address = get_client_ip(request)
        session_id = get_session_id(request)
        
        # Get or create guest session
        session_data = await demo_service.get_guest_session(ip_address, session_id)
        
        # Get comprehensive stats
        stats = await demo_service.get_demo_stats(session_data["guest_id"])
        
        response = JSONResponse(content=stats)
        
        # Set session cookie if new session
        if not session_id:
            set_session_cookie(response, session_data["session_id"])
        
        return response
        
    except Exception as e:
        logger.error(f"Error getting demo session: {e}")
        raise HTTPException(status_code=500, detail="Failed to get demo session")

@router.get("/limits", response_model=DemoLimitsResponse)
@limiter.limit("30/minute")
async def get_demo_limits():
    """Get demo service limits and restrictions"""
    try:
        limits = await demo_service.get_demo_limits()
        return DemoLimitsResponse(**limits)
    except Exception as e:
        logger.error(f"Error getting demo limits: {e}")
        raise HTTPException(status_code=500, detail="Failed to get demo limits")

@router.post("/summary", response_model=DemoSummaryResponse)
@limiter.limit("10/minute")
async def create_demo_summary(
    request: DemoSummaryRequest,
    req: Request
):
    """Create demo summary from YouTube URL (guest access)"""
    try:
        ip_address = get_client_ip(req)
        session_id = get_session_id(req)
        
        # Get guest session
        session_data = await demo_service.get_guest_session(ip_address, session_id)
        guest_id = session_data["guest_id"]
        
        # Check quota
        has_quota, quota_info = await demo_service.check_demo_quota(guest_id, "summary")
        if not has_quota:
            raise HTTPException(
                status_code=429, 
                detail=f"Demo quota exceeded. You've used {quota_info['used']}/{quota_info['limit']} summaries. Sign up for unlimited access!"
            )
        
        # Extract video ID and get transcript
        from app.routers.summary import extract_video_id, get_youtube_transcript, get_video_metadata, generate_summary_with_gpt
        
        try:
            video_id = extract_video_id(request.youtube_url)
            transcript = await get_youtube_transcript(video_id)
            metadata = await get_video_metadata(video_id)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        # Generate summary
        summary_data = await generate_summary_with_gpt(
            transcript, 
            metadata, 
            request.tone, 
            request.max_length
        )
        
        # Increment usage
        usage_result = await demo_service.increment_demo_usage(guest_id, "summary")
        
        response_data = DemoSummaryResponse(
            summary=summary_data["summary"],
            title=summary_data["title"],
            tone=summary_data["tone"],
            video_script=transcript[:1000] + "..." if len(transcript) > 1000 else transcript,
            cta=summary_data["cta"],
            quota_info=usage_result["quota_info"],
            session_id=session_data["session_id"]
        )
        
        response = JSONResponse(content=response_data.dict())
        
        # Set session cookie if new session
        if not session_id:
            set_session_cookie(response, session_data["session_id"])
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating demo summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to create demo summary")

@router.post("/transcribe", response_model=DemoTranscriptionResponse)
@limiter.limit("10/minute")
async def transcribe_demo_audio(
    file: UploadFile = File(...),
    language: Optional[str] = None,
    auto_summarize: bool = True,
    req: Request = None
):
    """Transcribe demo audio file (guest access)"""
    try:
        ip_address = get_client_ip(req)
        session_id = get_session_id(req)
        
        # Get guest session
        session_data = await demo_service.get_guest_session(ip_address, session_id)
        guest_id = session_data["guest_id"]
        
        # Check quota
        has_quota, quota_info = await demo_service.check_demo_quota(guest_id, "transcription")
        if not has_quota:
            raise HTTPException(
                status_code=429, 
                detail=f"Demo quota exceeded. You've used {quota_info['used']}/{quota_info['limit']} transcriptions. Sign up for unlimited access!"
            )
        
        # Validate file type
        if not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File must be an audio file")
        
        # Read audio content
        audio_content = await file.read()
        audio_io = io.BytesIO(audio_content)
        
        # Transcribe audio
        transcription_result = await voice_service.transcribe_audio(
            audio_io, 
            language=language,
            user_id=guest_id
        )
        
        # Validate duration for demo
        if not demo_service.validate_demo_audio_duration(transcription_result["duration"]):
            raise HTTPException(
                status_code=400, 
                detail=f"Audio too long for demo. Maximum duration is {settings.DEMO_AUDIO_MAX_DURATION} seconds."
            )
        
        # Auto-summarize if requested
        summary = None
        if auto_summarize and transcription_result["transcription"].strip():
            try:
                # Run LangGraph workflow for summarization
                workflow_result = await run_langgraph_workflow(
                    query=transcription_result["transcription"],
                    user_id=guest_id
                )
                summary = workflow_result.get("summary", "")
            except Exception as e:
                logger.error(f"Auto-summarization error: {e}")
                # Continue without summary
        
        # Increment usage
        usage_result = await demo_service.increment_demo_usage(guest_id, "transcription")
        
        response_data = DemoTranscriptionResponse(
            transcription=transcription_result["transcription"],
            language=transcription_result["language"],
            language_probability=transcription_result["language_probability"],
            duration=transcription_result["duration"],
            segments=transcription_result["segments"],
            summary=summary,
            quota_info=usage_result["quota_info"],
            session_id=session_data["session_id"]
        )
        
        response = JSONResponse(content=response_data.dict())
        
        # Set session cookie if new session
        if not session_id:
            set_session_cookie(response, session_data["session_id"])
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error transcribing demo audio: {e}")
        return DemoTranscriptionResponse(
            transcription="",
            language="",
            language_probability=0.0,
            duration=0.0,
            segments=[],
            quota_info={},
            session_id="",
            error=str(e)
        )

@router.get("/stats")
@limiter.limit("30/minute")
async def get_demo_stats(request: Request):
    """Get demo usage statistics for current session"""
    try:
        ip_address = get_client_ip(request)
        session_id = get_session_id(request)
        
        # Get guest session
        session_data = await demo_service.get_guest_session(ip_address, session_id)
        guest_id = session_data["guest_id"]
        
        # Get comprehensive stats
        stats = await demo_service.get_demo_stats(guest_id)
        
        response = JSONResponse(content=stats)
        
        # Set session cookie if new session
        if not session_id:
            set_session_cookie(response, session_data["session_id"])
        
        return response
        
    except Exception as e:
        logger.error(f"Error getting demo stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get demo stats")

@router.delete("/session")
@limiter.limit("10/minute")
async def clear_demo_session(request: Request):
    """Clear demo session and reset usage"""
    try:
        ip_address = get_client_ip(request)
        session_id = get_session_id(request)
        
        if not session_id:
            raise HTTPException(status_code=400, detail="No session to clear")
        
        # Get guest session
        session_data = await demo_service.get_guest_session(ip_address, session_id)
        guest_id = session_data["guest_id"]
        
        # Clear session
        success = await demo_service.clear_demo_session(guest_id)
        
        if success:
            response = JSONResponse(content={"message": "Demo session cleared successfully"})
            response.delete_cookie("demo_session_id")
            return response
        else:
            raise HTTPException(status_code=500, detail="Failed to clear demo session")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error clearing demo session: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear demo session") 