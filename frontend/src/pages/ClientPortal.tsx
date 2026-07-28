import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { 
  Building2, 
  Camera, 
  Calendar, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Loader2, 
  Eye
} from 'lucide-react';

export type ClientTab = 'projects' | 'photos' | 'timeline' | 'progress';

interface ProjectItem {
  id: string;
  name: string;
  description?: string | null;
  location?: string | null;
  status: string;
  startDate: string;
  endDate?: string | null;
  _count?: { tasks: number };
}

interface PhotoItem {
  id: string;
  url: string;
  caption?: string | null;
  createdAt: string;
  uploadedBy?: { name: string };
  task?: { name: string; title?: string };
}

interface TaskItem {
  id: string;
  title: string;
  name?: string;
  status: string;
  progress: number;
  startDate: string;
  endDate: string;
  room?: { name: string; floor?: { name: string } };
  subWork?: { name: string; category?: { name: string } };
}

const ClientPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ClientTab>('projects');
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [stats, setStats] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchClientData = async () => {
    try {
      setLoading(true);
      setError('');
      const [projRes, tasksRes, statsRes] = await Promise.all([
        client.get('/api/projects'),
        client.get('/api/tasks'),
        client.get('/api/projects/dashboard/stats'),
      ]);

      setProjects(projRes.data);
      setTasks(tasksRes.data);
      setStats(statsRes.data);

      if (statsRes.data?.recentPhotos) {
        setPhotos(statsRes.data.recentPhotos);
      }
    } catch (err: any) {
      console.error('Failed to load client portal data:', err);
      setError(err.response?.data?.error || 'Failed to load client portal data from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-16 text-center rounded-2xl animate-fade-in">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Loading Read-Only Client Portal...</p>
      </div>
    );
  }

  const overallProgress = stats?.overallProgress || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* CLIENT PORTAL HEADER BANNER */}
      <div className="glass-panel p-6 rounded-2xl border-l-4 border-brand-500 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1">
              <Eye className="w-3 h-3" /> Client Read-Only Portal
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
            Executive Construction Dashboard
          </h3>
          <p className="text-xs text-slate-400">
            Real-time read-only inspection access to Projects, Site Photos, Execution Timeline, and Progress metrics.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/60 p-3 rounded-xl border border-white/5">
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Overall Project Progress</div>
            <div className="text-lg font-black text-brand-400">{overallProgress}% Completed</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* READ-ONLY NAVIGATION TABS */}
      <div className="glass-card p-2 rounded-2xl flex flex-wrap gap-2">
        {([
          { id: 'projects', label: 'View Projects', icon: Building2 },
          { id: 'photos', label: 'View Site Photos', icon: Camera },
          { id: 'timeline', label: 'View Execution Timeline', icon: Calendar },
          { id: 'progress', label: 'View Progress Status', icon: TrendingUp },
        ] as const).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-200 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* SECTION 1: VIEW PROJECTS */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <h4 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-400" /> Active Construction Projects
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <div key={proj.id} className="glass-card p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-base font-extrabold text-white">{proj.name}</h5>
                    {proj.location && (
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{proj.location}</span>
                      </div>
                    )}
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20 text-[10px] font-extrabold uppercase">
                    {proj.status}
                  </span>
                </div>

                {proj.description && (
                  <p className="text-xs text-slate-300">{proj.description}</p>
                )}

                <div className="flex justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5 font-semibold">
                  <span>Start Date: {new Date(proj.startDate).toLocaleDateString()}</span>
                  <span>{proj._count?.tasks || 0} Execution Tasks</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: VIEW PHOTOS */}
      {activeTab === 'photos' && (
        <div className="space-y-4">
          <h4 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Camera className="w-4 h-4 text-brand-400" /> Site Inspection Photos (Supabase Storage)
          </h4>

          {photos.length === 0 ? (
            <div className="glass-card p-12 text-center rounded-2xl">
              <Camera className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-semibold">No Site Photos Uploaded</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((ph) => (
                <div key={ph.id} className="glass-card p-3 rounded-2xl space-y-2 group">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950">
                    <img src={ph.url} alt={ph.caption || 'Site photo'} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{ph.caption || 'Site Execution Photo'}</p>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>{ph.uploadedBy?.name || 'Inspector'}</span>
                      <span>{new Date(ph.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: VIEW TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <h4 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" /> Read-Only Execution Schedule Timeline
          </h4>

          <div className="space-y-3">
            {tasks.map((t) => (
              <div key={t.id} className="glass-card p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <h5 className="text-sm font-extrabold text-white">{t.title || t.name}</h5>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold mt-0.5">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{new Date(t.startDate).toLocaleDateString()} → {new Date(t.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="w-full md:w-48 space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-white">{t.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${Math.max(4, t.progress)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: VIEW PROGRESS */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          <h4 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Overall Progress & Status Metrics
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-2xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Overall Progress</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{overallProgress}%</div>
            </div>

            <div className="glass-card p-4 rounded-2xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Total Tasks</div>
              <div className="text-2xl font-black text-white mt-1">{tasks.length}</div>
            </div>

            <div className="glass-card p-4 rounded-2xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Completed Tasks</div>
              <div className="text-2xl font-black text-brand-400 mt-1">
                {tasks.filter(t => t.status === 'COMPLETED' || t.progress >= 100).length}
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Pending Defects</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{stats?.pendingSnagsCount || 0}</div>
            </div>
          </div>

          {/* Trade Category Progress Breakdown */}
          {stats?.categoryBreakdown && (
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Trade Sector Completion Breakdown</h5>
              <div className="space-y-3">
                {stats.categoryBreakdown.map((cat: any) => (
                  <div key={cat.id} className="glass-card p-3 rounded-xl space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-white">{cat.name}</span>
                      <span className="text-brand-400">{cat.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${Math.max(4, cat.progress)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default ClientPortal;
