import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { ShieldCheck, HardHat, Lock, Mail, ArrowRight, Loader2, KeyRound, Sparkles } from 'lucide-react';

interface LoginProps {
  onSuccess?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>('admin@dfolio.com');
  const [password, setPassword] = useState<string>('Password123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await client.post('/api/auth/login', { email, password });
      const { token, user } = res.data;
      login(token, user);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.response?.data?.error || 'Invalid credentials. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#060814] via-[#02040b] to-[#0d1527] relative overflow-hidden">
      {/* Background Lighting Visuals */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-slate-800/80 shadow-2xl relative z-10 animate-fade-in">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30">
            <HardHat className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">DFOLIO</h1>
          <p className="text-slate-400 text-xs mt-1 tracking-wider uppercase font-semibold">Construction Execution Management</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs leading-relaxed flex items-center gap-3 animate-fade-in">
            <Lock className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                Sign In to Worksite
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Presets */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-brand-400 font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>Quick Demo Role Presets</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@dfolio.com')}
              className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-brand-950/40 border border-slate-800 hover:border-brand-500/40 text-left transition-all group"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-brand-300">System Admin</div>
              <div className="text-[10px] text-slate-500">admin@dfolio.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('pm@dfolio.com')}
              className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-brand-950/40 border border-slate-800 hover:border-brand-500/40 text-left transition-all group"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-brand-300">Project Manager</div>
              <div className="text-[10px] text-slate-500">pm@dfolio.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('engineer@dfolio.com')}
              className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-brand-950/40 border border-slate-800 hover:border-brand-500/40 text-left transition-all group"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-brand-300">Site Engineer</div>
              <div className="text-[10px] text-slate-500">engineer@dfolio.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('contractor@dfolio.com')}
              className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-brand-950/40 border border-slate-800 hover:border-brand-500/40 text-left transition-all group"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-brand-300">Contractor</div>
              <div className="text-[10px] text-slate-500">contractor@dfolio.com</div>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Encrypted JWT Token Authentication</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
