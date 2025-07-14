# LangGraph Workflow Integration for YTS by AI

Complete LangGraph-based automation pipeline for YouTube summarization, classification, and dual storage (Pinecone + Neo4j).

## 📁 Folder Structure

```
backend/
├── app/
│   ├── langgraph/                    # NEW: LangGraph package
│   │   ├── __init__.py
│   │   ├── types.py                  # Workflow state and data models
│   │   ├── nodes.py                  # LangGraph nodes (summarize, classify, store)
│   │   ├── workflow.py               # Main workflow orchestration
│   │   └── neo4j_service.py          # Neo4j graph database service
│   ├── core/
│   │   ├── config.py                 # UPDATED: Added Neo4j config
│   │   ├── langchain_service.py      # EXISTING: LangChain service
│   │   └── pinecone_service.py       # EXISTING: Pinecone service
│   └── routers/
│       ├── langgraph_summary.py      # NEW: LangGraph API endpoints
│       └── smart_summary.py          # EXISTING: Smart summary endpoints
├── requirements.txt                   # UPDATED: Added LangGraph & Neo4j deps
└── env-template.txt                  # UPDATED: Added Neo4j config

frontend/
├── components/
│   ├── langgraph-summary-input.tsx   # NEW: LangGraph input component
│   └── langgraph-summary-display.tsx # NEW: LangGraph display component
├── app/
│   └── langgraph-workflow/
│       └── page.tsx                  # NEW: Demo page
└── lib/
    └── api.ts                        # UPDATED: Added LangGraph API methods
```

## 🧠 LangGraph Pipeline Architecture

### Workflow Flow
```
YouTube URL → Summarize → Classify → Pinecone Store → Neo4j Store → Finalize
```

### Node Functions
1. **Summarize Node**: Generate comprehensive summary with key points
2. **Classify Node**: AI-powered topic and category classification
3. **Pinecone Store Node**: Vector storage for semantic search
4. **Neo4j Store Node**: Graph storage for relationship analysis
5. **Finalize Node**: Complete workflow with metadata

## 🧾 LangChain Nodes Implementation

### Summarize Node
```python
async def summarize_node(state: WorkflowState) -> WorkflowState:
    # Truncate transcript to fit token limit
    # Generate summary using GPT-4
    # Extract key points and tags
    # Update state with results
```

### Classify Node
```python
async def classify_node(state: WorkflowState) -> WorkflowState:
    # Analyze summary for topic classification
    # Determine category and confidence
    # Extract subcategories and additional tags
    # Update state with classification results
```

### Storage Nodes
```python
async def pinecone_store_node(state: WorkflowState) -> WorkflowState:
    # Generate embeddings for summary
    # Store in Pinecone with metadata
    # Return vector ID

async def neo4j_store_node(state: WorkflowState) -> WorkflowState:
    # Create graph relationships
    # Store in Neo4j with full metadata
    # Return graph ID
```

## ⚙️ Configuration Updates

### Environment Variables
```bash
# Neo4j Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
NEO4J_DATABASE=neo4j
```

### Dependencies Added
```
langgraph==0.0.20
neo4j==5.15.0
graphviz==0.20.1
```

## 🔁 FastAPI Routes

### LangGraph Workflow Endpoints

#### POST `/api/v1/langgraph-summary`
Run the complete LangGraph workflow.

**Request:**
```json
{
  "youtube_url": "https://www.youtube.com/watch?v=...",
  "tone": "professional",
  "use_checkpointing": false,
  "thread_id": "optional_thread_id"
}
```

**Response:**
```json
{
  "success": true,
  "video_id": "abc123",
  "summary": "Generated summary...",
  "title": "Summary title",
  "topic": "Machine Learning",
  "category": "Technology",
  "confidence": 0.85,
  "key_points": ["point1", "point2"],
  "tags": ["tag1", "tag2"],
  "pinecone_id": "vector_123",
  "neo4j_id": "graph_456",
  "thread_id": "workflow_abc123",
  "processing_time": 12.5
}
```

#### GET `/api/v1/workflow-status/{thread_id}`
Get workflow execution status.

#### GET `/api/v1/workflow-threads`
List all workflow threads.

#### DELETE `/api/v1/workflow-thread/{thread_id}`
Clear workflow thread from memory.

### Neo4j Graph Endpoints

#### GET `/api/v1/neo4j/user-summaries`
Get user summaries from graph database.

#### GET `/api/v1/neo4j/topic-search/{topic}`
Search summaries by topic.

#### GET `/api/v1/neo4j/statistics`
Get graph statistics and analytics.

#### DELETE `/api/v1/neo4j/summary/{video_id}`
Delete summary from graph database.

## ✅ Implementation Features

### LangGraph Features
- ✅ **State Management**: WorkflowState with comprehensive metadata
- ✅ **Conditional Edges**: Error handling and routing
- ✅ **Memory Checkpointing**: Resumable workflows
- ✅ **Modular Nodes**: Reusable node architecture
- ✅ **Async/Await**: Full async implementation
- ✅ **Error Handling**: Graceful error recovery
- ✅ **Logging**: Comprehensive logging throughout

### Storage Features
- ✅ **Pinecone Integration**: Vector similarity search
- ✅ **Neo4j Integration**: Graph relationship analysis
- ✅ **Dual Storage**: Both vector and graph storage
- ✅ **Automatic Constraints**: Neo4j constraint creation
- ✅ **Rich Metadata**: Comprehensive data storage
- ✅ **User Filtering**: User-specific queries

### Frontend Features
- ✅ **LangGraph Input**: Advanced workflow input component
- ✅ **LangGraph Display**: Enhanced results display
- ✅ **Error Handling**: Comprehensive error display
- ✅ **Copy Functions**: Copy summary, key points, tags
- ✅ **Workflow Details**: Detailed processing information
- ✅ **Demo Page**: Complete demonstration interface

## 🔄 Sample API Calls

### Run LangGraph Workflow
```bash
curl -X POST "http://localhost:8000/api/v1/langgraph-summary" \
  -H "Content-Type: application/json" \
  -d '{
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "tone": "professional",
    "use_checkpointing": false
  }'
```

### Get Workflow Status
```bash
curl -X GET "http://localhost:8000/api/v1/workflow-status/workflow_abc123"
```

### Search by Topic
```bash
curl -X GET "http://localhost:8000/api/v1/neo4j/topic-search/Machine%20Learning"
```

## 🚀 Deployment

### Environment Setup
1. Add Neo4j configuration to `.env`
2. Install new dependencies: `pip install -r requirements.txt`
3. Start Neo4j database
4. Configure Pinecone index

### Neo4j Setup
```bash
# Install Neo4j (Docker)
docker run \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:latest

# Or install locally
# Follow Neo4j installation guide
```

### Dependencies
The integration adds these new dependencies:
- `langgraph==0.0.20` - LangGraph workflow orchestration
- `neo4j==5.15.0` - Neo4j Python driver
- `graphviz==0.20.1` - Graph visualization

## 📊 Neo4j Graph Schema

### Nodes
- **Video**: Video summaries with metadata
- **User**: User accounts
- **Topic**: Content topics
- **Category**: Content categories
- **Subcategory**: Topic subcategories
- **Tag**: Content tags
- **KeyPoint**: Summary key points

### Relationships
- `(User)-[:CREATED]->(Video)`
- `(Video)-[:HAS_TOPIC]->(Topic)`
- `(Video)-[:IN_CATEGORY]->(Category)`
- `(Video)-[:HAS_SUBCATEGORY]->(Subcategory)`
- `(Video)-[:HAS_TAG]->(Tag)`
- `(Video)-[:HAS_KEY_POINT]->(KeyPoint)`
- `(Topic)-[:BELONGS_TO]->(Category)`
- `(Subcategory)-[:BELONGS_TO]->(Topic)`

## 🔧 Configuration

### LangGraph Configuration
- **State Type**: WorkflowState with comprehensive metadata
- **Memory**: MemorySaver for checkpointing
- **Error Handling**: Conditional edges for graceful failures
- **Logging**: Structured logging throughout pipeline

### Neo4j Configuration
- **Constraints**: Automatic constraint creation
- **Indexes**: Automatic index management
- **Relationships**: Rich relationship modeling
- **Metadata**: Comprehensive metadata storage

## 📈 Performance

### Optimization Features
- **Token Management**: Automatic transcript truncation
- **Async Operations**: Full async/await implementation
- **Error Recovery**: Graceful error handling
- **Memory Management**: Efficient state management
- **Caching**: Checkpointing for resumability

### Monitoring
- **Processing Time**: Track workflow execution time
- **Error Tracking**: Detailed error logging
- **Status Monitoring**: Workflow status endpoints
- **Statistics**: Comprehensive analytics

## 🔒 Security

- **Authentication**: User authentication required
- **Rate Limiting**: API rate limiting
- **Input Validation**: Comprehensive validation
- **Error Sanitization**: Secure error handling
- **Environment Protection**: Secure config management

## 📋 Testing

### Backend Testing
```bash
cd backend
pip install -r requirements.txt
python -m pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm run dev
# Navigate to http://localhost:3000/langgraph-workflow
```

### API Testing
```bash
# Test workflow
curl -X POST "http://localhost:8000/api/v1/langgraph-summary" \
  -H "Content-Type: application/json" \
  -d '{"youtube_url": "https://youtube.com/watch?v=test"}'

# Test status
curl -X GET "http://localhost:8000/api/v1/workflow-status/workflow_test"
```

This implementation provides a complete, production-ready LangGraph workflow for automated YouTube summarization with dual storage capabilities, comprehensive error handling, and full frontend integration. 