import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || 'Authentication failed. Please check credentials.');
      }
    } catch (err) {
      setError('An unexpected system error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-2xl border border-slate-200">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-xl shadow-lg shadow-indigo-600/30 mb-4">
            D
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to Dayflow</h2>
          <p className="mt-1.5 text-xs text-slate-500 font-medium">Every workday, perfectly aligned.</p>
        </div>

        {/* Quick Demo Credentials Switcher */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
          <div className="flex items-center justify-between font-semibold text-slate-700 mb-2">
            <span className="flex items-center space-x-1.5 text-indigo-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quick Demo Accounts</span>
            </span>
            <span className="text-[10px] text-slate-400">Click to fill</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('alex.morgan@dayflow.io')}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition-colors"
            >
              <p className="font-bold text-slate-800 text-[11px]">Alex Morgan</p>
              <p className="text-[10px] text-slate-500">Employee / Engineer</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('sarah.jenkins@dayflow.io')}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 text-left transition-colors"
            >
              <p className="font-bold text-slate-800 text-[11px]">Sarah Jenkins</p>
              <p className="text-[10px] text-slate-500">Admin / HR Director</p>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Work Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@dayflow.io"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold tracking-wide shadow-md shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Register New Employee
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
