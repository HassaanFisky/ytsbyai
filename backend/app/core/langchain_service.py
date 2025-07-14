from langchain_openai import ChatOpenAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.memory import ConversationBufferMemory
from langchain.agents import initialize_agent, AgentType, Tool
from langchain.tools import BaseTool
from langchain.schema import BaseOutputParser
from typing import Dict, List, Any, Optional
import json
import tiktoken
from app.core.config import settings

class SummaryOutputParser(BaseOutputParser):
    """Parse structured summary output"""
    
    def parse(self, text: str) -> Dict[str, Any]:
        try:
            # Try to extract JSON from the response
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
                # Fallback to simple parsing
                return {
                    "summary": text,
                    "title": "Video Summary",
                    "tone": "professional",
                    "cta": "Share this summary!"
                }
        except Exception:
            return {
                "summary": text,
                "title": "Video Summary", 
                "tone": "professional",
                "cta": "Share this summary!"
            }

class LangChainService:
    """LangChain service for advanced summarization"""
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4",
            temperature=0.7,
            openai_api_key=settings.OPENAI_API_KEY
        )
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        self.output_parser = SummaryOutputParser()
        
    def create_summary_chain(self, tone: str = "professional") -> LLMChain:
        """Create a summary generation chain"""
        
        summary_template = """
        You are an expert AI assistant that creates engaging, informative summaries of YouTube videos.
        
        Video Title: {title}
        Video Author: {author}
        Video Length: {length} seconds
        Tone: {tone}
        Max Summary Length: {max_length} characters
        
        Transcript:
        {transcript}
        
        Please provide a comprehensive summary in the specified tone. Format your response as JSON:
        {{
            "summary": "Your engaging summary here",
            "title": "Catchy title for the summary",
            "tone": "{tone}",
            "cta": "Compelling call-to-action",
            "key_points": ["point1", "point2", "point3"],
            "tags": ["tag1", "tag2", "tag3"]
        }}
        """
        
        prompt = PromptTemplate(
            input_variables=["title", "author", "length", "tone", "max_length", "transcript"],
            template=summary_template
        )
        
        return LLMChain(
            llm=self.llm,
            prompt=prompt,
            output_parser=self.output_parser
        )
    
    def create_smart_summary_agent(self) -> Any:
        """Create a smart summary agent with tools"""
        
        # Define tools
        tools = [
            Tool(
                name="analyze_content",
                func=self._analyze_content,
                description="Analyze video content for key themes and topics"
            ),
            Tool(
                name="extract_key_points",
                func=self._extract_key_points,
                description="Extract main points and insights from transcript"
            ),
            Tool(
                name="generate_engagement_hooks",
                func=self._generate_engagement_hooks,
                description="Generate engaging hooks and CTAs"
            )
        ]
        
        # Initialize agent
        agent = initialize_agent(
            tools,
            self.llm,
            agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
            memory=self.memory,
            verbose=True
        )
        
        return agent
    
    def _analyze_content(self, transcript: str) -> str:
        """Analyze content for themes and topics"""
        analysis_prompt = f"""
        Analyze this video transcript and identify:
        1. Main themes and topics
        2. Target audience
        3. Content type (educational, entertainment, etc.)
        4. Key insights
        
        Transcript: {transcript[:2000]}
        
        Provide a concise analysis.
        """
        
        response = self.llm.invoke(analysis_prompt)
        return response.content
    
    def _extract_key_points(self, transcript: str) -> str:
        """Extract key points from transcript"""
        points_prompt = f"""
        Extract the 5 most important points from this video transcript:
        
        {transcript[:2000]}
        
        Format as a numbered list.
        """
        
        response = self.llm.invoke(points_prompt)
        return response.content
    
    def _generate_engagement_hooks(self, summary: str) -> str:
        """Generate engagement hooks and CTAs"""
        hook_prompt = f"""
        Based on this summary, generate 3 engaging hooks and 2 compelling call-to-actions:
        
        Summary: {summary}
        
        Format as JSON:
        {{
            "hooks": ["hook1", "hook2", "hook3"],
            "ctas": ["cta1", "cta2"]
        }}
        """
        
        response = self.llm.invoke(hook_prompt)
        return response.content
    
    def count_tokens(self, text: str) -> int:
        """Count tokens in text"""
        encoding = tiktoken.encoding_for_model("gpt-4")
        return len(encoding.encode(text))
    
    def truncate_transcript(self, transcript: str, max_tokens: int = 4000) -> str:
        """Truncate transcript to fit token limit"""
        tokens = self.count_tokens(transcript)
        if tokens <= max_tokens:
            return transcript
        
        # Truncate to fit token limit
        encoding = tiktoken.encoding_for_model("gpt-4")
        encoded = encoding.encode(transcript)
        truncated = encoded[:max_tokens]
        return encoding.decode(truncated)

# Global instance
langchain_service = LangChainService() 