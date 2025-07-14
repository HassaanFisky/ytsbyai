'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mic, 
  Play, 
 
  Download, 
  Copy, 
  Share2, 
  Youtube, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Sparkles,
  Users,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import QuotaExceededModal from './QuotaExceededModal';
import { useDemoStore, useDemoStats, useQuotaExceeded, useDemoActions, useQuotaHelpers } from '@/lib/demo-store';
import { redirectToFirebaseSignup, redirectToStripeCheckout } from '@/lib/redirect-utils';

interface DemoStats {
  guest_id: string;
  session_id: string;
  created_at: string;
  ip_address: string;
  usage: {
    summary: {
      used: number;
      limit: number;
      remaining: number;
    };
    transcription: {
      used: number;
      limit: number;
      remaining: number;
    };
  };
  total_used: number;
  total_limit: number;
  has_any_quota: boolean;
}

interface DemoLimits {
  summary: {
    limit: number;
    description: string;
  };
  transcription: {
    limit: number;
    description: string;
  };
  audio_max_duration: number;
  session_duration_hours: number;
}

interface TranscriptionResult {
  transcription: string;
  language: string;
  language_probability: number;
  duration: number;
  segments: any[];
  summary?: string;
  quota_info: any;
  session_id: string;
  error?: string;
}

interface SummaryResult {
  summary: string;
  title: string;
  tone: string;
  video_script?: string;
  cta: string;
  quota_info: any;
  session_id: string;
}

const DemoPortal: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoStats, setDemoStats] = useState<DemoStats | null>(null);
  const [demoLimits, setDemoLimits] = useState<DemoLimits | null>(null);
  const [activeTab, setActiveTab] = useState('transcription');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Global state
  const quotaExceeded = useQuotaExceeded();
  const { updateQuota, closeQuotaModal, setLoading, setError } = useDemoActions();
  const { shouldShowModal } = useQuotaHelpers();

  // Load demo session and limits on mount
  useEffect(() => {
    loadDemoSession();
    loadDemoLimits();
  }, []);

  // Check for quota exceeded and show modal
  useEffect(() => {
    if (shouldShowModal() && quotaExceeded.quotaInfo) {
      // Modal will be shown by QuotaExceededModal component
    }
  }, [quotaExceeded.isModalOpen, shouldShowModal]);

  const loadDemoSession = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/demo/session', {
        credentials: 'include'
      });
      if (response.ok) {
        const stats = await response.json();
        setDemoStats(stats);
      } else {
        setError('Failed to load demo session');
      }
    } catch (error) {
      console.error('Error loading demo session:', error);
      setError('Failed to load demo session');
    } finally {
      setLoading(false);
    }
  };

  const loadDemoLimits = async () => {
    try {
      const response = await fetch('/api/v1/demo/limits');
      if (response.ok) {
        const limits = await response.json();
        setDemoLimits(limits);
      }
    } catch (error) {
      console.error('Error loading demo limits:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const transcribeAudio = async () => {
    if (!audioBlob) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.wav');

      const response = await fetch('/api/v1/demo/transcribe', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        setTranscriptionResult(result);
        
        // Update global quota state
        updateQuota('transcription', result.quota_info.used);
        
        toast.success('Audio transcribed successfully!');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Transcription failed');
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      toast.error('Transcription failed');
    } finally {
      setIsLoading(false);
    }
  };

  const createSummary = async () => {
    if (!youtubeUrl.trim()) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/demo/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          youtube_url: youtubeUrl,
          tone: 'professional',
          max_length: 500
        }),
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        setSummaryResult(result);
        
        // Update global quota state
        updateQuota('summary', result.quota_info.used);
        
        toast.success('Summary created successfully!');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Summary creation failed');
      }
    } catch (error) {
      console.error('Error creating summary:', error);
      toast.error('Summary creation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('File downloaded!');
  };

  const shareContent = async (text: string, title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text
        });
        toast.success('Content shared!');
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyToClipboard(text, title);
    }
  };



  const getQuotaColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Modal handlers
  const handleContinueFree = () => {
    redirectToFirebaseSignup('quota_modal');
  };

  const handleUnlockPro = () => {
    redirectToStripeCheckout('price_1OqX2X2X2X2X2X2X2X2X2X2X', 'quota_modal');
  };

  if (!demoStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading demo portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Try YTS by AI
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Experience AI-powered YouTube summarization and voice transcription
          </p>
          
          {/* Demo Stats */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Demo Usage</h3>
              <Badge variant={demoStats.has_any_quota ? "default" : "destructive"}>
                {demoStats.has_any_quota ? "Active" : "Quota Exceeded"}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">YouTube Summaries</span>
                  <span className="text-sm text-gray-500">
                    {demoStats.usage.summary.used}/{demoStats.usage.summary.limit}
                  </span>
                </div>
                <Progress 
                  value={(demoStats.usage.summary.used / demoStats.usage.summary.limit) * 100}
                  className="h-2"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Voice Transcriptions</span>
                  <span className="text-sm text-gray-500">
                    {demoStats.usage.transcription.used}/{demoStats.usage.transcription.limit}
                  </span>
                </div>
                <Progress 
                  value={(demoStats.usage.transcription.used / demoStats.usage.transcription.limit) * 100}
                  className="h-2"
                />
              </div>
            </div>
            
            {!demoStats.has_any_quota && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You've reached your demo limit. <a href="/auth" className="font-semibold text-blue-600 hover:underline">Sign up</a> for unlimited access!
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Demo Limits Info */}
        {demoLimits && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Demo Features & Limits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Youtube className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium">YouTube Summaries</p>
                    <p className="text-sm text-gray-600">{demoLimits.summary.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mic className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Voice Transcription</p>
                    <p className="text-sm text-gray-600">Max {demoLimits.audio_max_duration}s audio</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Demo Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transcription" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Voice Transcription
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <Youtube className="h-4 w-4" />
              YouTube Summary
            </TabsTrigger>
          </TabsList>

          {/* Voice Transcription Tab */}
          <TabsContent value="transcription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Voice Transcription Demo</CardTitle>
                <CardDescription>
                  Record up to 30 seconds of audio and get instant transcription with AI summary
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Recording Controls */}
                <div className="flex items-center gap-4">
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={!demoStats?.has_any_quota || quotaExceeded?.transcription}
                    variant={isRecording ? "destructive" : "default"}
                    className="flex items-center gap-2"
                  >
                    {isRecording ? (
                      <>
                        <Stop className="h-4 w-4" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4" />
                        Start Recording
                      </>
                    )}
                  </Button>
                  
                  {audioBlob && (
                    <Button
                      onClick={transcribeAudio}
                      disabled={isLoading || !demoStats?.has_any_quota || quotaExceeded.transcription}
                      className="flex items-center gap-2"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      {isLoading ? 'Transcribing...' : 'Transcribe Audio'}
                    </Button>
                  )}
                </div>

                {/* Audio Duration Warning */}
                {demoLimits && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Maximum recording duration: {demoLimits.audio_max_duration} seconds
                    </AlertDescription>
                  </Alert>
                )}

                {/* Transcription Result */}
                {transcriptionResult && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Transcription</h4>
                      <p className="text-gray-700">{transcriptionResult.transcription}</p>
                      
                      <div className="flex items-center gap-4 mt-4">
                        <Button
                          onClick={() => copyToClipboard(transcriptionResult.transcription, 'Transcription')}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Copy
                        </Button>
                        <Button
                          onClick={() => downloadText(transcriptionResult.transcription, 'transcription.txt')}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                        <Button
                          onClick={() => shareContent(transcriptionResult.transcription, 'My Transcription')}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Share2 className="h-4 w-4" />
                          Share
                        </Button>
                      </div>
                    </div>

                    {transcriptionResult.summary && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">AI Summary</h4>
                        <p className="text-gray-700">{transcriptionResult.summary}</p>
                      </div>
                    )}

                    <div className="text-sm text-gray-500">
                      <p>Language: {transcriptionResult.language} ({Math.round(transcriptionResult.language_probability * 100)}% confidence)</p>
                      <p>Duration: {transcriptionResult.duration.toFixed(1)} seconds</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* YouTube Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>YouTube Summary Demo</CardTitle>
                <CardDescription>
                  Enter a YouTube URL and get an AI-powered summary
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter YouTube URL..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={createSummary}
                    disabled={isLoading || !youtubeUrl.trim() || !demoStats?.has_any_quota || quotaExceeded.summary}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {isLoading ? 'Creating Summary...' : 'Create Summary'}
                  </Button>
                </div>

                {/* Summary Result */}
                {summaryResult && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{summaryResult.title}</h4>
                      <p className="text-gray-700 mb-4">{summaryResult.summary}</p>
                      
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={() => copyToClipboard(summaryResult.summary, 'Summary')}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Copy Summary
                        </Button>
                        <Button
                          onClick={() => downloadText(summaryResult.summary, 'summary.txt')}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                        <Button
                          onClick={() => shareContent(summaryResult.summary, summaryResult.title)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Share2 className="h-4 w-4" />
                          Share
                        </Button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      <p>Tone: {summaryResult.tone}</p>
                      <p>CTA: {summaryResult.cta}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Conversion CTA */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Ready for Unlimited Access?</h3>
              <p className="text-blue-100 mb-6">
                Get unlimited summaries, transcriptions, and advanced AI features
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleContinueFree}
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Sign Up Free
                </Button>
                <Button
                  onClick={handleUnlockPro}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  View Plans
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quota Exceeded Modal */}
      <QuotaExceededModal
        isOpen={quotaExceeded.isModalOpen}
        onClose={closeQuotaModal}
        quotaInfo={quotaExceeded.quotaInfo!}
        onContinueFree={handleContinueFree}
        onUnlockPro={handleUnlockPro}
      />
    </div>
  );
};

export default DemoPortal; 