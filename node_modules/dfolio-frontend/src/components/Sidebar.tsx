import React from 'react';
import { useAuth } from '../context/AuthContext';
import { usePWA } from '../context/PWAContext';
import { 
  LayoutDashboard, 
  Building2, 
  CheckSquare, 
  AlertTriangle, 
  HardHat,
  FileSpreadsheet,
  Camera,
  Users as UsersIcon,
  Settings,
  Home,
  FolderKanban,
  GitMerge,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Download,
  X
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileDrawerOpen?: boolean;
  setMobileDrawerOpen?: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  setCurrentTab, 
  collapsed, 
  setCollapsed,
  mobileDrawerOpen = false,
  setMobileDrawerOpen
}) => {
  const { user, logout } = useAuth();
  const { isInstalled, installPWA } = usePWA();

  const mainNav = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: Building2 },
    { id: 'tasks', label: 'Works', icon: CheckSquare },
    { id: 'snags', label: 'Snags', icon: AlertTriangle },
    { id: 'contractor', label: 'Contractors', icon: HardHat },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'users', label: 'Team', icon: UsersIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const secondaryNav = [
    { id: 'rooms', label: 'Rooms', icon: Home },
    { id: 'categories', label: 'Categories', icon: FolderKanban },
    { id: 'subworks', label: 'Sub Works', icon: GitMerge },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'client', label: 'Client Portal', icon: Eye },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'DF';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const handleNavClick = (id: string) => {
    setCurrentTab(id);
    if (setMobileDrawerOpen) setMobileDrawerOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {mobileDrawerOpen && (
        <div 
          onClick={() => setMobileDrawerOpen && setMobileDrawerOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        />
      )}

      <aside 
        className={`bg-white dark:bg-[#18191D] fixed inset-y-0 left-0 z-50 transition-all duration-300 border-r border-[#E8E5DF] dark:border-[#2B2D34] flex flex-col ${
          mobileDrawerOpen 
            ? 'translate-x-0 w-72 shadow-2xl h-[100dvh]' 
            : '-translate-x-full md:translate-x-0 h-screen ' + (collapsed ? 'w-20' : 'w-64')
        }`}
      >
        {/* Project / Company Identity Header */}
        <div className="p-6 flex items-center justify-between border-b border-[#E8E5DF] dark:border-[#2B2D34] shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 bg-[#16171A] dark:bg-[#F4F2ED] text-[#FAF8F5] dark:text-[#16171A] flex items-center justify-center font-serif text-sm font-bold flex-shrink-0">
              d.
            </div>
            {(!collapsed || mobileDrawerOpen) && (
              <div className="flex flex-col">
                <span className="font-serif text-base font-bold tracking-tight text-[#16171A] dark:text-[#F4F2ED] leading-none">
                  d.folio
                </span>
                <span className="text-[9px] text-[#6E7179] dark:text-[#A0A4AD] font-medium uppercase tracking-[0.2em] mt-1">
                  PROJECT CONTROL
                </span>
              </div>
            )}
          </div>
          
          {/* Desktop Collapse Toggle */}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1 hover:bg-[#FAF8F5] dark:hover:bg-[#23252C] rounded text-[#6E7179] dark:text-[#A0A4AD] hover:text-[#16171A] dark:hover:text-[#F4F2ED] transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          {mobileDrawerOpen && (
            <button
              onClick={() => setMobileDrawerOpen && setMobileDrawerOpen(false)}
              className="md:hidden p-1.5 hover:bg-[#FAF8F5] dark:hover:bg-[#23252C] rounded text-[#16171A] dark:text-[#F4F2ED]"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Download App PWA Banner (if not installed) */}
        {!isInstalled && (!collapsed || mobileDrawerOpen) && (
          <div className="mx-4 mt-4 p-3 bg-[#FAF8F5] dark:bg-[#121316] border border-[#E8E5DF] dark:border-[#2B2D34] rounded-sm space-y-2 shrink-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#16171A] dark:text-[#F4F2ED]">
              <Download className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Install DFOLIO App</span>
            </div>
            <p className="text-[10px] text-[#6E7179] dark:text-[#A0A4AD] leading-relaxed">
              Download as a standalone app for fast offline inspection & control.
            </p>
            <button
              onClick={installPWA}
              className="w-full py-1.5 arch-btn-primary text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <Download className="w-3 h-3" /> Download App
            </button>
          </div>
        )}

        {/* Flexible Fill Navigation Items */}
        <nav className="p-4 space-y-1 overflow-y-auto flex-1 min-h-0">
          <div className="text-[9px] font-semibold text-[#A0A4AD] uppercase tracking-[0.2em] px-3 mb-2">
            {(!collapsed || mobileDrawerOpen) && 'Navigation'}
          </div>

          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 text-xs font-medium transition-all duration-200 group relative rounded-sm ${
                  isActive 
                    ? 'bg-[#16171A] dark:bg-[#F4F2ED] text-[#FAF8F5] dark:text-[#16171A] font-semibold' 
                    : 'text-[#6E7179] dark:text-[#A0A4AD] hover:text-[#16171A] dark:hover:text-[#F4F2ED] hover:bg-[#FAF8F5] dark:hover:bg-[#22242B]'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive 
                    ? 'text-[#FAF8F5] dark:text-[#16171A]' 
                    : 'text-[#8C8F99] dark:text-[#7A7E88] group-hover:text-[#16171A] dark:group-hover:text-[#F4F2ED]'
                }`} />
                {(!collapsed || mobileDrawerOpen) && (
                  <span className="truncate tracking-wide">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}

          {/* Secondary Structural Items */}
          <div className="pt-4 border-t border-[#E8E5DF]/60 dark:border-[#2B2D34]/60 mt-4">
            <div className="text-[9px] font-semibold text-[#A0A4AD] uppercase tracking-[0.2em] px-3 mb-2">
              {(!collapsed || mobileDrawerOpen) && 'Structure'}
            </div>
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 text-xs font-medium transition-all duration-200 group relative rounded-sm ${
                    isActive 
                      ? 'bg-[#16171A] dark:bg-[#F4F2ED] text-[#FAF8F5] dark:text-[#16171A] font-semibold' 
                      : 'text-[#6E7179] dark:text-[#A0A4AD] hover:text-[#16171A] dark:hover:text-[#F4F2ED] hover:bg-[#FAF8F5] dark:hover:bg-[#22242B]'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive 
                      ? 'text-[#FAF8F5] dark:text-[#16171A]' 
                      : 'text-[#8C8F99] dark:text-[#7A7E88] group-hover:text-[#16171A] dark:group-hover:text-[#F4F2ED]'
                  }`} />
                  {(!collapsed || mobileDrawerOpen) && (
                    <span className="truncate tracking-wide">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Profile Footer Block */}
        <div className="p-4 border-t border-[#E8E5DF] dark:border-[#2B2D34] bg-[#FAF8F5]/50 dark:bg-[#121316]/50 shrink-0">
          <div className={`flex items-center gap-3 ${(collapsed && !mobileDrawerOpen) ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 bg-[#16171A]/10 dark:bg-[#F4F2ED]/10 border border-[#16171A]/20 dark:border-[#F4F2ED]/20 text-[#16171A] dark:text-[#F4F2ED] flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">
                {getInitials(user?.name)}
              </div>
              {(!collapsed || mobileDrawerOpen) && (
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-[#16171A] dark:text-[#F4F2ED] truncate">{user?.name || 'User'}</div>
                  <div className="text-[9px] font-medium text-[#6E7179] dark:text-[#A0A4AD] uppercase tracking-wider truncate">{user?.role || 'Guest'}</div>
                </div>
              )}
            </div>

            {(!collapsed || mobileDrawerOpen) && (
              <button
                onClick={logout}
                className="p-1.5 hover:bg-rose-500/10 text-[#6E7179] hover:text-rose-600 transition-colors rounded"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
