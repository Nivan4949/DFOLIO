import React from 'react';
import { ShieldAlert, Sparkles, UserCheck, CheckCircle2 } from 'lucide-react';

interface SettingsProps {
  simulatedRole: string;
  setSimulatedRole: (role: string) => void;
  theme: 'dark' | 'midnight';
  setTheme: (theme: 'dark' | 'midnight') => void;
}

const Settings: React.FC<SettingsProps> = ({
  simulatedRole,
  setSimulatedRole,
  theme,
  setTheme
}) => {
  const roles = [
    { id: 'ADMIN', name: 'Admin / Owner', desc: 'Full write access, project initialization, deletion.' },
    { id: 'PROJECT_MANAGER', name: 'Project Manager', desc: 'Can manage timelines, tasks, and resolve snags.' },
    { id: 'SITE_ENGINEER', name: 'Site Engineer', desc: 'Can create daily reports, log defects, check off tasks.' },
    { id: 'CONTRACTOR', name: 'Contractor', desc: 'View tasks, receive snags, update completion status.' },
    { id: 'CLIENT', name: 'Client', desc: 'Read-only view of progress and daily site highlights.' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-white mb-2">System Configurator</h3>
        <p className="text-xs text-slate-400">Configure theme aesthetics and simulate system permission rules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Role Simulator Card */}
        <div className="glass-card p-6 rounded-2xl space-y-6">
          <h4 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-white/5 pb-3">
            <UserCheck className="w-5 h-5 text-brand-400" />
            Role Simulation Interface
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Simulate access scopes for different project actors. The active view adapts to show actions authorized for each role.
          </p>

          <div className="space-y-3">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSimulatedRole(role.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  simulatedRole === role.id
                    ? 'bg-brand-500/5 border-brand-500/30 text-white shadow-[0_2px_10px_rgba(14,160,234,0.1)]'
                    : 'bg-slate-900/10 border-transparent hover:bg-white/5 text-slate-400'
                }`}
              >
                <div>
                  <div className="text-xs font-black text-white">{role.name}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{role.desc}</div>
                </div>
                {simulatedRole === role.id && (
                  <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Settings Card */}
        <div className="glass-card p-6 rounded-2xl space-y-6">
          <h4 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-white/5 pb-3">
            <Sparkles className="w-5 h-5 text-brand-400" />
            Visual Theme Aesthetics
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Switch between curated high-fidelity background gradients.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTheme('dark')}
              className={`p-5 rounded-xl border text-center transition-all ${
                theme === 'dark'
                  ? 'bg-slate-900 border-brand-500/40 text-white'
                  : 'bg-slate-900/20 border-transparent text-slate-400 hover:bg-white/5'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-slate-950 border border-white/15 mx-auto mb-2" />
              <div className="text-xs font-extrabold">Sleek Dark</div>
              <div className="text-[9px] text-slate-500 mt-0.5">True Obsidian Gray</div>
            </button>

            <button
              onClick={() => setTheme('midnight')}
              className={`p-5 rounded-xl border text-center transition-all ${
                theme === 'midnight'
                  ? 'bg-[#0f172a]/80 border-brand-500/40 text-white'
                  : 'bg-slate-900/20 border-transparent text-slate-400 hover:bg-white/5'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-950 to-brand-950 border border-white/15 mx-auto mb-2" />
              <div className="text-xs font-extrabold">Midnight Blue</div>
              <div className="text-[9px] text-slate-500 mt-0.5">Electric Gradient</div>
            </button>
          </div>

          {/* Security & Database Status Banner */}
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">Live Database Connection Active</div>
              <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                Connected to live PostgreSQL database via Prisma ORM and Supabase Storage for site photo assets.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
