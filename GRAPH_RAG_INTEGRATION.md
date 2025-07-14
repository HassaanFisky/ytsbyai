# GraphRAG Recommendation Engine Integration

## Overview

The GraphRAG recommendation engine combines Neo4j graph relationships with Pinecone vector similarity to provide intelligent, personalized video recommendations. This hybrid approach leverages both structured graph data and semantic vector embeddings for superior recommendation quality.

## Architecture

### Core Components

1. **GraphRAG Service** (`backend/app/core/graphrag_service.py`)
   - Orchestrates graph and vector searches
   - Merges results intelligently
   - Generates AI-powered recommendations

2. **FastAPI Router** (`backend/app/routers/recommendation.py`)
   - RESTful endpoints for recommendations
   - Rate limiting and authentication
   - Structured request/response models

3. **Frontend Components**
   - `recommendation-input.tsx`: User interface for queries
   - `recommendation-display.tsx`: Results visualization
   - `recommendation-engine/page.tsx`: Demo page

## Backend Implementation

### GraphRAG Service Features

```python
# Key methods in GraphRAGService
- get_graph_context(): Queries Neo4j for topic relationships
- get_vector_similarity(): Searches Pinecone for similar content
- merge_graph_and_vector_results(): Intelligently combines results
- generate_recommendations(): AI-powered recommendation generation
- get_topic_recommendations(): Topic-specific recommendations
- get_user_recommendations(): Personalized user recommendations
```

### API Endpoints

#### POST `/api/v1/recommend`
Main recommendation endpoint combining graph and vector search.

**Request:**
```json
{
  "query": "machine learning tutorials",
  "limit": 10,
  "include_user_history": true,
  "filter_by_topic": "Technology"
}
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "video_id": "abc123",
      "title": "Introduction to Machine Learning",
      "reason": "Matches your interest in ML and similar to your watched content",
      "relevance_score": 0.95,
      "category": "Technology",
      "topic": "Machine Learning"
    }
  ],
  "explanation": "Based on your interest in technology and ML content",
  "topics": ["Machine Learning", "Technology"],
  "confidence": 0.85,
  "total_videos_analyzed": 150,
  "graph_videos": 45,
  "vector_videos": 105,
  "personalization_level": "high"
}
```

#### POST `/api/v1/recommend/topic`
Get recommendations for a specific topic.

#### POST `/api/v1/recommend/user`
Get personalized recommendations for the current user.

#### GET `/api/v1/recommend/topics`
Get available topics for filtering.

#### GET `/api/v1/recommend/stats`
Get recommendation system statistics.

## Frontend Implementation

### Components

1. **RecommendationInput**
   - Search query input
   - Result limit configuration
   - Topic filtering dropdown
   - User history toggle
   - GraphRAG architecture explanation

2. **RecommendationDisplay**
   - Structured results display
   - Confidence scoring visualization
   - Personalization level indicators
   - Graph vs Vector result breakdown
   - Topic tags and categories

3. **Demo Page**
   - Architecture overview
   - Feature highlights
   - Example queries
   - Interactive testing interface

## GraphRAG Workflow

### 1. Query Processing
```
User Query → Embedding Generation → Graph Context + Vector Search
```

### 2. Dual Search
- **Neo4j Graph Search**: Topic relationships, user patterns, semantic connections
- **Pinecone Vector Search**: Semantic similarity using embeddings

### 3. Intelligent Merging
- Deduplication of results
- Score normalization and combination
- Source tracking (graph/vector/hybrid)

### 4. AI-Powered Recommendations
- LangChain prompt engineering
- Structured JSON output parsing
- Confidence scoring and explanation

## Configuration

### Environment Variables
```bash
# Neo4j Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX_NAME=yts-summaries

# OpenAI Configuration
OPENAI_API_KEY=your_openai_key
```

### Dependencies
```txt
# Backend requirements
langchain-openai>=0.1.0
neo4j>=5.0.0
pinecone-client>=2.0.0
```

## Features

### Hybrid Search
- Combines graph relationships with vector similarity
- Intelligent result merging and scoring
- Source tracking (graph/vector/hybrid)

### Personalization
- User history integration
- Topic preference analysis
- Confidence-based recommendations

### Topic Filtering
- Filter by specific topics
- Dynamic topic discovery
- Category-based organization

### Confidence Scoring
- Relevance scores (0-1)
- Personalization levels (high/medium/low)
- Explanation generation

## Usage Examples

### Basic Recommendation
```bash
curl -X POST "http://localhost:8000/api/v1/recommend" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "machine learning tutorials",
    "limit": 10,
    "include_user_history": true
  }'
```

### Topic-Specific Recommendations
```bash
curl -X POST "http://localhost:8000/api/v1/recommend/topic" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Machine Learning",
    "limit": 20,
    "include_user_videos": true
  }'
```

### User Personalization
```bash
curl -X POST "http://localhost:8000/api/v1/recommend/user" \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 10,
    "include_topics": true
  }'
```

## Performance Optimization

### Caching
- Graph context caching
- Vector search result caching
- User preference caching

### Rate Limiting
- 20 requests/minute for main recommendations
- 30 requests/minute for topic/user recommendations

### Async Processing
- Non-blocking graph queries
- Parallel vector searches
- Efficient result merging

## Security

### Authentication
- Firebase user authentication
- Trial token validation
- Subscription status checking

### Input Validation
- Query sanitization
- Limit enforcement
- Topic validation

### Error Handling
- Graceful degradation
- Detailed error messages
- Fallback recommendations

## Monitoring

### Metrics
- Total videos analyzed
- Graph vs vector result counts
- Confidence score distribution
- Personalization effectiveness

### Logging
- Query processing logs
- Performance metrics
- Error tracking
- User interaction analytics

## Deployment

### Backend Deployment
```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export NEO4J_URI=your_neo4j_uri
export PINECONE_API_KEY=your_pinecone_key
export OPENAI_API_KEY=your_openai_key

# Start server
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend Deployment
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

## Integration with Existing Systems

### LangGraph Workflow
- Recommendations feed into summarization pipeline
- User preferences influence topic classification
- Graph relationships enhance content discovery

### Existing APIs
- Compatible with current authentication
- Extends existing rate limiting
- Integrates with subscription system

### Database Integration
- Neo4j: Graph relationships and user patterns
- Pinecone: Vector similarity search
- Firebase: User authentication and preferences

## Future Enhancements

### Advanced Features
- Multi-modal recommendations (video + text)
- Real-time preference learning
- Collaborative filtering
- A/B testing framework

### Performance Improvements
- GraphQL API for complex queries
- Real-time streaming recommendations
- Edge caching optimization
- Distributed processing

### Analytics
- Recommendation effectiveness tracking
- User engagement metrics
- Content performance analysis
- Personalization accuracy measurement

## Troubleshooting

### Common Issues
1. **Neo4j Connection**: Check URI and credentials
2. **Pinecone Search**: Verify API key and index
3. **OpenAI Limits**: Monitor API usage and rate limits
4. **Memory Usage**: Optimize embedding generation

### Debug Mode
```python
# Enable detailed logging
logging.basicConfig(level=logging.DEBUG)

# Test individual components
await graphrag_service.get_graph_context("test query")
await graphrag_service.get_vector_similarity([0.1, 0.2, ...])
```

## Support

For issues or questions:
1. Check the logs for detailed error messages
2. Verify environment configuration
3. Test individual service components
4. Review rate limiting and authentication

The GraphRAG recommendation engine provides a powerful, scalable solution for intelligent video recommendations that combines the best of graph databases and vector similarity search. 