'use client'

import { motion } from 'framer-motion'
import { Copy, Check, ArrowLeft, Share2, Download, Play, Pause, Volume2, Calendar, Clock, ExternalLink } from 'lucide-react'
import { useState, useRef } from 'react'
import { formatDate } from '@/lib/utils';

interface SummaryDisplayProps {
  summary?: any
  isLoading?: boolean
  onNewSummary?: () => void
}

export default function SummaryDisplay({ summary, isLoading, onNewSummary }: SummaryDisplayProps) {
  const [copied, setCopied] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)

  const handleCopy = async () => {
    if (summary?.content) {
      try {
        await navigator.clipboard.writeText(summary.content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy:', error)
      }
    }
  }

  const handleShare = async () => {
    if (navigator.share && summary?.content) {
      try {
        await navigator.share({
          title: 'YTS by AI Summary',
          text: summary.content,
          url: window.location.href
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      setShowShareMenu(!showShareMenu)
    }
  }

  const handleExport = () => {
    if (summary?.content) {
      const blob = new Blob([summary.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `summary-${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleVoicePlayback = () => {
    if (!summary?.content) return

    if (isPlaying) {
      // Stop playback
      if (speechRef.current) {
        window.speechSynthesis.cancel()
      }
      setIsPlaying(false)
    } else {
      // Start playback
      const utterance = new SpeechSynthesisUtterance(summary.content)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => setIsPlaying(false)
      
      speechRef.current = utterance
      window.speechSynthesis.speak(utterance)
      setIsPlaying(true)
    }
  }



  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-4xl mx-auto"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (!summary) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onNewSummary}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Create new summary"
            >
              <ArrowLeft size={16} />
              New Summary
            </button>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Generated Summary</h3>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDate(summary.timestamp)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  {summary.type === 'youtube' ? 'YouTube Video' : 'Voice Input'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleVoicePlayback}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label={isPlaying ? 'Stop voice playback' : 'Start voice playback'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? 'Stop' : 'Play'}
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Share summary"
            >
              <Share2 size={16} />
              Share
            </button>
            
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Export summary"
            >
              <Download size={16} />
              Export
            </button>
            
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Copy summary to clipboard"
            >
              {copied ? (
                <>
                  <Check size={16} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Share Menu */}
        {showShareMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  setShowShareMenu(false)
                }}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Copy Link
              </button>
              <button
                onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(summary.content.substring(0, 100))}...&url=${encodeURIComponent(window.location.href)}`)
                  setShowShareMenu(false)
                }}
                className="px-3 py-1 text-xs bg-blue-400 text-white rounded hover:bg-blue-500 transition-colors"
              >
                Twitter
              </button>
              <button
                onClick={() => {
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`)
                  setShowShareMenu(false)
                }}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                LinkedIn
              </button>
            </div>
          </motion.div>
        )}

        {/* Summary Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
              {summary.content}
            </p>
          </div>
        </div>

        {/* Source Information */}
        {summary.source && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>Source:</strong> {summary.source}
                </p>
                {summary.type === 'youtube' && (
                  <a
                    href={summary.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 transition-colors mt-1"
                  >
                    <ExternalLink size={12} />
                    Open on YouTube
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Volume2 size={16} className="text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {summary.content.split(' ').length} words
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
} 