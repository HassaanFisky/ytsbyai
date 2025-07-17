'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, Youtube } from 'lucide-react';
import { apiMethods } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface Summary {
  id: string;
  title: string;
  summary: string;
  youtube_url: string;
  thumbnail_url?: string;
  video_duration?: number;
  channel_name?: string;
  view_count?: number;
  created_at: string;
  updated_at: string;
}

interface UploadCardProps {
  onSummaryCreated?: (summary: Summary) => void;
}

export default function UploadCard({ onSummaryCreated }: UploadCardProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isValidYouTubeUrl = (url: string) => {
    const patterns = [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
      /^https?:\/\/(www\.)?youtu\.be\/[\w-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    setLoading(true);
    try {
      const summary = await apiMethods.createSummary(url) as Summary;
      toast.success('Summary created successfully!');
      
      if (onSummaryCreated) {
        onSummaryCreated(summary);
      } else {
        // Navigate to the summary page if no callback provided
        router.push(`/summary/${summary.id}`);
      }
      
      setUrl(''); // Clear the input
    } catch (error: unknown) {
      console.error('Error creating summary:', error);
      
      const axiosError = error as { 
        response?: { 
          status: number; 
          data?: { detail?: string } 
        } 
      };
      
      if (axiosError.response?.status === 401) {
        toast.error('Please log in to create summaries');
        router.push('/login');
      } else if (axiosError.response?.status === 400) {
        toast.error('Invalid YouTube URL or video not accessible');
      } else if (axiosError.response?.status === 429) {
        toast.error('Too many requests. Please try again later.');
      } else {
        toast.error(axiosError.response?.data?.detail || 'Failed to create summary');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Youtube className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Create YouTube Summary
          </CardTitle>
          <CardDescription>
            Enter a YouTube URL to generate an AI-powered summary of the video content
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-url">YouTube URL</Label>
              <Input
                id="youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                className="w-full"
                required
              />
              <p className="text-sm text-muted-foreground">
                Supports youtube.com/watch, youtu.be, and youtube.com/embed URLs
              </p>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full flex items-center justify-center space-x-2"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Summary...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Create Summary</span>
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}