"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from '../hooks/use-auth';
import { api } from '../lib/api';
import { toast } from 'react-hot-toast';
import { getStatusInfo, getPriorityInfo, formatDate, getCategoryInfo, getDifficultyInfo } from '@/lib/utils';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  Star,
  MessageSquare,
  User,
  Calendar,
  Tag,
  Sparkles,
  Heart,
  Award,
  Lightbulb,
  Zap,
  BookOpen,
  Users as UsersIcon,
  Eye,
  Volume2,
  Video,
  Image as ImageIcon
} from 'lucide-react';

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  feature_type: string;
  category: string;
  author_id: string;
  author_email: string;
  author_type: string;
  created_at: string;
  updated_at: string;
  vote_count: number;
  upvotes: number;
  downvotes: number;
  status: string;
  tags: string[];
  screenshot_url?: string;
  audio_url?: string;
  video_url?: string;
  priority: string;
  estimated_effort?: string;
  assigned_to?: string;
  comments_count: number;
  helpful_count: number;
  difficulty_level: string;
  target_audience: string[];
  user_vote?: string;
}

interface UserProfile {
  user_id: string;
  user_type: string;
  created_at: string;
  feature_count: number;
  vote_count: number;
  helpful_votes: number;
  badges: string[];
}

interface FeatureBoardProps {
  onFeatureClick?: (feature: FeatureRequest) => void;
  onCreateNew?: () => void;
}

const categories = [
  { value: "beginner", label: "😊 For Beginners", emoji: "😊", description: "Easy to use features" },
  { value: "pro", label: "⚡ For Pros", emoji: "⚡", description: "Advanced features" },
  { value: "everyone", label: "🌟 For Everyone", emoji: "🌟", description: "Universal features" }
];

const difficulties = [
  { value: "easy", label: "😮 Easy", emoji: "😮", description: "Simple to implement" },
  { value: "medium", label: "⚙️ Medium", emoji: "⚙️", description: "Moderate complexity" },
  { value: "hard", label: "🎓 Advanced", emoji: "🎓", description: "Complex features" }
];

const audiences = [
  { value: "kids", label: "🧒 Kids", emoji: "🧒", description: "Child-friendly features" },
  { value: "beginners", label: "🌱 Beginners", emoji: "🌱", description: "New users" },
  { value: "pros", label: "🚀 Pros", emoji: "🚀", description: "Power users" },
  { value: "elderly", label: "👴 Elderly", emoji: "👴", description: "Accessibility features" }
];

const priorities = [
  { value: "low", label: "Low", color: "bg-gray-100 text-gray-800" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-800" }
];

const statuses = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-800" },
  { value: "planned", label: "Planned", color: "bg-blue-100 text-blue-800" },
  { value: "in_progress", label: "In Progress", color: "bg-yellow-100 text-yellow-800" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" }
];

export default function FeatureBoard({ onFeatureClick, onCreateNew }: FeatureBoardProps) {
  const { user } = useAuth();
  const [features, setFeatures] = useState<FeatureRequest[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('votes');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');
  const [filterAudience, setFilterAudience] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [activeTab, setActiveTab] = useState('all');
  const [showTooltips, setShowTooltips] = useState(true);

  useEffect(() => {
    loadFeatures();
    if (user) {
      loadUserProfile();
    }
  }, [sortBy, filterCategory, filterDifficulty, filterAudience, filterStatus, filterPriority]);

  const loadFeatures = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sort_by: sortBy,
        limit: '100'
      });

      if (filterCategory) params.append('category', filterCategory);
      if (filterDifficulty) params.append('difficulty_level', filterDifficulty);
      if (filterAudience) params.append('target_audience', filterAudience);
      if (filterStatus) params.append('status', filterStatus);
      if (filterPriority) params.append('priority', filterPriority);

      const response = await api.get(`/features?${params.toString()}`);
      setFeatures(response.data);
    } catch (error) {
      console.error('Error loading features:', error);
      toast.error('Failed to load feature requests');
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const response = await api.get('/features/user/profile');
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const searchFeatures = async () => {
    if (!searchQuery.trim()) {
      loadFeatures();
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/features/search?q=${encodeURIComponent(searchQuery)}&limit=50`);
      setFeatures(response.data);
    } catch (error) {
      console.error('Error searching features:', error);
      toast.error('Failed to search feature requests');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (featureId: string, voteType: 'upvote' | 'downvote') => {
    if (!user) {
      toast.error('Please log in to vote');
      return;
    }

    try {
      const userType = userProfile?.user_type || 'unknown';
      const response = await api.post(`/features/${featureId}/vote`, {
        vote_type: voteType,
        user_type: userType
      });

      // Update the feature in the list
      setFeatures(prev => prev.map(feature => 
        feature.id === featureId 
          ? { ...response.data.feature, user_vote: response.data.feature.user_vote }
          : feature
      ));

      // Reload user profile to update stats
      if (user) {
        loadUserProfile();
      }

      toast.success(response.data.message);
    } catch (error: any) {
      console.error('Error voting:', error);
      toast.error(error.response?.data?.detail || 'Failed to vote');
    }
  };



  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'feature_creator': return <Lightbulb className="h-4 w-4" />;
      case 'active_voter': return <Heart className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const filteredFeatures = features.filter(feature => {
    // Type cast to avoid Firebase User typings mismatch
    if (activeTab === 'my-requests' && feature.author_id !== (user as any)?.uid) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header with User Profile */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feature Requests</h1>
          <p className="text-gray-600 mt-1">Help us improve YTS by AI with your ideas!</p>
          
          {/* User Profile Summary */}
          {userProfile && (
            <div className="mt-3 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{userProfile.user_type}</span>
              </div>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-green-600" />
                <span>{userProfile.feature_count} ideas</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-600" />
                <span>{userProfile.vote_count} votes</span>
              </div>
              {userProfile.badges.length > 0 && (
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4 text-yellow-600" />
                  <span>{userProfile.badges.length} badges</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {user && (
            <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
              <Sparkles className="h-4 w-4 mr-2" />
              New Idea
            </Button>
          )}
          <Button 
            onClick={() => setShowTooltips(!showTooltips)} 
            variant="outline"
            size="sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            {showTooltips ? 'Hide' : 'Show'} Help
          </Button>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="space-y-4">
        {/* Emoji Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setFilterCategory('')}
            variant={filterCategory === '' ? 'default' : 'outline'}
            size="sm"
          >
            🌟 All
          </Button>
          {categories.map(category => (
            <Button
              key={category.value}
              onClick={() => setFilterCategory(category.value)}
              variant={filterCategory === category.value ? 'default' : 'outline'}
              size="sm"
              title={category.description}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Difficulty Filters */}
        <div className="flex flex-wrap gap-2">
          {difficulties.map(difficulty => (
            <Button
              key={difficulty.value}
              onClick={() => setFilterDifficulty(difficulty.value)}
              variant={filterDifficulty === difficulty.value ? 'default' : 'outline'}
              size="sm"
              title={difficulty.description}
            >
              {difficulty.label}
            </Button>
          ))}
        </div>

        {/* Audience Filters */}
        <div className="flex flex-wrap gap-2">
          {audiences.map(audience => (
            <Button
              key={audience.value}
              onClick={() => setFilterAudience(audience.value)}
              variant={filterAudience === audience.value ? 'default' : 'outline'}
              size="sm"
              title={audience.description}
            >
              {audience.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Search and Advanced Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search for features..."
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

        {/* Advanced Filters */}
        <div className="flex flex-wrap gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="votes">🔥 Most Popular</SelectItem>
              <SelectItem value="recent">🕒 Recent</SelectItem>
              <SelectItem value="priority">⚡ Priority</SelectItem>
            </SelectContent>
          </Select>

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
          <TabsTrigger value="all">🌟 All Features</TabsTrigger>
          {user && <TabsTrigger value="my-requests">💡 My Ideas</TabsTrigger>}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading features...</p>
            </div>
          ) : filteredFeatures.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No feature requests found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredFeatures.map((feature) => (
                <UniversalFeatureCard
                  key={feature.id}
                  feature={feature}
                  onVote={handleVote}
                  onClick={() => onFeatureClick?.(feature)}
                  isAuthor={feature.author_id === (user as any)?.uid}
                  showTooltips={showTooltips}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {user && (
          <TabsContent value="my-requests" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading your requests...</p>
              </div>
            ) : filteredFeatures.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">You haven't created any feature requests yet</p>
                <Button onClick={onCreateNew} className="mt-2">
                  Create Your First Idea
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredFeatures.map((feature) => (
                  <UniversalFeatureCard
                    key={feature.id}
                    feature={feature}
                    onVote={handleVote}
                    onClick={() => onFeatureClick?.(feature)}
                    isAuthor={true}
                    showTooltips={showTooltips}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

interface UniversalFeatureCardProps {
  feature: FeatureRequest;
  onVote: (featureId: string, voteType: 'upvote' | 'downvote') => void;
  onClick?: () => void;
  isAuthor?: boolean;
  showTooltips?: boolean;
}

function UniversalFeatureCard({ 
  feature, 
  onVote, 
  onClick, 
  isAuthor, 
  showTooltips 
}: UniversalFeatureCardProps) {
  const categoryInfo = getCategoryInfo(feature.category);
  const difficultyInfo = getDifficultyInfo(feature.difficulty_level);
  const priorityInfo = getPriorityInfo(feature.priority);
  const statusInfo = getStatusInfo(feature.status);

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
              {feature.title}
            </CardTitle>
            
            {/* Category and Difficulty Badges */}
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-blue-100 text-blue-800">
                {(categoryInfo as any).emoji ?? ''} {categoryInfo.label.split(' ')[2]}
              </Badge>
              <Badge className="bg-purple-100 text-purple-800">
                {(difficultyInfo as any).emoji ?? ''} {difficultyInfo.label.split(' ')[1]}
              </Badge>
              <Badge className={priorityInfo.color}>
                {priorityInfo.label}
              </Badge>
              <Badge className={statusInfo.color}>
                {statusInfo.label}
              </Badge>
              {isAuthor && (
                <Badge className="bg-purple-100 text-purple-800">
                  💡 Your Idea
                </Badge>
              )}
            </div>

            {/* Target Audience */}
            {feature.target_audience.length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <UsersIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  For: {feature.target_audience.join(', ')}
                </span>
              </div>
            )}
          </div>
          
          {/* Vote Count with Animation */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 group-hover:scale-110 transition-transform">
              {feature.vote_count}
            </div>
            <div className="text-xs text-gray-500">votes</div>
            {feature.helpful_count > 0 && (
              <div className="text-xs text-green-600 mt-1">
                👍 {feature.helpful_count} found helpful
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-gray-600 line-clamp-3 mb-4">
          {feature.description}
        </p>

        {/* Media Attachments */}
        {(feature.screenshot_url || feature.audio_url || feature.video_url) && (
          <div className="flex items-center gap-2 mb-4">
            {feature.screenshot_url && (
              <Badge variant="outline" className="text-xs">
                <ImageIcon className="h-3 w-3 mr-1" />
                Screenshot
              </Badge>
            )}
            {feature.audio_url && (
              <Badge variant="outline" className="text-xs">
                <Volume2 className="h-3 w-3 mr-1" />
                Audio
              </Badge>
            )}
            {feature.video_url && (
              <Badge variant="outline" className="text-xs">
                <Video className="h-3 w-3 mr-1" />
                Video
              </Badge>
            )}
          </div>
        )}

        {/* Tags */}
        {feature.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {feature.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{feature.author_email}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(feature.created_at)}</span>
            </div>
            {feature.comments_count > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{feature.comments_count}</span>
              </div>
            )}
          </div>

          {/* Vote Buttons with Animation */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={feature.user_vote === 'upvote' ? 'default' : 'outline'}
              onClick={(e) => {
                e.stopPropagation();
                onVote(feature.id, 'upvote');
              }}
              className={`flex items-center gap-1 transition-all ${
                feature.user_vote === 'upvote' ? 'bg-green-600 hover:bg-green-700' : ''
              }`}
            >
              <ThumbsUp className={`h-4 w-4 ${feature.user_vote === 'upvote' ? 'animate-pulse' : ''}`} />
              <span>{feature.upvotes}</span>
            </Button>
            <Button
              size="sm"
              variant={feature.user_vote === 'downvote' ? 'default' : 'outline'}
              onClick={(e) => {
                e.stopPropagation();
                onVote(feature.id, 'downvote');
              }}
              className={`flex items-center gap-1 transition-all ${
                feature.user_vote === 'downvote' ? 'bg-red-600 hover:bg-red-700' : ''
              }`}
            >
              <ThumbsDown className={`h-4 w-4 ${feature.user_vote === 'downvote' ? 'animate-pulse' : ''}`} />
              <span>{feature.downvotes}</span>
            </Button>
          </div>
        </div>

        {/* Tooltip Help */}
        {showTooltips && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4" />
              <span className="font-medium">What's this?</span>
            </div>
            <p className="text-xs">
              This is a feature request - an idea to improve the app! You can vote on ideas you like, 
              and the most popular ones get built. {categoryInfo.description} {difficultyInfo.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 