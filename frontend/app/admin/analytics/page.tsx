import React from 'react';
import AdminAuthGate from '@/components/admin/AdminAuthGate';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Analytics - YTS by AI',
  description: 'Real-time analytics dashboard for demo portal usage and conversions',
  robots: 'noindex, nofollow', // Prevent indexing of admin pages
};

export default function AdminAnalyticsPage() {
  return (
    <AdminAuthGate>
      <AnalyticsDashboard />
    </AdminAuthGate>
  );
} 