import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import type { Meeting } from '../types';
import {
  FileText,
  List,
  CheckSquare,
  MessageSquare,
  Download,
  Calendar,
  MapPin,
  Search,
  Check,
  Send,
  AlertCircle,
  Loader2,
  DollarSign,
  Briefcase,
  ArrowLeft,
} from 'lucide-react';

interface MeetingDetailsProps {
  meetingId: string;
  onBack: () => void;
}

export const MeetingDetails: React.FC<MeetingDetailsProps> = ({ meetingId, onBack }) => {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | 'actions' | 'chat'>('summary');

  // Transcript Search
  const [transcriptSearch, setTranscriptSearch] = useState('');

  // Chat Assistant State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load meeting details
  const fetchMeetingDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/meetings/${meetingId}`);
      setMeeting(response.data.meeting);
      
      // Initialize chat with a welcome message
      setChatMessages([
        {
          sender: 'ai',
          text: `Hello! I am your Panchayat AI Assistant. I have analyzed the transcript of "${response.data.meeting.title}". How can I help you today?`,
        },
      ]);
    } catch (err: any) {
      console.error('Error fetching meeting details:', err);
      setError('Failed to load meeting details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingDetails();
  }, [meetingId]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Toggle Action Item Status
  const handleToggleActionStatus = async (itemId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await api.put(`/meetings/action-items/${itemId}`, { status: newStatus });
      
      // Update local state
      if (meeting) {
        const updatedItems = meeting.actionItems?.map((item) =>
          item.id === itemId ? { ...item, status: newStatus as any } : item
        );
        setMeeting({ ...meeting, actionItems: updatedItems });
      }
    } catch (err) {
      console.error('Failed to update action item status:', err);
    }
  };

  // Chat Submission
  const handleSendChatMessage = async (textToSend?: string) => {
    const query = textToSend || chatInput;
    if (!query.trim() || !meeting) return;

    if (!textToSend) setChatInput('');

    // Add user message
    setChatMessages((prev) => [...prev, { sender: 'user', text: query }]);
    setChatLoading(true);

    try {
      const response = await api.post(`/meetings/${meeting.id}/chat`, { question: query });
      setChatMessages((prev) => [...prev, { sender: 'ai', text: response.data.answer }]);
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Sorry, I encountered an error. Please try asking again.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Export Trigger
  const handleExport = async (format: 'pdf' | 'excel' | 'word' | 'json') => {
    if (!meeting) return;
    try {
      // In Phase 7 we will implement actual export downloads.
      // For now, we will notify the user or make the API call.
      window.open(`http://localhost:5000/api/meetings/${meeting.id}/export/${format}?token=${localStorage.getItem('token')}`, '_blank');
    } catch (err) {
      console.error(`Export failed for ${format}:`, err);
    }
  };

  // Format time helper (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to highlight search term
  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;
    const regex = new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-yellow-200 text-slate-900 rounded-sm px-0.5 font-medium">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-800 mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-600">Analyzing meeting records...</p>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="flex-1 p-8 bg-slate-50">
        <div className="max-w-md mx-auto bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-base">Error Loading Meeting</h4>
          <p className="text-xs text-slate-500 mt-1.5">{error || 'Meeting record could not be retrieved.'}</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Detail Header Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shrink-0">
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="mt-1 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {meeting.meetingType}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">FY {meeting.financialYear}</span>
            </div>
            <h3 className="font-bold text-slate-800 text-lg mt-1 tracking-tight">{meeting.title}</h3>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(meeting.date).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {meeting.villageName}
              </span>
            </div>
          </div>
        </div>

        {/* Exports Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-end md:self-center">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> Export:
          </span>
          <button
            onClick={() => handleExport('pdf')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            PDF
          </button>
          <button
            onClick={() => handleExport('word')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            Word
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            Excel
          </button>
          <button
            onClick={() => handleExport('json')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            JSON
          </button>
        </div>
      </div>

      {/* Tabs selector */}
      <div className="bg-white border-b border-slate-200 px-8 flex gap-6 shrink-0">
        {[
          { id: 'summary', label: 'AI Minutes & Summary', icon: FileText },
          { id: 'transcript', label: 'Searchable Transcript', icon: Search },
          { id: 'actions', label: 'Action Items Tracker', icon: CheckSquare },
          { id: 'chat', label: 'Panchayat AI Chatbot', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 border-b-2 font-semibold text-sm transition-all ${
                isActive
                  ? 'border-blue-600 text-blue-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Scrollable Tab Content Container */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* SUMMARY TAB */}
        {activeTab === 'summary' && meeting.summary && (
          <div className="flex-1 overflow-y-auto p-8 space-y-8 max-w-4xl mx-auto w-full">
            {/* Executive Summary */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-3">
              <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-800" />
                Executive Summary
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {meeting.summary.executiveSummary}
              </p>
            </div>

            {/* Decisions Taken & Key Discussion Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-4">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-wider pb-2 border-b border-slate-100">
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                  Decisions Taken
                </h4>
                <ul className="space-y-2.5">
                  {meeting.summary.decisionsTaken.map((d, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2.5 leading-snug">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-4">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-wider pb-2 border-b border-slate-100">
                  <List className="w-5 h-5 text-blue-600" />
                  Key Discussion Points
                </h4>
                <ul className="space-y-2.5">
                  {meeting.summary.keyDiscussionPoints.map((p, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2.5 leading-snug">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-2"></span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Government Schemes & Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Schemes */}
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-4">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-wider pb-2 border-b border-slate-100">
                  <Briefcase className="w-5 h-5 text-orange-600" />
                  Government Schemes Mentioned
                </h4>
                <div className="space-y-3">
                  {meeting.summary.schemesMentioned.map((s, i) => (
                    <div key={i} className="p-3 bg-orange-50/30 rounded-xl border border-orange-200/40">
                      <span className="text-xs font-bold text-orange-800 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {s.name}
                      </span>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">{s.context}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-4">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-wider pb-2 border-b border-slate-100">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Budget Allocations & Discussions
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="pb-2">Purpose</th>
                        <th className="pb-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {meeting.summary.budgetDiscussions.map((b, i) => (
                        <tr key={i} className="text-xs">
                          <td className="py-3 pr-4 font-semibold text-slate-700">
                            {b.purpose}
                            <p className="text-[10px] font-normal text-slate-400 mt-0.5">{b.context}</p>
                          </td>
                          <td className="py-3 text-right font-bold text-slate-800 shrink-0">
                            ₹{b.amount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Problems Raised & Citizen Requests */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-4">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-wider pb-2 border-b border-slate-100">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Problems Raised & Citizen Requests
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Problems Raised</span>
                  <ul className="mt-2 space-y-2">
                    {meeting.summary.problemsRaised.map((p, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed">
                        <span className="w-1 h-1 rounded-full bg-red-600 shrink-0 mt-2"></span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Citizen Requests</span>
                  <ul className="mt-2 space-y-2">
                    {meeting.summary.citizenRequests.map((c, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed">
                        <span className="w-1 h-1 rounded-full bg-blue-600 shrink-0 mt-2"></span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TRANSCRIPT TAB */}
        {activeTab === 'transcript' && meeting.transcript && (
          <div className="flex-1 flex flex-col overflow-hidden max-w-4xl mx-auto w-full p-8">
            {/* Search bar inside transcript */}
            <div className="bg-white rounded-t-2xl border-t border-x border-slate-200/60 shadow-sm p-4 shrink-0">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  value={transcriptSearch}
                  onChange={(e) => setTranscriptSearch(e.target.value)}
                  placeholder="Search keywords, speakers, or decisions in transcript..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-800 text-xs"
                />
              </div>
            </div>

            {/* Transcript scrollable dialogues */}
            <div className="flex-1 bg-white border-x border-b border-slate-200/60 shadow-sm rounded-b-2xl overflow-y-auto p-6 divide-y divide-slate-100">
              {meeting.transcript.segments.map((seg, i) => {
                const isMatch = transcriptSearch
                  ? seg.text.toLowerCase().includes(transcriptSearch.toLowerCase()) ||
                    seg.speaker.toLowerCase().includes(transcriptSearch.toLowerCase())
                  : true;

                if (!isMatch) return null;

                return (
                  <div key={i} className="py-5 first:pt-0 last:pb-0 flex gap-4">
                    <div className="w-32 shrink-0">
                      <span className="font-bold text-slate-800 text-xs block leading-tight">
                        {seg.speaker}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md mt-1.5 inline-block">
                        {formatTime(seg.start)} - {formatTime(seg.end)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {highlightText(seg.text, transcriptSearch)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ACTION ITEMS TAB */}
        {activeTab === 'actions' && (
          <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200/60">
                <h4 className="font-bold text-slate-800 text-base">Meeting Action Items</h4>
                <p className="text-xs text-slate-500 mt-0.5">Tasks assigned during the meeting and their current status</p>
              </div>

              <div className="divide-y divide-slate-100">
                {meeting.actionItems && meeting.actionItems.length > 0 ? (
                  meeting.actionItems.map((task) => (
                    <div
                      key={task.id}
                      className="p-6 hover:bg-slate-50/20 flex items-start gap-4 transition-all duration-150"
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggleActionStatus(task.id, task.status)}
                        className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 ${
                          task.status === 'COMPLETED'
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 hover:border-blue-600'
                        }`}
                      >
                        {task.status === 'COMPLETED' && <Check className="w-3.5 h-3.5" />}
                      </button>

                      {/* Content */}
                      <div className="flex-1 space-y-2">
                        <p
                          className={`text-sm font-semibold text-slate-800 leading-snug ${
                            task.status === 'COMPLETED' ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {task.task}
                        </p>
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
                        </div>
                      </div>

                      {/* Priority Tag */}
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
                ) : (
                  <div className="p-12 text-center text-slate-400 text-sm">
                    No action items generated for this meeting.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex overflow-hidden max-w-4xl mx-auto w-full p-8">
            <div className="flex-1 bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col overflow-hidden">
              {/* Chat Header and Suggestion chips */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                  Suggested Questions:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'What decisions were taken?',
                    'Show pending works.',
                    'What was discussed about MGNREGA?',
                    'What is the budget allocation?',
                  ].map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendChatMessage(q)}
                      disabled={chatLoading}
                      className="px-3 py-1.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-[11px] font-semibold text-slate-700 rounded-lg shadow-sm transition-all active:scale-98 disabled:opacity-70"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat history */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.map((msg, i) => {
                  const isAi = msg.sender === 'ai';
                  return (
                    <div
                      key={i}
                      className={`flex ${isAi ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm border ${
                          isAi
                            ? 'bg-slate-50 border-slate-200/85 text-slate-800 rounded-tl-none'
                            : 'bg-blue-800 border-blue-900 text-white rounded-tr-none'
                        }`}
                      >
                        {isAi && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-blue-800 block mb-1">
                            Panchayat AI Assistant
                          </span>
                        )}
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  );
                })}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 border border-slate-200/85 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-800" />
                      <span className="text-xs font-semibold text-slate-500">Formulating response...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef}></div>
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-slate-200 bg-slate-50/50 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendChatMessage();
                  }}
                  className="flex gap-3"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a question about the meeting decisions, schemes, or budget..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-800 text-xs bg-white"
                    disabled={chatLoading}
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !chatInput.trim()}
                    className="p-2.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white shadow-md shadow-blue-800/10 active:scale-98 transition-all shrink-0 disabled:opacity-60"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
