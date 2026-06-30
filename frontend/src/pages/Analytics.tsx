import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { DashboardStats } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Loader2, TrendingUp, Award, Clock, FileText, CheckCircle2 } from 'lucide-react';

export const Analytics: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/meetings/stats');
        setStats(response.data.stats);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-800 mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-600">Generating analytics reports...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex-1 p-8 bg-slate-50">
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error || 'Failed to load analytics.'}
        </div>
      </div>
    );
  }

  // Data for Action Items Donut Chart
  const actionItemsData = [
    { name: 'Completed Tasks', value: stats.completedTasks, color: '#10b981' }, // Emerald
    { name: 'Pending Tasks', value: stats.pendingTasks, color: '#f59e0b' },    // Amber
  ];

  const hasActionItems = stats.totalActionItems > 0;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8 space-y-8">
      {/* Top summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-800 rounded-xl border border-blue-100">
            <FileText className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Meetings Conducted</span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{stats.totalMeetings}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-800 rounded-xl border border-amber-100">
            <Clock className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Assignments</span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{stats.pendingTasks}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100">
            <CheckCircle2 className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Tasks</span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{stats.completedTasks}</h3>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Meeting Frequency Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-4">
          <div>
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-blue-600" />
              Meeting Frequency (Monthly)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">Number of Panchayat meetings held per month</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyMeetings}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} stroke="#64748b" />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={11} stroke="#64748b" />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="count" fill="#1e3a8a" radius={[4, 4, 0, 0]} name="Meetings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Item Donut Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-emerald-600" />
              Action Item Resolution Rate
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">Distribution of completed vs pending administrative tasks</p>
          </div>

          {hasActionItems ? (
            <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
              <div className="h-56 w-56 shrink-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={actionItemsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {actionItemsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Percentage */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-800">
                    {Math.round((stats.completedTasks / stats.totalActionItems) * 100)}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completed</span>
                </div>
              </div>

              <div className="space-y-3 shrink-0">
                {actionItemsData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{item.name}</p>
                      <p className="text-sm font-black text-slate-850 mt-0.5">{item.value} tasks</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center py-12 text-slate-400 text-xs">
              No tasks registered yet. Action items will appear here after analysis.
            </div>
          )}
        </div>

        {/* Scheme Focus horizontal chart */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-4 lg:col-span-2">
          <div>
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-orange-600" />
              Scheme Focus Area Distribution
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">Frequency of development schemes discussed in meetings</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.schemeFrequency} layout="vertical" margin={{ left: 30, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} fontSize={11} stroke="#64748b" />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} fontSize={11} stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="count" fill="#047857" radius={[0, 4, 4, 0]} name="Mentions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
