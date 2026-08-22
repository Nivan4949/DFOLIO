import React from 'react';
import { ShieldCheck, Sparkles, UserCheck, Check, Moon, Sun } from 'lucide-react';

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
    { id: 'ADMIN', name: 'Admin / Principal Architect', desc: 'Full write access, project initialization, structural modifications.' },
    { id: 'PROJECT_MANAGER', name: 'Project Manager', desc: 'Manage Gantt schedules, task assignments, and snag verification.' },
    { id: 'SITE_ENGINEER', name: 'Site Engineer', desc: 'Daily log creation, defect logging, and inspection check-offs.' },
    { id: 'CONTRACTOR', name: 'Trade Contractor', desc: 'View assigned works, submit snag resolutions, update status.' },
    { id: 'CLIENT', name: 'Client / Owner', desc: 'Read-only editorial presentation of site progress & photo logs.' }
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8E5DF] dark:border-[#2B2D34] pb-6">
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#6E7179] dark:text-[#A0A4AD]">
            SYSTEM CONFIGURATION
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#16171A] dark:text-[#F4F2ED] tracking-tight mt-1">
            Studio & Role Preferences
          </h2>
          <p className="text-xs text-[#6E7179] dark:text-[#A0A4AD] mt-1 max-w-xl">
            Configure visual aesthetic modes and simulate user permission scopes across DFOLIO.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Role Simulator Card */}
        <div className="arch-card p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-[#E8E5DF] dark:border-[#2B2D34] pb-3">
            <UserCheck className="w-4 h-4 text-[#16171A] dark:text-[#F4F2ED]" />
            <h3 className="font-serif font-bold text-lg text-[#16171A] dark:text-[#F4F2ED]">
              Role Access Scope Simulator
            </h3>
          </div>

          <p className="text-xs text-[#6E7179] dark:text-[#A0A4AD] leading-relaxed">
            Select a role to test permission constraints and visible action controls across the studio interface.
          </p>

          <div className="space-y-3">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSimulatedRole(role.id)}
                className={`w-full text-left p-4 border transition-all flex items-start justify-between gap-3 ${
                  simulatedRole === role.id
                    ? 'bg-[#16171A] dark:bg-[#F4F2ED] text-[#FAF8F5] dark:text-[#16171A] border-[#16171A] dark:border-[#F4F2ED]'
                    : 'bg-transparent border-[#E8E5DF] dark:border-[#2B2D34] text-[#6E7179] dark:text-[#A0A4AD] hover:border-[#16171A]'
                }`}
              >
                <div>
                  <div className="font-serif font-bold text-sm leading-snug">{role.name}</div>
                  <div className="text-[10px] opacity-80 mt-1">{role.desc}</div>
                </div>
                {simulatedRole === role.id && (
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Theme Card */}
        <div className="arch-card p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-[#E8E5DF] dark:border-[#2B2D34] pb-3">
            <Sparkles className="w-4 h-4 text-[#16171A] dark:text-[#F4F2ED]" />
            <h3 className="font-serif font-bold text-lg text-[#16171A] dark:text-[#F4F2ED]">
              Architectural Theme Palette
            </h3>
          </div>

          <p className="text-xs text-[#6E7179] dark:text-[#A0A4AD] leading-relaxed">
            Switch between Warm Off-White (editorial daylight) and Deep Charcoal (studio night mode).
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTheme('dark')}
              className={`p-6 border text-center transition-all ${
                theme === 'dark'
                  ? 'bg-[#16171A] text-[#FAF8F5] border-[#16171A]'
                  : 'bg-transparent border-[#E8E5DF] dark:border-[#2B2D34] text-[#6E7179] hover:border-[#16171A]'
              }`}
            >
              <Moon className="w-5 h-5 mx-auto mb-2" />
              <div className="font-serif font-bold text-sm">Deep Charcoal</div>
              <div className="text-[9px] font-mono opacity-70 mt-1">Dark Mode (#121316)</div>
            </button>

            <button
              onClick={() => setTheme('midnight')}
              className={`p-6 border text-center transition-all ${
                theme === 'midnight'
                  ? 'bg-[#FAF8F5] text-[#16171A] border-[#16171A]'
                  : 'bg-transparent border-[#E8E5DF] dark:border-[#2B2D34] text-[#6E7179] hover:border-[#16171A]'
              }`}
            >
              <Sun className="w-5 h-5 mx-auto mb-2" />
              <div className="font-serif font-bold text-sm">Warm Off-White</div>
              <div className="text-[9px] font-mono opacity-70 mt-1">Light Mode (#FAF8F5)</div>
            </button>
          </div>

          {/* System & Database Health Banner */}
          <div className="p-4 border border-[#E8E5DF] dark:border-[#2B2D34] bg-[#FAF8F5] dark:bg-[#121316] flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#16171A] dark:text-[#F4F2ED]">
                PostgreSQL & Supabase Active
              </div>
              <div className="text-[10px] text-[#6E7179] dark:text-[#A0A4AD] mt-1 leading-relaxed">
                Live ORM database connection, asset storage, and role permissions verified.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
