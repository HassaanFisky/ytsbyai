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

class AlertLevel(Enum):
    SUCCESS = "success"
    WARNING = "warning"
    DANGER = "danger"
    INFO = "info"

class AlertType(Enum):
    HIGH_USAGE = "high_usage"
    QUOTA_ABUSE = "quota_abuse"
    CONVERSION_SPIKE = "conversion_spike"
    SYSTEM_ERROR = "system_error"
    SECURITY_THREAT = "security_threat"
    PERFORMANCE_ISSUE = "performance_issue"

class Alert:
    def __init__(
        self,
        alert_type: AlertType,
        level: AlertLevel,
        title: str,
        message: str,
        data: Dict[str, Any] = None,
        expires_at: datetime = None
    ):
        self.id = f"{alert_type.value}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        self.alert_type = alert_type
        self.level = level
        self.title = title
        self.message = message
        self.data = data or {}
        self.created_at = datetime.utcnow()
        self.expires_at = expires_at or (datetime.utcnow() + timedelta(hours=24))
        self.is_dismissed = False

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "alert_type": self.alert_type.value,
            "level": self.level.value,
            "title": self.title,
            "message": self.message,
            "data": self.data,
            "created_at": self.created_at.isoformat(),
            "expires_at": self.expires_at.isoformat(),
            "is_dismissed": self.is_dismissed
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Alert':
        alert = cls(
            alert_type=AlertType(data["alert_type"]),
            level=AlertLevel(data["level"]),
            title=data["title"],
            message=data["message"],
            data=data.get("data", {})
        )
        alert.id = data["id"]
        alert.created_at = datetime.fromisoformat(data["created_at"])
        alert.expires_at = datetime.fromisoformat(data["expires_at"])
        alert.is_dismissed = data.get("is_dismissed", False)
        return alert

class AlertsService:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            password=settings.REDIS_PASSWORD,
            decode_responses=True
        )
        self.alerts_key = "admin:alerts"
        self.thresholds = {
            "high_usage": {
                "sessions_per_hour": 100,
                "conversions_per_minute": 10,
                "quota_exceeded_per_hour": 50
            },
            "quota_abuse": {
                "summary_quota_exceeded": 80,
                "transcription_quota_exceeded": 60
            },
            "security": {
                "failed_auth_attempts": 20,
                "suspicious_ips": 5
            }
        }
        
    async def _send_email_alert(self, alert: Alert) -> bool:
        """Send email alert via SendGrid"""
        try:
            if not hasattr(settings, 'SENDGRID_API_KEY') or not settings.SENDGRID_API_KEY:
                logger.warning("SendGrid API key not configured")
                return False

            if not hasattr(settings, 'ALERT_EMAIL') or not settings.ALERT_EMAIL:
                logger.warning("Alert email not configured")
                return False

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
                                "to": [{"email": settings.ALERT_EMAIL}],
                                "subject": f"[YTS by AI Alert] {alert.title}"
                            }
                        ],
                        "from": {"email": "alerts@ytsbyai.com", "name": "YTS by AI Alerts"},
                        "content": [
                            {
                                "type": "text/html",
                                "value": self._generate_email_content(alert)
                            }
                        ]
                    }
                )
                
                if response.status_code == 202:
                    logger.info(f"Email alert sent successfully: {alert.id}")
                    return True
                else:
                    logger.error(f"Failed to send email alert: {response.status_code}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error sending email alert: {e}")
            return False

    def _generate_email_content(self, alert: Alert) -> str:
        """Generate HTML email content"""
        level_colors = {
            AlertLevel.SUCCESS: "#10B981",
            AlertLevel.WARNING: "#F59E0B", 
            AlertLevel.DANGER: "#EF4444",
            AlertLevel.INFO: "#3B82F6"
        }
        
        return f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: {level_colors[alert.level]}; color: white; padding: 20px; border-radius: 8px;">
                <h2 style="margin: 0;">{alert.title}</h2>
            </div>
            <div style="padding: 20px; background-color: #f9fafb;">
                <p style="margin: 0 0 20px 0; font-size: 16px;">{alert.message}</p>
                <div style="background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid {level_colors[alert.level]};">
                    <strong>Alert Details:</strong><br>
                    <strong>Type:</strong> {alert.alert_type.value}<br>
                    <strong>Level:</strong> {alert.level.value}<br>
                    <strong>Time:</strong> {alert.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}<br>
                    <strong>ID:</strong> {alert.id}
                </div>
                <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 4px;">
                    <strong>Action Required:</strong><br>
                    Please review the admin dashboard at <a href="https://ytsbyai.com/admin/analytics">https://ytsbyai.com/admin/analytics</a>
                </div>
            </div>
        </body>
        </html>
        """

    async def _send_slack_alert(self, alert: Alert) -> bool:
        """Send Slack alert via webhook (optional)"""
        try:
            if not hasattr(settings, 'SLACK_WEBHOOK_URL') or not settings.SLACK_WEBHOOK_URL:
                return False

            level_emoji = {
                AlertLevel.SUCCESS: "✅",
                AlertLevel.WARNING: "⚠️",
                AlertLevel.DANGER: "🚨",
                AlertLevel.INFO: "ℹ️"
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    settings.SLACK_WEBHOOK_URL,
                    json={
                        "text": f"{level_emoji[alert.level]} *{alert.title}*",
                        "attachments": [
                            {
                                "color": alert.level.value,
                                "fields": [
                                    {
                                        "title": "Message",
                                        "value": alert.message,
                                        "short": False
                                    },
                                    {
                                        "title": "Type",
                                        "value": alert.alert_type.value,
                                        "short": True
                                    },
                                    {
                                        "title": "Time",
                                        "value": alert.created_at.strftime('%H:%M:%S UTC'),
                                        "short": True
                                    }
                                ]
                            }
                        ]
                    }
                )
                
                if response.status_code == 200:
                    logger.info(f"Slack alert sent successfully: {alert.id}")
                    return True
                else:
                    logger.error(f"Failed to send Slack alert: {response.status_code}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error sending Slack alert: {e}")
            return False

    async def create_alert(
        self,
        alert_type: AlertType,
        level: AlertLevel,
        title: str,
        message: str,
        data: Dict[str, Any] = None,
        send_email: bool = True,
        send_slack: bool = False
    ) -> Alert:
        """Create and store a new alert"""
        try:
            alert = Alert(alert_type, level, title, message, data)
            
            # Store in Redis
            alert_data = alert.to_dict()
            self.redis_client.lpush(self.alerts_key, json.dumps(alert_data))
            
            # Set expiration for the alert (24 hours)
            self.redis_client.expire(self.alerts_key, 86400)  # 24 hours
            
            # Send notifications
            if send_email:
                await self._send_email_alert(alert)
            
            if send_slack:
                await self._send_slack_alert(alert)
            
            logger.info(f"Alert created: {alert.id} - {title}")
            return alert
            
        except Exception as e:
            logger.error(f"Error creating alert: {e}")
            raise

    async def get_active_alerts(self) -> List[Alert]:
        """Get all active (non-expired, non-dismissed) alerts"""
        try:
            alerts_data = self.redis_client.lrange(self.alerts_key, 0, -1)
            alerts = []
            
            for alert_json in alerts_data:
                try:
                    alert_dict = json.loads(alert_json)
                    alert = Alert.from_dict(alert_dict)
                    
                    # Check if alert is still active
                    if (not alert.is_dismissed and 
                        alert.expires_at > datetime.utcnow()):
                        alerts.append(alert)
                        
                except Exception as e:
                    logger.error(f"Error parsing alert: {e}")
                    continue
            
            # Sort by creation time (newest first)
            alerts.sort(key=lambda x: x.created_at, reverse=True)
            return alerts
            
        except Exception as e:
            logger.error(f"Error getting active alerts: {e}")
            return []

    async def dismiss_alert(self, alert_id: str) -> bool:
        """Dismiss an alert"""
        try:
            alerts_data = self.redis_client.lrange(self.alerts_key, 0, -1)
            
            for i, alert_json in enumerate(alerts_data):
                alert_dict = json.loads(alert_json)
                if alert_dict["id"] == alert_id:
                    alert_dict["is_dismissed"] = True
                    self.redis_client.lset(self.alerts_key, i, json.dumps(alert_dict))
                    logger.info(f"Alert dismissed: {alert_id}")
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error dismissing alert: {e}")
            return False

    async def clear_expired_alerts(self) -> int:
        """Clear expired alerts from Redis"""
        try:
            alerts_data = self.redis_client.lrange(self.alerts_key, 0, -1)
            expired_count = 0
            
            for alert_json in alerts_data:
                alert_dict = json.loads(alert_json)
                alert = Alert.from_dict(alert_dict)
                
                if alert.expires_at <= datetime.utcnow():
                    # Remove expired alert
                    self.redis_client.lrem(self.alerts_key, 1, alert_json)
                    expired_count += 1
            
            if expired_count > 0:
                logger.info(f"Cleared {expired_count} expired alerts")
            
            return expired_count
            
        except Exception as e:
            logger.error(f"Error clearing expired alerts: {e}")
            return 0

    async def check_usage_thresholds(self, demo_stats: Dict[str, Any]) -> List[Alert]:
        """Check demo portal usage against thresholds and create alerts"""
        alerts = []
        
        try:
            # Check for high usage
            total_sessions = demo_stats.get("total_sessions", 0)
            active_sessions = demo_stats.get("active_sessions", 0)
            
            if active_sessions > self.thresholds["high_usage"]["sessions_per_hour"]:
                alert = await self.create_alert(
                    AlertType.HIGH_USAGE,
                    AlertLevel.WARNING,
                    "High Demo Portal Usage",
                    f"Active sessions ({active_sessions}) exceeded threshold of {self.thresholds['high_usage']['sessions_per_hour']} per hour",
                    {"active_sessions": active_sessions, "threshold": self.thresholds["high_usage"]["sessions_per_hour"]}
                )
                alerts.append(alert)
            
            # Check for quota abuse
            quota_exceeded = demo_stats.get("quota_exceeded_counts", {})
            summary_exceeded = quota_exceeded.get("summary", 0)
            transcription_exceeded = quota_exceeded.get("transcription", 0)
            
            if summary_exceeded > self.thresholds["quota_abuse"]["summary_quota_exceeded"]:
                alert = await self.create_alert(
                    AlertType.QUOTA_ABUSE,
                    AlertLevel.DANGER,
                    "Summary Quota Abuse Detected",
                    f"Summary quota exceeded {summary_exceeded} times, exceeding threshold of {self.thresholds['quota_abuse']['summary_quota_exceeded']}",
                    {"summary_exceeded": summary_exceeded, "threshold": self.thresholds["quota_abuse"]["summary_quota_exceeded"]}
                )
                alerts.append(alert)
            
            if transcription_exceeded > self.thresholds["quota_abuse"]["transcription_quota_exceeded"]:
                alert = await self.create_alert(
                    AlertType.QUOTA_ABUSE,
                    AlertLevel.DANGER,
                    "Transcription Quota Abuse Detected",
                    f"Transcription quota exceeded {transcription_exceeded} times, exceeding threshold of {self.thresholds['quota_abuse']['transcription_quota_exceeded']}",
                    {"transcription_exceeded": transcription_exceeded, "threshold": self.thresholds["quota_abuse"]["transcription_quota_exceeded"]}
                )
                alerts.append(alert)
            
            # Check for conversion spikes
            conversion_clicks = demo_stats.get("conversion_clicks", {})
            total_conversions = conversion_clicks.get("signup", 0) + conversion_clicks.get("stripe", 0)
            
            if total_conversions > self.thresholds["high_usage"]["conversions_per_minute"]:
                alert = await self.create_alert(
                    AlertType.CONVERSION_SPIKE,
                    AlertLevel.SUCCESS,
                    "Conversion Spike Detected",
                    f"High conversion rate detected: {total_conversions} conversions in the last period",
                    {"total_conversions": total_conversions, "threshold": self.thresholds["high_usage"]["conversions_per_minute"]}
                )
                alerts.append(alert)
            
            return alerts
            
        except Exception as e:
            logger.error(f"Error checking usage thresholds: {e}")
            return []

    async def create_test_alert(self) -> Alert:
        """Create a test alert for testing purposes"""
        return await self.create_alert(
            AlertType.SYSTEM_ERROR,
            AlertLevel.INFO,
            "Test Alert",
            "This is a test alert to verify the notification system is working correctly.",
            {"test": True, "timestamp": datetime.utcnow().isoformat()},
            send_email=True,
            send_slack=False
        )

# Global alerts service instance
alerts_service = AlertsService() 