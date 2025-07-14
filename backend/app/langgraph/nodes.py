import logging
import json
import time
from typing import Dict, Any, List
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.schema import BaseOutputParser
from app.core.config import settings
from app.core.pinecone_service import pinecone_service
from app.langgraph.types import WorkflowState, ClassificationResult, SummaryResult, StorageResult
import tiktoken

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize OpenAI
llm = ChatOpenAI(
    model="gpt-4",
    temperature=0.7,
    openai_api_key=settings.OPENAI_API_KEY
)

class SummaryOutputParser(BaseOutputParser):
    """Parse structured summary output"""
    
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
                    "summary": text,
                    "title": "Video Summary",
                    "tone": "professional",
                    "key_points": [],
                    "tags": []
                }
        except Exception as e:
            logger.error(f"Summary parsing error: {e}")
            return {
                "summary": text,
                "title": "Video Summary",
                "tone": "professional",
                "key_points": [],
                "tags": []
            }

class ClassificationOutputParser(BaseOutputParser):
    """Parse structured classification output"""
    
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
                    "topic": "General",
                    "category": "Education",
                    "confidence": 0.5,
                    "subcategories": [],
                    "tags": []
                }
        except Exception as e:
            logger.error(f"Classification parsing error: {e}")
            return {
                "topic": "General",
                "category": "Education",
                "confidence": 0.5,
                "subcategories": [],
                "tags": []
            }

def count_tokens(text: str) -> int:
    """Count tokens in text"""
    encoding = tiktoken.encoding_for_model("gpt-4")
    return len(encoding.encode(text))

def truncate_text(text: str, max_tokens: int = 4000) -> str:
    """Truncate text to fit token limit"""
    tokens = count_tokens(text)
    if tokens <= max_tokens:
        return text
    
    encoding = tiktoken.encoding_for_model("gpt-4")
    encoded = encoding.encode(text)
    truncated = encoded[:max_tokens]
    return encoding.decode(truncated)

async def summarize_node(state: WorkflowState) -> WorkflowState:
    """LangGraph node for summarization"""
    logger.info(f"Starting summarization for video: {state.video_id}")
    start_time = time.time()
    
    try:
        # Truncate transcript
        truncated_transcript = truncate_text(state.transcript or "", 4000)
        token_count = count_tokens(truncated_transcript)
        
        # Create summary prompt
        summary_template = """
        You are an expert AI assistant that creates engaging, informative summaries of YouTube videos.
        
        Video ID: {video_id}
        Transcript Length: {token_count} tokens
        Tone: {tone}
        Max Summary Length: {max_length} characters
        
        Transcript:
        {transcript}
        
        Please provide a comprehensive summary. Format your response as JSON:
        {{
            "summary": "Your engaging summary here",
            "title": "Catchy title for the summary",
            "tone": "{tone}",
            "key_points": ["point1", "point2", "point3"],
            "tags": ["tag1", "tag2", "tag3"]
        }}
        """
        
        prompt = PromptTemplate(
            input_variables=["video_id", "token_count", "tone", "max_length", "transcript"],
            template=summary_template
        )
        
        # Generate summary
        response = await llm.ainvoke(prompt.format(
            video_id=state.video_id or "unknown",
            token_count=token_count,
            tone=state.tone or "professional",
            max_length=500,
            transcript=truncated_transcript
        ))
        
        # Parse response
        parser = SummaryOutputParser()
        result = parser.parse(response.content)
        
        # Update state
        state.summary = result.get("summary", "")
        state.title = result.get("title", "Video Summary")
        state.tone = result.get("tone", "professional")
        state.key_points = result.get("key_points", [])
        state.tags = result.get("tags", [])
        state.token_count = token_count
        state.processing_time = time.time() - start_time
        
        logger.info(f"Summarization completed in {state.processing_time:.2f}s")
        
    except Exception as e:
        logger.error(f"Summarization error: {e}")
        state.error = str(e)
        state.error_step = "summarize"
    
    return state

async def classify_node(state: WorkflowState) -> WorkflowState:
    """LangGraph node for topic classification"""
    logger.info(f"Starting classification for video: {state.video_id}")
    start_time = time.time()
    
    try:
        # Create classification prompt
        classification_template = """
        You are an expert content classifier. Analyze this video summary and classify it by topic and category.
        
        Video Title: {title}
        Summary: {summary}
        Key Points: {key_points}
        
        Classify the content into:
        1. Main topic (e.g., "Machine Learning", "Cooking", "Gaming")
        2. Category (e.g., "Technology", "Lifestyle", "Education")
        3. Subcategories (e.g., ["Deep Learning", "Python", "Tutorial"])
        4. Confidence score (0.0 to 1.0)
        5. Additional tags
        
        Format your response as JSON:
        {{
            "topic": "Main topic",
            "category": "Category",
            "confidence": 0.85,
            "subcategories": ["sub1", "sub2"],
            "tags": ["tag1", "tag2"]
        }}
        """
        
        prompt = PromptTemplate(
            input_variables=["title", "summary", "key_points"],
            template=classification_template
        )
        
        # Generate classification
        response = await llm.ainvoke(prompt.format(
            title=state.title or "Unknown Video",
            summary=state.summary or "",
            key_points=", ".join(state.key_points)
        ))
        
        # Parse response
        parser = ClassificationOutputParser()
        result = parser.parse(response.content)
        
        # Update state
        state.topic = result.get("topic", "General")
        state.category = result.get("category", "Education")
        state.confidence = result.get("confidence", 0.5)
        state.subcategories = result.get("subcategories", [])
        state.tags.extend(result.get("tags", []))
        
        # Remove duplicates
        state.tags = list(set(state.tags))
        
        logger.info(f"Classification completed: {state.topic} ({state.category}) - Confidence: {state.confidence}")
        
    except Exception as e:
        logger.error(f"Classification error: {e}")
        state.error = str(e)
        state.error_step = "classify"
    
    return state

async def pinecone_store_node(state: WorkflowState) -> WorkflowState:
    """LangGraph node for Pinecone storage"""
    logger.info(f"Starting Pinecone storage for video: {state.video_id}")
    start_time = time.time()
    
    try:
        # Get embedding for summary
        from app.routers.smart_summary import get_embedding
        
        summary_embedding = await get_embedding(state.summary or "")
        
        # Prepare summary data
        summary_data = {
            "summary": state.summary,
            "title": state.title,
            "tone": state.tone,
            "key_points": state.key_points,
            "tags": state.tags,
            "topic": state.topic,
            "category": state.category,
            "confidence": state.confidence,
            "subcategories": state.subcategories,
            "transcript_length": len(state.transcript or ""),
            "summary_length": len(state.summary or "")
        }
        
        # Store in Pinecone
        vector_id = await pinecone_service.store_summary(
            summary_data=summary_data,
            user_id=state.user_id or "anonymous",
            video_id=state.video_id or "unknown",
            embedding=summary_embedding
        )
        
        state.pinecone_id = vector_id
        logger.info(f"Pinecone storage completed: {vector_id}")
        
    except Exception as e:
        logger.error(f"Pinecone storage error: {e}")
        state.error = str(e)
        state.error_step = "pinecone_store"
    
    return state

async def neo4j_store_node(state: WorkflowState) -> WorkflowState:
    """LangGraph node for Neo4j storage"""
    logger.info(f"Starting Neo4j storage for video: {state.video_id}")
    start_time = time.time()
    
    try:
        from app.langgraph.neo4j_service import neo4j_service
        
        # Store in Neo4j
        graph_id = await neo4j_service.store_summary(
            video_id=state.video_id or "unknown",
            user_id=state.user_id or "anonymous",
            title=state.title or "Unknown Video",
            summary=state.summary or "",
            topic=state.topic or "General",
            category=state.category or "Education",
            confidence=state.confidence or 0.5,
            subcategories=state.subcategories,
            tags=state.tags,
            key_points=state.key_points,
            tone=state.tone or "professional"
        )
        
        state.neo4j_id = graph_id
        logger.info(f"Neo4j storage completed: {graph_id}")
        
    except Exception as e:
        logger.error(f"Neo4j storage error: {e}")
        state.error = str(e)
        state.error_step = "neo4j_store"
    
    return state

async def finalize_node(state: WorkflowState) -> WorkflowState:
    """LangGraph node for finalization and logging"""
    logger.info(f"Finalizing workflow for video: {state.video_id}")
    
    # Set creation timestamp
    from datetime import datetime
    state.created_at = datetime.utcnow()
    
    # Log final results
    if state.error:
        logger.error(f"Workflow failed at step {state.error_step}: {state.error}")
    else:
        logger.info(f"Workflow completed successfully:")
        logger.info(f"  - Summary: {len(state.summary or '')} chars")
        logger.info(f"  - Topic: {state.topic}")
        logger.info(f"  - Category: {state.category}")
        logger.info(f"  - Confidence: {state.confidence}")
        logger.info(f"  - Pinecone ID: {state.pinecone_id}")
        logger.info(f"  - Neo4j ID: {state.neo4j_id}")
    
    return state 