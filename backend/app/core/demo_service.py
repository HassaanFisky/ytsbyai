import redis
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class DemoService:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            password=settings.REDIS_PASSWORD,
            decode_responses=True
        )
        
        # Demo quotas
        self.DEMO_SUMMARY_LIMIT = 3
        self.DEMO_TRANSCRIPTION_LIMIT = 2
        self.DEMO_AUDIO_MAX_DURATION = 30  # seconds
        self.DEMO_SESSION_DURATION = 24 * 60 * 60  # 24 hours
        
    def _get_guest_id(self, ip_address: str, session_id: Optional[str] = None) -> str:
        """Generate or retrieve guest ID for demo usage tracking"""
        if session_id:
            return f"guest:{session_id}"
        
        # Create new guest ID based on IP
        guest_id = f"guest:{ip_address}:{uuid.uuid4().hex[:8]}"
        return guest_id
    
    def _get_usage_key(self, guest_id: str, service: str) -> str:
        """Get Redis key for usage tracking"""
        return f"demo:usage:{guest_id}:{service}"
    
    def _get_session_key(self, guest_id: str) -> str:
        """Get Redis key for session data"""
        return f"demo:session:{guest_id}"
    
    async def get_guest_session(self, ip_address: str, session_id: Optional[str] = None) -> Dict:
        """Get or create guest session for demo usage"""
        guest_id = self._get_guest_id(ip_address, session_id)
        session_key = self._get_session_key(guest_id)
        
        # Check if session exists
        session_data = self.redis_client.get(session_key)
        if session_data:
            session = json.loads(session_data)
            return {
                "guest_id": guest_id,
                "session_id": session.get("session_id"),
                "created_at": session.get("created_at"),
                "ip_address": ip_address,
                "usage": session.get("usage", {})
            }
        
        # Create new session
        new_session_id = str(uuid.uuid4())
        session_data = {
            "session_id": new_session_id,
            "created_at": datetime.utcnow().isoformat(),
            "ip_address": ip_address,
            "usage": {
                "summary": 0,
                "transcription": 0
            }
        }
        
        # Store session with expiration
        self.redis_client.setex(
            session_key,
            self.DEMO_SESSION_DURATION,
            json.dumps(session_data)
        )
        
        return {
            "guest_id": guest_id,
            "session_id": new_session_id,
            "created_at": session_data["created_at"],
            "ip_address": ip_address,
            "usage": session_data["usage"]
        }
    
    async def check_demo_quota(self, guest_id: str, service: str) -> Tuple[bool, Dict]:
        """Check if guest has quota remaining for demo service"""
        usage_key = self._get_usage_key(guest_id, service)
        session_key = self._get_session_key(guest_id)
        
        # Get current usage
        current_usage = int(self.redis_client.get(usage_key) or 0)
        
        # Get limits
        limits = {
            "summary": self.DEMO_SUMMARY_LIMIT,
            "transcription": self.DEMO_TRANSCRIPTION_LIMIT
        }
        
        limit = limits.get(service, 0)
        remaining = max(0, limit - current_usage)
        has_quota = remaining > 0
        
        # Get session data
        session_data = self.redis_client.get(session_key)
        session = json.loads(session_data) if session_data else {}
        
        return has_quota, {
            "service": service,
            "used": current_usage,
            "limit": limit,
            "remaining": remaining,
            "has_quota": has_quota,
            "session_id": session.get("session_id"),
            "created_at": session.get("created_at")
        }
    
    async def increment_demo_usage(self, guest_id: str, service: str) -> Dict:
        """Increment demo usage counter"""
        usage_key = self._get_usage_key(guest_id, service)
        session_key = self._get_session_key(guest_id)
        
        # Increment usage
        current_usage = self.redis_client.incr(usage_key)
        
        # Set expiration for usage key
        self.redis_client.expire(usage_key, self.DEMO_SESSION_DURATION)
        
        # Update session usage
        session_data = self.redis_client.get(session_key)
        if session_data:
            session = json.loads(session_data)
            session["usage"][service] = current_usage
            self.redis_client.setex(
                session_key,
                self.DEMO_SESSION_DURATION,
                json.dumps(session)
            )
        
        # Get updated quota info
        has_quota, quota_info = await self.check_demo_quota(guest_id, service)
        
        return {
            "success": True,
            "new_usage": current_usage,
            "quota_info": quota_info
        }
    
    async def get_demo_stats(self, guest_id: str) -> Dict:
        """Get comprehensive demo usage statistics"""
        session_key = self._get_session_key(guest_id)
        session_data = self.redis_client.get(session_key)
        
        if not session_data:
            return {
                "error": "Session not found",
                "guest_id": guest_id
            }
        
        session = json.loads(session_data)
        
        # Get current usage for all services
        summary_usage = int(self.redis_client.get(self._get_usage_key(guest_id, "summary")) or 0)
        transcription_usage = int(self.redis_client.get(self._get_usage_key(guest_id, "transcription")) or 0)
        
        return {
            "guest_id": guest_id,
            "session_id": session.get("session_id"),
            "created_at": session.get("created_at"),
            "ip_address": session.get("ip_address"),
            "usage": {
                "summary": {
                    "used": summary_usage,
                    "limit": self.DEMO_SUMMARY_LIMIT,
                    "remaining": max(0, self.DEMO_SUMMARY_LIMIT - summary_usage)
                },
                "transcription": {
                    "used": transcription_usage,
                    "limit": self.DEMO_TRANSCRIPTION_LIMIT,
                    "remaining": max(0, self.DEMO_TRANSCRIPTION_LIMIT - transcription_usage)
                }
            },
            "total_used": summary_usage + transcription_usage,
            "total_limit": self.DEMO_SUMMARY_LIMIT + self.DEMO_TRANSCRIPTION_LIMIT,
            "has_any_quota": (summary_usage < self.DEMO_SUMMARY_LIMIT) or (transcription_usage < self.DEMO_TRANSCRIPTION_LIMIT)
        }
    
    async def clear_demo_session(self, guest_id: str) -> bool:
        """Clear demo session and usage data"""
        try:
            # Delete usage keys
            self.redis_client.delete(self._get_usage_key(guest_id, "summary"))
            self.redis_client.delete(self._get_usage_key(guest_id, "transcription"))
            
            # Delete session key
            self.redis_client.delete(self._get_session_key(guest_id))
            
            return True
        except Exception as e:
            logger.error(f"Error clearing demo session: {e}")
            return False
    
    def validate_demo_audio_duration(self, audio_duration: float) -> bool:
        """Validate audio duration for demo (max 30 seconds)"""
        return audio_duration <= self.DEMO_AUDIO_MAX_DURATION
    
    async def get_demo_limits(self) -> Dict:
        """Get demo service limits and restrictions"""
        return {
            "summary": {
                "limit": self.DEMO_SUMMARY_LIMIT,
                "description": "YouTube URL summaries"
            },
            "transcription": {
                "limit": self.DEMO_TRANSCRIPTION_LIMIT,
                "description": "Audio transcription (max 30s)"
            },
            "audio_max_duration": self.DEMO_AUDIO_MAX_DURATION,
            "session_duration_hours": self.DEMO_SESSION_DURATION // 3600
        }

# Global demo service instance
demo_service = DemoService() 