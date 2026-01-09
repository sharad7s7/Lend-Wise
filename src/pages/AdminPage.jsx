import { useState } from 'react';
import Layout from '../components/common/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';

export default function AdminPage() {
  const { user, canAccessAdmin } = useAuth();
  const [metrics] = useState({
    totalUsers: 1250,
    students: 850,
    nonStudents: 300,
    lenders: 100,
    totalLoans: 3420,
    activeLoans: 450,
    defaultRate: 2.3,
    avgTrustScore: 87,
    platformHealth: 'Excellent',
  });

  // Only allow access if user is admin
  if (!canAccessAdmin) {
    return null;
  }

  const content = (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Platform Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-sm font-semibold text-gray-600 mb-2">Total Users</div>
          <div className="text-3xl font-bold text-gray-900">{metrics.totalUsers.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-sm font-semibold text-gray-600 mb-2">Active Loans</div>
          <div className="text-3xl font-bold text-primary-600">{metrics.activeLoans.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-sm font-semibold text-gray-600 mb-2">Default Rate</div>
          <div className="text-3xl font-bold text-red-600">{metrics.defaultRate}%</div>
        </div>
      </div>

      {/* User Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">User Breakdown</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Students</div>
            <div className="text-2xl font-bold text-primary-600">{metrics.students}</div>
            <div className="text-xs text-gray-500 mt-1">
              {((metrics.students / metrics.totalUsers) * 100).toFixed(1)}% of total
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Non-Students</div>
            <div className="text-2xl font-bold text-purple-600">{metrics.nonStudents}</div>
            <div className="text-xs text-gray-500 mt-1">
              {((metrics.nonStudents / metrics.totalUsers) * 100).toFixed(1)}% of total
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Lenders</div>
            <div className="text-2xl font-bold text-gray-600">{metrics.lenders}</div>
            <div className="text-xs text-gray-500 mt-1">
              {((metrics.lenders / metrics.totalUsers) * 100).toFixed(1)}% of total
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">System Health</h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-600">Average Trust Score</span>
              <span className="text-lg font-bold text-green-600">{metrics.avgTrustScore}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${metrics.avgTrustScore}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-600">Platform Health</span>
              <span className="text-lg font-bold text-green-600">{metrics.platformHealth}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute requiredAccess="admin">
      <Layout>{content}</Layout>
    </ProtectedRoute>
  );
}

