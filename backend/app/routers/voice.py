from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import json
import base64
import io
from app.core.config import settings
from app.core.auth import get_current_user, get_device_id, create_trial_token, is_trial_valid
from app.core.firebase import get_user_record
from app.core.voice_service import voice_service
from app.langgraph.workflow import run_langgraph_workflow
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

class TranscriptionRequest(BaseModel):
    language: Optional[str] = None
    auto_summarize: bool = True

class SynthesisRequest(BaseModel):
    text: str
    voice_id: str = "default"
    speed: float = 1.0

class VoiceCloneRequest(BaseModel):
    voice_name: str
    description: Optional[str] = None

class TranscriptionResponse(BaseModel):
    transcription: str
    language: str
    language_probability: float
    duration: float
    segments: list
    summary: Optional[str] = None
    error: Optional[str] = None

class SynthesisResponse(BaseModel):
    audio_base64: str
    duration: float
    voice_id: str
    text_length: int
    error: Optional[str] = None

class VoiceCloneResponse(BaseModel):
    voice_id: str
    voice_name: str
    status: str
    message: str
    error: Optional[str] = None

@router.post("/transcribe", response_model=TranscriptionResponse)
@limiter.limit("10/minute")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: Optional[str] = None,
    auto_summarize: bool = True,
    current_user: dict = Depends(get_current_user)
):
    """Transcribe uploaded audio file"""
    
    # Check subscription/trial status
    if current_user.get("auth_type") == "firebase":
        user_record = await get_user_record(current_user["uid"])
        if not user_record or user_record.get("subscription_status") not in ["active", "trial"]:
            raise HTTPException(status_code=403, detail="Subscription required for voice transcription")
    else:
        if not is_trial_valid(current_user):
            raise HTTPException(status_code=403, detail="Trial expired")
    
    # Validate file type
    if not file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    try:
        # Get user ID
        user_id = current_user.get("uid") if current_user.get("auth_type") == "firebase" else None
        
        # Check usage limits
        usage_limits = await voice_service.check_usage_limits(user_id or "anonymous", "transcription")
        
        # Transcribe audio
        audio_content = await file.read()
        audio_io = io.BytesIO(audio_content)
        
        transcription_result = await voice_service.transcribe_audio(
            audio_io, 
            language=language,
            user_id=user_id
        )
        
        # Auto-summarize if requested
        summary = None
        if auto_summarize and transcription_result["transcription"].strip():
            try:
                # Run LangGraph workflow for summarization
                workflow_result = await run_langgraph_workflow(
                    query=transcription_result["transcription"],
                    user_id=user_id
                )
                summary = workflow_result.get("summary", "")
            except Exception as e:
                logger.error(f"Auto-summarization error: {e}")
                # Continue without summary
        
        return TranscriptionResponse(
            transcription=transcription_result["transcription"],
            language=transcription_result["language"],
            language_probability=transcription_result["language_probability"],
            duration=transcription_result["duration"],
            segments=transcription_result["segments"],
            summary=summary
        )
        
    except Exception as e:
        return TranscriptionResponse(
            transcription="",
            language="",
            language_probability=0.0,
            duration=0.0,
            segments=[],
            error=str(e)
        )

@router.post("/synthesize", response_model=SynthesisResponse)
@limiter.limit("20/minute")
async def synthesize_speech(
    request: SynthesisRequest,
    current_user: dict = Depends(get_current_user)
):
    """Synthesize speech from text"""
    
    # Check subscription/trial status
    if current_user.get("auth_type") == "firebase":
        user_record = await get_user_record(current_user["uid"])
        if not user_record or user_record.get("subscription_status") not in ["active", "trial"]:
            raise HTTPException(status_code=403, detail="Subscription required for speech synthesis")
    else:
        if not is_trial_valid(current_user):
            raise HTTPException(status_code=403, detail="Trial expired")
    
    try:
        # Get user ID
        user_id = current_user.get("uid") if current_user.get("auth_type") == "firebase" else None
        
        # Check usage limits
        usage_limits = await voice_service.check_usage_limits(user_id or "anonymous", "synthesis")
        
        # Synthesize speech
        synthesis_result = await voice_service.synthesize_speech(
            text=request.text,
            voice_id=request.voice_id,
            speed=request.speed,
            user_id=user_id
        )
        
        return SynthesisResponse(
            audio_base64=synthesis_result["audio_base64"],
            duration=synthesis_result["duration"],
            voice_id=synthesis_result["voice_id"],
            text_length=synthesis_result["text_length"]
        )
        
    except Exception as e:
        return SynthesisResponse(
            audio_base64="",
            duration=0.0,
            voice_id=request.voice_id,
            text_length=0,
            error=str(e)
        )

@router.post("/clone-voice", response_model=VoiceCloneResponse)
@limiter.limit("5/minute")
async def clone_voice(
    file: UploadFile = File(...),
    voice_name: str = "My Voice",
    description: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Clone user's voice for synthesis"""
    
    # Check subscription/trial status
    if current_user.get("auth_type") == "firebase":
        user_record = await get_user_record(current_user["uid"])
        if not user_record or user_record.get("subscription_status") not in ["active", "trial"]:
            raise HTTPException(status_code=403, detail="Subscription required for voice cloning")
    else:
        if not is_trial_valid(current_user):
            raise HTTPException(status_code=403, detail="Trial expired")
    
    # Validate file type
    if not file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    try:
        # Get user ID
        user_id = current_user.get("uid")
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID required for voice cloning")
        
        # Clone voice
        audio_content = await file.read()
        audio_io = io.BytesIO(audio_content)
        
        clone_result = await voice_service.clone_voice(
            audio_file=audio_io,
            voice_name=voice_name,
            user_id=user_id
        )
        
        return VoiceCloneResponse(
            voice_id=clone_result["voice_id"],
            voice_name=clone_result["voice_name"],
            status=clone_result["status"],
            message=clone_result["message"]
        )
        
    except Exception as e:
        return VoiceCloneResponse(
            voice_id="",
            voice_name=voice_name,
            status="failed",
            message="Voice cloning failed",
            error=str(e)
        )

@router.get("/voices")
@limiter.limit("30/minute")
async def get_available_voices():
    """Get available voice options"""
    try:
        voices = await voice_service.get_available_voices()
        return voices
    except Exception as e:
        return {"voices": [], "supported_languages": [], "error": str(e)}

@router.get("/usage-limits")
@limiter.limit("30/minute")
async def get_usage_limits(
    service: str,
    current_user: dict = Depends(get_current_user)
):
    """Get usage limits for current user"""
    try:
        user_id = current_user.get("uid") if current_user.get("auth_type") == "firebase" else None
        limits = await voice_service.check_usage_limits(user_id or "anonymous", service)
        return limits
    except Exception as e:
        return {"error": str(e)}

# WebSocket for real-time transcription
@router.websocket("/transcribe-realtime")
async def transcribe_realtime(websocket: WebSocket):
    """Real-time transcription via WebSocket"""
    await websocket.accept()
    
    try:
        while True:
            # Receive audio chunk
            audio_data = await websocket.receive_bytes()
            
            # Transcribe chunk
            result = await voice_service.transcribe_realtime(audio_data)
            
            # Send result back
            await websocket.send_text(json.dumps(result))
            
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.send_text(json.dumps({"error": str(e)}))

@router.post("/transcribe-and-summarize")
@limiter.limit("5/minute")
async def transcribe_and_summarize(
    file: UploadFile = File(...),
    language: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Transcribe audio and automatically summarize"""
    
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
        
        # Transcribe audio
        audio_content = await file.read()
        audio_io = io.BytesIO(audio_content)
        
        transcription_result = await voice_service.transcribe_audio(
            audio_io, 
            language=language,
            user_id=user_id
        )
        
        # Run LangGraph workflow for summarization
        workflow_result = await run_langgraph_workflow(
            query=transcription_result["transcription"],
            user_id=user_id
        )
        
        return {
            "transcription": transcription_result,
            "summary": workflow_result,
            "success": True
        }
        
    except Exception as e:
        return {
            "transcription": None,
            "summary": None,
            "success": False,
            "error": str(e)
        } 