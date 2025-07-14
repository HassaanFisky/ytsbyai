from typing import Dict, List, Any, Optional
from pydantic import BaseModel
from datetime import datetime

class WorkflowState(BaseModel):
    """State object for LangGraph workflow"""
    # Input data
    youtube_url: Optional[str] = None
    video_id: Optional[str] = None
    transcript: Optional[str] = None
    user_id: Optional[str] = None
    
    # Processing results
    summary: Optional[str] = None
    title: Optional[str] = None
    tone: Optional[str] = None
    key_points: List[str] = []
    tags: List[str] = []
    
    # Classification results
    topic: Optional[str] = None
    category: Optional[str] = None
    confidence: Optional[float] = None
    subcategories: List[str] = []
    
    # Storage results
    pinecone_id: Optional[str] = None
    neo4j_id: Optional[str] = None
    
    # Metadata
    created_at: Optional[datetime] = None
    processing_time: Optional[float] = None
    token_count: Optional[int] = None
    
    # Error handling
    error: Optional[str] = None
    error_step: Optional[str] = None

class ClassificationResult(BaseModel):
    """Result from topic classification"""
    topic: str
    category: str
    confidence: float
    subcategories: List[str]
    tags: List[str]

class SummaryResult(BaseModel):
    """Result from summarization"""
    summary: str
    title: str
    tone: str
    key_points: List[str]
    tags: List[str]

class StorageResult(BaseModel):
    """Result from storage operations"""
    pinecone_id: Optional[str] = None
    neo4j_id: Optional[str] = None
    success: bool
    error: Optional[str] = None 