import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { Meeting } from '../types';
import { Search, Filter, Calendar, MapPin, Tag, ArrowRight, Loader2, RefreshCw } from 'lucide-react';

interface MeetingsListProps {
  onSelectMeeting: (id: string) => void;
}

export const MeetingsList: React.FC<MeetingsListProps> = ({ onSelectMeeting }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [villageFilter, setVillageFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [fyFilter, setFyFilter] = useState('');

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params: any = {};
      if (search) params.search = search;
      if (villageFilter) params.villageName = villageFilter;
      if (typeFilter) params.meetingType = typeFilter;
      if (fyFilter) params.financialYear = fyFilter;

      const response = await api.get('/meetings', { params });
      setMeetings(response.data.meetings);
    } catch (err: any) {
      console.error('Error fetching meetings:', err);
      setError('Failed to fetch meetings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [villageFilter, typeFilter, fyFilter]); // Auto-fetch on filter change

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMeetings();
  };

  const handleResetFilters = () => {
    setSearch('');
    setVillageFilter('');
    setTypeFilter('');
    setFyFilter('');
    // The useEffect will trigger a fetch since filters changed
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8 space-y-6">
      {/* Search and Filters Header */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
          {/* Search bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keyword, agenda, scheme, or village..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-slate-900 text-sm bg-slate-50/50"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-semibold text-sm shadow-md shadow-blue-900/15 transition-all shrink-0"
          >
            Search
          </button>
        </form>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mr-2">
            <Filter className="w-4 h-4" />
            <span>Filters:</span>
          </div>

          {/* Village Filter */}
          <select
            value={villageFilter}
            onChange={(e) => setVillageFilter(e.target.value)}
            className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          >
            <option value="">All Villages</option>
            <option value="Kalyanpur East">Kalyanpur East</option>
            <option value="Kalyanpur West">Kalyanpur West</option>
            <option value="Rampur">Rampur</option>
          </select>

          {/* Meeting Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          >
            <option value="">All Meeting Types</option>
            <option value="Gram Sabha">Gram Sabha</option>
            <option value="Ward Sabha">Ward Sabha</option>
            <option value="Panchayat Samiti">Panchayat Samiti</option>
            <option value="Special Meeting">Special Meeting</option>
          </select>

          {/* Financial Year Filter */}
          <select
            value={fyFilter}
            onChange={(e) => setFyFilter(e.target.value)}
            className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          >
            <option value="">All Financial Years</option>
            <option value="2025-2026">2025-2026</option>
            <option value="2026-2027">2026-2027</option>
          </select>

          {/* Reset button */}
          {(search || villageFilter || typeFilter || fyFilter) && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors ml-auto flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-800 mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-600">Searching meeting records...</p>
        </div>
      ) : meetings.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200/60 shadow-sm">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">No meeting records match your search criteria.</p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl transition-all"
          >
            Clear Search & Filters
          </button>
        </div>
      ) : (
        /* Meetings Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              onClick={() => onSelectMeeting(meeting.id)}
              className="bg-white rounded-2xl border border-slate-200/60 hover:border-blue-600/50 hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between cursor-pointer group"
            >
              <div className="space-y-4">
                {/* Header row: Type and Status */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {meeting.meetingType}
                  </span>
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
                </div>

                {/* Title */}
                <div>
                  <h3 className="font-bold text-slate-800 text-base leading-snug group-hover:text-blue-800 transition-colors">
                    {meeting.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {meeting.description || meeting.agenda}
                  </p>
                </div>

                {/* Metadata Badges */}
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(meeting.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{meeting.villageName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>FY {meeting.financialYear}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  {meeting.actionItems ? meeting.actionItems.length : 0} Action Items
                </span>
                <span className="text-xs font-semibold text-blue-700 group-hover:text-blue-950 flex items-center gap-1 transition-all">
                  <span>Analyze Record</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
