import logging
from typing import Dict, Any, List
from langgraph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from app.langgraph.types import WorkflowState
from app.langgraph.nodes import (
    summarize_node,
    classify_node,
    pinecone_store_node,
    neo4j_store_node,
    finalize_node
)

logger = logging.getLogger(__name__)

def create_workflow() -> StateGraph:
    """Create the LangGraph workflow for summarization and classification"""
    
    # Create the workflow graph
    workflow = StateGraph(WorkflowState)
    
    # Add nodes
    workflow.add_node("summarize", summarize_node)
    workflow.add_node("classify", classify_node)
    workflow.add_node("pinecone_store", pinecone_store_node)
    workflow.add_node("neo4j_store", neo4j_store_node)
    workflow.add_node("finalize", finalize_node)
    
    # Define the workflow edges
    workflow.set_entry_point("summarize")
    
    # Linear flow: summarize -> classify -> store -> finalize
    workflow.add_edge("summarize", "classify")
    workflow.add_edge("classify", "pinecone_store")
    workflow.add_edge("pinecone_store", "neo4j_store")
    workflow.add_edge("neo4j_store", "finalize")
    workflow.add_edge("finalize", END)
    
    # Add conditional edges for error handling
    workflow.add_conditional_edges(
        "summarize",
        lambda state: "classify" if not state.error else END
    )
    
    workflow.add_conditional_edges(
        "classify",
        lambda state: "pinecone_store" if not state.error else END
    )
    
    workflow.add_conditional_edges(
        "pinecone_store",
        lambda state: "neo4j_store" if not state.error else END
    )
    
    workflow.add_conditional_edges(
        "neo4j_store",
        lambda state: "finalize" if not state.error else END
    )
    
    return workflow

def create_workflow_with_memory() -> StateGraph:
    """Create workflow with memory for checkpointing"""
    workflow = create_workflow()
    
    # Add memory for checkpointing
    memory = MemorySaver()
    workflow.set_checkpointer(memory)
    
    return workflow

# Global workflow instance
workflow_graph = create_workflow_with_memory()

async def run_workflow(
    youtube_url: str,
    video_id: str,
    transcript: str,
    user_id: str,
    tone: str = "professional"
) -> WorkflowState:
    """Run the complete LangGraph workflow"""
    
    logger.info(f"Starting LangGraph workflow for video: {video_id}")
    
    # Initialize workflow state
    initial_state = WorkflowState(
        youtube_url=youtube_url,
        video_id=video_id,
        transcript=transcript,
        user_id=user_id,
        tone=tone
    )
    
    try:
        # Run the workflow
        config = {"configurable": {"thread_id": f"workflow_{video_id}"}}
        result = await workflow_graph.ainvoke(initial_state, config)
        
        logger.info(f"LangGraph workflow completed for video: {video_id}")
        return result
        
    except Exception as e:
        logger.error(f"LangGraph workflow error for video {video_id}: {e}")
        # Return state with error
        initial_state.error = str(e)
        initial_state.error_step = "workflow"
        return initial_state

async def run_workflow_with_checkpoint(
    youtube_url: str,
    video_id: str,
    transcript: str,
    user_id: str,
    tone: str = "professional",
    thread_id: str = None
) -> WorkflowState:
    """Run workflow with checkpointing for resumability"""
    
    if thread_id is None:
        thread_id = f"workflow_{video_id}"
    
    logger.info(f"Starting LangGraph workflow with checkpoint for video: {video_id}")
    
    # Initialize workflow state
    initial_state = WorkflowState(
        youtube_url=youtube_url,
        video_id=video_id,
        transcript=transcript,
        user_id=user_id,
        tone=tone
    )
    
    try:
        # Run the workflow with checkpointing
        config = {"configurable": {"thread_id": thread_id}}
        result = await workflow_graph.ainvoke(initial_state, config)
        
        logger.info(f"LangGraph workflow with checkpoint completed for video: {video_id}")
        return result
        
    except Exception as e:
        logger.error(f"LangGraph workflow with checkpoint error for video {video_id}: {e}")
        # Return state with error
        initial_state.error = str(e)
        initial_state.error_step = "workflow"
        return initial_state

def get_workflow_status(thread_id: str) -> Dict[str, Any]:
    """Get the status of a workflow thread"""
    try:
        # Get the latest state from memory
        memory = workflow_graph.checkpointer
        latest_state = memory.get(thread_id)
        
        if latest_state:
            return {
                "thread_id": thread_id,
                "completed": True,
                "error": latest_state.get("error"),
                "error_step": latest_state.get("error_step"),
                "video_id": latest_state.get("video_id"),
                "summary": latest_state.get("summary"),
                "topic": latest_state.get("topic"),
                "category": latest_state.get("category"),
                "pinecone_id": latest_state.get("pinecone_id"),
                "neo4j_id": latest_state.get("neo4j_id")
            }
        else:
            return {
                "thread_id": thread_id,
                "completed": False,
                "error": "Thread not found"
            }
            
    except Exception as e:
        logger.error(f"Error getting workflow status: {e}")
        return {
            "thread_id": thread_id,
            "completed": False,
            "error": str(e)
        }

def list_workflow_threads() -> List[Dict[str, Any]]:
    """List all workflow threads"""
    try:
        memory = workflow_graph.checkpointer
        threads = memory.list_keys()
        
        thread_statuses = []
        for thread_id in threads:
            status = get_workflow_status(thread_id)
            thread_statuses.append(status)
        
        return thread_statuses
        
    except Exception as e:
        logger.error(f"Error listing workflow threads: {e}")
        return []

def clear_workflow_thread(thread_id: str) -> bool:
    """Clear a workflow thread from memory"""
    try:
        memory = workflow_graph.checkpointer
        memory.clear(thread_id)
        return True
        
    except Exception as e:
        logger.error(f"Error clearing workflow thread: {e}")
        return False 