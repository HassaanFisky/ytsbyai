import logging
from typing import Dict, List, Any, Optional, Tuple
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.schema import BaseOutputParser
import json
import asyncio
from app.core.config import settings
from app.core.pinecone_service import pinecone_service
from app.langgraph.neo4j_service import neo4j_service
from app.routers.smart_summary import get_embedding

logger = logging.getLogger(__name__)

# Initialize OpenAI
llm = ChatOpenAI(
    model="gpt-4",
    temperature=0.7,
    openai_api_key=settings.OPENAI_API_KEY
)

class GraphRAGOutputParser(BaseOutputParser):
    """Parse structured GraphRAG output"""
    
    def parse(self, text: str) -> Dict[str, Any]:
        try:
            if "```json" in text:
                json_start = text.find("```json") + 7
                json_end = text.find("```", json_start)
                json_str = text[json_start:json_end].strip()
                return json.loads(json_str)
            elif "{" in text and "}" in text:
                start = text.find("{")
                end = text.rfind("}") + 1
                json_str = text[start:end]
                return json.loads(json_str)
            else:
                return {
                    "recommendations": [],
                    "explanation": text,
                    "topics": [],
                    "confidence": 0.5
                }
        except Exception as e:
            logger.error(f"GraphRAG parsing error: {e}")
            return {
                "recommendations": [],
                "explanation": text,
                "topics": [],
                "confidence": 0.5
            }

class GraphRAGService:
    """GraphRAG service combining Neo4j graph queries with Pinecone vector similarity"""
    
    def __init__(self):
        self.output_parser = GraphRAGOutputParser()
    
    async def get_graph_context(self, query: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Get relevant context from Neo4j graph"""
        try:
            # Get embedding for query
            query_embedding = await get_embedding(query)
            
            # Search for similar topics in Neo4j
            topics = await neo4j_service.search_by_topic(query, limit=10)
            
            # Get user's video history if available
            user_videos = []
            if user_id:
                user_videos = await neo4j_service.get_user_summaries(user_id, limit=20)
            
            # Get topic statistics
            stats = await neo4j_service.get_topic_statistics()
            
            return {
                "topics": topics,
                "user_videos": user_videos,
                "stats": stats,
                "query_embedding": query_embedding
            }
        except Exception as e:
            logger.error(f"Graph context error: {e}")
            return {"topics": [], "user_videos": [], "stats": {}, "query_embedding": None}
    
    async def get_vector_similarity(self, query_embedding: List[float], user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get similar summaries from Pinecone"""
        try:
            # Search for similar summaries
            similar_summaries = await pinecone_service.search_similar_summaries(
                query_embedding=query_embedding,
                user_id=user_id,
                top_k=10
            )
            
            return similar_summaries
        except Exception as e:
            logger.error(f"Vector similarity error: {e}")
            return []
    
    async def merge_graph_and_vector_results(
        self, 
        graph_context: Dict[str, Any], 
        vector_results: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Merge graph and vector results intelligently"""
        
        # Combine and deduplicate results
        all_videos = {}
        
        # Add graph results
        for topic in graph_context.get("topics", []):
            video_id = topic.get("video_id")
            if video_id:
                all_videos[video_id] = {
                    "video_id": video_id,
                    "title": topic.get("title", ""),
                    "summary": topic.get("summary", ""),
                    "topic": topic.get("topic", ""),
                    "category": topic.get("category", ""),
                    "confidence": topic.get("confidence", 0.5),
                    "source": "graph",
                    "score": topic.get("confidence", 0.5)
                }
        
        # Add vector results
        for result in vector_results:
            video_id = result.get("id")
            if video_id and video_id not in all_videos:
                metadata = result.get("metadata", {})
                all_videos[video_id] = {
                    "video_id": video_id,
                    "title": metadata.get("video_title", ""),
                    "summary": metadata.get("summary", ""),
                    "topic": metadata.get("topic", ""),
                    "category": metadata.get("category", ""),
                    "confidence": result.get("score", 0.5),
                    "source": "vector",
                    "score": result.get("score", 0.5)
                }
            elif video_id in all_videos:
                # Merge scores if video appears in both
                all_videos[video_id]["score"] = (all_videos[video_id]["score"] + result.get("score", 0.5)) / 2
                all_videos[video_id]["source"] = "hybrid"
        
        # Sort by score
        sorted_videos = sorted(all_videos.values(), key=lambda x: x["score"], reverse=True)
        
        return {
            "merged_results": sorted_videos,
            "graph_context": graph_context,
            "vector_results": vector_results
        }
    
    async def generate_recommendations(
        self, 
        query: str, 
        merged_results: Dict[str, Any],
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate AI-powered recommendations"""
        
        try:
            # Create recommendation prompt
            recommendation_template = """
            You are an expert recommendation system that analyzes user queries and video content to provide personalized suggestions.
            
            User Query: {query}
            
            Available Videos (sorted by relevance):
            {video_list}
            
            User's Video History (if available):
            {user_history}
            
            Please provide structured recommendations. Format your response as JSON:
            {{
                "recommendations": [
                    {{
                        "video_id": "video_id",
                        "title": "Video title",
                        "reason": "Why this video is recommended",
                        "relevance_score": 0.95,
                        "category": "Technology",
                        "topic": "Machine Learning"
                    }}
                ],
                "explanation": "Overall explanation of recommendations",
                "topics": ["topic1", "topic2"],
                "confidence": 0.85,
                "personalization_level": "high/medium/low"
            }}
            """
            
            # Prepare video list
            video_list = ""
            for i, video in enumerate(merged_results.get("merged_results", [])[:10]):
                video_list += f"{i+1}. {video['title']} (Score: {video['score']:.2f}, Topic: {video['topic']})\n"
            
            # Prepare user history
            user_history = ""
            if user_id:
                user_videos = merged_results.get("graph_context", {}).get("user_videos", [])
                for video in user_videos[:5]:
                    user_history += f"- {video.get('title', 'Unknown')} ({video.get('topic', 'Unknown')})\n"
            
            prompt = PromptTemplate(
                input_variables=["query", "video_list", "user_history"],
                template=recommendation_template
            )
            
            # Generate recommendations
            response = await llm.ainvoke(prompt.format(
                query=query,
                video_list=video_list,
                user_history=user_history
            ))
            
            # Parse response
            result = self.output_parser.parse(response.content)
            
            # Add metadata
            result["total_videos_analyzed"] = len(merged_results.get("merged_results", []))
            result["graph_videos"] = len(merged_results.get("graph_context", {}).get("topics", []))
            result["vector_videos"] = len(merged_results.get("vector_results", []))
            result["user_id"] = user_id
            
            return result
            
        except Exception as e:
            logger.error(f"Recommendation generation error: {e}")
            return {
                "recommendations": [],
                "explanation": f"Error generating recommendations: {str(e)}",
                "topics": [],
                "confidence": 0.0,
                "error": str(e)
            }
    
    async def get_topic_recommendations(self, topic: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Get recommendations based on a specific topic"""
        try:
            # Get topic-based videos from Neo4j
            topic_videos = await neo4j_service.search_by_topic(topic, limit=20)
            
            # Get user's videos in this topic
            user_topic_videos = []
            if user_id:
                user_videos = await neo4j_service.get_user_summaries(user_id, limit=50)
                user_topic_videos = [v for v in user_videos if v.get("topic") == topic]
            
            # Get topic statistics
            stats = await neo4j_service.get_topic_statistics()
            topic_stats = next((t for t in stats.get("top_topics", []) if t["topic"] == topic), None)
            
            return {
                "topic": topic,
                "videos": topic_videos,
                "user_videos": user_topic_videos,
                "stats": topic_stats,
                "total_videos": len(topic_videos),
                "user_video_count": len(user_topic_videos)
            }
            
        except Exception as e:
            logger.error(f"Topic recommendation error: {e}")
            return {
                "topic": topic,
                "videos": [],
                "user_videos": [],
                "stats": None,
                "error": str(e)
            }
    
    async def get_user_recommendations(self, user_id: str, limit: int = 10) -> Dict[str, Any]:
        """Get personalized recommendations for a user"""
        try:
            # Get user's video history
            user_videos = await neo4j_service.get_user_summaries(user_id, limit=50)
            
            if not user_videos:
                return {
                    "user_id": user_id,
                    "recommendations": [],
                    "explanation": "No video history found for personalized recommendations",
                    "topics": [],
                    "confidence": 0.0
                }
            
            # Analyze user's topics
            user_topics = {}
            for video in user_videos:
                topic = video.get("topic")
                if topic:
                    user_topics[topic] = user_topics.get(topic, 0) + 1
            
            # Get recommendations for top topics
            recommendations = []
            for topic, count in sorted(user_topics.items(), key=lambda x: x[1], reverse=True)[:3]:
                topic_recs = await self.get_topic_recommendations(topic, user_id)
                recommendations.extend(topic_recs.get("videos", [])[:5])
            
            # Remove duplicates and user's own videos
            user_video_ids = {v.get("video_id") for v in user_videos}
            unique_recommendations = []
            seen_ids = set()
            
            for rec in recommendations:
                video_id = rec.get("video_id")
                if video_id and video_id not in seen_ids and video_id not in user_video_ids:
                    unique_recommendations.append(rec)
                    seen_ids.add(video_id)
            
            return {
                "user_id": user_id,
                "recommendations": unique_recommendations[:limit],
                "explanation": f"Based on your interest in {', '.join(list(user_topics.keys())[:3])}",
                "topics": list(user_topics.keys()),
                "confidence": min(0.9, len(user_videos) / 10),
                "user_topics": user_topics
            }
            
        except Exception as e:
            logger.error(f"User recommendation error: {e}")
            return {
                "user_id": user_id,
                "recommendations": [],
                "explanation": f"Error generating user recommendations: {str(e)}",
                "topics": [],
                "confidence": 0.0,
                "error": str(e)
            }

# Global instance
graphrag_service = GraphRAGService() 