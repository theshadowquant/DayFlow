import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';
import { ShieldCheck, Mail, Lock, User, ArrowRight, ArrowLeft } from 'lucide-react';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('EMPLOYEE');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await register(employeeId, email, password, role);
      if (!result.success) {
        setError(result.error || 'Registration failed.');
      }
    } catch (err) {
      setError('System registration error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl shadow-2xl border border-slate-200">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-xl shadow-lg shadow-indigo-600/30 mb-3">
            D
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Employee Account</h2>
          <p className="mt-1 text-xs text-slate-500 font-medium">Join your organization on Dayflow.</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                placeholder="EMP-1009"
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="firstname.lastname@dayflow.io"
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Min. 8 characters"
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Access Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('EMPLOYEE')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                  role === 'EMPLOYEE'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Employee</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                  role === 'ADMIN'
                    ? 'border-purple-600 bg-purple-50 text-purple-900'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>HR Admin</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 mt-4"
          >
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 text-center">
          <button
            onClick={onSwitchToLogin}
            className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-indigo-600 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
};
