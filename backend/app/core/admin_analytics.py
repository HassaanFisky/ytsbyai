import redis
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from collections import defaultdict, Counter
import requests
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class AdminAnalyticsService:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            password=settings.REDIS_PASSWORD,
            decode_responses=True
        )
        
    def _get_all_demo_keys(self) -> List[str]:
        """Get all demo-related Redis keys"""
        return self.redis_client.keys("demo:*")
    
    def _get_session_data(self, session_key: str) -> Optional[Dict]:
        """Get session data from Redis"""
        try:
            data = self.redis_client.get(session_key)
            return json.loads(data) if data else None
        except Exception as e:
            logger.error(f"Error getting session data: {e}")
            return None
    
    def _get_usage_data(self, usage_key: str) -> Optional[int]:
        """Get usage count from Redis"""
        try:
            data = self.redis_client.get(usage_key)
            return int(data) if data else 0
        except Exception as e:
            logger.error(f"Error getting usage data: {e}")
            return 0
    
    def _get_ip_location(self, ip: str) -> Dict[str, str]:
        """Get IP location data (mock implementation)"""
        try:
            # In production, use a real IP geolocation service
            # response = requests.get(f"http://ip-api.com/json/{ip}")
            # return response.json()
            
            # Mock location data for demo
            return {
                "country": "Unknown",
                "region": "Unknown", 
                "city": "Unknown",
                "timezone": "UTC"
            }
        except Exception:
            return {
                "country": "Unknown",
                "region": "Unknown",
                "city": "Unknown", 
                "timezone": "UTC"
            }
    
    async def get_demo_stats(self) -> Dict[str, Any]:
        """Get comprehensive demo portal statistics"""
        try:
            # Get all demo keys
            all_keys = self._get_all_demo_keys()
            session_keys = [k for k in all_keys if k.startswith("demo:session:")]
            usage_keys = [k for k in all_keys if k.startswith("demo:usage:")]
            
            # Process sessions
            total_sessions = len(session_keys)
            active_sessions = 0
            session_sources = defaultdict(int)
            top_ips = []
            ip_counter = Counter()
            
            # Process usage
            quota_exceeded_counts = {"summary": 0, "transcription": 0}
            conversion_clicks = {"signup": 0, "stripe": 0}
            
            # Track recent sessions for detailed analysis
            recent_sessions = []
            
            for session_key in session_keys:
                session_data = self._get_session_data(session_key)
                if session_data:
                    # Check if session is active (within 24 hours)
                    created_at = datetime.fromisoformat(session_data.get("created_at", ""))
                    if datetime.utcnow() - created_at < timedelta(hours=24):
                        active_sessions += 1
                    
                    # Track IP
                    ip = session_data.get("ip_address", "unknown")
                    ip_counter[ip] += 1
                    
                    # Get location data
                    location = self._get_ip_location(ip)
                    
                    # Get usage data for this session
                    guest_id = session_key.replace("demo:session:", "")
                    summary_usage = self._get_usage_data(f"demo:usage:{guest_id}:summary")
                    transcription_usage = self._get_usage_data(f"demo:usage:{guest_id}:transcription")
                    
                    # Check if quota exceeded
                    if summary_usage >= 3:
                        quota_exceeded_counts["summary"] += 1
                    if transcription_usage >= 2:
                        quota_exceeded_counts["transcription"] += 1
                    
                    # Add to recent sessions
                    recent_sessions.append({
                        "session_id": session_data.get("session_id"),
                        "ip_address": ip,
                        "location": location,
                        "created_at": session_data.get("created_at"),
                        "summary_usage": summary_usage,
                        "transcription_usage": transcription_usage,
                        "total_usage": summary_usage + transcription_usage,
                        "is_active": datetime.utcnow() - created_at < timedelta(hours=24)
                    })
            
            # Get top IPs
            top_ips = [ip for ip, count in ip_counter.most_common(10)]
            
            # Mock conversion data (in production, track this from frontend events)
            conversion_clicks = {
                "signup": len([s for s in recent_sessions if s["total_usage"] >= 3]),
                "stripe": len([s for s in recent_sessions if s["total_usage"] >= 4])
            }
            
            # Session sources (mock data)
            session_sources = {
                "direct": int(total_sessions * 0.4),
                "shared": int(total_sessions * 0.3),
                "organic": int(total_sessions * 0.3)
            }
            
            return {
                "total_sessions": total_sessions,
                "active_sessions": active_sessions,
                "quota_exceeded_counts": quota_exceeded_counts,
                "conversion_clicks": conversion_clicks,
                "session_sources": session_sources,
                "top_ips": top_ips,
                "recent_sessions": recent_sessions[:50],  # Last 50 sessions
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting demo stats: {e}")
            return {
                "total_sessions": 0,
                "active_sessions": 0,
                "quota_exceeded_counts": {"summary": 0, "transcription": 0},
                "conversion_clicks": {"signup": 0, "stripe": 0},
                "session_sources": {"direct": 0, "shared": 0, "organic": 0},
                "top_ips": [],
                "recent_sessions": [],
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e)
            }
    
    async def get_usage_timeline(self, hours: int = 24) -> Dict[str, List]:
        """Get usage timeline for charts"""
        try:
            timeline = {
                "summary": [],
                "transcription": [],
                "labels": []
            }
            
            # Generate timeline data (mock for demo)
            for i in range(hours):
                hour_ago = datetime.utcnow() - timedelta(hours=i)
                timeline["labels"].insert(0, hour_ago.strftime("%H:%M"))
                timeline["summary"].insert(0, max(0, 10 - i + (i % 3)))  # Mock data
                timeline["transcription"].insert(0, max(0, 8 - i + (i % 2)))  # Mock data
            
            return timeline
            
        except Exception as e:
            logger.error(f"Error getting usage timeline: {e}")
            return {
                "summary": [],
                "transcription": [],
                "labels": []
            }
    
    async def get_leaderboard(self) -> List[Dict[str, Any]]:
        """Get leaderboard of most active sessions"""
        try:
            all_keys = self._get_all_demo_keys()
            session_keys = [k for k in all_keys if k.startswith("demo:session:")]
            
            leaderboard = []
            
            for session_key in session_keys:
                session_data = self._get_session_data(session_key)
                if session_data:
                    guest_id = session_key.replace("demo:session:", "")
                    summary_usage = self._get_usage_data(f"demo:usage:{guest_id}:summary")
                    transcription_usage = self._get_usage_data(f"demo:usage:{guest_id}:transcription")
                    total_usage = summary_usage + transcription_usage
                    
                    if total_usage > 0:
                        ip = session_data.get("ip_address", "unknown")
                        location = self._get_ip_location(ip)
                        
                        leaderboard.append({
                            "ip_address": ip,
                            "location": location,
                            "total_usage": total_usage,
                            "summary_usage": summary_usage,
                            "transcription_usage": transcription_usage,
                            "created_at": session_data.get("created_at"),
                            "session_id": session_data.get("session_id")
                        })
            
            # Sort by total usage
            leaderboard.sort(key=lambda x: x["total_usage"], reverse=True)
            return leaderboard[:20]  # Top 20
            
        except Exception as e:
            logger.error(f"Error getting leaderboard: {e}")
            return []
    
    async def get_conversion_funnel(self) -> Dict[str, Any]:
        """Get conversion funnel data"""
        try:
            all_keys = self._get_all_demo_keys()
            session_keys = [k for k in all_keys if k.startswith("demo:session:")]
            
            funnel = {
                "demo_started": len(session_keys),
                "quota_exceeded": 0,
                "modal_shown": 0,
                "signup_clicked": 0,
                "checkout_clicked": 0,
                "signup_completed": 0,
                "checkout_completed": 0
            }
            
            for session_key in session_keys:
                session_data = self._get_session_data(session_key)
                if session_data:
                    guest_id = session_key.replace("demo:session:", "")
                    summary_usage = self._get_usage_data(f"demo:usage:{guest_id}:summary")
                    transcription_usage = self._get_usage_data(f"demo:usage:{guest_id}:transcription")
                    
                    # Check if quota exceeded
                    if summary_usage >= 3 or transcription_usage >= 2:
                        funnel["quota_exceeded"] += 1
                        funnel["modal_shown"] += 1
                        
                        # Mock conversion data
                        if summary_usage >= 3:
                            funnel["signup_clicked"] += 1
                            if summary_usage >= 4:
                                funnel["signup_completed"] += 1
                        
                        if transcription_usage >= 2:
                            funnel["checkout_clicked"] += 1
                            if transcription_usage >= 3:
                                funnel["checkout_completed"] += 1
            
            return funnel
            
        except Exception as e:
            logger.error(f"Error getting conversion funnel: {e}")
            return {
                "demo_started": 0,
                "quota_exceeded": 0,
                "modal_shown": 0,
                "signup_clicked": 0,
                "checkout_clicked": 0,
                "signup_completed": 0,
                "checkout_completed": 0
            }

# Global analytics service instance
admin_analytics = AdminAnalyticsService() 