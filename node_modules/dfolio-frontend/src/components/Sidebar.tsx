import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Building2, 
  Home,
  FolderKanban,
  GitMerge,
  CheckSquare, 
  Calendar,
  AlertTriangle, 
  FileSpreadsheet,
  Users as UsersIcon,
  Eye,
  Settings, 
  HardHat,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  setCurrentTab, 
  collapsed, 
  setCollapsed 
}) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: Building2 },
    { id: 'rooms', label: 'Rooms', icon: Home },
    { id: 'categories', label: 'Categories', icon: FolderKanban },
    { id: 'subworks', label: 'Sub Works', icon: GitMerge },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'snags', label: 'Snag List', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'users', label: 'Team & Users', icon: UsersIcon },
    { id: 'client', label: 'Client Portal', icon: Eye },
    { id: 'contractor', label: 'Contractor Portal', icon: HardHat },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'DF';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <aside 
      className={`glass-panel h-screen fixed left-0 top-0 z-30 transition-all duration-300 border-r border-white/5 flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Logo Section */}
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 bg-brand-500/20 border border-brand-500/30 rounded-xl flex items-center justify-center text-brand-400 shadow-[0_0_15px_rgba(14,160,234,0.25)] flex-shrink-0">
              <HardHat className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-black text-white tracking-wider leading-none">DFOLIO</span>
                <span className="text-[9px] text-brand-400 font-extrabold uppercase tracking-widest mt-1">EXECUTION</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 hover:bg-white/5 border border-transparent hover:border-white/5 rounded-lg text-slate-400 hover:text-white transition-all"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-170px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-gradient-to-r from-brand-600/30 to-brand-500/10 border border-brand-500/30 text-white shadow-[0_4px_15px_rgba(14,160,234,0.15)]' 
                    : 'text-slate-400 hover:text-white border border-transparent hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'
                }`} />
                {!collapsed && (
                  <span className="text-sm font-semibold tracking-wide truncate">
                    {item.label}
                  </span>
                )}
                {/* Active side indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand-500 rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile Block */}
      <div className="p-4 border-t border-white/5">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 bg-brand-600/30 border border-brand-500/40 rounded-xl flex items-center justify-center font-bold text-brand-300 text-xs flex-shrink-0 shadow-lg">
              {getInitials(user?.name)}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <div className="text-xs font-extrabold text-white truncate">{user?.name || 'User'}</div>
                <div className="text-[9px] font-bold text-brand-400 uppercase tracking-widest truncate">{user?.role || 'Guest'}</div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={logout}
              className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
