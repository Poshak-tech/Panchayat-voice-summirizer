import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2 } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  const { user } = useAuth();

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'meetings':
        return 'Panchayat Meeting Records';
      case 'meeting-details':
        return 'Meeting Analysis & Summary';
      case 'upload':
        return 'Upload & Process Meeting Audio';
      case 'analytics':
        return 'Governance Analytics';
      default:
        return 'Panchayat Voice Summarizer';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 relative shrink-0">
      {/* Subtle Indian Flag Tri-color top bar */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-orange-500"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-emerald-600"></div>
      </div>

      <div className="px-8 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{getTitle()}</h2>
          <p className="text-xs text-slate-500 mt-0.5">eGramSwaraj digital record management system</p>
        </div>

        {user?.panchayat && (
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200/60 shadow-sm">
            <Building2 className="w-4.5 h-4.5 text-blue-800" />
            <span className="text-xs font-semibold text-slate-700 tracking-wide">
              {user.panchayat}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
