import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  GitCommit, 
  Loader2, 
  FolderKanban,
  Edit3,
  X
} from 'lucide-react';

interface TaskDependency {
  id: string;
  name?: string;
  title?: string;
  status: string;
  progress: number;
}

interface TaskItem {
  id: string;
  title: string;
  name?: string;
  description?: string | null;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'HOLD' | 'INSPECTION' | 'COMPLETED';
  priority: string;
  progress: number;
  startDate: string;
  endDate: string;
  estimatedDays?: number;
  dependsOnTaskId?: string | null;
  dependsOnTask?: TaskDependency | null;
  subWork?: { name: string; category?: { name: string } };
  room?: { name: string; floor?: { name: string } };
  contractor?: { name: string };
  supervisor?: { name: string };
}

const Timeline: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editing Dependency Modal State
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [selectedDependencyId, setSelectedDependencyId] = useState<string>('');
  const [submittingDep, setSubmittingDep] = useState(false);

  const fetchTimelineTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await client.get('/api/tasks');
      setTasks(res.data);
    } catch (err: any) {
      console.error('Failed to load timeline tasks:', err);
      setError(err.response?.data?.error || 'Failed to load task timeline records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimelineTasks();
  }, []);

  // Delay Calculation Helper
  const calculateDelayInfo = (task: TaskItem) => {
    if (task.status === 'COMPLETED' || task.progress >= 100) {
      return { isDelayed: false, delayDays: 0 };
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = new Date(task.endDate);

    if (task.status === 'HOLD') {
      const diffMs = todayStart.getTime() - endDate.getTime();
      const delayDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      return { isDelayed: true, delayDays, reason: 'Task On Hold' };
    }

    if (endDate < todayStart) {
      const diffMs = todayStart.getTime() - endDate.getTime();
      const delayDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      return { isDelayed: true, delayDays, reason: 'Overdue Deadline' };
    }

    return { isDelayed: false, delayDays: 0 };
  };

  const handleOpenDependencyModal = (task: TaskItem) => {
    setEditingTask(task);
    setSelectedDependencyId(task.dependsOnTaskId || '');
  };

  const handleSaveDependency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    setSubmittingDep(true);
    try {
      await client.put(`/api/tasks/${editingTask.id}`, {
        dependsOnTaskId: selectedDependencyId || null,
      });
      setEditingTask(null);
      fetchTimelineTasks();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update task dependency');
    } finally {
      setSubmittingDep(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return { label: 'Not Started', badge: 'bg-slate-800 text-slate-400 border-slate-700', barBg: 'bg-slate-700' };
      case 'IN_PROGRESS':
        return { label: 'In Progress', badge: 'bg-brand-500/10 text-brand-400 border-brand-500/20', barBg: 'bg-brand-500' };
      case 'HOLD':
        return { label: 'Hold', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', barBg: 'bg-amber-500' };
      case 'INSPECTION':
        return { label: 'Inspection', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20', barBg: 'bg-purple-500' };
      case 'COMPLETED':
        return { label: 'Completed', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', barBg: 'bg-emerald-500' };
      default:
        return { label: status, badge: 'bg-slate-800 text-slate-400 border-slate-700', barBg: 'bg-brand-500' };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Construction Execution Timeline & Dependencies
          </h3>
          <p className="text-xs text-slate-400">
            Interactive Gantt schedule, Task Dependencies, Start & End Dates, Delay Calculations, and Progress bars.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-200 text-sm rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* TIMELINE LIST */}
      {loading ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Connecting to PostgreSQL Database...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 text-sm font-semibold">No Execution Tasks Found</p>
          <p className="text-slate-500 text-xs mt-1">Create tasks to view the timeline Gantt chart and dependency chain.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const delayInfo = calculateDelayInfo(task);
            const statusConfig = getStatusConfig(task.status);

            const startDateStr = new Date(task.startDate).toLocaleDateString();
            const endDateStr = new Date(task.endDate).toLocaleDateString();
            const estDays = task.estimatedDays || Math.max(1, Math.ceil((new Date(task.endDate).getTime() - new Date(task.startDate).getTime()) / 86400000));

            const hasDependency = !!task.dependsOnTask;
            const isPrereqUnfinished = hasDependency && task.dependsOnTask?.status !== 'COMPLETED';

            return (
              <div key={task.id} className="glass-card p-5 rounded-2xl space-y-4 relative group">
                
                {/* TOP BAR: Task Name, Dates & Delay Calculation Badge */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold">
                      {task.subWork?.category && (
                        <span className="flex items-center gap-1 text-cyan-400 font-extrabold uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          <FolderKanban className="w-3 h-3" />
                          {task.subWork.category.name}
                        </span>
                      )}

                      {task.room && (
                        <span className="text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {task.room.name}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-extrabold text-white leading-tight">
                      {task.title || task.name}
                    </h4>
                  </div>

                  {/* DATES & DELAY CALCULATION */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 rounded-xl border border-white/5 text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{startDateStr} → {endDateStr}</span>
                      <span className="text-[10px] font-bold text-slate-500">({estDays} Days)</span>
                    </div>

                    {/* DELAY CALCULATION BADGE */}
                    {delayInfo.isDelayed ? (
                      <div className="flex items-center gap-1 px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-300 font-extrabold text-xs rounded-xl shadow-sm animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        <span>Delayed by {delayInfo.delayDays} Days</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>On Schedule</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* VISUAL GANTT PROGRESS BAR */}
                <div className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] border px-2 py-0.5 rounded uppercase tracking-wider font-extrabold ${statusConfig.badge}`}>
                        {statusConfig.label}
                      </span>
                      <span className="text-slate-400 text-[11px]">Execution Progress</span>
                    </div>
                    <span className="text-white font-black text-sm">{task.progress}%</span>
                  </div>

                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/10 relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${statusConfig.barBg}`}
                      style={{ width: `${Math.max(3, task.progress)}%` }}
                    />
                  </div>
                </div>

                {/* TASK DEPENDENCIES DISPLAY */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <GitCommit className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-slate-400">Prerequisite Dependency:</span>
                    
                    {hasDependency ? (
                      <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                        isPrereqUnfinished 
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                      }`}>
                        <span>{task.dependsOnTask?.title || task.dependsOnTask?.name}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-black/40">
                          {task.dependsOnTask?.status} ({task.dependsOnTask?.progress}%)
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 italic">None (Independent Task)</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenDependencyModal(task)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Set Dependency</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* EDIT DEPENDENCY MODAL */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl shadow-2xl relative space-y-5">
            <button
              onClick={() => setEditingTask(null)}
              className="absolute right-4 top-4 p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <GitCommit className="w-5 h-5 text-purple-400" />
                Configure Task Dependency
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Select the prerequisite task that must be completed before <strong className="text-white">{editingTask.title || editingTask.name}</strong> can start.
              </p>
            </div>

            <form onSubmit={handleSaveDependency} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Prerequisite Predecessor Task
                </label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs cursor-pointer bg-slate-900 font-semibold"
                  value={selectedDependencyId}
                  onChange={(e) => setSelectedDependencyId(e.target.value)}
                >
                  <option value="">-- No Dependency (Start Immediately) --</option>
                  {tasks
                    .filter(t => t.id !== editingTask.id)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title || t.name} ({t.status} - {t.progress}%)
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDep}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50"
                >
                  {submittingDep ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Dependency'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;
