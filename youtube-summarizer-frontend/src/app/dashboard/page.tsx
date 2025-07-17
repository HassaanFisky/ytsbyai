'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { apiMethods } from '@/lib/api';
import SummaryCard from '@/components/SummaryCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Clock,
  Youtube,
  Loader2,
  RefreshCw,
  FileText,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

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

export default function DashboardPage() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [filteredSummaries, setFilteredSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchSummariesCallback = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiMethods.getSummaries();
      setSummaries(data || []);
    } catch (error: unknown) {
      console.error('Error fetching summaries:', error);
      const axiosError = error as { response?: { status: number } };
      if (axiosError.response?.status === 401) {
        toast.error('Please log in to view your summaries');
        router.push('/login');
      } else {
        toast.error('Failed to load summaries');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  const filterAndSortSummariesCallback = useCallback(() => {
    let filtered = summaries;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(summary =>
        summary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        summary.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        summary.channel_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredSummaries(filtered);
  }, [summaries, searchQuery, sortBy]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSummariesCallback();
    }
  }, [isAuthenticated, fetchSummariesCallback]);

  useEffect(() => {
    filterAndSortSummariesCallback();
  }, [filterAndSortSummariesCallback]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSummariesCallback();
    setRefreshing(false);
    toast.success('Summaries refreshed!');
  };

  const getTotalDuration = () => {
    return summaries.reduce((total, summary) => total + (summary.video_duration || 0), 0);
  };

  const formatTotalDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Welcome back, {user?.displayName || user?.email?.split('@')[0]}!
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage your YouTube summaries and insights
              </p>
            </div>
            
            <Link href="/summary">
              <Button size="lg" className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Summary
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Summaries</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaries.length}</div>
                <p className="text-xs text-muted-foreground">
                  {summaries.length > 0 && `Latest: ${formatDistanceToNow(new Date(summaries[0]?.created_at), { addSuffix: true })}`}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Content Processed</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTotalDuration(getTotalDuration())}</div>
                <p className="text-xs text-muted-foreground">
                  Total video duration summarized
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summaries.filter(s => 
                    new Date(s.created_at).getMonth() === new Date().getMonth()
                  ).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Summaries created this month
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search summaries by title, content, or channel..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
                    className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">Title A-Z</option>
                  </select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summaries List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading your summaries...</p>
              </div>
            </div>
          ) : filteredSummaries.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                {summaries.length === 0 ? (
                  <>
                    <Youtube className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No summaries yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Create your first YouTube summary to get started
                    </p>
                    <Link href="/summary">
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create Your First Summary
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No results found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search query or filters
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear Search
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Your Summaries ({filteredSummaries.length})
                </h2>
                {searchQuery && (
                  <Badge variant="secondary">
                    Filtered by: &quot;{searchQuery}&quot;
                  </Badge>
                )}
              </div>
              
              {filteredSummaries.map((summary, index) => (
                <motion.div
                  key={summary.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <SummaryCard summary={summary} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}