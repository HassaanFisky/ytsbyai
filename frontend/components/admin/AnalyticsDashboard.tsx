'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  Target, 
  Globe, 
  Activity,
  BarChart3,
  PieChart,
  MapPin,
  Clock,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import AdminAlertBanner from './AdminAlertBanner';

interface DemoStats {
  total_sessions: number;
  active_sessions: number;
  quota_exceeded_counts: {
    summary: number;
    transcription: number;
  };
  conversion_clicks: {
    signup: number;
    stripe: number;
  };
  session_sources: {
    direct: number;
    shared: number;
    organic: number;
  };
  top_ips: string[];
  recent_sessions: Array<{
    session_id: string;
    ip_address: string;
    location: {
      country: string;
      region: string;
      city: string;
    };
    created_at: string;
    summary_usage: number;
    transcription_usage: number;
    total_usage: number;
    is_active: boolean;
  }>;
  timestamp: string;
}

interface UsageTimeline {
  summary: number[];
  transcription: number[];
  labels: string[];
}

interface LeaderboardEntry {
  ip_address: string;
  location: {
    country: string;
    region: string;
    city: string;
  };
  total_usage: number;
  summary_usage: number;
  transcription_usage: number;
  created_at: string;
  session_id: string;
}

interface ConversionFunnel {
  demo_started: number;
  quota_exceeded: number;
  modal_shown: number;
  signup_clicked: number;
  checkout_clicked: number;
  signup_completed: number;
  checkout_completed: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [demoStats, setDemoStats] = useState<DemoStats | null>(null);
  const [usageTimeline, setUsageTimeline] = useState<UsageTimeline | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const auth = getAuth();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = await auth.currentUser?.getIdToken();
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch all data in parallel
      const [statsRes, timelineRes, leaderboardRes, funnelRes] = await Promise.all([
        fetch('/api/v1/admin/demo-stats', { headers }),
        fetch('/api/v1/admin/usage-timeline?hours=24', { headers }),
        fetch('/api/v1/admin/leaderboard', { headers }),
        fetch('/api/v1/admin/conversion-funnel', { headers })
      ]);

      if (statsRes.ok) {
        const stats = await statsRes.json();
        setDemoStats(stats);
      }

      if (timelineRes.ok) {
        const timeline = await timelineRes.json();
        setUsageTimeline(timeline);
      }

      if (leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json();
        setLeaderboard(leaderboardData.leaderboard);
      }

      if (funnelRes.ok) {
        const funnel = await funnelRes.json();
        setConversionFunnel(funnel);
      }

      setLastUpdated(new Date());
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getConversionRate = () => {
    if (!demoStats) return 0;
    const totalClicks = demoStats.conversion_clicks.signup + demoStats.conversion_clicks.stripe;
    const totalSessions = demoStats.total_sessions;
    return totalSessions > 0 ? ((totalClicks / totalSessions) * 100).toFixed(1) : '0.0';
  };

  const getQuotaExceededRate = () => {
    if (!demoStats) return 0;
    const totalExceeded = demoStats.quota_exceeded_counts.summary + demoStats.quota_exceeded_counts.transcription;
    const totalSessions = demoStats.total_sessions;
    return totalSessions > 0 ? ((totalExceeded / totalSessions) * 100).toFixed(1) : '0.0';
  };



  const getLocationString = (location: any) => {
    const parts = [location.city, location.region, location.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Unknown';
  };

  if (isLoading && !demoStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      <AdminAlertBanner />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Demo Portal Analytics</h2>
          <p className="text-gray-600">
            Real-time insights into demo portal usage and conversions
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <Button onClick={fetchData} disabled={isLoading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoStats?.total_sessions || 0}</div>
            <p className="text-xs text-muted-foreground">
              {demoStats?.active_sessions || 0} active sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getConversionRate()}%</div>
            <p className="text-xs text-muted-foreground">
              {demoStats?.conversion_clicks.signup || 0} signups, {demoStats?.conversion_clicks.stripe || 0} checkouts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quota Exceeded</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getQuotaExceededRate()}%</div>
            <p className="text-xs text-muted-foreground">
              {demoStats?.quota_exceeded_counts.summary || 0} summary, {demoStats?.quota_exceeded_counts.transcription || 0} transcription
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Traffic Sources</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoStats?.session_sources.direct || 0}</div>
            <p className="text-xs text-muted-foreground">
              Direct traffic (shared: {demoStats?.session_sources.shared || 0}, organic: {demoStats?.session_sources.organic || 0})
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Usage Timeline Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Timeline (Last 24 Hours)</CardTitle>
              <CardDescription>
                Summary vs Transcription usage over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usageTimeline ? (
                <div className="h-64 flex items-end justify-between gap-1">
                  {usageTimeline.labels.map((label, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <div className="flex flex-col gap-1">
                        <div 
                          className="bg-blue-500 rounded-t"
                          style={{ 
                            height: `${(usageTimeline.summary[index] / Math.max(...usageTimeline.summary)) * 100}px`,
                            width: '20px'
                          }}
                        />
                        <div 
                          className="bg-green-500 rounded-t"
                          style={{ 
                            height: `${(usageTimeline.transcription[index] / Math.max(...usageTimeline.transcription)) * 100}px`,
                            width: '20px'
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 rotate-45 origin-left">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No timeline data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top IPs */}
          <Card>
            <CardHeader>
              <CardTitle>Top IP Addresses</CardTitle>
              <CardDescription>
                Most active IP addresses by session count
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {demoStats?.top_ips.slice(0, 10).map((ip, index) => (
                  <div key={ip} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{index + 1}</Badge>
                      <span className="font-mono text-sm">{ip}</span>
                    </div>
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>
                Latest demo portal sessions with usage details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Session ID</th>
                      <th className="text-left p-2">IP Address</th>
                      <th className="text-left p-2">Location</th>
                      <th className="text-left p-2">Usage</th>
                      <th className="text-left p-2">Created</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoStats?.recent_sessions.map((session) => (
                      <tr key={session.session_id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-mono text-sm">
                          {session.session_id.slice(0, 8)}...
                        </td>
                        <td className="p-2 font-mono text-sm">
                          {session.ip_address}
                        </td>
                        <td className="p-2 text-sm">
                          {getLocationString(session.location)}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              S: {session.summary_usage}
                            </Badge>
                            <Badge variant="outline">
                              T: {session.transcription_usage}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-2 text-sm text-gray-500">
                          {formatDate(session.created_at)}
                        </td>
                        <td className="p-2">
                          <Badge variant={session.is_active ? "default" : "secondary"}>
                            {session.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Leaderboard</CardTitle>
              <CardDescription>
                Most active sessions by total usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div key={entry.session_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant={index < 3 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{entry.ip_address}</p>
                        <p className="text-sm text-gray-500">
                          {getLocationString(entry.location)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{entry.total_usage} total</p>
                      <p className="text-sm text-gray-500">
                        S: {entry.summary_usage} | T: {entry.transcription_usage}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>
                User journey from demo start to conversion
              </CardDescription>
            </CardHeader>
            <CardContent>
              {conversionFunnel ? (
                <div className="space-y-4">
                  {[
                    { key: 'demo_started', label: 'Demo Started', color: 'bg-blue-500' },
                    { key: 'quota_exceeded', label: 'Quota Exceeded', color: 'bg-yellow-500' },
                    { key: 'modal_shown', label: 'Modal Shown', color: 'bg-orange-500' },
                    { key: 'signup_clicked', label: 'Signup Clicked', color: 'bg-green-500' },
                    { key: 'checkout_clicked', label: 'Checkout Clicked', color: 'bg-purple-500' },
                    { key: 'signup_completed', label: 'Signup Completed', color: 'bg-emerald-500' },
                    { key: 'checkout_completed', label: 'Checkout Completed', color: 'bg-indigo-500' }
                  ].map((step) => {
                    const value = conversionFunnel[step.key as keyof ConversionFunnel] as number;
                    const rate = conversionFunnel.demo_started > 0 
                      ? ((value / conversionFunnel.demo_started) * 100).toFixed(1)
                      : '0.0';
                    
                    return (
                      <div key={step.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{step.label}</span>
                          <span className="text-sm text-gray-500">{value} ({rate}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${step.color} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No funnel data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard; 