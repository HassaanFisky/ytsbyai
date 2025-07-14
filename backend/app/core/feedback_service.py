import redis
import json
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from enum import Enum
import httpx
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class FeedbackType(Enum):
    BUG = "bug"
    IDEA = "idea"
    ISSUE = "issue"
    FEATURE = "feature"
    GENERAL = "general"

class FeedbackStatus(Enum):
    NEW = "new"
    REVIEWING = "reviewing"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class Feedback:
    def __init__(
        self,
        feedback_type: FeedbackType,
        message: str,
        user_email: Optional[str] = None,
        user_uid: Optional[str] = None,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
        page_url: Optional[str] = None,
        status: FeedbackStatus = FeedbackStatus.NEW
    ):
        self.id = f"feedback_{datetime.utcnow().strftime('%Y%m%d_%H%M%S_%f')[:-3]}"
        self.feedback_type = feedback_type
        self.message = message
        self.user_email = user_email
        self.user_uid = user_uid
        self.user_agent = user_agent
        self.ip_address = ip_address
        self.page_url = page_url
        self.status = status
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.is_anonymous = user_email is None and user_uid is None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "feedback_type": self.feedback_type.value,
            "message": self.message,
            "user_email": self.user_email,
            "user_uid": self.user_uid,
            "user_agent": self.user_agent,
            "ip_address": self.ip_address,
            "page_url": self.page_url,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "is_anonymous": self.is_anonymous
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Feedback':
        feedback = cls(
            feedback_type=FeedbackType(data["feedback_type"]),
            message=data["message"],
            user_email=data.get("user_email"),
            user_uid=data.get("user_uid"),
            user_agent=data.get("user_agent"),
            ip_address=data.get("ip_address"),
            page_url=data.get("page_url"),
            status=FeedbackStatus(data.get("status", "new"))
        )
        feedback.id = data["id"]
        feedback.created_at = datetime.fromisoformat(data["created_at"])
        feedback.updated_at = datetime.fromisoformat(data["updated_at"])
        feedback.is_anonymous = data.get("is_anonymous", False)
        return feedback

class FeedbackService:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            password=settings.REDIS_PASSWORD,
            decode_responses=True
        )
        self.feedback_key = "feedback:all"
        self.feedback_stats_key = "feedback:stats"
        
    async def create_feedback(
        self,
        feedback_type: FeedbackType,
        message: str,
        user_email: Optional[str] = None,
        user_uid: Optional[str] = None,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
        page_url: Optional[str] = None
    ) -> Feedback:
        """Create and store a new feedback"""
        try:
            feedback = Feedback(
                feedback_type=feedback_type,
                message=message,
                user_email=user_email,
                user_uid=user_uid,
                user_agent=user_agent,
                ip_address=ip_address,
                page_url=page_url
            )
            
            # Store in Redis
            feedback_data = feedback.to_dict()
            self.redis_client.lpush(self.feedback_key, json.dumps(feedback_data))
            
            # Set expiration for feedback (30 days)
            self.redis_client.expire(self.feedback_key, 2592000)  # 30 days
            
            # Update stats
            await self._update_stats(feedback_type)
            
            # Send notifications
            await self._send_notifications(feedback)
            
            logger.info(f"Feedback created: {feedback.id} - {feedback_type.value}")
            return feedback
            
        except Exception as e:
            logger.error(f"Error creating feedback: {e}")
            raise

    async def get_feedback(self, limit: int = 100, feedback_type: Optional[FeedbackType] = None) -> List[Feedback]:
        """Get feedback with optional filtering"""
        try:
            feedback_data = self.redis_client.lrange(self.feedback_key, 0, limit - 1)
            feedback_list = []
            
            for feedback_json in feedback_data:
                try:
                    feedback_dict = json.loads(feedback_json)
                    feedback = Feedback.from_dict(feedback_dict)
                    
                    # Apply type filter if specified
                    if feedback_type is None or feedback.feedback_type == feedback_type:
                        feedback_list.append(feedback)
                        
                except Exception as e:
                    logger.error(f"Error parsing feedback: {e}")
                    continue
            
            # Sort by creation time (newest first)
            feedback_list.sort(key=lambda x: x.created_at, reverse=True)
            return feedback_list
            
        except Exception as e:
            logger.error(f"Error getting feedback: {e}")
            return []

    async def delete_feedback(self, feedback_id: str) -> bool:
        """Delete a feedback by ID"""
        try:
            feedback_data = self.redis_client.lrange(self.feedback_key, 0, -1)
            
            for i, feedback_json in enumerate(feedback_data):
                feedback_dict = json.loads(feedback_json)
                if feedback_dict["id"] == feedback_id:
                    self.redis_client.lrem(self.feedback_key, 1, feedback_json)
                    logger.info(f"Feedback deleted: {feedback_id}")
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error deleting feedback: {e}")
            return False

    async def update_feedback_status(self, feedback_id: str, status: FeedbackStatus) -> bool:
        """Update feedback status"""
        try:
            feedback_data = self.redis_client.lrange(self.feedback_key, 0, -1)
            
            for i, feedback_json in enumerate(feedback_data):
                feedback_dict = json.loads(feedback_json)
                if feedback_dict["id"] == feedback_id:
                    feedback_dict["status"] = status.value
                    feedback_dict["updated_at"] = datetime.utcnow().isoformat()
                    self.redis_client.lset(self.feedback_key, i, json.dumps(feedback_dict))
                    logger.info(f"Feedback status updated: {feedback_id} -> {status.value}")
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error updating feedback status: {e}")
            return False

    async def get_feedback_stats(self) -> Dict[str, Any]:
        """Get feedback statistics"""
        try:
            stats_data = self.redis_client.get(self.feedback_stats_key)
            if stats_data:
                return json.loads(stats_data)
            
            # Calculate stats from feedback data
            feedback_list = await self.get_feedback(limit=1000)
            
            stats = {
                "total_feedback": len(feedback_list),
                "by_type": {},
                "by_status": {},
                "recent_feedback": len([f for f in feedback_list if f.created_at > datetime.utcnow() - timedelta(days=7)]),
                "anonymous_feedback": len([f for f in feedback_list if f.is_anonymous])
            }
            
            for feedback in feedback_list:
                # Count by type
                feedback_type = feedback.feedback_type.value
                stats["by_type"][feedback_type] = stats["by_type"].get(feedback_type, 0) + 1
                
                # Count by status
                status = feedback.status.value
                stats["by_status"][status] = stats["by_status"].get(status, 0) + 1
            
            # Store stats in Redis
            self.redis_client.setex(self.feedback_stats_key, 3600, json.dumps(stats))  # 1 hour cache
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting feedback stats: {e}")
            return {
                "total_feedback": 0,
                "by_type": {},
                "by_status": {},
                "recent_feedback": 0,
                "anonymous_feedback": 0
            }

    async def _update_stats(self, feedback_type: FeedbackType):
        """Update feedback statistics"""
        try:
            # Invalidate stats cache to force recalculation
            self.redis_client.delete(self.feedback_stats_key)
        except Exception as e:
            logger.error(f"Error updating stats: {e}")

    async def _send_notifications(self, feedback: Feedback):
        """Send notifications for new feedback"""
        try:
            # Send email notification
            await self._send_email_notification(feedback)
            
            # Send Slack notification
            await self._send_slack_notification(feedback)
            
        except Exception as e:
            logger.error(f"Error sending notifications: {e}")

    async def _send_email_notification(self, feedback: Feedback) -> bool:
        """Send email notification via SendGrid"""
        try:
            if not hasattr(settings, 'SENDGRID_API_KEY') or not settings.SENDGRID_API_KEY:
                logger.warning("SendGrid API key not configured")
                return False

            if not hasattr(settings, 'FEEDBACK_ALERT_EMAIL') or not settings.FEEDBACK_ALERT_EMAIL:
                logger.warning("Feedback alert email not configured")
                return False

            # Prepare email content
            subject = f"[{feedback.feedback_type.value.upper()}] New Feedback from {feedback.user_email or 'Anonymous'}"
            
            # SendGrid API call
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.sendgrid.com/v3/mail/send",
                    headers={
                        "Authorization": f"Bearer {settings.SENDGRID_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "personalizations": [
                            {
                                "to": [{"email": settings.FEEDBACK_ALERT_EMAIL}],
                                "subject": subject
                            }
                        ],
                        "from": {"email": "feedback@ytsbyai.com", "name": "YTS by AI Feedback"},
                        "content": [
                            {
                                "type": "text/html",
                                "value": self._generate_email_content(feedback)
                            }
                        ]
                    }
                )
                
                if response.status_code == 202:
                    logger.info(f"Email notification sent successfully: {feedback.id}")
                    return True
                else:
                    logger.error(f"Failed to send email notification: {response.status_code}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error sending email notification: {e}")
            return False

    def _generate_email_content(self, feedback: Feedback) -> str:
        """Generate HTML email content"""
        type_colors = {
            FeedbackType.BUG: "#EF4444",
            FeedbackType.ISSUE: "#F59E0B",
            FeedbackType.IDEA: "#10B981",
            FeedbackType.FEATURE: "#3B82F6",
            FeedbackType.GENERAL: "#6B7280"
        }
        
        return f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: {type_colors[feedback.feedback_type]}; color: white; padding: 20px; border-radius: 8px;">
                <h2 style="margin: 0;">New Feedback: {feedback.feedback_type.value.upper()}</h2>
            </div>
            <div style="padding: 20px; background-color: #f9fafb;">
                <div style="background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid {type_colors[feedback.feedback_type]};">
                    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">{feedback.message}</p>
                    
                    <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 4px;">
                        <strong>Feedback Details:</strong><br>
                        <strong>Type:</strong> {feedback.feedback_type.value}<br>
                        <strong>User:</strong> {feedback.user_email or 'Anonymous'}<br>
                        <strong>Time:</strong> {feedback.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}<br>
                        <strong>ID:</strong> {feedback.id}<br>
                        {f'<strong>Page:</strong> {feedback.page_url}<br>' if feedback.page_url else ''}
                        {f'<strong>IP:</strong> {feedback.ip_address}<br>' if feedback.ip_address else ''}
                    </div>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 4px;">
                    <strong>Action Required:</strong><br>
                    Please review this feedback in the admin dashboard at <a href="https://ytsbyai.com/admin/analytics">https://ytsbyai.com/admin/analytics</a>
                </div>
            </div>
        </body>
        </html>
        """

    async def _send_slack_notification(self, feedback: Feedback) -> bool:
        """Send Slack notification via webhook"""
        try:
            if not hasattr(settings, 'SLACK_WEBHOOK_FEEDBACK') or not settings.SLACK_WEBHOOK_FEEDBACK:
                return False

            type_emoji = {
                FeedbackType.BUG: "🐛",
                FeedbackType.ISSUE: "⚠️",
                FeedbackType.IDEA: "💡",
                FeedbackType.FEATURE: "🚀",
                FeedbackType.GENERAL: "💬"
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    settings.SLACK_WEBHOOK_FEEDBACK,
                    json={
                        "text": f"{type_emoji[feedback.feedback_type]} *New {feedback.feedback_type.value.upper()} Feedback*",
                        "attachments": [
                            {
                                "color": "good" if feedback.feedback_type in [FeedbackType.IDEA, FeedbackType.FEATURE] else "warning",
                                "fields": [
                                    {
                                        "title": "Message",
                                        "value": feedback.message[:200] + ("..." if len(feedback.message) > 200 else ""),
                                        "short": False
                                    },
                                    {
                                        "title": "User",
                                        "value": feedback.user_email or "Anonymous",
                                        "short": True
                                    },
                                    {
                                        "title": "Time",
                                        "value": feedback.created_at.strftime('%H:%M:%S UTC'),
                                        "short": True
                                    }
                                ],
                                "footer": f"ID: {feedback.id}"
                            }
                        ]
                    }
                )
                
                if response.status_code == 200:
                    logger.info(f"Slack notification sent successfully: {feedback.id}")
                    return True
                else:
                    logger.error(f"Failed to send Slack notification: {response.status_code}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error sending Slack notification: {e}")
            return False

# Global feedback service instance
feedback_service = FeedbackService() 