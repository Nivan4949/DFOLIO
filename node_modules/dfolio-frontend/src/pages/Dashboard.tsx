import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { 
  Building2, 
  CheckSquare, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Camera,
  FolderKanban,
  PlayCircle,
  PauseCircle,
  ShieldCheck,
  Calendar,
  Loader2
} from 'lucide-react';

interface TaskItem {
  id: string;
  name?: string;
  title?: string;
  progress: number;
  status: string;
  startDate: string;
  endDate: string;
  room?: { name: string; floor?: { name: string; project?: { name: string } } };
  subWork?: { name: string; category?: { name: string } };
}

interface PhotoItem {
  id: string;
  url: string;
  caption?: string | null;
  createdAt: string;
  uploadedBy?: { name: string };
}

interface CategoryStat {
  id: string;
  name: string;
  taskCount: number;
  progress: number;
}

interface DashboardStatsData {
  overallProgress: number;
  todayTasksCount: number;
  todayTasks: TaskItem[];
  pendingSnagsCount: number;
  delayedTasksCount: number;
  statusBreakdown: {
    NOT_STARTED: number;
    IN_PROGRESS: number;
    HOLD: number;
    INSPECTION: number;
    COMPLETED: number;
  };
  categoryBreakdown: CategoryStat[];
  recentPhotos: PhotoItem[];
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await client.get('/api/projects/dashboard/stats');
      setData(res.data);
    } catch (err: any) {
      console.error('Failed to load dashboard metrics:', err);
      setError(err.response?.data?.error || 'Failed to load live dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-16 text-center rounded-2xl animate-fade-in">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Loading Live Construction Metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-950/40 border border-red-500/30 text-red-200 text-sm rounded-2xl flex items-center gap-3">
        <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
        <div>
          <p className="font-bold">Dashboard Synchronization Error</p>
          <p className="text-xs text-red-300 mt-0.5">{error || 'Could not fetch live dashboard metrics'}</p>
        </div>
      </div>
    );
  }

  const {
    overallProgress,
    todayTasksCount,
    todayTasks,
    pendingSnagsCount,
    delayedTasksCount,
    statusBreakdown,
    categoryBreakdown,
    recentPhotos
  } = data;

  const totalTasks = (statusBreakdown.NOT_STARTED || 0) +
                     (statusBreakdown.IN_PROGRESS || 0) +
                     (statusBreakdown.HOLD || 0) +
                     (statusBreakdown.INSPECTION || 0) +
                     (statusBreakdown.COMPLETED || 0);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 🚀 TOP 4 REQUIRED CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: OVERALL PROGRESS */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Overall Progress</span>
            <TrendingUp className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 tracking-tight flex items-baseline gap-1">
            <span>{overallProgress}%</span>
            <span className="text-xs text-slate-400 font-normal">avg completion</span>
          </div>

          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mt-3 border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, overallProgress)}%` }}
            />
          </div>

          <div className="text-[10px] text-brand-400 font-bold flex items-center gap-1 mt-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Across all rooms & categories</span>
          </div>
        </div>

        {/* CARD 2: TODAY'S TASKS */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Today's Tasks</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-400 mt-2 tracking-tight">{todayTasksCount}</div>
          <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-3">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active work scheduled today</span>
          </div>
          <div className="absolute right-4 bottom-4 text-cyan-400/10 group-hover:text-cyan-400/20 transition-colors">
            <CheckSquare className="w-12 h-12" />
          </div>
        </div>

        {/* CARD 3: PENDING SNAGS */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Pending Snags</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-extrabold text-red-400 mt-2 tracking-tight">{pendingSnagsCount}</div>
          <div className="text-[10px] text-red-400/90 font-bold flex items-center gap-1 mt-3">
            <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
            <span>Open & In-Progress defects</span>
          </div>
          <div className="absolute right-4 bottom-4 text-red-500/10 group-hover:text-red-500/20 transition-colors">
            <AlertTriangle className="w-12 h-12" />
          </div>
        </div>

        {/* CARD 4: DELAYED TASKS */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Delayed Tasks</span>
            <PauseCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mt-2 tracking-tight">{delayedTasksCount}</div>
          <div className="text-[10px] text-amber-400/90 font-bold flex items-center gap-1 mt-3">
            <Clock className="w-3.5 h-3.5" />
            <span>Overdue or on hold</span>
          </div>
          <div className="absolute right-4 bottom-4 text-amber-500/10 group-hover:text-amber-500/20 transition-colors">
            <PauseCircle className="w-12 h-12" />
          </div>
        </div>

      </div>

      {/* 📊 MAIN LAYOUT: CHARTS & TODAY'S TASKS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT 2 COLUMNS: CHARTS & CATEGORY BREAKDOWN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CHART 1: STATUS DISTRIBUTION CHART */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-brand-400" />
                  Task Progress & Status Distribution
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Real-time status metrics across {totalTasks} execution tasks</p>
              </div>
            </div>

            {/* Visual Bar Distribution Chart */}
            <div className="space-y-3 pt-2">
              <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden flex border border-white/5 p-0.5">
                {totalTasks > 0 ? (
                  <>
                    <div style={{ width: `${(statusBreakdown.NOT_STARTED / totalTasks) * 100}%` }} className="bg-slate-700 h-full transition-all" title="Not Started" />
                    <div style={{ width: `${(statusBreakdown.IN_PROGRESS / totalTasks) * 100}%` }} className="bg-brand-500 h-full transition-all" title="In Progress" />
                    <div style={{ width: `${(statusBreakdown.HOLD / totalTasks) * 100}%` }} className="bg-amber-500 h-full transition-all" title="Hold" />
                    <div style={{ width: `${(statusBreakdown.INSPECTION / totalTasks) * 100}%` }} className="bg-purple-500 h-full transition-all" title="Inspection" />
                    <div style={{ width: `${(statusBreakdown.COMPLETED / totalTasks) * 100}%` }} className="bg-emerald-500 h-full transition-all" title="Completed" />
                  </>
                ) : (
                  <div className="w-full bg-slate-800 h-full" />
                )}
              </div>

              {/* Status Metric Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> Not Started
                  </span>
                  <div className="text-lg font-black text-slate-300">{statusBreakdown.NOT_STARTED}</div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold text-brand-400 uppercase flex items-center gap-1">
                    <PlayCircle className="w-3 h-3 text-brand-400" /> In Progress
                  </span>
                  <div className="text-lg font-black text-brand-300">{statusBreakdown.IN_PROGRESS}</div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1">
                    <PauseCircle className="w-3 h-3 text-amber-400" /> Hold
                  </span>
                  <div className="text-lg font-black text-amber-300">{statusBreakdown.HOLD}</div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold text-purple-400 uppercase flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-purple-400" /> Inspection
                  </span>
                  <div className="text-lg font-black text-purple-300">{statusBreakdown.INSPECTION}</div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Completed
                  </span>
                  <div className="text-lg font-black text-emerald-300">{statusBreakdown.COMPLETED}</div>
                </div>
              </div>
            </div>
          </div>

          {/* CHART 2: TRADE / WORK CATEGORIES BREAKDOWN */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-cyan-400" />
              Work Categories Progress Breakdown
            </h3>

            <div className="space-y-3">
              {categoryBreakdown.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No work categories configured.</p>
              ) : (
                categoryBreakdown.map((cat) => (
                  <div key={cat.id} className="glass-card p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        {cat.name}
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                          {cat.taskCount} tasks
                        </span>
                      </span>
                      <span className="text-cyan-300 font-extrabold">{cat.progress}%</span>
                    </div>

                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(4, cat.progress)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* RIGHT 1 COLUMN: TODAY'S TASKS SCHEDULE */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Today's Task Schedule
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Tasks scheduled for active execution today</p>
            </div>

            <div className="space-y-3">
              {todayTasks.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-400">No Tasks Scheduled For Today</p>
                </div>
              ) : (
                todayTasks.map((t) => (
                  <div key={t.id} className="glass-card p-4 rounded-xl space-y-2 border-l-2 border-cyan-400">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-extrabold text-white leading-tight">
                        {t.title || t.name}
                      </h4>
                      <span className="text-[10px] font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {t.progress}%
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 space-y-1">
                      {t.subWork?.name && (
                        <div>Trade: <strong className="text-slate-200">{t.subWork.name}</strong></div>
                      )}
                      {t.room?.name && (
                        <div>Room: <strong className="text-slate-200">{t.room.name}</strong></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 📷 RECENT PHOTOS GALLERY (SUPABASE STORAGE) */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-brand-400" />
              Recent Site Execution Photos
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Latest site inspection photos stored in Supabase Storage</p>
          </div>
        </div>

        {recentPhotos.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
            <Camera className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-400">No Site Photos Uploaded Yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {recentPhotos.map((p) => (
              <div key={p.id} className="glass-card rounded-xl overflow-hidden group space-y-1.5 p-2">
                <div className="aspect-video rounded-lg overflow-hidden bg-slate-950 relative">
                  <img
                    src={p.url}
                    alt={p.caption || 'Site Photo'}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-1">
                  <p className="text-[10px] font-semibold text-slate-200 truncate">{p.caption || 'Site Inspection'}</p>
                  <p className="text-[9px] text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
