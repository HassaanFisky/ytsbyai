'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Calendar, 
  ExternalLink, 
  Copy, 
  Share2,
  Youtube,
  User,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface SummaryData {
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

interface SummaryCardProps {
  summary: SummaryData;
  showActions?: boolean;
  className?: string;
}

export default function SummaryCard({ 
  summary, 
  showActions = true,
  className = "" 
}: SummaryCardProps) {
  
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary.summary);
      toast.success('Summary copied to clipboard!');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: summary.title,
          text: summary.summary,
          url: window.location.href,
        });
      } catch {
        // User cancelled sharing or error occurred
      }
    } else {
      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Summary URL copied to clipboard!');
      } catch {
        toast.error('Failed to copy URL');
      }
    }
  };

  const openYouTubeVideo = () => {
    window.open(summary.youtube_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col space-y-4">
            {/* Video Thumbnail and Basic Info */}
            <div className="flex flex-col md:flex-row gap-4">
              {summary.thumbnail_url && (
                <div className="flex-shrink-0">
                  <Image
                    src={summary.thumbnail_url}
                    alt={summary.title}
                    width={192}
                    height={112}
                    className="w-full md:w-48 h-28 object-cover rounded-md"
                  />
                </div>
              )}
              
              <div className="flex-1 space-y-2">
                <CardTitle className="text-lg md:text-xl leading-tight">
                  {summary.title}
                </CardTitle>
                
                {/* Video metadata */}
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  {summary.channel_name && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{summary.channel_name}</span>
                    </div>
                  )}
                  
                  {summary.video_duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(summary.video_duration)}</span>
                    </div>
                  )}
                  
                  {summary.view_count && (
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{formatViewCount(summary.view_count)} views</span>
                    </div>
                  )}
                </div>
                
                {/* Created date */}
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(summary.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            {showActions && (
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={openYouTubeVideo}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Youtube className="h-3 w-3" />
                  <span>Watch Video</span>
                  <ExternalLink className="h-3 w-3" />
                </Button>
                
                <Button
                  onClick={handleCopyToClipboard}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" />
                  <span>Copy Summary</span>
                </Button>
                
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Share2 className="h-3 w-3" />
                  <span>Share</span>
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Summary</h3>
              <Badge variant="secondary">AI Generated</Badge>
            </div>
            
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {summary.summary}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}