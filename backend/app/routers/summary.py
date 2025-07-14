from fastapi import APIRouter, HTTPException, Depends, Request, UploadFile, File
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import openai
import whisper
import re
import httpx
from youtube_transcript_api import YouTubeTranscriptApi
from pytube import YouTube
import tempfile
import os
from app.core.config import settings
from app.core.auth import get_current_user, get_device_id, create_trial_token, is_trial_valid
from app.core.firebase import save_summary, get_user_record
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# Initialize OpenAI
openai.api_key = settings.OPENAI_API_KEY

# Initialize Whisper model
whisper_model = None

def get_whisper_model():
    global whisper_model
    if whisper_model is None:
        whisper_model = whisper.load_model("base")
    return whisper_model

class SummaryRequest(BaseModel):
    youtube_url: Optional[str] = None
    voice_file: Optional[str] = None
    tone: str = "professional"
    max_length: int = 500

class SummaryResponse(BaseModel):
    summary: str
    title: str
    tone: str
    video_script: Optional[str] = None
    cta: str
    usage_count: int

def extract_video_id(url: str) -> str:
    """Extract YouTube video ID from URL"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
        r'youtube\.com\/watch\?.*v=([^&\n?#]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    raise HTTPException(status_code=400, detail="Invalid YouTube URL")

async def get_youtube_transcript(video_id: str) -> str:
    """Get transcript from YouTube or fallback to Whisper"""
    try:
        # Try YouTube transcript API first
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        transcript = " ".join([item["text"] for item in transcript_list])
        return transcript
    except Exception:
        # Fallback to Whisper
        try:
            yt = YouTube(f"https://www.youtube.com/watch?v={video_id}")
            audio_stream = yt.streams.filter(only_audio=True).first()
            
            with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as temp_file:
                audio_stream.download(filename=temp_file.name)
                model = get_whisper_model()
                result = model.transcribe(temp_file.name)
                os.unlink(temp_file.name)
                return result["text"]
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not extract transcript: {str(e)}")

async def get_video_metadata(video_id: str) -> dict:
    """Get YouTube video metadata"""
    try:
        yt = YouTube(f"https://www.youtube.com/watch?v={video_id}")
        return {
            "title": yt.title,
            "author": yt.author,
            "length": yt.length,
            "views": yt.views,
            "description": yt.description[:500] if yt.description else ""
        }
    except Exception:
        return {"title": "Unknown Video", "author": "Unknown", "length": 0, "views": 0, "description": ""}

async def generate_summary_with_gpt(transcript: str, metadata: dict, tone: str, max_length: int) -> dict:
    """Generate summary using GPT-4"""
    prompt = f"""
    You are an AI assistant that creates engaging, informative summaries of YouTube videos.
    
    Video Title: {metadata.get('title', 'Unknown')}
    Video Author: {metadata.get('author', 'Unknown')}
    Video Length: {metadata.get('length', 0)} seconds
    Tone: {tone}
    Max Summary Length: {max_length} characters
    
    Transcript:
    {transcript[:4000]}  # Limit transcript length
    
    Please provide:
    1. A concise, engaging summary in the specified tone
    2. A catchy title for the summary
    3. A compelling call-to-action
    4. The tone used
    
    Format your response as JSON:
    {{
        "summary": "Your summary here",
        "title": "Catchy title",
        "tone": "{tone}",
        "cta": "Your call-to-action here"
    }}
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,
            temperature=0.7
        )
        
        content = response.choices[0].message.content
        # Extract JSON from response
        import json
        try:
            result = json.loads(content)
        except:
            # Fallback if JSON parsing fails
            result = {
                "summary": content,
                "title": metadata.get('title', 'Video Summary'),
                "tone": tone,
                "cta": "Share this summary with friends!"
            }
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")

@router.post("/summary", response_model=SummaryResponse)
@limiter.limit("10/minute")
async def create_summary(
    request: SummaryRequest,
    req: Request,
    current_user: dict = Depends(get_current_user)
):
    """Create summary from YouTube URL or voice input"""
    
    # Check subscription/trial status
    if current_user.get("auth_type") == "firebase":
        user_record = await get_user_record(current_user["uid"])
        if not user_record or user_record.get("subscription_status") not in ["active", "trial"]:
            raise HTTPException(status_code=403, detail="Subscription required")
    else:
        # Trial token validation
        if not is_trial_valid(current_user):
            raise HTTPException(status_code=403, detail="Trial expired")
    
    # Process YouTube URL
    if request.youtube_url:
        try:
            video_id = extract_video_id(request.youtube_url)
            transcript = await get_youtube_transcript(video_id)
            metadata = await get_video_metadata(video_id)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    # Process voice file (placeholder for now)
    elif request.voice_file:
        raise HTTPException(status_code=501, detail="Voice input not implemented yet")
    
    else:
        raise HTTPException(status_code=400, detail="Either youtube_url or voice_file must be provided")
    
    # Generate summary
    summary_data = await generate_summary_with_gpt(transcript, metadata, request.tone, request.max_length)
    
    # Save to database if user is authenticated
    if current_user.get("auth_type") == "firebase":
        await save_summary(current_user["uid"], {
            "video_id": video_id if request.youtube_url else None,
            "video_title": metadata.get("title"),
            "summary": summary_data["summary"],
            "tone": summary_data["tone"],
            "cta": summary_data["cta"],
            "transcript_length": len(transcript)
        })
        
        # Get updated usage count
        user_record = await get_user_record(current_user["uid"])
        usage_count = user_record.get("usage_count", 0) if user_record else 0
    else:
        usage_count = 0
    
    return SummaryResponse(
        summary=summary_data["summary"],
        title=summary_data["title"],
        tone=summary_data["tone"],
        video_script=transcript[:1000] + "..." if len(transcript) > 1000 else transcript,
        cta=summary_data["cta"],
        usage_count=usage_count
    )

@router.get("/trial-token")
async def get_trial_token(req: Request):
    """Get trial token for device-based trial"""
    device_id = get_device_id(req, req.headers.get("user-agent"), req.client.host)
    token = create_trial_token(device_id, req.headers.get("user-agent"), req.client.host)
    
    return {"trial_token": token, "device_id": device_id} 