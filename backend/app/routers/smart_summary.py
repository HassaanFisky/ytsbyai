from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import openai
import re
from app.core.config import settings
from app.core.auth import get_current_user, get_device_id, create_trial_token, is_trial_valid
from app.core.firebase import save_summary, get_user_record
from app.core.langchain_service import langchain_service
from app.core.pinecone_service import pinecone_service
from app.routers.summary import extract_video_id, get_youtube_transcript, get_video_metadata
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# Initialize OpenAI for embeddings
openai.api_key = settings.OPENAI_API_KEY

class SmartSummaryRequest(BaseModel):
    youtube_url: Optional[str] = None
    voice_file: Optional[str] = None
    tone: str = "professional"
    max_length: int = 500
    use_agent: bool = False
    include_similar: bool = False

class SmartSummaryResponse(BaseModel):
    summary: str
    title: str
    tone: str
    video_script: Optional[str] = None
    cta: str
    usage_count: int
    key_points: List[str] = []
    tags: List[str] = []
    similar_summaries: List[Dict[str, Any]] = []
    vector_id: Optional[str] = None

class SearchRequest(BaseModel):
    query: str
    user_id: Optional[str] = None
    top_k: int = 5

class SearchResponse(BaseModel):
    results: List[Dict[str, Any]]
    total_found: int

async def get_embedding(text: str) -> List[float]:
    """Get embedding for text using OpenAI"""
    try:
        response = openai.Embedding.create(
            model="text-embedding-ada-002",
            input=text
        )
        return response['data'][0]['embedding']
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding error: {str(e)}")

@router.post("/smart-summary", response_model=SmartSummaryResponse)
@limiter.limit("10/minute")
async def create_smart_summary(
    request: SmartSummaryRequest,
    req: Request,
    current_user: dict = Depends(get_current_user)
):
    """Create smart summary using LangChain and store in Pinecone"""
    
    # Check subscription/trial status
    if current_user.get("auth_type") == "firebase":
        user_record = await get_user_record(current_user["uid"])
        if not user_record or user_record.get("subscription_status") not in ["active", "trial"]:
            raise HTTPException(status_code=403, detail="Subscription required")
    else:
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
    
    elif request.voice_file:
        raise HTTPException(status_code=501, detail="Voice input not implemented yet")
    
    else:
        raise HTTPException(status_code=400, detail="Either youtube_url or voice_file must be provided")
    
    # Truncate transcript to fit token limit
    transcript = langchain_service.truncate_transcript(transcript)
    
    # Generate summary using LangChain
    if request.use_agent:
        # Use agent for advanced processing
        agent = langchain_service.create_smart_summary_agent()
        agent_input = f"""
        Create a comprehensive summary of this YouTube video:
        Title: {metadata.get('title', 'Unknown')}
        Author: {metadata.get('author', 'Unknown')}
        Length: {metadata.get('length', 0)} seconds
        Tone: {request.tone}
        Max Length: {request.max_length} characters
        
        Transcript: {transcript}
        """
        
        result = await agent.ainvoke({"input": agent_input})
        summary_data = langchain_service.output_parser.parse(result["output"])
    else:
        # Use simple chain
        chain = langchain_service.create_summary_chain(request.tone)
        result = await chain.ainvoke({
            "title": metadata.get('title', 'Unknown'),
            "author": metadata.get('author', 'Unknown'),
            "length": metadata.get('length', 0),
            "tone": request.tone,
            "max_length": request.max_length,
            "transcript": transcript
        })
        summary_data = result
    
    # Get embedding for summary
    summary_embedding = await get_embedding(summary_data["summary"])
    
    # Store in Pinecone if user is authenticated
    vector_id = None
    if current_user.get("auth_type") == "firebase":
        vector_id = await pinecone_service.store_summary(
            summary_data=summary_data,
            user_id=current_user["uid"],
            video_id=video_id if request.youtube_url else "voice",
            embedding=summary_embedding
        )
        
        # Save to Firebase as well
        await save_summary(current_user["uid"], {
            "video_id": video_id if request.youtube_url else None,
            "video_title": metadata.get("title"),
            "summary": summary_data["summary"],
            "tone": summary_data["tone"],
            "cta": summary_data["cta"],
            "transcript_length": len(transcript),
            "vector_id": vector_id,
            "key_points": summary_data.get("key_points", []),
            "tags": summary_data.get("tags", [])
        })
        
        # Get updated usage count
        user_record = await get_user_record(current_user["uid"])
        usage_count = user_record.get("usage_count", 0) if user_record else 0
    else:
        usage_count = 0
    
    # Find similar summaries if requested
    similar_summaries = []
    if request.include_similar and current_user.get("auth_type") == "firebase":
        similar_summaries = await pinecone_service.search_similar_summaries(
            query_embedding=summary_embedding,
            user_id=current_user["uid"],
            top_k=3
        )
    
    return SmartSummaryResponse(
        summary=summary_data["summary"],
        title=summary_data["title"],
        tone=summary_data["tone"],
        video_script=transcript[:1000] + "..." if len(transcript) > 1000 else transcript,
        cta=summary_data["cta"],
        usage_count=usage_count,
        key_points=summary_data.get("key_points", []),
        tags=summary_data.get("tags", []),
        similar_summaries=similar_summaries,
        vector_id=vector_id
    )

@router.post("/search-summaries", response_model=SearchResponse)
@limiter.limit("20/minute")
async def search_summaries(
    request: SearchRequest,
    current_user: dict = Depends(get_current_user)
):
    """Search summaries using semantic similarity"""
    
    # Get embedding for search query
    query_embedding = await get_embedding(request.query)
    
    # Search in Pinecone
    results = await pinecone_service.search_similar_summaries(
        query_embedding=query_embedding,
        user_id=request.user_id or (current_user.get("uid") if current_user.get("auth_type") == "firebase" else None),
        top_k=request.top_k
    )
    
    return SearchResponse(
        results=results,
        total_found=len(results)
    )

@router.get("/user-summaries")
@limiter.limit("30/minute")
async def get_user_summaries(
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Get all summaries for the current user"""
    
    if current_user.get("auth_type") != "firebase":
        raise HTTPException(status_code=401, detail="Authentication required")
    
    summaries = await pinecone_service.get_user_summaries(
        user_id=current_user["uid"],
        limit=limit
    )
    
    return {"summaries": summaries}

@router.delete("/summary/{vector_id}")
async def delete_summary(
    vector_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a summary from Pinecone"""
    
    if current_user.get("auth_type") != "firebase":
        raise HTTPException(status_code=401, detail="Authentication required")
    
    success = await pinecone_service.delete_summary(vector_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Summary not found")
    
    return {"message": "Summary deleted successfully"}

@router.get("/summary-stats")
async def get_summary_stats(
    current_user: dict = Depends(get_current_user)
):
    """Get summary statistics"""
    
    user_id = None
    if current_user.get("auth_type") == "firebase":
        user_id = current_user["uid"]
    
    stats = await pinecone_service.get_summary_stats(user_id=user_id)
    
    return stats 