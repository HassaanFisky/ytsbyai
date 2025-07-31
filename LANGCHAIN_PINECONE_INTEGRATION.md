# LangChain & Pinecone Integration for YTS by AI

A complete, production-ready integration of LangChain and Pinecone for advanced YouTube summarization and semantic search. All code/config examples are copy-paste ready and validated for 2025 standards.

---

## 🏗️ Folder Structure

### Backend
```
backend/
├── app/
│   ├── core/
│   │   ├── langchain_service.py    # LangChain service
│   │   ├── pinecone_service.py     # Pinecone service
│   │   └── config.py               # Pinecone config
│   └── routers/
│       ├── smart_summary.py        # Smart summary endpoints
│       └── summary.py              # Original summary endpoints
├── requirements.txt                # LangChain & Pinecone deps
└── env-template.txt                # Environment template
```

### Frontend
```
frontend/
├── components/
│   ├── smart-summary-input.tsx     # Smart summary input
│   ├── smart-summary-display.tsx   # Enhanced summary display
│   └── summary-search.tsx          # Search component
├── app/
│   └── smart-summary/
│       └── page.tsx                # Demo page
└── lib/
    └── api.ts                      # Smart summary API methods
```

---

## ⚙️ Environment Setup

Add to `.env`:
```env
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_INDEX_NAME=ytsbyai-summaries
```

---

## 🚀 Backend API Endpoints

All endpoints use `/api/v1/` prefix. All responses are JSON. All code examples are copy-paste ready.

### Smart Summary
```http
POST /api/v1/smart-summary
Content-Type: application/json

{
  "youtube_url": "https://www.youtube.com/watch?v=...",
  "tone": "professional",
  "max_length": 500,
  "use_agent": false,
  "include_similar": true
}
```
**Response:**
```json
{
  "summary": "Generated summary text...",
  "title": "Summary title",
  "tone": "professional",
  "cta": "Call to action",
  "usage_count": 5,
  "key_points": ["point1", "point2"],
  "tags": ["tag1", "tag2"],
  "similar_summaries": [...],
  "vector_id": "abc123"
}
```

### Search Summaries
```http
POST /api/v1/search-summaries
Content-Type: application/json

{
  "query": "machine learning tutorial",
  "top_k": 5
}
```

### User Summaries
```http
GET /api/v1/user-summaries
```

### Delete Summary
```http
DELETE /api/v1/summary/{vector_id}
```

### Summary Stats
```http
GET /api/v1/summary-stats
```

---

## 🤖 LangChain Integration

- **LLMChain:** Structured summary generation with prompt templates
- **Agents:** Advanced processing with tools for content analysis
- **Memory:** Conversation buffer for context awareness
- **Output Parsing:** Structured JSON response parsing
- **Token Management:** Automatic transcript truncation

**Example:**
```python
chain = langchain_service.create_summary_chain(tone="professional")
result = await chain.ainvoke({
    "title": "Video Title",
    "author": "Author Name",
    "length": 1200,
    "tone": "professional",
    "max_length": 500,
    "transcript": "Video transcript..."
})

agent = langchain_service.create_smart_summary_agent()
result = await agent.ainvoke({"input": "Generate summary..."})
```

---

## 🧠 Pinecone Integration

- **Vector Storage:** Store summary embeddings with metadata
- **Semantic Search:** Find similar summaries using cosine similarity
- **User Filtering:** Search within user's summaries
- **Metadata Management:** Rich metadata for each summary
- **Statistics:** Usage metrics and analytics

**Example:**
```python
vector_id = await pinecone_service.store_summary(
    summary_data=summary_data,
    user_id=user_id,
    video_id=video_id,
    embedding=embedding
)

results = await pinecone_service.search_similar_summaries(
    query_embedding=embedding,
    user_id=user_id,
    top_k=5
)
```

---

## 🎨 Frontend Integration

- Smart summary input/display components
- Semantic search interface
- Copy-to-clipboard, similar summaries display
- Accessible, responsive design (WCAG 2.2+)

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
# Visit http://localhost:3000/smart-summary
```

---

## 🚀 Deployment

- Ensure all required environment variables are set
- All API keys are protected and not exposed
- User authentication required for vector storage
- Rate limiting on all endpoints
- Input validation and sanitization
- Secure environment variable handling

---

## 📈 Monitoring & Security

- Async/await for all database operations
- Token counting and truncation for large transcripts
- Efficient vector similarity search
- Caching and optimization strategies
- Memory management for large documents
- Monitoring: Sentry, PostHog, logs
- GDPR: All summary data is ephemeral, non-personal, and user-controlled

---

**Production Ready:** This integration provides a complete, secure, and accessible implementation of LangChain and Pinecone for advanced YouTube summarization with semantic search. 