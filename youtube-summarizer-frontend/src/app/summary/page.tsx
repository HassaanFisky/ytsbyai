'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import UploadCard from '@/components/UploadCard';
import SummaryCard from '@/components/SummaryCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

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

export default function SummaryPage() {
  const [currentSummary, setCurrentSummary] = useState<Summary | null>(null);
  const [showUploadCard, setShowUploadCard] = useState(true);
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  const handleSummaryCreated = (summary: Summary) => {
    setCurrentSummary(summary);
    setShowUploadCard(false);
  };

  const handleCreateNew = () => {
    setCurrentSummary(null);
    setShowUploadCard(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            
            {currentSummary && (
              <Button
                onClick={handleCreateNew}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create New Summary
              </Button>
            )}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              {currentSummary ? 'Summary Result' : 'Create YouTube Summary'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {currentSummary 
                ? 'Your AI-generated summary is ready'
                : 'Transform any YouTube video into an intelligent summary'
              }
            </p>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {showUploadCard && !currentSummary ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <UploadCard onSummaryCreated={handleSummaryCreated} />
              
              {/* Tips Card */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="text-lg">💡 Tips for Best Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      <span>Works best with educational, tutorial, or informational videos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      <span>Videos with clear speech and good audio quality produce better summaries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      <span>Supports videos up to 2 hours in length</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      <span>Processing time varies based on video length (typically 30 seconds to 2 minutes)</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ) : currentSummary ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SummaryCard summary={currentSummary} />
              
              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What&apos;s Next?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={handleCreateNew}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create Another Summary
                    </Button>
                    <Link href="/dashboard">
                      <Button variant="outline" className="w-full">
                        View All Summaries
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Share & Export</CardTitle>
                    <CardDescription>
                      Share your summary or export it for later use
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Use the share and copy buttons above to save or share this summary with others.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}