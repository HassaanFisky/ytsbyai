# LangGraph Workflow Integration for YTS by AI

A complete, production-ready LangGraph-based automation pipeline for YouTube summarization, classification, and dual storage (Pinecone + Neo4j). All code/config examples are copy-paste ready and validated for 2025 standards.

---

## 🏗️ Folder Structure

### Backend
```
backend/
├── app/
│   ├── langgraph/                    # LangGraph package
│   │   ├── __init__.py
│   │   ├── types.py                  # Workflow state/data models
│   │   ├── nodes.py                  # LangGraph nodes (summarize, classify, store)
│   │   ├── workflow.py               # Main workflow orchestration
│   │   └── neo4j_service.py          # Neo4j graph database service
│   ├── core/
│   │   ├── config.py                 # Neo4j config
│   │   ├── langchain_service.py      # LangChain service
│   │   └── pinecone_service.py       # Pinecone service
│   └── routers/
│       ├── langgraph_summary.py      # LangGraph API endpoints
│       └── smart_summary.py          # Smart summary endpoints
├── requirements.txt                  # LangGraph & Neo4j deps
└── env-template.txt                  # Neo4j config
```

### Frontend
```
frontend/
├── components/
│   ├── langgraph-summary-input.tsx   # LangGraph input
│   └── langgraph-summary-display.tsx # LangGraph display
├── app/
│   └── langgraph-workflow/
│       └── page.tsx                  # Demo page
└── lib/
    └── api.ts                        # LangGraph API methods
```

---

## ⚙️ Environment Setup

Add to `.env`:
```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
NEO4J_DATABASE=neo4j
```

---

## 🚀 Backend API Endpoints

All endpoints use `/api/v1/` prefix. All responses are JSON. All code examples are copy-paste ready.

### LangGraph Workflow
```http
POST /api/v1/langgraph-summary
Content-Type: application/json

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

### Workflow Status
```http
GET /api/v1/workflow-status/{thread_id}
```

### Workflow Threads
```http
GET /api/v1/workflow-threads
DELETE /api/v1/workflow-thread/{thread_id}
```

### Neo4j Graph Endpoints
```http
GET    /api/v1/neo4j/user-summaries
GET    /api/v1/neo4j/topic-search/{topic}
GET    /api/v1/neo4j/statistics
DELETE /api/v1/neo4j/summary/{video_id}
```

---

## 🧠 LangGraph Pipeline Architecture

### Workflow Flow
```
YouTube URL → Summarize → Classify → Pinecone Store → Neo4j Store → Finalize
```

### Node Functions
- **Summarize Node:** Generate summary, extract key points/tags
- **Classify Node:** AI-powered topic/category classification
- **Pinecone Store Node:** Vector storage for semantic search
- **Neo4j Store Node:** Graph storage for relationship analysis
- **Finalize Node:** Complete workflow with metadata

---

## 🔒 Security & Monitoring

- **Authentication:** User authentication required
- **Rate Limiting:** All endpoints
- **Input Validation:** Comprehensive validation
- **Error Handling:** Graceful error recovery, secure error messages
- **GDPR:** All workflow data is ephemeral, non-personal, and user-controlled
- **Monitoring:** Sentry, PostHog, logs
- **Accessibility:** All frontend components are WCAG 2.2+ compliant

---

## 🧪 Testing

### Backend
```bash
cd backend
pip install -r requirements.txt
pytest tests/
```

### Frontend
```bash
cd frontend
npm run dev
# Visit http://localhost:3000/langgraph-workflow
```

---

## 🚀 Deployment

- Add Neo4j config to `.env`
- Install dependencies: `pip install -r requirements.txt`
- Start Neo4j database (Docker or local)
- Configure Pinecone index
- All API keys are protected and not exposed
- All endpoints are rate-limited and validated

---

**Production Ready:** This LangGraph workflow is fully production-ready with dual storage, comprehensive error handling, and accessible frontend integration. 