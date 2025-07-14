'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Youtube, Mic, Sparkles, Play, Pause, Square, AlertCircle, CheckCircle } from 'lucide-react'

interface SummaryInputProps {
  onSummaryGenerated?: (summary: any) => void
  isLoading?: boolean
  setIsLoading?: (loading: boolean) => void
  subscriptionStatus?: string
}

export default function SummaryInput({ 
  onSummaryGenerated, 
  isLoading = false, 
  setIsLoading,
  subscriptionStatus = 'active'
}: SummaryInputProps) {
  const [inputType, setInputType] = useState<'youtube' | 'voice'>('youtube')
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState('')
  const [isValidUrl, setIsValidUrl] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // URL validation
  const validateYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    return youtubeRegex.test(url)
  }

  const handleInputChange = (value: string) => {
    setInput(value)
    setError('')
    
    if (inputType === 'youtube') {
      setIsValidUrl(validateYouTubeUrl(value))
    }
  }

  // Voice recording functionality
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        // TODO: Convert audio to text using Whisper API
        setInput('Voice recording completed. Processing...')
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      setError('Microphone access denied. Please allow microphone access to record voice.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim()) {
      setError('Please enter a YouTube URL or voice content.')
      return
    }

    if (inputType === 'youtube' && !isValidUrl) {
      setError('Please enter a valid YouTube URL.')
      return
    }

    if (subscriptionStatus !== 'active') {
      setError('Please upgrade your subscription to generate summaries.')
      return
    }

    setIsLoading?.(true)
    setError('')
    
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      const mockSummary = {
        id: Date.now().toString(),
        content: `This is a mock summary of your ${inputType === 'youtube' ? 'YouTube video' : 'voice input'}. The actual AI-powered summary will be generated here.`,
        type: inputType,
        source: input,
        timestamp: new Date().toISOString()
      }
      
      onSummaryGenerated?.(mockSummary)
    } catch (error) {
      setError('Failed to generate summary. Please try again.')
      console.error('Error generating summary:', error)
    } finally {
      setIsLoading?.(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Input Type Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setInputType('youtube')
            setInput('')
            setError('')
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            inputType === 'youtube'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          aria-label="YouTube URL input"
        >
          <Youtube size={20} />
          YouTube URL
        </button>
        <button
          onClick={() => {
            setInputType('voice')
            setInput('')
            setError('')
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            inputType === 'voice'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          aria-label="Voice input"
        >
          <Mic size={20} />
          Voice Input
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
        </motion.div>
      )}

      {/* Success Indicator for Valid URL */}
      {inputType === 'youtube' && input && isValidUrl && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
        >
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-green-700 dark:text-green-400 text-sm">Valid YouTube URL</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          {inputType === 'youtube' ? (
            <div className="relative">
              <input
                type="url"
                placeholder="Paste YouTube URL here..."
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  input && isValidUrl 
                    ? 'border-green-300 dark:border-green-700' 
                    : input 
                    ? 'border-red-300 dark:border-red-700' 
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                aria-label="YouTube URL input"
              />
              {input && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isValidUrl ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                placeholder="Type or paste your content here..."
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                aria-label="Voice content input"
              />
              
              {/* Voice Recording Controls */}
              <div className="flex items-center gap-3">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    aria-label="Start voice recording"
                  >
                    <Play className="h-4 w-4" />
                    Start Recording
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Recording...</span>
                    </div>
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      aria-label="Stop voice recording"
                    >
                      <Square className="h-4 w-4" />
                      Stop Recording
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!input.trim() || isLoading || (inputType === 'youtube' && !isValidUrl)}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          aria-label="Generate summary"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Generating Summary...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Generate Summary
            </>
          )}
        </button>
      </form>
    </motion.div>
  )
} 