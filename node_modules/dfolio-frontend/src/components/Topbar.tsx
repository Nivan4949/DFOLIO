import React, { useState, useEffect, useRef } from 'react';
import client from '../api/client';
import { 
  Bell, 
  Search, 
  Moon, 
  Sparkles, 
  Building2, 
  CheckSquare, 
  AlertTriangle, 
  Home, 
  FolderKanban, 
  Camera, 
  Loader2, 
  X,
  ExternalLink
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
    { id: 1, text: 'New Daily Report submitted for Block C', time: '10m ago', read: false },
    { id: 2, text: 'Snag #104 status updated to RESOLVED', time: '1h ago', read: false },
    { id: 3, text: 'Safety audit scheduled for tomorrow 09:00 AM', time: '4h ago', read: true },
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

  const getBreadcrumb = () => {
    switch (currentTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'projects': return 'Project Portfolios';
      case 'rooms': return 'Room Management';
      case 'categories': return 'Work Categories';
      case 'subworks': return 'Sub Works Breakdown';
      case 'tasks': return 'Execution Schedule';
      case 'timeline': return 'Execution Timeline';
      case 'snags': return 'Defect & Snag Tracker';
      case 'reports': return 'Executive Reports';
      case 'users': return 'User & Access Management';
      case 'settings': return 'System Settings';
      default: return 'Construction Portal';
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
    <header className="glass-panel sticky top-0 z-40 border-b border-white/5 py-4 px-6 md:px-8 flex justify-between items-center h-20">
      {/* Breadcrumbs */}
      <div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Portal</div>
        <div className="text-base font-extrabold text-white tracking-wide mt-1">{getBreadcrumb()}</div>
      </div>

      {/* Action Items */}
      <div className="flex items-center gap-4">
        
        {/* GLOBAL SEARCH INPUT WITH LIVE POPOVER */}
        <div ref={searchRef} className="relative hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Global Search (Projects, Tasks, Snags, Rooms...)"
              className="pl-9 pr-8 py-2 w-72 rounded-xl glass-input text-xs text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults && totalMatchCount > 0) setShowSearchPopover(true);
              }}
            />
            {searching ? (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400 animate-spin" />
            ) : searchQuery ? (
              <button 
                onClick={() => { setSearchQuery(''); setShowSearchPopover(false); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          {/* GLOBAL SEARCH RESULTS POPOVER */}
          {showSearchPopover && searchResults && (
            <div className="absolute right-0 mt-3 w-96 glass-panel rounded-2xl p-4 shadow-2xl border border-white/10 max-h-[480px] overflow-y-auto z-50 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5 text-xs font-bold text-slate-400">
                <span>Global Search Results ({totalMatchCount} matches)</span>
                <span className="text-[10px] text-brand-400">Query: "{searchQuery}"</span>
              </div>

              {totalMatchCount === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 italic">
                  No matching items found across Projects, Tasks, Snags, Rooms, Categories, or Photos.
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  {/* PROJECTS RESULTS */}
                  {searchResults.projects.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-extrabold text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" /> Projects ({searchResults.projects.length})
                      </div>
                      {searchResults.projects.map(p => (
                        <div
                          key={p.id}
                          onClick={() => handleNavigateToTab('projects')}
                          className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-white/5 cursor-pointer flex justify-between items-center transition-all"
                        >
                          <div>
                            <div className="font-bold text-white">{p.name}</div>
                            {p.location && <div className="text-[10px] text-slate-400">{p.location}</div>}
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TASKS RESULTS */}
                  {searchResults.tasks.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5" /> Tasks ({searchResults.tasks.length})
                      </div>
                      {searchResults.tasks.map(t => (
                        <div
                          key={t.id}
                          onClick={() => handleNavigateToTab('tasks')}
                          className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-white/5 cursor-pointer flex justify-between items-center transition-all"
                        >
                          <div>
                            <div className="font-bold text-white">{t.title || t.name}</div>
                            <div className="text-[10px] text-slate-400">Status: {t.status} ({t.progress}%)</div>
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* SNAGS RESULTS */}
                  {searchResults.snags.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-extrabold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Snags ({searchResults.snags.length})
                      </div>
                      {searchResults.snags.map(s => (
                        <div
                          key={s.id}
                          onClick={() => handleNavigateToTab('snags')}
                          className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-white/5 cursor-pointer flex justify-between items-center transition-all"
                        >
                          <div>
                            <div className="font-bold text-white">{s.title}</div>
                            <div className="text-[10px] text-red-400 font-semibold">{s.priority} • {s.status}</div>
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ROOMS RESULTS */}
                  {searchResults.rooms.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5" /> Rooms ({searchResults.rooms.length})
                      </div>
                      {searchResults.rooms.map(r => (
                        <div
                          key={r.id}
                          onClick={() => handleNavigateToTab('rooms')}
                          className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-white/5 cursor-pointer flex justify-between items-center transition-all"
                        >
                          <div>
                            <div className="font-bold text-white">{r.name}</div>
                            <div className="text-[10px] text-slate-400">{r.floor?.name}</div>
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CATEGORIES RESULTS */}
                  {searchResults.categories.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FolderKanban className="w-3.5 h-3.5" /> Work Categories ({searchResults.categories.length})
                      </div>
                      {searchResults.categories.map(c => (
                        <div
                          key={c.id}
                          onClick={() => handleNavigateToTab('categories')}
                          className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-white/5 cursor-pointer flex justify-between items-center transition-all"
                        >
                          <div>
                            <div className="font-bold text-white">{c.name}</div>
                            {c.description && <div className="text-[10px] text-slate-400 truncate">{c.description}</div>}
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* PHOTOS RESULTS */}
                  {searchResults.photos.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5" /> Photos ({searchResults.photos.length})
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {searchResults.photos.map(ph => (
                          <div
                            key={ph.id}
                            onClick={() => handleNavigateToTab('tasks')}
                            className="relative aspect-video rounded-lg overflow-hidden border border-white/10 cursor-pointer group"
                          >
                            <img src={ph.url} alt={ph.caption || 'Photo'} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme Customizer Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'midnight' : 'dark')}
          className="p-2.5 hover:bg-white/5 border border-transparent hover:border-white/5 rounded-xl text-slate-400 hover:text-white transition-all flex items-center gap-1.5"
          title="Toggle Theme style"
        >
          {theme === 'dark' ? (
            <>
              <Moon className="w-4.5 h-4.5 text-brand-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider hidden lg:inline">Sleek Dark</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4.5 h-4.5 text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider hidden lg:inline">Midnight Blue</span>
            </>
          )}
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 hover:bg-white/5 border border-transparent hover:border-white/5 rounded-xl text-slate-400 hover:text-white transition-all relative"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full shadow-[0_0_8px_#0ea0ea]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 glass-panel rounded-2xl p-4 shadow-2xl border border-white/10 z-50">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
                <span className="text-xs font-black text-white uppercase tracking-wider">Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] text-brand-400 hover:text-brand-300 font-bold uppercase"
                  >
                    Mark read
                  </button>
                )}
              </div>
              
              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-2.5 rounded-xl border text-[11px] leading-relaxed transition-all ${
                      n.read 
                        ? 'bg-transparent border-transparent text-slate-400' 
                        : 'bg-brand-500/5 border-brand-500/10 text-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p>{n.text}</p>
                      {!n.read && <span className="w-1.5 h-1.5 bg-brand-400 rounded-full flex-shrink-0 mt-1" />}
                    </div>
                    <span className="text-[9px] text-slate-500 block mt-1">{n.time}</span>
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
