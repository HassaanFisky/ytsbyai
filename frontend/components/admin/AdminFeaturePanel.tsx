"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth } from '../../hooks/use-auth';
import { api } from '../../lib/api';
import { toast } from 'react-hot-toast';
import { getStatusInfo, getPriorityInfo, formatDate } from '@/lib/utils';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  feature_type: string;
  author_id: string;
  author_email: string;
  created_at: string;
  updated_at: string;
  vote_count: number;
  upvotes: number;
  downvotes: number;
  status: string;
  tags: string[];
  screenshot_url?: string;
  priority: string;
  estimated_effort?: string;
  assigned_to?: string;
  comments_count: number;
}

interface FeatureStats {
  total_features: number;
  status_counts: Record<string, number>;
  type_counts: Record<string, number>;
  priority_counts: Record<string, number>;
  total_votes: number;
  avg_votes_per_feature: number;
}

interface TopVoter {
  user_id: string;
  vote_count: number;
}

const statuses = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-800" },
  { value: "planned", label: "Planned", color: "bg-blue-100 text-blue-800" },
  { value: "in_progress", label: "In Progress", color: "bg-yellow-100 text-yellow-800" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" }
];

const priorities = [
  { value: "low", label: "Low", color: "bg-gray-100 text-gray-800" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-800" }
];

export default function AdminFeaturePanel() {
  const { user } = useAuth();
  const [features, setFeatures] = useState<FeatureRequest[]>([]);
  const [stats, setStats] = useState<FeatureStats | null>(null);
  const [topVoters, setTopVoters] = useState<TopVoter[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [deletingFeature, setDeletingFeature] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, [filterStatus, filterType, filterPriority]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load features
      const params = new URLSearchParams({
        limit: '500'
      });
      if (filterStatus) params.append('status', filterStatus);
      if (filterType) params.append('feature_type', filterType);
      if (filterPriority) params.append('priority', filterPriority);

      const [featuresResponse, statsResponse, votersResponse] = await Promise.all([
        api.get(`/features/admin/all?${params.toString()}`),
        api.get('/features/admin/stats'),
        api.get('/features/admin/top-voters?limit=10')
      ]);

      setFeatures(featuresResponse.data);
      setStats(statsResponse.data);
      setTopVoters(votersResponse.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const updateFeatureStatus = async (featureId: string, status: string) => {
    try {
      setUpdatingStatus(featureId);
      
      const response = await api.put(`/features/admin/${featureId}/status`, {
        status
      });

      // Update the feature in the list
      setFeatures(prev => prev.map(feature => 
        feature.id === featureId 
          ? { ...feature, status, updated_at: new Date().toISOString() }
          : feature
      ));

      toast.success(`Feature status updated to ${status}`);
    } catch (error: any) {
      console.error('Error updating feature status:', error);
      toast.error(error.response?.data?.detail || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const deleteFeature = async (featureId: string) => {
    if (!confirm('Are you sure you want to delete this feature request? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingFeature(featureId);
      
      await api.delete(`/features/admin/${featureId}`);

      // Remove from list
      setFeatures(prev => prev.filter(feature => feature.id !== featureId));

      toast.success('Feature request deleted successfully');
    } catch (error: any) {
      console.error('Error deleting feature:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete feature');
    } finally {
      setDeletingFeature(null);
    }
  };

  const searchFeatures = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/features/search?q=${encodeURIComponent(searchQuery)}&limit=100`);
      setFeatures(response.data);
    } catch (error) {
      console.error('Error searching features:', error);
      toast.error('Failed to search features');
    } finally {
      setLoading(false);
    }
  };



  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Access Required</h3>
            <p className="text-gray-600">You need admin privileges to access this panel</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feature Request Admin</h1>
          <p className="text-gray-600 mt-1">Manage feature requests and track community engagement</p>
        </div>
        <Button onClick={loadData} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search feature requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchFeatures()}
              className="pl-10"
            />
          </div>
          <Button onClick={searchFeatures} variant="outline">
            Search
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="enhancement">Enhancement</SelectItem>
              <SelectItem value="bug_fix">Bug Fix</SelectItem>
              <SelectItem value="new_feature">New Feature</SelectItem>
              <SelectItem value="ui_improvement">UI Improvement</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Priority</SelectItem>
              {priorities.map(priority => (
                <SelectItem key={priority.value} value={priority.value}>
                  {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Feature Requests</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="voters">Top Voters</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Features</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_features}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Votes</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_votes}</p>
                    </div>
                    <ThumbsUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Votes/Feature</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.avg_votes_per_feature.toFixed(1)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Voters</p>
                      <p className="text-2xl font-bold text-gray-900">{topVoters.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Status Distribution */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.status_counts).map(([status, count]) => {
                      const statusInfo = getStatusInfo(status);
                      const percentage = ((count / stats.total_features) * 100).toFixed(1);
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={statusInfo.color}>
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{count}</div>
                            <div className="text-sm text-gray-500">{percentage}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.type_counts).map(([type, count]) => {
                      const percentage = ((count / stats.total_features) * 100).toFixed(1);
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{count}</div>
                            <div className="text-sm text-gray-500">{percentage}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading features...</p>
            </div>
          ) : features.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No feature requests found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {features.map((feature) => (
                <AdminFeatureCard
                  key={feature.id}
                  feature={feature}
                  onStatusUpdate={updateFeatureStatus}
                  onDelete={deleteFeature}
                  updatingStatus={updatingStatus === feature.id}
                  deleting={deletingFeature === feature.id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-6">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Priority Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.priority_counts).map(([priority, count]) => {
                      const priorityInfo = getPriorityInfo(priority);
                      const percentage = ((count / stats.total_features) * 100).toFixed(1);
                      return (
                        <div key={priority} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={priorityInfo.color}>
                              {priorityInfo.label}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{count}</div>
                            <div className="text-sm text-gray-500">{percentage}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Voting Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Votes</span>
                      <span className="font-bold">{stats.total_votes}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Votes per Feature</span>
                      <span className="font-bold">{stats.avg_votes_per_feature.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Features with Votes</span>
                      <span className="font-bold">
                        {features.filter(f => f.vote_count > 0).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Top Voters Tab */}
        <TabsContent value="voters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Voters</CardTitle>
            </CardHeader>
            <CardContent>
              {topVoters.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No voting data available</p>
              ) : (
                <div className="space-y-3">
                  {topVoters.map((voter, index) => (
                    <div key={voter.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {voter.user_id.substring(0, 8)}...
                          </div>
                          <div className="text-sm text-gray-500">User ID</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{voter.vote_count}</div>
                        <div className="text-sm text-gray-500">votes</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface AdminFeatureCardProps {
  feature: FeatureRequest;
  onStatusUpdate: (featureId: string, status: string) => void;
  onDelete: (featureId: string) => void;
  updatingStatus: boolean;
  deleting: boolean;
}

function AdminFeatureCard({ 
  feature, 
  onStatusUpdate, 
  onDelete, 
  updatingStatus, 
  deleting 
}: AdminFeatureCardProps) {
  const statusInfo = getStatusInfo(feature.status);
  const priorityInfo = getPriorityInfo(feature.priority);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {feature.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={statusInfo.color}>
                {statusInfo.label}
              </Badge>
              <Badge className={priorityInfo.color}>
                {priorityInfo.label}
              </Badge>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {feature.vote_count}
            </div>
            <div className="text-xs text-gray-500">votes</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-gray-600 line-clamp-2 mb-4">
          {feature.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{feature.author_email}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(feature.created_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span>{feature.upvotes}</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsDown className="h-4 w-4" />
              <span>{feature.downvotes}</span>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <Select
              value={feature.status}
              onValueChange={(status: string) => onStatusUpdate(feature.id, status)}
              disabled={updatingStatus}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(feature.id)}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 