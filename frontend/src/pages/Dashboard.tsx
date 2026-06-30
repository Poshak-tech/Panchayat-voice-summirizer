import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { Meeting, ActionItem, DashboardStats } from '../types';
import {
  FileText,
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight,
  Loader2,
  TrendingUp,
  Tag,
} from 'lucide-react';

interface DashboardProps {
  onSelectMeeting: (id: string) => void;
  onNavigateToUpload: () => void;
  onNavigateToMeetings: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectMeeting,
  onNavigateToUpload,
  onNavigateToMeetings,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);
  const [pendingTasks, setPendingTasks] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, meetingsRes] = await Promise.all([
          api.get('/meetings/stats'),
          api.get('/meetings'),
        ]);

        setStats(statsRes.data.stats);
        setRecentMeetings(meetingsRes.data.meetings.slice(0, 3));

        // Gather all pending action items across meetings
        const allMeetings: Meeting[] = meetingsRes.data.meetings;
        const allPendingTasks: ActionItem[] = [];
        allMeetings.forEach((m) => {
          if (m.actionItems) {
            m.actionItems.forEach((item) => {
              if (item.status !== 'COMPLETED') {
                allPendingTasks.push({
                  ...item,
                  // Include meeting title for display context
                  meetingId: m.title, 
                });
              }
            });
          }
        });
        setPendingTasks(allPendingTasks.slice(0, 5));
      } catch (err: any) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await api.put(`/meetings/action-items/${taskId}`, { status: nextStatus });
      
      // Update local state
      setPendingTasks((prev) => prev.filter((task) => task.id !== taskId));
      if (stats) {
        setStats({
          ...stats,
          completedTasks: stats.completedTasks + (nextStatus === 'COMPLETED' ? 1 : -1),
          pendingTasks: stats.pendingTasks + (nextStatus === 'COMPLETED' ? -1 : 1),
        });
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-800 mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-600">Loading Dashboard Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8 space-y-8">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm flex items-center gap-5">
          <div className="p-4 rounded-xl bg-blue-50 text-blue-800 border border-blue-100">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Meetings</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalMeetings || 0}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm flex items-center gap-5">
          <div className="p-4 rounded-xl bg-amber-50 text-amber-800 border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Tasks</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.pendingTasks || 0}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm flex items-center gap-5">
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Tasks</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.completedTasks || 0}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm flex items-center gap-5">
          <div className="p-4 rounded-xl bg-purple-50 text-purple-800 border border-purple-100">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Task Completion</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {stats?.totalActionItems
                ? Math.round((stats.completedTasks / stats.totalActionItems) * 100)
                : 0}
              %
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Meetings Column */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200/60 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Recent Meetings</h3>
              <p className="text-xs text-slate-500 mt-0.5">Quick access to newly recorded village meetings</p>
            </div>
            <button
              onClick={onNavigateToMeetings}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 divide-y divide-slate-100">
            {recentMeetings.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500">No meetings recorded yet.</p>
                <button
                  onClick={onNavigateToUpload}
                  className="mt-4 px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold rounded-xl transition-all"
                >
                  Record First Meeting
                </button>
              </div>
            ) : (
              recentMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  onClick={() => onSelectMeeting(meeting.id)}
                  className="p-6 hover:bg-slate-50/50 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-150 group"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 group-hover:text-blue-800 transition-colors text-sm">
                      {meeting.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(meeting.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full text-[10px]">
                        {meeting.meetingType}
                      </span>
                      <span>•</span>
                      <span>{meeting.villageName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        meeting.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : meeting.status === 'PROCESSING'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {meeting.status}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Schemes and Stats Widget */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-6 flex flex-col">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Key Focus Areas</h3>
            <p className="text-xs text-slate-500 mt-0.5">Most discussed government schemes</p>
          </div>

          <div className="flex-1 space-y-4">
            {stats?.schemeFrequency && stats.schemeFrequency.some((s) => s.count > 0) ? (
              stats.schemeFrequency.map((scheme, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/40">
                  <div className="flex items-center gap-2.5">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-800">{scheme.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md">
                    {scheme.count} times
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                <Tag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                No schemes discussed yet. Complete a meeting to extract scheme tags.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Action Items Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200/60">
          <h3 className="font-bold text-slate-800 text-base">Pending Action Items</h3>
          <p className="text-xs text-slate-500 mt-0.5">Assigned tasks requiring immediate attention</p>
        </div>

        <div className="divide-y divide-slate-100">
          {pendingTasks.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">All tasks completed! No pending items.</p>
            </div>
          ) : (
            pendingTasks.map((task) => (
              <div
                key={task.id}
                className="p-6 hover:bg-slate-50/30 flex items-start gap-4 transition-all duration-150"
              >
                <button
                  onClick={() => handleToggleTaskStatus(task.id, task.status)}
                  className="mt-1 w-5 h-5 rounded-md border-2 border-slate-300 hover:border-blue-600 flex items-center justify-center transition-colors shrink-0"
                >
                  <span className="w-2.5 h-2.5 rounded-sm bg-transparent"></span>
                </button>

                <div className="flex-1 space-y-2">
                  <p className="text-sm font-semibold text-slate-800 leading-snug">{task.task}</p>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">
                      Officer: {task.responsibleOfficer}
                    </span>
                    <span>•</span>
                    {task.deadline && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Deadline:{' '}
                        {new Date(task.deadline).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                    <span>•</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-xs">
                      Meeting: {task.meetingId} {/* Temporary field carrying meeting title */}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                    task.priority === 'HIGH'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : task.priority === 'MEDIUM'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
