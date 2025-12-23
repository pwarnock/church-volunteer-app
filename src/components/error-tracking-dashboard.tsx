'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ErrorCategory, ErrorSeverity } from '@/lib/logger';

interface ErrorLog {
  id: string;
  timestamp: string;
  level: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  isUserFacing: boolean;
  requiresAlert: boolean;
  suggestedAction?: string;
  endpoint?: string;
  userId?: string;
  userAgent?: string;
  ip?: string;
}

interface ErrorStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  byCategory: Record<string, number>;
  byEndpoint: Record<string, number>;
  recentCount: number;
}

export default function ErrorTrackingDashboard() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchErrorData();
    const interval = setInterval(fetchErrorData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchErrorData = async () => {
    try {
      const response = await fetch(`/api/admin/errors?timeRange=${timeRange}`);
      const data = await response.json();

      setErrors(data.errors || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Failed to fetch error data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'destructive';
      case ErrorSeverity.HIGH:
        return 'destructive';
      case ErrorSeverity.MEDIUM:
        return 'default';
      case ErrorSeverity.LOW:
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getCategoryColor = (category: ErrorCategory) => {
    switch (category) {
      case ErrorCategory.SECURITY:
      case ErrorCategory.SUSPICIOUS_ACTIVITY:
        return 'destructive';
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.AUTHORIZATION:
        return 'default';
      case ErrorCategory.DATABASE_CONNECTION:
        return 'destructive';
      case ErrorCategory.RATE_LIMIT:
      case ErrorCategory.VALIDATION:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const filteredErrors = errors.filter((error) => {
    const categoryMatch =
      selectedCategory === 'all' || error.category === selectedCategory;
    const severityMatch =
      selectedSeverity === 'all' || error.severity === selectedSeverity;
    return categoryMatch && severityMatch;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Error Tracking Dashboard</h1>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Errors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.critical}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Facing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {errors.filter((e) => e.isUserFacing).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.recentCount}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Categories</option>
          {Object.values(ErrorCategory).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Severities</option>
          {Object.values(ErrorSeverity).map((severity) => (
            <option key={severity} value={severity}>
              {severity}
            </option>
          ))}
        </select>
      </div>

      {/* Errors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Error Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredErrors.map((error) => (
                <TableRow key={error.id}>
                  <TableCell className="text-sm">
                    {new Date(error.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getCategoryColor(error.category)}>
                      {error.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSeverityColor(error.severity)}>
                      {error.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {error.message}
                  </TableCell>
                  <TableCell className="text-sm">
                    {error.endpoint || '-'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {error.userId ? `User ${error.userId.slice(-4)}` : '-'}
                  </TableCell>
                  <TableCell>
                    {error.suggestedAction && (
                      <div className="text-xs text-gray-600 max-w-xs">
                        {error.suggestedAction}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
