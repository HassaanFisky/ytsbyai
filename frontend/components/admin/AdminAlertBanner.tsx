'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X, 
  Bell,
  RefreshCw,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { toast } from 'sonner';

interface Alert {
  id: string;
  alert_type: string;
  level: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  data: Record<string, any>;
  created_at: string;
  expires_at: string;
  is_dismissed: boolean;
}

interface AlertsResponse {
  alerts: Alert[];
  total_count: number;
  active_count: number;
}

const AdminAlertBanner: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const auth = getAuth();

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const token = await auth.currentUser?.getIdToken();
      
      if (!token) {
        console.error('No auth token available');
        return;
      }

      const response = await fetch('/api/v1/admin/alerts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: AlertsResponse = await response.json();
        setAlerts(data.alerts.filter(alert => !alert.is_dismissed));
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch alerts');
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`/api/v1/admin/alerts/${alertId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
        toast.success('Alert dismissed');
      } else {
        toast.error('Failed to dismiss alert');
      }
    } catch (error) {
      console.error('Error dismissing alert:', error);
      toast.error('Error dismissing alert');
    }
  };

  const createTestAlert = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch('/api/v1/admin/alerts/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(prev => [data.alert, ...prev]);
        toast.success('Test alert created');
      } else {
        toast.error('Failed to create test alert');
      }
    } catch (error) {
      console.error('Error creating test alert:', error);
      toast.error('Error creating test alert');
    }
  };

  useEffect(() => {
    fetchAlerts();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchAlerts, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'danger':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'danger':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getAlertTypeIcon = (alertType: string) => {
    switch (alertType) {
      case 'high_usage':
        return <TrendingUp className="h-4 w-4" />;
      case 'quota_abuse':
        return <Shield className="h-4 w-4" />;
      case 'conversion_spike':
        return <Zap className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (!isVisible || alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {/* Alert Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
            <Badge variant="secondary">{alerts.length}</Badge>
          </div>
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchAlerts}
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={createTestAlert}
            size="sm"
            variant="outline"
          >
            Test Alert
          </Button>
          <Button
            onClick={() => setIsVisible(false)}
            size="sm"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.map((alert) => (
          <Card key={alert.id} className={`border-l-4 ${getAlertColor(alert.level)}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5">
                    {getAlertIcon(alert.level)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{alert.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        <div className="flex items-center gap-1">
                          {getAlertTypeIcon(alert.alert_type)}
                          {alert.alert_type.replace('_', ' ')}
                        </div>
                      </Badge>
                      <Badge 
                        variant={alert.level === 'danger' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {alert.level}
                      </Badge>
                    </div>
                    <p className="text-sm mb-2">{alert.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Created: {formatTime(alert.created_at)}</span>
                      <span>Expires: {formatTime(alert.expires_at)}</span>
                      {alert.data && Object.keys(alert.data).length > 0 && (
                        <span className="text-blue-600 cursor-pointer hover:underline">
                          View Details
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => dismissAlert(alert.id)}
                  size="sm"
                  variant="ghost"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Alerts State */}
      {alerts.length === 0 && !isLoading && (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="p-6 text-center">
            <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No active alerts</p>
            <p className="text-sm text-gray-400">All systems are running normally</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminAlertBanner; 