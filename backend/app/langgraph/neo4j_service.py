import logging
from typing import Dict, List, Any, Optional
from neo4j import GraphDatabase
from app.core.config import settings

logger = logging.getLogger(__name__)

class Neo4jService:
    """Neo4j service for graph storage operations"""
    
    def __init__(self):
        self.driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
        )
        self._ensure_constraints()
    
    def _ensure_constraints(self):
        """Ensure Neo4j constraints exist"""
        try:
            with self.driver.session(database=settings.NEO4J_DATABASE) as session:
                # Create constraints if they don't exist
                session.run("CREATE CONSTRAINT video_id IF NOT EXISTS FOR (v:Video) REQUIRE v.video_id IS UNIQUE")
                session.run("CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.user_id IS UNIQUE")
                session.run("CREATE CONSTRAINT topic_name IF NOT EXISTS FOR (t:Topic) REQUIRE t.name IS UNIQUE")
                session.run("CREATE CONSTRAINT category_name IF NOT EXISTS FOR (c:Category) REQUIRE c.name IS UNIQUE")
                session.run("CREATE CONSTRAINT tag_name IF NOT EXISTS FOR (tag:Tag) REQUIRE tag.name IS UNIQUE")
        except Exception as e:
            logger.warning(f"Could not create constraints: {e}")
    
    async def store_summary(self, 
                          video_id: str,
                          user_id: str,
                          title: str,
                          summary: str,
                          topic: str,
                          category: str,
                          confidence: float,
                          subcategories: List[str],
                          tags: List[str],
                          key_points: List[str],
                          tone: str) -> str:
        """Store summary in Neo4j graph database"""
        
        try:
            with self.driver.session(database=settings.NEO4J_DATABASE) as session:
                # Create the graph structure
                result = session.run("""
                    MERGE (v:Video {video_id: $video_id})
                    SET v.title = $title,
                        v.summary = $summary,
                        v.tone = $tone,
                        v.confidence = $confidence,
                        v.created_at = datetime()
                    
                    MERGE (u:User {user_id: $user_id})
                    
                    MERGE (t:Topic {name: $topic})
                    
                    MERGE (c:Category {name: $category})
                    
                    MERGE (u)-[:CREATED]->(v)
                    MERGE (v)-[:HAS_TOPIC]->(t)
                    MERGE (v)-[:IN_CATEGORY]->(c)
                    MERGE (t)-[:BELONGS_TO]->(c)
                    
                    WITH v, u, t, c
                    UNWIND $subcategories as subcat
                    MERGE (sc:Subcategory {name: subcat})
                    MERGE (v)-[:HAS_SUBCATEGORY]->(sc)
                    MERGE (sc)-[:BELONGS_TO]->(t)
                    
                    WITH v, u, t, c
                    UNWIND $tags as tag_name
                    MERGE (tag:Tag {name: tag_name})
                    MERGE (v)-[:HAS_TAG]->(tag)
                    
                    WITH v, u, t, c
                    UNWIND $key_points as point
                    CREATE (kp:KeyPoint {text: point})
                    MERGE (v)-[:HAS_KEY_POINT]->(kp)
                    
                    RETURN v.video_id as video_id
                """, {
                    'video_id': video_id,
                    'user_id': user_id,
                    'title': title,
                    'summary': summary,
                    'topic': topic,
                    'category': category,
                    'confidence': confidence,
                    'subcategories': subcategories,
                    'tags': tags,
                    'key_points': key_points,
                    'tone': tone
                })
                
                record = result.single()
                return record["video_id"] if record else video_id
                
        except Exception as e:
            logger.error(f"Neo4j storage error: {e}")
            raise e
    
    async def get_user_summaries(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get all summaries for a user"""
        try:
            with self.driver.session(database=settings.NEO4J_DATABASE) as session:
                result = session.run("""
                    MATCH (u:User {user_id: $user_id})-[:CREATED]->(v:Video)
                    OPTIONAL MATCH (v)-[:HAS_TOPIC]->(t:Topic)
                    OPTIONAL MATCH (v)-[:IN_CATEGORY]->(c:Category)
                    OPTIONAL MATCH (v)-[:HAS_TAG]->(tag:Tag)
                    OPTIONAL MATCH (v)-[:HAS_KEY_POINT]->(kp:KeyPoint)
                    
                    RETURN v, t, c, 
                           collect(DISTINCT tag.name) as tags,
                           collect(DISTINCT kp.text) as key_points
                    ORDER BY v.created_at DESC
                    LIMIT $limit
                """, {'user_id': user_id, 'limit': limit})
                
                summaries = []
                for record in result:
                    video = record["v"]
                    summaries.append({
                        "video_id": video["video_id"],
                        "title": video["title"],
                        "summary": video["summary"],
                        "tone": video["tone"],
                        "confidence": video["confidence"],
                        "topic": record["t"]["name"] if record["t"] else None,
                        "category": record["c"]["name"] if record["c"] else None,
                        "tags": record["tags"],
                        "key_points": record["key_points"],
                        "created_at": video["created_at"].isoformat() if video["created_at"] else None
                    })
                
                return summaries
                
        except Exception as e:
            logger.error(f"Neo4j query error: {e}")
            return []
    
    async def search_by_topic(self, topic: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Search summaries by topic"""
        try:
            with self.driver.session(database=settings.NEO4J_DATABASE) as session:
                result = session.run("""
                    MATCH (t:Topic {name: $topic})<-[:HAS_TOPIC]-(v:Video)
                    OPTIONAL MATCH (v)-[:IN_CATEGORY]->(c:Category)
                    OPTIONAL MATCH (v)-[:HAS_TAG]->(tag:Tag)
                    
                    RETURN v, c, collect(DISTINCT tag.name) as tags
                    ORDER BY v.confidence DESC
                    LIMIT $limit
                """, {'topic': topic, 'limit': limit})
                
                summaries = []
                for record in result:
                    video = record["v"]
                    summaries.append({
                        "video_id": video["video_id"],
                        "title": video["title"],
                        "summary": video["summary"],
                        "confidence": video["confidence"],
                        "category": record["c"]["name"] if record["c"] else None,
                        "tags": record["tags"]
                    })
                
                return summaries
                
        except Exception as e:
            logger.error(f"Neo4j topic search error: {e}")
            return []
    
    async def get_topic_statistics(self) -> Dict[str, Any]:
        """Get topic and category statistics"""
        try:
            with self.driver.session(database=settings.NEO4J_DATABASE) as session:
                # Topic statistics
                topic_stats = session.run("""
                    MATCH (t:Topic)<-[:HAS_TOPIC]-(v:Video)
                    RETURN t.name as topic, count(v) as count
                    ORDER BY count DESC
                    LIMIT 10
                """)
                
                # Category statistics
                category_stats = session.run("""
                    MATCH (c:Category)<-[:IN_CATEGORY]-(v:Video)
                    RETURN c.name as category, count(v) as count
                    ORDER BY count DESC
                    LIMIT 10
                """)
                
                # Total counts
                total_videos = session.run("MATCH (v:Video) RETURN count(v) as count").single()["count"]
                total_users = session.run("MATCH (u:User) RETURN count(u) as count").single()["count"]
                
                return {
                    "total_videos": total_videos,
                    "total_users": total_users,
                    "top_topics": [{"topic": r["topic"], "count": r["count"]} for r in topic_stats],
                    "top_categories": [{"category": r["category"], "count": r["count"]} for r in category_stats]
                }
                
        except Exception as e:
            logger.error(f"Neo4j statistics error: {e}")
            return {
                "total_videos": 0,
                "total_users": 0,
                "top_topics": [],
                "top_categories": []
            }
    
    async def delete_summary(self, video_id: str) -> bool:
        """Delete a summary from Neo4j"""
        try:
            with self.driver.session(database=settings.NEO4J_DATABASE) as session:
                result = session.run("""
                    MATCH (v:Video {video_id: $video_id})
                    OPTIONAL MATCH (v)-[:HAS_KEY_POINT]->(kp:KeyPoint)
                    DELETE kp
                    WITH v
                    OPTIONAL MATCH (v)-[r]-()
                    DELETE r
                    DELETE v
                    RETURN count(v) as deleted
                """, {'video_id': video_id})
                
                deleted = result.single()["deleted"]
                return deleted > 0
                
        except Exception as e:
            logger.error(f"Neo4j delete error: {e}")
            return False
    
    def close(self):
        """Close Neo4j driver connection"""
        if self.driver:
            self.driver.close()

# Global instance
neo4j_service = Neo4jService() 