import pytest
from unittest.mock import Mock, patch
from app.core.config import settings
from app.core.summary_service import SummaryService
from app.core.voice_service import VoiceService
from app.core.demo_service import DemoService

class TestSummaryService:
    """Test the summary service"""
    
    @patch('app.core.summary_service.OpenAI')
    def test_summarize_youtube_video(self, mock_openai):
        """Test YouTube video summarization"""
        # Mock OpenAI response
        mock_client = Mock()
        mock_openai.return_value = mock_client
        mock_client.chat.completions.create.return_value.choices[0].message.content = "Test summary"
        
        service = SummaryService()
        result = service.summarize_youtube_video("https://youtube.com/watch?v=test")
        
        assert result["summary"] == "Test summary"
        assert "video_id" in result
    
    @patch('app.core.summary_service.yt_dlp')
    def test_extract_video_info(self, mock_yt_dlp):
        """Test video information extraction"""
        mock_yt_dlp.YoutubeDL.return_value.extract_info.return_value = {
            "title": "Test Video",
            "description": "Test description",
            "duration": 120
        }
        
        service = SummaryService()
        info = service.extract_video_info("https://youtube.com/watch?v=test")
        
        assert info["title"] == "Test Video"
        assert info["duration"] == 120

class TestVoiceService:
    """Test the voice service"""
    
    @patch('app.core.voice_service.whisper')
    def test_transcribe_audio(self, mock_whisper):
        """Test audio transcription"""
        mock_whisper.load_model.return_value.transcribe.return_value = {
            "text": "Test transcription"
        }
        
        service = VoiceService()
        result = service.transcribe_audio("test_audio.wav")
        
        assert result["text"] == "Test transcription"
    
    @patch('app.core.voice_service.openvoice')
    def test_synthesize_speech(self, mock_openvoice):
        """Test speech synthesis"""
        mock_openvoice.return_value.tts.return_value = b"audio_data"
        
        service = VoiceService()
        result = service.synthesize_speech("Test text", "test_voice")
        
        assert result["audio_data"] == b"audio_data"

class TestDemoService:
    """Test the demo service"""
    
    def test_create_session(self):
        """Test demo session creation"""
        service = DemoService()
        session = service.create_session()
        
        assert "session_id" in session
        assert "expires_at" in session
        assert "usage" in session
    
    def test_check_limits(self):
        """Test demo usage limits"""
        service = DemoService()
        
        # Test within limits
        session = {
            "usage": {"summaries": 1, "transcriptions": 0},
            "expires_at": "2024-12-31T23:59:59"
        }
        assert service.check_limits(session, "summary") == True
        
        # Test over limit
        session["usage"]["summaries"] = 10
        assert service.check_limits(session, "summary") == False
    
    def test_update_usage(self):
        """Test usage tracking"""
        service = DemoService()
        session = {
            "usage": {"summaries": 0, "transcriptions": 0}
        }
        
        updated = service.update_usage(session, "summary")
        assert updated["usage"]["summaries"] == 1
        
        updated = service.update_usage(updated, "transcription")
        assert updated["usage"]["transcriptions"] == 1

class TestConfig:
    """Test configuration settings"""
    
    def test_settings_loaded(self):
        """Test that settings are properly loaded"""
        assert hasattr(settings, 'OPENAI_API_KEY')
        assert hasattr(settings, 'PINECONE_API_KEY')
        assert hasattr(settings, 'NEO4J_URI')
        assert settings.PROJECT_NAME == "YTS by AI"
    
    def test_cors_origins(self):
        """Test CORS origins configuration"""
        assert "http://localhost:3000" in settings.ALLOWED_ORIGINS
        assert "chrome-extension://*" in settings.ALLOWED_ORIGINS
    
    def test_demo_settings(self):
        """Test demo portal settings"""
        assert settings.DEMO_ENABLED == True
        assert settings.DEMO_SUMMARY_LIMIT == 3
        assert settings.DEMO_TRANSCRIPTION_LIMIT == 2 