import React, { useState, useEffect, useRef } from 'react';
import client from '../api/client';
import { 
  Bell,
  Search, 
  Moon, 
  Sun, 
  Building2,
  X,
  CheckSquare,
  AlertTriangle,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface TopbarProps {
  currentTab: string;
  theme: 'dark' | 'midnight';
  setTheme: (theme: 'dark' | 'midnight') => void;
  setCurrentTab?: (tab: string) => void;
}

interface SearchResults {
  projects: Array<{ id: string; name: string; location?: string }>;
  tasks: Array<{ id: string; name?: string; title?: string; progress: number; status: string }>;
  snags: Array<{ id: string; title: string; priority: string; status: string }>;
  rooms: Array<{ id: string; name: string; floor?: { name: string; project?: { name: string } } }>;
  categories: Array<{ id: string; name: string; description?: string }>;
  photos: Array<{ id: string; url: string; caption?: string; uploadedBy?: { name: string } }>;
}

const Topbar: React.FC<TopbarProps> = ({ currentTab, theme, setTheme, setCurrentTab }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New Daily Site Report submitted for Residence Project', time: '10m ago', read: false },
    { id: 2, text: 'Snag #104 resolved by Site Engineer', time: '1h ago', read: false },
    { id: 3, text: 'Architectural structural inspection scheduled', time: '4h ago', read: true },
  ]);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [showSearchPopover, setShowSearchPopover] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchPopover(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults(null);
      setShowSearchPopover(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await client.get('/api/search', {
          params: { q: searchQuery.trim() },
        });
        setSearchResults(res.data.results);
        setShowSearchPopover(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleNavigateToTab = (tab: string) => {
    if (setCurrentTab) {
      setCurrentTab(tab);
    }
    setShowSearchPopover(false);
    setSearchQuery('');
  };

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'Overview';
      case 'projects': return 'Projects';
      case 'rooms': return 'Rooms';
      case 'categories': return 'Categories';
      case 'subworks': return 'Sub Works';
      case 'tasks': return 'Works';
      case 'timeline': return 'Timeline';
      case 'snags': return 'Snags';
      case 'reports': return 'Reports';
      case 'photos': return 'Photos';
      case 'users': return 'Team';
      case 'contractor': return 'Contractors';
      case 'settings': return 'Settings';
      default: return 'Project Control';
    }
  };

  const totalMatchCount = searchResults
    ? searchResults.projects.length +
      searchResults.tasks.length +
      searchResults.snags.length +
      searchResults.rooms.length +
      searchResults.categories.length +
      searchResults.photos.length
    : 0;

  return (
    <header className="bg-white/80 dark:bg-[#18191D]/80 backdrop-blur-md sticky top-0 z-30 border-b border-[#E8E5DF] dark:border-[#2B2D34] py-4 px-6 md:px-8 flex justify-between items-center h-20 transition-colors">
      {/* Left Breadcrumb & Section Title */}
      <div>
        <div className="text-[9px] font-medium text-[#6E7179] dark:text-[#A0A4AD] uppercase tracking-[0.2em]">
          Control Panel &nbsp;/&nbsp; {getPageTitle()}
        </div>
        <h1 className="font-serif text-xl font-bold text-[#16171A] dark:text-[#F4F2ED] tracking-tight mt-0.5">
          {getPageTitle()}
        </h1>
      </div>

      {/* Center / Right Control Actions */}
      <div className="flex items-center gap-4">
        
        {/* Minimal Search Bar */}
        <div ref={searchRef} className="relative hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8C8F99] dark:text-[#7A7E88]" />
            <input 
              type="text"
              placeholder="Search projects, works, snags..."
              className="pl-8 pr-8 py-2 w-64 md:w-80 bg-[#FAF8F5] dark:bg-[#121316] border border-[#E0DCD4] dark:border-[#2E3038] text-xs text-[#16171A] dark:text-[#F4F2ED] placeholder-[#A0A4AD] focus:outline-none focus:border-[#16171A] dark:focus:border-[#F4F2ED] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults && totalMatchCount > 0) setShowSearchPopover(true);
              }}
            />
            {searching ? (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#16171A] dark:text-[#F4F2ED] animate-spin" />
            ) : searchQuery ? (
              <button 
                onClick={() => { setSearchQuery(''); setShowSearchPopover(false); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#8C8F99] hover:text-[#16171A]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          {/* Search Popover */}
          {showSearchPopover && searchResults && (
            <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-[#1C1D23] border border-[#E8E5DF] dark:border-[#2B2D34] shadow-arch dark:shadow-arch-dark p-4 max-h-[480px] overflow-y-auto z-50 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#E8E5DF] dark:border-[#2B2D34] text-xs font-medium text-[#6E7179] dark:text-[#A0A4AD]">
                <span>Results ({totalMatchCount})</span>
                <span className="text-[10px] text-[#16171A] dark:text-[#F4F2ED]">"{searchQuery}"</span>
              </div>

              {totalMatchCount === 0 ? (
                <div className="p-4 text-center text-xs text-[#8C8F99] italic">
                  No items match query.
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  {searchResults.projects.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-semibold text-[#16171A] dark:text-[#F4F2ED] uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" /> Projects ({searchResults.projects.length})
                      </div>
                      {searchResults.projects.map(p => (
                        <div
                          key={p.id}
                          onClick={() => handleNavigateToTab('projects')}
                          className="p-2.5 bg-[#FAF8F5] dark:bg-[#121316] hover:bg-[#EFECE6] dark:hover:bg-[#22242C] border border-[#E8E5DF] dark:border-[#2B2D34] cursor-pointer flex justify-between items-center transition-all"
                        >
                          <div>
                            <div className="font-semibold text-[#16171A] dark:text-[#F4F2ED]">{p.name}</div>
                            {p.location && <div className="text-[10px] text-[#6E7179] dark:text-[#A0A4AD]">{p.location}</div>}
                          </div>
                          <ExternalLink className="w-3 h-3 text-[#8C8F99]" />
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.tasks.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-semibold text-[#16171A] dark:text-[#F4F2ED] uppercase tracking-wider flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5" /> Works ({searchResults.tasks.length})
                      </div>
                      {searchResults.tasks.map(t => (
                        <div
                          key={t.id}
                          onClick={() => handleNavigateToTab('tasks')}
                          className="p-2.5 bg-[#FAF8F5] dark:bg-[#121316] hover:bg-[#EFECE6] dark:hover:bg-[#22242C] border border-[#E8E5DF] dark:border-[#2B2D34] cursor-pointer flex justify-between items-center transition-all"
                        >
                          <div>
                            <div className="font-semibold text-[#16171A] dark:text-[#F4F2ED]">{t.title || t.name}</div>
                            <div className="text-[10px] text-[#6E7179] dark:text-[#A0A4AD]">Status: {t.status} ({t.progress}%)</div>
                          </div>
                          <ExternalLink className="w-3 h-3 text-[#8C8F99]" />
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.snags.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-semibold text-[#16171A] dark:text-[#F4F2ED] uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Snags ({searchResults.snags.length})
                      </div>
                      {searchResults.snags.map(s => (
                        <div
                          key={s.id}
                          onClick={() => handleNavigateToTab('snags')}
                          className="p-2.5 bg-[#FAF8F5] dark:bg-[#121316] hover:bg-[#EFECE6] dark:hover:bg-[#22242C] border border-[#E8E5DF] dark:border-[#2B2D34] cursor-pointer flex justify-between items-center transition-all"
                        >
                          <div>
                            <div className="font-semibold text-[#16171A] dark:text-[#F4F2ED]">{s.title}</div>
                            <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">{s.priority} • {s.status}</div>
                          </div>
                          <ExternalLink className="w-3 h-3 text-[#8C8F99]" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme Toggle (Light / Dark Architectural) */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'midnight' : 'dark')}
          className="p-2 hover:bg-[#FAF8F5] dark:hover:bg-[#23252C] border border-[#E8E5DF] dark:border-[#2B2D34] text-[#16171A] dark:text-[#F4F2ED] transition-colors flex items-center gap-2"
          title="Switch Dark / Light Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-[#C5A880]" />
          ) : (
            <Moon className="w-4 h-4 text-[#16171A]" />
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-[#FAF8F5] dark:hover:bg-[#23252C] border border-[#E8E5DF] dark:border-[#2B2D34] text-[#16171A] dark:text-[#F4F2ED] transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-600 rounded-full" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#1C1D23] border border-[#E8E5DF] dark:border-[#2B2D34] p-4 shadow-arch dark:shadow-arch-dark z-50">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#E8E5DF] dark:border-[#2B2D34]">
                <span className="text-xs font-semibold text-[#16171A] dark:text-[#F4F2ED] uppercase tracking-wider">Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] text-[#6E7179] dark:text-[#A0A4AD] hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-2.5 border text-xs leading-relaxed transition-all ${
                      n.read 
                        ? 'bg-transparent border-transparent text-[#6E7179] dark:text-[#A0A4AD]' 
                        : 'bg-[#FAF8F5] dark:bg-[#121316] border-[#E8E5DF] dark:border-[#2B2D34] text-[#16171A] dark:text-[#F4F2ED]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p>{n.text}</p>
                      {!n.read && <span className="w-1.5 h-1.5 bg-[#16171A] dark:bg-[#F4F2ED] rounded-full flex-shrink-0 mt-1" />}
                    </div>
                    <span className="text-[9px] text-[#A0A4AD] block mt-1">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Topbar;
