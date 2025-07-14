# LangChain & Pinecone Integration for YTS by AI

This document outlines the complete integration of LangChain and Pinecone into the YTS by AI YouTube Summarizer SaaS.

## 📁 Folder Structure Changes

### Backend Changes
```
backend/
├── app/
│   ├── core/
│   │   ├── langchain_service.py    # NEW: LangChain service
│   │   ├── pinecone_service.py     # NEW: Pinecone service
│   │   └── config.py               # UPDATED: Added Pinecone config
│   └── routers/
│       ├── smart_summary.py        # NEW: Smart summary endpoints
│       └── summary.py              # EXISTING: Original summary endpoints
├── requirements.txt                 # UPDATED: Added LangChain & Pinecone deps
└── env-template.txt                # NEW: Environment template
```

### Frontend Changes
```
frontend/
├── components/
│   ├── smart-summary-input.tsx     # NEW: Smart summary input component
│   ├── smart-summary-display.tsx   # NEW: Enhanced summary display
│   └── summary-search.tsx          # NEW: Search component
├── app/
│   └── smart-summary/
│       └── page.tsx                # NEW: Demo page
└── lib/
    └── api.ts                      # UPDATED: Added smart summary API methods
```

## 🔧 Environment Setup

Add these variables to your `.env` file:

```bash
# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_pinecone_environment_here
PINECONE_INDEX_NAME=ytsbyai-summaries
```

## 🚀 Backend FastAPI Endpoints

### Smart Summary Endpoints

#### POST `/api/v1/smart-summary`
Generate smart summary using LangChain and store in Pinecone.

**Request:**
```json
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

#### POST `/api/v1/search-summaries`
Search summaries using semantic similarity.

**Request:**
```json
{
  "query": "machine learning tutorial",
  "top_k": 5
}
```

#### GET `/api/v1/user-summaries`
Get all summaries for the current user.

#### DELETE `/api/v1/summary/{vector_id}`
Delete a summary from Pinecone.

#### GET `/api/v1/summary-stats`
Get summary statistics.

## 🤖 LangChain Integration

### Features
- **LLMChain**: Structured summary generation with prompt templates
- **Agents**: Advanced processing with tools for content analysis
- **Memory**: Conversation buffer for context awareness
- **Output Parsing**: Structured JSON response parsing
- **Token Management**: Automatic transcript truncation

### Key Components

#### LangChainService (`backend/app/core/langchain_service.py`)
```python
# Create summary chain
chain = langchain_service.create_summary_chain(tone="professional")
result = await chain.ainvoke({
    "title": "Video Title",
    "author": "Author Name",
    "length": 1200,
    "tone": "professional",
    "max_length": 500,
    "transcript": "Video transcript..."
})

# Use AI agent
agent = langchain_service.create_smart_summary_agent()
result = await agent.ainvoke({"input": "Generate summary..."})
```

## 🧠 Pinecone Integration

### Features
- **Vector Storage**: Store summary embeddings with metadata
- **Semantic Search**: Find similar summaries using cosine similarity
- **User Filtering**: Search within user's summaries
- **Metadata Management**: Rich metadata for each summary
- **Statistics**: Get usage statistics and metrics

### Key Components

#### PineconeService (`backend/app/core/pinecone_service.py`)
```python
# Store summary
vector_id = await pinecone_service.store_summary(
    summary_data=summary_data,
    user_id=user_id,
    video_id=video_id,
    embedding=embedding
)

# Search similar summaries
results = await pinecone_service.search_similar_summaries(
    query_embedding=embedding,
    user_id=user_id,
    top_k=5
)
```

## 💻 Frontend Integration

### Smart Summary Input Component
```typescript
import SmartSummaryInput from '../components/smart-summary-input';

<SmartSummaryInput
  onSummaryGenerated={handleSummaryGenerated}
  isLoading={isLoading}
  setIsLoading={setIsLoading}
/>
```

### Smart Summary Display Component
```typescript
import SmartSummaryDisplay from '../components/smart-summary-display';

<SmartSummaryDisplay
  summary={summaryData}
  onBack={handleBack}
/>
```

### Search Component
```typescript
import SummarySearch from '../components/summary-search';

<SummarySearch onResultClick={handleResultClick} />
```

### API Methods
```typescript
import { smartSummaryApi } from '../lib/api';

// Create smart summary
const result = await smartSummaryApi.createSmartSummary({
  youtube_url: 'https://youtube.com/watch?v=...',
  tone: 'professional',
  max_length: 500,
  use_agent: false,
  include_similar: true
});

// Search summaries
const searchResults = await smartSummaryApi.searchSummaries({
  query: 'machine learning',
  top_k: 10
});
```

## 🔄 Sample API Calls

### Generate Smart Summary
```bash
curl -X POST "http://localhost:8000/api/v1/smart-summary" \
  -H "Content-Type: application/json" \
  -d '{
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "tone": "professional",
    "max_length": 500,
    "use_agent": true,
    "include_similar": true
  }'
```

### Search Summaries
```bash
curl -X POST "http://localhost:8000/api/v1/search-summaries" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "artificial intelligence tutorial",
    "top_k": 5
  }'
```

## ✅ Testing

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
# Navigate to http://localhost:3000/smart-summary
```

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set:
- `PINECONE_API_KEY`
- `PINECONE_ENVIRONMENT`
- `OPENAI_API_KEY`
- Firebase configuration
- Stripe configuration

### Dependencies
The integration adds these new dependencies:
- `langchain==0.1.0`
- `langchain-openai==0.0.2`
- `langchain-community==0.0.10`
- `pinecone-client==2.2.4`
- `tiktoken==0.5.2`

## 🔧 Configuration

### Pinecone Index Setup
The system automatically creates a Pinecone index with:
- **Dimension**: 1536 (OpenAI embedding dimension)
- **Metric**: Cosine similarity
- **Index Name**: `ytsbyai-summaries`

### LangChain Configuration
- **Model**: GPT-4
- **Temperature**: 0.7
- **Memory**: ConversationBufferMemory
- **Output Parser**: Custom JSON parser

## 📊 Features

### Enhanced Summarization
- ✅ LangChain chains and agents
- ✅ Structured output with key points and tags
- ✅ Multiple tone options
- ✅ Token management and truncation
- ✅ Memory and context awareness

### Vector Storage
- ✅ Pinecone vector database integration
- ✅ Semantic similarity search
- ✅ User-specific filtering
- ✅ Rich metadata storage
- ✅ Automatic index management

### Frontend Features
- ✅ Smart summary input with advanced options
- ✅ Enhanced summary display with key points
- ✅ Semantic search interface
- ✅ Copy-to-clipboard functionality
- ✅ Similar summaries display

### API Features
- ✅ Rate limiting
- ✅ Authentication integration
- ✅ Error handling
- ✅ Structured responses
- ✅ Statistics and analytics

## 🔒 Security

- All API keys are protected and not exposed
- User authentication required for vector storage
- Rate limiting on all endpoints
- Input validation and sanitization
- Secure environment variable handling

## 📈 Performance

- Async/await for all database operations
- Token counting and truncation for large transcripts
- Efficient vector similarity search
- Caching and optimization strategies
- Memory management for large documents

This integration provides a complete, production-ready implementation of LangChain and Pinecone for advanced YouTube summarization with semantic search capabilities. 