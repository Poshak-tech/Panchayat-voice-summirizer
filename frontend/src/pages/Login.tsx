import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';

interface LoginProps {
  onNavigateToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigateToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-slate-900 to-emerald-950 p-4 relative overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute w-96 h-96 rounded-full bg-blue-500/10 -top-20 -left-20 blur-3xl"></div>
      <div className="absolute w-96 h-96 rounded-full bg-emerald-500/10 -bottom-20 -right-20 blur-3xl"></div>

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 p-8 z-10 transition-all duration-300">
        <div className="text-center mb-8">
          {/* Stylized Ashoka Chakra Emblem */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4 border-2 border-blue-600 animate-pulse">
            <svg
              className="w-10 h-10 text-blue-800"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="2" />
              {/* Spokes */}
              {[...Array(24)].map((_, i) => (
                <line
                  key={i}
                  x1="12"
                  y1="12"
                  x2={12 + 10 * Math.cos((i * 15 * Math.PI) / 180)}
                  y2={12 + 10 * Math.sin((i * 15 * Math.PI) / 180)}
                  strokeWidth="0.5"
                />
              ))}
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Panchayat Voice Summarizer
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            eGramSwaraj AI Meeting Assistant
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-start gap-2 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Official Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="secretary@panchayat.gov.in"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-slate-900 text-sm bg-slate-50/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-slate-900 text-sm bg-slate-50/50"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-800 hover:bg-blue-900 active:bg-blue-950 text-white font-semibold shadow-lg shadow-blue-900/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500">
            Don't have an official account?{' '}
            <button
              onClick={onNavigateToRegister}
              className="font-semibold text-blue-700 hover:text-blue-900 transition-colors"
            >
              Register Panchayat
            </button>
          </p>
        </div>

        {/* Footer info indicating official system */}
        <div className="mt-6 text-center">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-medium text-slate-600 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Secure NIC Gateway
          </span>
        </div>
      </div>
    </div>
  );
};
