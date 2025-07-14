# Backend (FastAPI)

## Stack
- FastAPI (Python)
- OpenAI API (GPT-4)
- Whisper (fallback transcript)
- Firebase Auth
- Stripe (webhooks, billing)

## Endpoints
- `/summary` — Summarize YouTube/voice input
- `/check-subscription` — Check user subscription status
- `/webhook` — Stripe webhook handler

## Auth
- JWT + Firebase token validation

## Security
- CORS, rate limiting, .env checks, GitHub secrets

## Testing
- Pytest

## Setup
1. Install Python 3.10+
2. `pip install -r requirements.txt`
3. Copy `.env.example` to `.env` and fill in keys
4. `uvicorn main:app --reload` 