'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  AlertTriangle, 
  Rocket, 
  Trash2,
  Filter,
  RefreshCw,
  Eye,
  Clock,
  User,
  Globe,
  Mail
} from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

interface Feedback {
  id: string;
  feedback_type: string;
  message: string;
  user_email: string | null;
  user_uid: string | null;
  user_agent: string | null;
  ip_address: string | null;
  page_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
}

interface FeedbackStats {
  total_feedback: number;
  by_type: Record<string, number>;
  by_status: Record<string, number>;
  recent_feedback: number;
  anonymous_feedback: number;
}

interface FeedbackListResponse {
  feedback: Feedback[];
  total_count: number;
  stats: FeedbackStats;
}

const AdminFeedbackPanel: React.FC = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const auth = getAuth();

  const fetchFeedback = async () => {
    try {
      setIsLoading(true);
      const token = await auth.currentUser?.getIdToken();
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const params = new URLSearchParams();
      if (filterType !== 'all') {
        params.append('feedback_type', filterType);
      }

      const response = await fetch(`/api/v1/admin/feedback?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: FeedbackListResponse = await response.json();
        setFeedback(data.feedback);
        setStats(data.stats);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch feedback');
        toast.error('Failed to fetch feedback');
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Error fetching feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFeedback = async (feedbackId: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`/api/v1/admin/feedback/${feedbackId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setFeedback(prev => prev.filter(f => f.id !== feedbackId));
        toast.success('Feedback deleted successfully');
        fetchFeedback(); // Refresh to update stats
      } else {
        toast.error('Failed to delete feedback');
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Error deleting feedback');
    }
  };

  const updateStatus = async (feedbackId: string, status: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`/api/v1/admin/feedback/${feedbackId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setFeedback(prev => 
          prev.map(f => 
            f.id === feedbackId 
              ? { ...f, status, updated_at: new Date().toISOString() }
              : f
          )
        );
        toast.success(`Status updated to ${status}`);
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status');
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [filterType]);

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'bug':
        return <Bug className="h-4 w-4 text-red-600" />;
      case 'issue':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'idea':
        return <Lightbulb className="h-4 w-4 text-green-600" />;
      case 'feature':
        return <Rocket className="h-4 w-4 text-blue-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };



  const truncateMessage = (message: string, maxLength: number = 100) => {
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  if (isLoading && feedback.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Feedback Management</h2>
          <p className="text-gray-600">
            Review and manage user feedback and bug reports
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <Button onClick={fetchFeedback} disabled={isLoading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_feedback}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent (7 days)</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recent_feedback}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anonymous</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.anonymous_feedback}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bugs</CardTitle>
              <Bug className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.by_type.bug || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ideas</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.by_type.idea || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Type:</span>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="bug">Bug Reports</SelectItem>
                  <SelectItem value="issue">Issues</SelectItem>
                  <SelectItem value="idea">Feature Ideas</SelectItem>
                  <SelectItem value="feature">Feature Requests</SelectItem>
                  <SelectItem value="general">General Feedback</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback ({feedback.length})</CardTitle>
          <CardDescription>
            Latest feedback from users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {feedback.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No feedback found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedback.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getFeedbackIcon(item.feedback_type)}
                        <Badge variant="outline" className="text-xs">
                          {item.feedback_type}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                          {item.status}
                        </Badge>
                        {item.is_anonymous && (
                          <Badge variant="secondary" className="text-xs">
                            Anonymous
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm mb-2">{truncateMessage(item.message)}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(item.created_at)}
                        </span>
                        {item.user_email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {item.user_email}
                          </span>
                        )}
                        {item.page_url && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {new URL(item.page_url).pathname}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        onClick={() => updateStatus(item.id, 'reviewing')}
                        size="sm"
                        variant="outline"
                        disabled={item.status === 'reviewing'}
                      >
                        Review
                      </Button>
                      <Button
                        onClick={() => updateStatus(item.id, 'resolved')}
                        size="sm"
                        variant="outline"
                        disabled={item.status === 'resolved'}
                      >
                        Resolve
                      </Button>
                      <Button
                        onClick={() => deleteFeedback(item.id)}
                        size="sm"
                        variant="destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFeedbackPanel; 