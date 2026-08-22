import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { Mail, KeyRound, ArrowRight, Loader2, ShieldCheck, Sparkles } from 'lucide-react';

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
      const msg = err.response?.data?.error || 'Invalid credentials. Please verify your email and password.';
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#FAF8F5] dark:bg-[#121316] text-[#16171A] dark:text-[#F4F2ED] transition-colors duration-300 relative overflow-hidden">
      {/* Subtle Architectural Grid Lines Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#E8E5DF15_1px,transparent_1px),linear-gradient(to_bottom,#E8E5DF15_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#2B2D3420_1px,transparent_1px),linear-gradient(to_bottom,#2B2D3420_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-md w-full arch-card p-6 sm:p-10 shadow-arch dark:shadow-arch-dark relative z-10 animate-fade-in space-y-8">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-[#16171A] dark:bg-[#F4F2ED] text-[#FAF8F5] dark:text-[#16171A] flex items-center justify-center font-serif text-2xl font-bold mx-auto transition-transform hover:scale-105 duration-300">
            d.
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#16171A] dark:text-[#F4F2ED]">
              d.folio
            </h1>
            <p className="text-[9px] font-semibold text-[#6E7179] dark:text-[#A0A4AD] uppercase tracking-[0.25em] mt-1">
              ARCHITECTURAL PROJECT CONTROL SYSTEM
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs rounded-sm leading-relaxed flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#6E7179] dark:text-[#A0A4AD]">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8C8F99] dark:text-[#7A7E88] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-3 arch-input text-xs font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#6E7179] dark:text-[#A0A4AD]">
              PASSWORD
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#8C8F99] dark:text-[#7A7E88] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 arch-input text-xs font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 arch-btn-primary text-xs uppercase tracking-widest flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                Sign In to Studio Workspace
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Role Presets */}
        <div className="pt-6 border-t border-[#E8E5DF] dark:border-[#2B2D34] space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-[#6E7179] dark:text-[#A0A4AD]">
            <Sparkles className="w-3.5 h-3.5 text-[#16171A] dark:text-[#F4F2ED]" />
            <span>DEMO ROLE PRESETS</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@dfolio.com')}
              className="p-3 bg-[#FAF8F5] dark:bg-[#121316] hover:bg-[#EFECE6] dark:hover:bg-[#22242B] border border-[#E8E5DF] dark:border-[#2B2D34] text-left transition-all group"
            >
              <div className="font-serif text-xs font-bold text-[#16171A] dark:text-[#F4F2ED] group-hover:underline">System Admin</div>
              <div className="text-[9px] font-mono text-[#6E7179] dark:text-[#A0A4AD] mt-0.5">admin@dfolio.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('pm@dfolio.com')}
              className="p-3 bg-[#FAF8F5] dark:bg-[#121316] hover:bg-[#EFECE6] dark:hover:bg-[#22242B] border border-[#E8E5DF] dark:border-[#2B2D34] text-left transition-all group"
            >
              <div className="font-serif text-xs font-bold text-[#16171A] dark:text-[#F4F2ED] group-hover:underline">Project Manager</div>
              <div className="text-[9px] font-mono text-[#6E7179] dark:text-[#A0A4AD] mt-0.5">pm@dfolio.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('engineer@dfolio.com')}
              className="p-3 bg-[#FAF8F5] dark:bg-[#121316] hover:bg-[#EFECE6] dark:hover:bg-[#22242B] border border-[#E8E5DF] dark:border-[#2B2D34] text-left transition-all group"
            >
              <div className="font-serif text-xs font-bold text-[#16171A] dark:text-[#F4F2ED] group-hover:underline">Site Engineer</div>
              <div className="text-[9px] font-mono text-[#6E7179] dark:text-[#A0A4AD] mt-0.5">engineer@dfolio.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('contractor@dfolio.com')}
              className="p-3 bg-[#FAF8F5] dark:bg-[#121316] hover:bg-[#EFECE6] dark:hover:bg-[#22242B] border border-[#E8E5DF] dark:border-[#2B2D34] text-left transition-all group"
            >
              <div className="font-serif text-xs font-bold text-[#16171A] dark:text-[#F4F2ED] group-hover:underline">Contractor</div>
              <div className="text-[9px] font-mono text-[#6E7179] dark:text-[#A0A4AD] mt-0.5">contractor@dfolio.com</div>
            </button>
          </div>
        </div>

        {/* Security Footnote */}
        <div className="pt-2 text-center text-[10px] font-mono text-[#6E7179] dark:text-[#A0A4AD] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#16171A] dark:text-[#F4F2ED]" />
        </div>
      </div>
    </div>
  );
};

export default Login;
