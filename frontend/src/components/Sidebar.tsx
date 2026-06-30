import React from 'react';
import { LayoutDashboard, FileAudio, BarChart2, LogOut, FileText, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'meetings', label: 'Meetings', icon: FileText },
    { id: 'upload', label: 'New Meeting', icon: FileAudio },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen shrink-0 border-r border-slate-800">
      {/* Brand Logo & Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center border border-blue-400 shrink-0">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="2" />
            {[...Array(8)].map((_, i) => (
              <line
                key={i}
                x1="12"
                y1="12"
                x2={12 + 10 * Math.cos((i * 45 * Math.PI) / 180)}
                y2={12 + 10 * Math.sin((i * 45 * Math.PI) / 180)}
                strokeWidth="0.75"
              />
            ))}
          </svg>
        </div>
        <div>
          <h1 className="font-bold text-white text-sm tracking-wide leading-tight">PANCHAYAT VOICE</h1>
          <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">eGramSwaraj AI</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'meetings' && activeTab === 'meeting-details');
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/15 font-semibold'
                  : 'hover:bg-slate-800 hover:text-slate-150 text-slate-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Card & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-300">
            <User className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 font-medium capitalize truncate">
              {user?.role === 'SECRETARY' ? 'Panchayat Secretary' : user?.role.toLowerCase()}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 mt-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/30 hover:border-red-900/50 transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};
