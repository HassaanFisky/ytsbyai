# Voice AI Integration for YTS by AI

## Overview

Complete voice transcription and speech synthesis integration using OpenAI Whisper and OpenVoice, with automatic summarization through LangGraph workflow.

## Architecture

### Voice AI Components

1. **Voice Service** (`backend/app/core/voice_service.py`)
   - Whisper transcription with faster-whisper
   - OpenVoice speech synthesis
   - Usage tracking and billing
   - Voice cloning capabilities

2. **Voice Router** (`backend/app/routers/voice.py`)
   - RESTful endpoints for voice features
   - WebSocket for real-time transcription
   - File upload handling
   - Authentication and rate limiting

3. **Frontend Components**
   - `voice-recorder.tsx`: Audio recording and transcription
   - `voice-player.tsx`: Speech synthesis and playback
   - `voice-ai/page.tsx`: Complete demo interface

## Backend Implementation

### Voice Service Features

```python
# Key methods in VoiceService
- transcribe_audio(): Process uploaded audio files
- transcribe_realtime(): Real-time WebSocket transcription
- synthesize_speech(): Generate speech from text
- clone_voice(): Clone user's voice for synthesis
- get_available_voices(): List available voice options
- check_usage_limits(): Track usage for billing
```

### API Endpoints

#### POST `/api/v1/transcribe`
Transcribe uploaded audio file with optional auto-summarization.

**Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/transcribe" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@audio.mp3" \
  -F "language=en" \
  -F "auto_summarize=true"
```

**Response:**
```json
{
  "transcription": "Hello, this is a test recording...",
  "language": "en",
  "language_probability": 0.95,
  "duration": 15.5,
  "segments": [
    {
      "start": 0.0,
      "end": 3.2,
      "text": "Hello, this is"
    }
  ],
  "summary": "AI-generated summary of the transcription"
}
```

#### POST `/api/v1/synthesize`
Synthesize speech from text using selected voice.

**Request:**
```json
{
  "text": "This is the text to synthesize",
  "voice_id": "default",
  "speed": 1.0
}
```

**Response:**
```json
{
  "audio_base64": "UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT...",
  "duration": 5.2,
  "voice_id": "default",
  "text_length": 35
}
```

#### POST `/api/v1/clone-voice`
Clone user's voice for personalized synthesis.

#### WebSocket `/api/v1/transcribe-realtime`
Real-time transcription via WebSocket connection.

#### GET `/api/v1/voices`
Get available voice options.

#### GET `/api/v1/usage-limits`
Check user's usage limits based on subscription.

## Frontend Implementation

### Voice Recorder Component

```typescript
// Key features
- MediaRecorder API for audio capture
- Real-time recording timer
- Audio preview with controls
- Auto-summarization toggle
- Error handling and validation
```

### Voice Player Component

```typescript
// Key features
- Multiple voice selection
- Playback speed control (0.5x - 2.0x)
- Auto-play functionality
- Audio controls (play/pause/stop)
- Base64 audio handling
```

## Environment Variables

### Required Environment Variables

```bash
# Voice AI Configuration
WHISPER_MODEL_SIZE=base  # tiny, base, small, medium, large
VOICE_SYNTHESIS_PROVIDER=openvoice  # openvoice, elevenlabs, azure
VOICE_CLONING_ENABLED=true
REALTIME_TRANSCRIPTION_ENABLED=true

# Usage Limits
FREE_TIER_TRANSCRIPTION_LIMIT=1000  # characters per month
FREE_TIER_SYNTHESIS_LIMIT=500       # characters per month
PRO_TIER_TRANSCRIPTION_LIMIT=100000
PRO_TIER_SYNTHESIS_LIMIT=50000

# Audio Processing
MAX_AUDIO_FILE_SIZE=50MB
SUPPORTED_AUDIO_FORMATS=mp3,wav,webm,m4a
AUDIO_SAMPLE_RATE=16000
AUDIO_CHANNELS=1
```

### Optional Environment Variables

```bash
# GPU Configuration
CUDA_VISIBLE_DEVICES=0
GPU_MEMORY_FRACTION=0.8

# Voice Cloning
VOICE_CLONING_MODEL_PATH=/models/voice_cloning
VOICE_CLONING_SAMPLE_RATE=22050

# Real-time Processing
REALTIME_CHUNK_SIZE=1024
REALTIME_SAMPLE_RATE=16000
```

## Usage Limits and Billing

### Subscription Tiers

| Feature | Free Tier | Pro Tier | Enterprise |
|---------|-----------|----------|------------|
| Transcription | 1,000 chars/month | 100,000 chars/month | Unlimited |
| Synthesis | 500 chars/month | 50,000 chars/month | Unlimited |
| Voice Cloning | ❌ | ✅ | ✅ |
| Real-time | ❌ | ✅ | ✅ |
| Custom Voices | ❌ | ✅ | ✅ |

### Usage Tracking

```python
# Usage logging
await voice_service._log_transcription_usage(user_id, text_length)
await voice_service._log_synthesis_usage(user_id, text_length)

# Limit checking
limits = await voice_service.check_usage_limits(user_id, "transcription")
```

## Voice Synthesis Options

### 1. OpenVoice (Recommended)
```python
# Install OpenVoice
pip install openvoice

# Usage
from openvoice import OpenVoice
voice_model = OpenVoice()
audio = voice_model.synthesize(text, voice_id)
```

### 2. ElevenLabs
```python
# Install ElevenLabs
pip install elevenlabs

# Usage
from elevenlabs import generate, set_api_key
set_api_key("your-api-key")
audio = generate(text=text, voice=voice_id)
```

### 3. Azure Speech Services
```python
# Install Azure Speech
pip install azure-cognitiveservices-speech

# Usage
import azure.cognitiveservices.speech as speechsdk
speech_config = speechsdk.SpeechConfig(subscription="key", region="region")
synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config)
result = synthesizer.speak_text_async(text).get()
```

## Deployment Configuration

### Docker with GPU Support

```dockerfile
# GPU-enabled Dockerfile
FROM nvidia/cuda:11.8-devel-ubuntu20.04

# Install PyTorch with CUDA
RUN pip install torch==2.1.1 torchaudio==2.1.1 --index-url https://download.pytorch.org/whl/cu118
```

### Docker Compose with GPU

```yaml
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

## Performance Optimization

### Whisper Optimization

```python
# Model size selection
model_size = "base"  # Balance of speed and accuracy
# Options: tiny (39MB), base (74MB), small (244MB), medium (769MB), large (1550MB)

# GPU acceleration
device = "cuda" if torch.cuda.is_available() else "cpu"
compute_type = "float16" if device == "cuda" else "int8"

# Batch processing
whisper_model = WhisperModel(
    model_size,
    device=device,
    compute_type=compute_type,
    cpu_threads=4,
    num_workers=1
)
```

### Voice Synthesis Optimization

```python
# Caching synthesized audio
audio_cache = {}

async def synthesize_with_cache(text, voice_id):
    cache_key = f"{text}_{voice_id}"
    if cache_key in audio_cache:
        return audio_cache[cache_key]
    
    audio = await synthesize_speech(text, voice_id)
    audio_cache[cache_key] = audio
    return audio
```

## Security Considerations

### Audio File Validation

```python
# File type validation
ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/mp4']
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

def validate_audio_file(file):
    if file.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(400, "Invalid audio file type")
    if file.size > MAX_FILE_SIZE:
        raise HTTPException(400, "File too large")
```

### Rate Limiting

```python
# Voice API rate limits
@limiter.limit("10/minute")  # Transcription
@limiter.limit("20/minute")  # Synthesis
@limiter.limit("5/minute")   # Voice cloning
```

## Testing

### Unit Tests

```python
# Test transcription
async def test_transcribe_audio():
    audio_file = create_test_audio()
    result = await voice_service.transcribe_audio(audio_file)
    assert result["transcription"] is not None
    assert result["language"] == "en"

# Test synthesis
async def test_synthesize_speech():
    result = await voice_service.synthesize_speech("Hello world")
    assert result["audio_base64"] is not None
    assert result["duration"] > 0
```

### Integration Tests

```python
# Test complete workflow
async def test_voice_workflow():
    # 1. Record audio
    audio_file = create_test_audio()
    
    # 2. Transcribe
    transcription = await voice_service.transcribe_audio(audio_file)
    
    # 3. Summarize
    summary = await run_langgraph_workflow(transcription["transcription"])
    
    # 4. Synthesize
    audio = await voice_service.synthesize_speech(summary["summary"])
    
    assert transcription["transcription"] is not None
    assert summary["summary"] is not None
    assert audio["audio_base64"] is not None
```

## Monitoring and Analytics

### Voice Usage Metrics

```python
# Track usage metrics
voice_metrics = {
    "transcription_requests": 0,
    "synthesis_requests": 0,
    "total_audio_duration": 0,
    "average_accuracy": 0.0,
    "popular_voices": {},
    "error_rate": 0.0
}
```

### Performance Monitoring

```python
# Monitor processing times
import time

async def transcribe_with_timing(audio_file):
    start_time = time.time()
    result = await voice_service.transcribe_audio(audio_file)
    processing_time = time.time() - start_time
    
    # Log metrics
    logger.info(f"Transcription completed in {processing_time:.2f}s")
    return result
```

## Troubleshooting

### Common Issues

1. **CUDA Out of Memory**
   ```bash
   # Reduce model size or batch size
   export CUDA_VISIBLE_DEVICES=0
   export GPU_MEMORY_FRACTION=0.5
   ```

2. **Audio Format Issues**
   ```python
   # Convert audio to supported format
   from pydub import AudioSegment
   audio = AudioSegment.from_file("input.mp3")
   audio.export("output.wav", format="wav")
   ```

3. **WebSocket Connection Issues**
   ```javascript
   // Reconnect logic
   const ws = new WebSocket('ws://localhost:8000/api/v1/transcribe-realtime');
   ws.onclose = () => {
     setTimeout(() => {
       // Reconnect after 5 seconds
       connectWebSocket();
     }, 5000);
   };
   ```

## Future Enhancements

### Planned Features

1. **Advanced Voice Cloning**
   - Multi-speaker voice cloning
   - Emotion-aware synthesis
   - Accent preservation

2. **Real-time Features**
   - Live transcription display
   - Real-time voice synthesis
   - Voice activity detection

3. **Advanced Analytics**
   - Speaker identification
   - Sentiment analysis
   - Content classification

4. **Integration Enhancements**
   - Video call integration
   - Meeting transcription
   - Podcast processing

The voice AI integration provides a complete solution for audio processing, transcription, and synthesis with enterprise-grade features and scalability. 