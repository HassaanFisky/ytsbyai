import logging
import asyncio
import tempfile
import os
from typing import Optional, Dict, Any, BinaryIO
from faster_whisper import WhisperModel
import torch
import numpy as np
from pydub import AudioSegment
import io
import base64
from app.core.config import settings

logger = logging.getLogger(__name__)

class VoiceService:
    """Voice transcription and synthesis service using Whisper and OpenVoice"""
    
    def __init__(self):
        self.whisper_model = None
        self.voice_model = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize Whisper and OpenVoice models"""
        try:
            # Initialize Whisper model
            model_size = "base"  # Options: tiny, base, small, medium, large
            self.whisper_model = WhisperModel(
                model_size,
                device=self.device,
                compute_type="float16" if self.device == "cuda" else "int8"
            )
            logger.info(f"Whisper model loaded on {self.device}")
            
            # Initialize OpenVoice (placeholder - implement based on your choice)
            # self.voice_model = OpenVoiceModel()
            logger.info("Voice models initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing voice models: {e}")
            raise
    
    async def transcribe_audio(
        self, 
        audio_file: BinaryIO, 
        language: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Transcribe audio file using Whisper"""
        try:
            # Save audio to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
                # Convert to WAV if needed
                audio = AudioSegment.from_file(audio_file)
                audio.export(temp_file.name, format="wav")
                
                # Transcribe with Whisper
                segments, info = self.whisper_model.transcribe(
                    temp_file.name,
                    language=language,
                    beam_size=5,
                    best_of=5,
                    temperature=0.0,
                    compression_ratio_threshold=2.4,
                    log_prob_threshold=-1.0,
                    no_speech_threshold=0.6,
                    condition_on_previous_text=True,
                    initial_prompt=None
                )
                
                # Extract transcription
                transcription = " ".join([segment.text for segment in segments])
                
                # Clean up temp file
                os.unlink(temp_file.name)
                
                # Log usage
                if user_id:
                    await self._log_transcription_usage(user_id, len(transcription))
                
                return {
                    "transcription": transcription,
                    "language": info.language,
                    "language_probability": info.language_probability,
                    "duration": info.duration,
                    "segments": [
                        {
                            "start": segment.start,
                            "end": segment.end,
                            "text": segment.text,
                            "words": segment.words if hasattr(segment, 'words') else []
                        }
                        for segment in segments
                    ]
                }
                
        except Exception as e:
            logger.error(f"Transcription error: {e}")
            raise
    
    async def transcribe_realtime(
        self, 
        audio_chunk: bytes,
        language: Optional[str] = None
    ) -> Dict[str, Any]:
        """Transcribe real-time audio chunk"""
        try:
            # Convert audio chunk to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
                temp_file.write(audio_chunk)
                temp_file.flush()
                
                # Transcribe chunk
                segments, info = self.whisper_model.transcribe(
                    temp_file.name,
                    language=language,
                    beam_size=3,
                    temperature=0.0
                )
                
                # Clean up
                os.unlink(temp_file.name)
                
                transcription = " ".join([segment.text for segment in segments])
                
                return {
                    "transcription": transcription,
                    "language": info.language,
                    "duration": info.duration,
                    "is_final": len(transcription.strip()) > 0
                }
                
        except Exception as e:
            logger.error(f"Real-time transcription error: {e}")
            raise
    
    async def synthesize_speech(
        self, 
        text: str, 
        voice_id: str = "default",
        speed: float = 1.0,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Synthesize speech using OpenVoice"""
        try:
            # Placeholder for OpenVoice implementation
            # This would integrate with your chosen TTS service
            # For now, returning a mock response
            
            # Mock synthesis (replace with actual OpenVoice implementation)
            audio_data = await self._mock_synthesize(text, voice_id, speed)
            
            # Convert to base64 for API response
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            
            # Log usage
            if user_id:
                await self._log_synthesis_usage(user_id, len(text))
            
            return {
                "audio_base64": audio_base64,
                "duration": len(text.split()) * 0.5,  # Rough estimate
                "voice_id": voice_id,
                "text_length": len(text)
            }
            
        except Exception as e:
            logger.error(f"Speech synthesis error: {e}")
            raise
    
    async def _mock_synthesize(
        self, 
        text: str, 
        voice_id: str, 
        speed: float
    ) -> bytes:
        """Mock speech synthesis (replace with actual implementation)"""
        # This is a placeholder - implement actual TTS here
        # You can use:
        # - OpenVoice
        # - ElevenLabs
        # - Azure Speech Services
        # - Google Text-to-Speech
        
        # For now, return empty audio data
        return b"mock_audio_data"
    
    async def get_available_voices(self) -> Dict[str, Any]:
        """Get available voice options"""
        return {
            "voices": [
                {
                    "id": "default",
                    "name": "Default Voice",
                    "language": "en",
                    "gender": "neutral"
                },
                {
                    "id": "myvoice",
                    "name": "My Voice Clone",
                    "language": "en",
                    "gender": "neutral",
                    "requires_cloning": True
                }
            ],
            "supported_languages": ["en", "es", "fr", "de", "it", "pt", "ja", "ko", "zh"]
        }
    
    async def clone_voice(
        self, 
        audio_file: BinaryIO, 
        voice_name: str,
        user_id: str
    ) -> Dict[str, Any]:
        """Clone user's voice for synthesis"""
        try:
            # Placeholder for voice cloning implementation
            # This would use OpenVoice or similar service
            
            # Mock voice cloning
            voice_id = f"user_{user_id}_{voice_name}"
            
            return {
                "voice_id": voice_id,
                "voice_name": voice_name,
                "status": "cloned",
                "message": "Voice cloned successfully"
            }
            
        except Exception as e:
            logger.error(f"Voice cloning error: {e}")
            raise
    
    async def _log_transcription_usage(self, user_id: str, text_length: int):
        """Log transcription usage for billing"""
        try:
            # Log to database or analytics service
            usage_data = {
                "user_id": user_id,
                "service": "transcription",
                "text_length": text_length,
                "timestamp": asyncio.get_event_loop().time()
            }
            logger.info(f"Transcription usage: {usage_data}")
            
        except Exception as e:
            logger.error(f"Usage logging error: {e}")
    
    async def _log_synthesis_usage(self, user_id: str, text_length: int):
        """Log synthesis usage for billing"""
        try:
            # Log to database or analytics service
            usage_data = {
                "user_id": user_id,
                "service": "synthesis",
                "text_length": text_length,
                "timestamp": asyncio.get_event_loop().time()
            }
            logger.info(f"Synthesis usage: {usage_data}")
            
        except Exception as e:
            logger.error(f"Usage logging error: {e}")
    
    async def check_usage_limits(self, user_id: str, service: str) -> Dict[str, Any]:
        """Check user's usage limits based on subscription"""
        try:
            # This would check against Firebase/Stripe subscription
            # For now, return basic limits
            
            limits = {
                "transcription": {
                    "free_tier": 1000,  # characters per month
                    "pro_tier": 100000,
                    "enterprise_tier": 1000000
                },
                "synthesis": {
                    "free_tier": 500,   # characters per month
                    "pro_tier": 50000,
                    "enterprise_tier": 500000
                }
            }
            
            return {
                "service": service,
                "limits": limits.get(service, {}),
                "current_usage": 0,  # Would be fetched from database
                "subscription_tier": "free_tier"  # Would be fetched from Stripe
            }
            
        except Exception as e:
            logger.error(f"Usage limit check error: {e}")
            raise

# Global instance
voice_service = VoiceService() 