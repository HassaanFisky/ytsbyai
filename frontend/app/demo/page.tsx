import React from 'react';
import DemoPortal from '@/components/demo-portal';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Try YTS by AI - Free Demo | YouTube Summarizer & Voice Transcription',
  description: 'Experience AI-powered YouTube summarization and voice transcription. Try our free demo with 3 summaries and 2 transcriptions. No signup required.',
  keywords: 'youtube summarizer, voice transcription, AI demo, free trial, video summary',
  openGraph: {
    title: 'Try YTS by AI - Free Demo',
    description: 'Experience AI-powered YouTube summarization and voice transcription. Try our free demo with 3 summaries and 2 transcriptions.',
    type: 'website',
    url: '/demo',
  },
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DemoPortal />
    </div>
  );
} 