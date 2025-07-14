import pinecone
from typing import Dict, List, Any, Optional
import json
import hashlib
from datetime import datetime
from app.core.config import settings

class PineconeService:
    """Pinecone service for vector storage and retrieval"""
    
    def __init__(self):
        pinecone.init(
            api_key=settings.PINECONE_API_KEY,
            environment=settings.PINECONE_ENVIRONMENT
        )
        self.index_name = settings.PINECONE_INDEX_NAME
        self._ensure_index_exists()
    
    def _ensure_index_exists(self):
        """Ensure Pinecone index exists"""
        if self.index_name not in pinecone.list_indexes():
            pinecone.create_index(
                name=self.index_name,
                dimension=1536,  # OpenAI embedding dimension
                metric="cosine"
            )
    
    def _generate_id(self, video_id: str, user_id: str) -> str:
        """Generate unique ID for summary"""
        return hashlib.md5(f"{video_id}_{user_id}".encode()).hexdigest()
    
    def _create_metadata(self, summary_data: Dict[str, Any], user_id: str, video_id: str) -> Dict[str, Any]:
        """Create metadata for vector storage"""
        return {
            "user_id": user_id,
            "video_id": video_id,
            "video_title": summary_data.get("title", ""),
            "tone": summary_data.get("tone", "professional"),
            "tags": summary_data.get("tags", []),
            "key_points": summary_data.get("key_points", []),
            "created_at": datetime.utcnow().isoformat(),
            "transcript_length": summary_data.get("transcript_length", 0),
            "summary_length": len(summary_data.get("summary", ""))
        }
    
    async def store_summary(self, 
                          summary_data: Dict[str, Any], 
                          user_id: str, 
                          video_id: str,
                          embedding: List[float]) -> str:
        """Store summary with embedding in Pinecone"""
        
        vector_id = self._generate_id(video_id, user_id)
        metadata = self._create_metadata(summary_data, user_id, video_id)
        
        # Store in Pinecone
        index = pinecone.Index(self.index_name)
        index.upsert(
            vectors=[{
                "id": vector_id,
                "values": embedding,
                "metadata": metadata
            }]
        )
        
        return vector_id
    
    async def search_similar_summaries(self, 
                                     query_embedding: List[float], 
                                     user_id: Optional[str] = None,
                                     top_k: int = 5) -> List[Dict[str, Any]]:
        """Search for similar summaries"""
        
        index = pinecone.Index(self.index_name)
        
        # Build filter
        filter_dict = {}
        if user_id:
            filter_dict["user_id"] = user_id
        
        # Query Pinecone
        results = index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True,
            filter=filter_dict if filter_dict else None
        )
        
        return [
            {
                "id": match.id,
                "score": match.score,
                "metadata": match.metadata
            }
            for match in results.matches
        ]
    
    async def get_user_summaries(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get all summaries for a user"""
        
        index = pinecone.Index(self.index_name)
        
        # Query with user filter
        results = index.query(
            vector=[0] * 1536,  # Dummy vector for metadata-only query
            top_k=limit,
            include_metadata=True,
            filter={"user_id": user_id}
        )
        
        return [
            {
                "id": match.id,
                "metadata": match.metadata
            }
            for match in results.matches
        ]
    
    async def delete_summary(self, vector_id: str) -> bool:
        """Delete a summary from Pinecone"""
        try:
            index = pinecone.Index(self.index_name)
            index.delete(ids=[vector_id])
            return True
        except Exception:
            return False
    
    async def update_summary(self, 
                           vector_id: str, 
                           summary_data: Dict[str, Any],
                           embedding: List[float]) -> bool:
        """Update existing summary"""
        try:
            index = pinecone.Index(self.index_name)
            
            # Get existing metadata
            existing = index.fetch(ids=[vector_id])
            if not existing.vectors:
                return False
            
            existing_metadata = existing.vectors[vector_id].metadata
            updated_metadata = {
                **existing_metadata,
                "tone": summary_data.get("tone", existing_metadata.get("tone")),
                "tags": summary_data.get("tags", existing_metadata.get("tags", [])),
                "key_points": summary_data.get("key_points", existing_metadata.get("key_points", [])),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            index.upsert(
                vectors=[{
                    "id": vector_id,
                    "values": embedding,
                    "metadata": updated_metadata
                }]
            )
            
            return True
        except Exception:
            return False
    
    async def get_summary_stats(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Get summary statistics"""
        index = pinecone.Index(self.index_name)
        
        filter_dict = {}
        if user_id:
            filter_dict["user_id"] = user_id
        
        # Get index stats
        stats = index.describe_index_stats(filter=filter_dict if filter_dict else None)
        
        return {
            "total_summaries": stats.total_vector_count,
            "dimension": stats.dimension,
            "metric": stats.metric
        }

# Global instance
pinecone_service = PineconeService() 