import redis
import json
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from pydantic import BaseModel
from app.core.config import settings
import firebase_admin
from firebase_admin import auth
import logging

logger = logging.getLogger(__name__)

class FeatureRequest(BaseModel):
    id: str
    title: str
    description: str
    feature_type: str  # "enhancement", "bug_fix", "new_feature", "ui_improvement"
    category: str  # "beginner", "pro", "everyone"
    author_id: str
    author_email: str
    author_type: str  # "beginner", "pro", "unknown"
    created_at: str
    updated_at: str
    vote_count: int = 0
    upvotes: int = 0
    downvotes: int = 0
    status: str = "pending"  # "pending", "planned", "in_progress", "completed", "rejected"
    tags: List[str] = []
    screenshot_url: Optional[str] = None
    audio_url: Optional[str] = None
    video_url: Optional[str] = None
    priority: str = "medium"  # "low", "medium", "high", "critical"
    estimated_effort: Optional[str] = None
    assigned_to: Optional[str] = None
    comments_count: int = 0
    helpful_count: int = 0  # How many users found this helpful
    difficulty_level: str = "easy"  # "easy", "medium", "hard"
    target_audience: List[str] = []  # ["kids", "beginners", "pros", "elderly"]

class Vote(BaseModel):
    user_id: str
    feature_id: str
    vote_type: str  # "upvote" or "downvote"
    user_type: str  # "beginner", "pro", "unknown"
    created_at: str

class UserProfile(BaseModel):
    user_id: str
    user_type: str  # "beginner", "pro", "unknown"
    created_at: str
    feature_count: int = 0
    vote_count: int = 0
    helpful_votes: int = 0
    badges: List[str] = []

class FeatureRequestService:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            password=settings.REDIS_PASSWORD,
            db=settings.REDIS_DB,
            decode_responses=True
        )
        self.ttl_days = 30
        self.ttl_seconds = self.ttl_days * 24 * 60 * 60

    def _get_feature_key(self, feature_id: str) -> str:
        return f"feature:{feature_id}"

    def _get_vote_key(self, feature_id: str, user_id: str) -> str:
        return f"vote:{feature_id}:{user_id}"

    def _get_features_list_key(self) -> str:
        return "features:list"

    def _get_user_votes_key(self, user_id: str) -> str:
        return f"user_votes:{user_id}"

    def _get_user_profile_key(self, user_id: str) -> str:
        return f"user_profile:{user_id}"

    def _get_category_key(self, category: str) -> str:
        return f"features:category:{category}"

    def _get_difficulty_key(self, difficulty: str) -> str:
        return f"features:difficulty:{difficulty}"

    def _get_audience_key(self, audience: str) -> str:
        return f"features:audience:{audience}"

    def create_feature_request(
        self,
        title: str,
        description: str,
        feature_type: str,
        category: str,
        author_id: str,
        author_email: str,
        author_type: str = "unknown",
        tags: List[str] = None,
        screenshot_url: Optional[str] = None,
        audio_url: Optional[str] = None,
        video_url: Optional[str] = None,
        priority: str = "medium",
        estimated_effort: Optional[str] = None,
        difficulty_level: str = "easy",
        target_audience: List[str] = None
    ) -> FeatureRequest:
        """Create a new feature request with universal design support"""
        try:
            feature_id = str(uuid.uuid4())
            now = datetime.utcnow().isoformat()
            
            feature = FeatureRequest(
                id=feature_id,
                title=title,
                description=description,
                feature_type=feature_type,
                category=category,
                author_id=author_id,
                author_email=author_email,
                author_type=author_type,
                created_at=now,
                updated_at=now,
                tags=tags or [],
                screenshot_url=screenshot_url,
                audio_url=audio_url,
                video_url=video_url,
                priority=priority,
                estimated_effort=estimated_effort,
                difficulty_level=difficulty_level,
                target_audience=target_audience or []
            )

            # Store feature request
            feature_key = self._get_feature_key(feature_id)
            self.redis_client.setex(
                feature_key,
                self.ttl_seconds,
                feature.json()
            )

            # Add to features list
            features_list_key = self._get_features_list_key()
            self.redis_client.zadd(
                features_list_key,
                {feature_id: datetime.utcnow().timestamp()}
            )
            self.redis_client.expire(features_list_key, self.ttl_seconds)

            # Add to category-specific lists
            category_key = self._get_category_key(category)
            self.redis_client.zadd(category_key, {feature_id: datetime.utcnow().timestamp()})
            self.redis_client.expire(category_key, self.ttl_seconds)

            # Add to difficulty lists
            difficulty_key = self._get_difficulty_key(difficulty_level)
            self.redis_client.zadd(difficulty_key, {feature_id: datetime.utcnow().timestamp()})
            self.redis_client.expire(difficulty_key, self.ttl_seconds)

            # Add to audience lists
            for audience in target_audience or []:
                audience_key = self._get_audience_key(audience)
                self.redis_client.zadd(audience_key, {feature_id: datetime.utcnow().timestamp()})
                self.redis_client.expire(audience_key, self.ttl_seconds)

            # Update user profile
            self._update_user_profile(author_id, feature_count=1)

            logger.info(f"Created feature request: {feature_id} by {author_id} (type: {author_type})")
            return feature

        except Exception as e:
            logger.error(f"Error creating feature request: {e}")
            raise

    def get_feature_request(self, feature_id: str) -> Optional[FeatureRequest]:
        """Get a feature request by ID"""
        try:
            feature_key = self._get_feature_key(feature_id)
            feature_data = self.redis_client.get(feature_key)
            
            if feature_data:
                return FeatureRequest.parse_raw(feature_data)
            return None

        except Exception as e:
            logger.error(f"Error getting feature request {feature_id}: {e}")
            return None

    def list_feature_requests(
        self,
        limit: int = 100,
        offset: int = 0,
        sort_by: str = "votes",  # "votes", "recent", "priority"
        category: Optional[str] = None,
        difficulty_level: Optional[str] = None,
        target_audience: Optional[str] = None,
        user_type: Optional[str] = None,
        status: Optional[str] = None,
        priority: Optional[str] = None
    ) -> List[FeatureRequest]:
        """List feature requests with universal design filtering"""
        try:
            # Determine which sorted set to use based on filters
            if category:
                list_key = self._get_category_key(category)
            elif difficulty_level:
                list_key = self._get_difficulty_key(difficulty_level)
            elif target_audience:
                list_key = self._get_audience_key(target_audience)
            else:
                list_key = self._get_features_list_key()

            # Get feature IDs based on sort criteria
            if sort_by == "votes":
                # Get all features and sort by vote count
                feature_ids = self.redis_client.zrange(list_key, 0, -1)
                features = []
                for fid in feature_ids:
                    feature = self.get_feature_request(fid)
                    if feature:
                        features.append(feature)
                
                # Sort by vote count (descending)
                features.sort(key=lambda x: x.vote_count, reverse=True)
            else:
                # Sort by timestamp (recent first)
                feature_ids = self.redis_client.zrevrange(list_key, offset, offset + limit - 1)
                features = []
                for fid in feature_ids:
                    feature = self.get_feature_request(fid)
                    if feature:
                        features.append(feature)

            # Apply additional filters
            if status:
                features = [f for f in features if f.status == status]
            if priority:
                features = [f for f in features if f.priority == priority]
            if user_type:
                # Filter based on user type preferences
                if user_type == "beginner":
                    features = [f for f in features if f.category in ["beginner", "everyone"]]
                elif user_type == "pro":
                    features = [f for f in features if f.category in ["pro", "everyone"]]

            return features[:limit]

        except Exception as e:
            logger.error(f"Error listing feature requests: {e}")
            return []

    def vote_feature_request(
        self,
        feature_id: str,
        user_id: str,
        vote_type: str,
        user_type: str = "unknown"
    ) -> Tuple[bool, str]:
        """Vote on a feature request with user type tracking"""
        try:
            # Verify user exists in Firebase
            try:
                user = auth.get_user(user_id)
            except Exception:
                return False, "Invalid user ID"

            # Check if user already voted
            vote_key = self._get_vote_key(feature_id, user_id)
            existing_vote = self.redis_client.get(vote_key)

            # Get feature request
            feature = self.get_feature_request(feature_id)
            if not feature:
                return False, "Feature request not found"

            now = datetime.utcnow().isoformat()

            if existing_vote:
                # User already voted - update vote
                existing_vote_data = json.loads(existing_vote)
                old_vote_type = existing_vote_data.get("vote_type")

                if old_vote_type == vote_type:
                    # Remove vote
                    self.redis_client.delete(vote_key)
                    
                    if vote_type == "upvote":
                        feature.upvotes = max(0, feature.upvotes - 1)
                    else:
                        feature.downvotes = max(0, feature.downvotes - 1)
                    
                    feature.vote_count = feature.upvotes - feature.downvotes
                    message = "Vote removed"
                else:
                    # Change vote
                    if old_vote_type == "upvote":
                        feature.upvotes = max(0, feature.upvotes - 1)
                    else:
                        feature.downvotes = max(0, feature.downvotes - 1)

                    if vote_type == "upvote":
                        feature.upvotes += 1
                    else:
                        feature.downvotes += 1

                    feature.vote_count = feature.upvotes - feature.downvotes
                    
                    # Update vote record
                    vote_data = {
                        "user_id": user_id,
                        "feature_id": feature_id,
                        "vote_type": vote_type,
                        "user_type": user_type,
                        "created_at": now
                    }
                    self.redis_client.setex(vote_key, self.ttl_seconds, json.dumps(vote_data))
                    message = "Vote updated"
            else:
                # New vote
                if vote_type == "upvote":
                    feature.upvotes += 1
                else:
                    feature.downvotes += 1

                feature.vote_count = feature.upvotes - feature.downvotes
                
                # Store vote record
                vote_data = {
                    "user_id": user_id,
                    "feature_id": feature_id,
                    "vote_type": vote_type,
                    "user_type": user_type,
                    "created_at": now
                }
                self.redis_client.setex(vote_key, self.ttl_seconds, json.dumps(vote_data))
                message = "Vote recorded"

            # Update feature request
            feature.updated_at = now
            feature_key = self._get_feature_key(feature_id)
            self.redis_client.setex(feature_key, self.ttl_seconds, feature.json())

            # Update user's vote tracking
            user_votes_key = self._get_user_votes_key(user_id)
            self.redis_client.sadd(user_votes_key, feature_id)
            self.redis_client.expire(user_votes_key, self.ttl_seconds)

            # Update user profile
            self._update_user_profile(user_id, vote_count=1)

            logger.info(f"User {user_id} ({user_type}) voted {vote_type} on feature {feature_id}")
            return True, message

        except Exception as e:
            logger.error(f"Error voting on feature request: {e}")
            return False, "Error processing vote"

    def _update_user_profile(self, user_id: str, feature_count: int = 0, vote_count: int = 0):
        """Update user profile with activity"""
        try:
            profile_key = self._get_user_profile_key(user_id)
            profile_data = self.redis_client.get(profile_key)
            
            if profile_data:
                profile = json.loads(profile_data)
                profile["feature_count"] += feature_count
                profile["vote_count"] += vote_count
            else:
                profile = {
                    "user_id": user_id,
                    "user_type": "unknown",
                    "created_at": datetime.utcnow().isoformat(),
                    "feature_count": feature_count,
                    "vote_count": vote_count,
                    "helpful_votes": 0,
                    "badges": []
                }

            # Check for badges
            if profile["feature_count"] >= 3:
                if "feature_creator" not in profile["badges"]:
                    profile["badges"].append("feature_creator")
            
            if profile["vote_count"] >= 10:
                if "active_voter" not in profile["badges"]:
                    profile["badges"].append("active_voter")

            self.redis_client.setex(profile_key, self.ttl_seconds, json.dumps(profile))

        except Exception as e:
            logger.error(f"Error updating user profile: {e}")

    def get_user_vote(self, feature_id: str, user_id: str) -> Optional[str]:
        """Get user's vote on a feature request"""
        try:
            vote_key = self._get_vote_key(feature_id, user_id)
            vote_data = self.redis_client.get(vote_key)
            
            if vote_data:
                vote = json.loads(vote_data)
                return vote.get("vote_type")
            return None

        except Exception as e:
            logger.error(f"Error getting user vote: {e}")
            return None

    def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """Get user profile with badges and stats"""
        try:
            profile_key = self._get_user_profile_key(user_id)
            profile_data = self.redis_client.get(profile_key)
            
            if profile_data:
                return UserProfile.parse_raw(profile_data)
            return None

        except Exception as e:
            logger.error(f"Error getting user profile: {e}")
            return None

    def update_feature_status(
        self,
        feature_id: str,
        status: str,
        assigned_to: Optional[str] = None,
        estimated_effort: Optional[str] = None
    ) -> bool:
        """Update feature request status (admin only)"""
        try:
            feature = self.get_feature_request(feature_id)
            if not feature:
                return False

            feature.status = status
            feature.updated_at = datetime.utcnow().isoformat()
            
            if assigned_to:
                feature.assigned_to = assigned_to
            if estimated_effort:
                feature.estimated_effort = estimated_effort

            feature_key = self._get_feature_key(feature_id)
            self.redis_client.setex(feature_key, self.ttl_seconds, feature.json())

            logger.info(f"Updated feature {feature_id} status to {status}")
            return True

        except Exception as e:
            logger.error(f"Error updating feature status: {e}")
            return False

    def delete_feature_request(self, feature_id: str) -> bool:
        """Delete a feature request (admin only)"""
        try:
            # Get feature to check if it exists
            feature = self.get_feature_request(feature_id)
            if not feature:
                return False

            # Delete feature
            feature_key = self._get_feature_key(feature_id)
            self.redis_client.delete(feature_key)

            # Remove from lists
            features_list_key = self._get_features_list_key()
            self.redis_client.zrem(features_list_key, feature_id)

            # Remove from category and difficulty lists
            category_key = self._get_category_key(feature.category)
            self.redis_client.zrem(category_key, feature_id)

            difficulty_key = self._get_difficulty_key(feature.difficulty_level)
            self.redis_client.zrem(difficulty_key, feature_id)

            # Remove from audience lists
            for audience in feature.target_audience:
                audience_key = self._get_audience_key(audience)
                self.redis_client.zrem(audience_key, feature_id)

            # Delete all votes for this feature
            pattern = f"vote:{feature_id}:*"
            for key in self.redis_client.scan_iter(match=pattern):
                self.redis_client.delete(key)

            logger.info(f"Deleted feature request: {feature_id}")
            return True

        except Exception as e:
            logger.error(f"Error deleting feature request: {e}")
            return False

    def get_feature_stats(self) -> Dict:
        """Get feature request statistics with universal design metrics"""
        try:
            features_list_key = self._get_features_list_key()
            total_features = self.redis_client.zcard(features_list_key)
            
            # Get features by status
            all_features = self.list_feature_requests(limit=1000)
            status_counts = {}
            category_counts = {}
            difficulty_counts = {}
            audience_counts = {}
            total_votes = 0

            for feature in all_features:
                status_counts[feature.status] = status_counts.get(feature.status, 0) + 1
                category_counts[feature.category] = category_counts.get(feature.category, 0) + 1
                difficulty_counts[feature.difficulty_level] = difficulty_counts.get(feature.difficulty_level, 0) + 1
                for audience in feature.target_audience:
                    audience_counts[audience] = audience_counts.get(audience, 0) + 1
                total_votes += feature.vote_count

            return {
                "total_features": total_features,
                "status_counts": status_counts,
                "category_counts": category_counts,
                "difficulty_counts": difficulty_counts,
                "audience_counts": audience_counts,
                "total_votes": total_votes,
                "avg_votes_per_feature": total_votes / max(total_features, 1)
            }

        except Exception as e:
            logger.error(f"Error getting feature stats: {e}")
            return {}

    def get_top_voters(self, limit: int = 10) -> List[Dict]:
        """Get top voters (users who voted the most)"""
        try:
            # Get all user vote keys
            user_vote_keys = []
            for key in self.redis_client.scan_iter(match="user_votes:*"):
                user_vote_keys.append(key)

            voter_counts = []
            for key in user_vote_keys:
                user_id = key.split(":")[1]
                vote_count = self.redis_client.scard(key)
                voter_counts.append({
                    "user_id": user_id,
                    "vote_count": vote_count
                })

            # Sort by vote count and return top voters
            voter_counts.sort(key=lambda x: x["vote_count"], reverse=True)
            return voter_counts[:limit]

        except Exception as e:
            logger.error(f"Error getting top voters: {e}")
            return []

    def search_feature_requests(
        self,
        query: str,
        limit: int = 50,
        user_type: Optional[str] = None
    ) -> List[FeatureRequest]:
        """Search feature requests by title and description with user type filtering"""
        try:
            all_features = self.list_feature_requests(limit=1000, user_type=user_type)
            query_lower = query.lower()
            
            matching_features = []
            for feature in all_features:
                if (query_lower in feature.title.lower() or 
                    query_lower in feature.description.lower() or
                    any(query_lower in tag.lower() for tag in feature.tags)):
                    matching_features.append(feature)

            # Sort by relevance (vote count as proxy)
            matching_features.sort(key=lambda x: x.vote_count, reverse=True)
            return matching_features[:limit]

        except Exception as e:
            logger.error(f"Error searching feature requests: {e}")
            return []

# Global service instance
feature_request_service = FeatureRequestService() 