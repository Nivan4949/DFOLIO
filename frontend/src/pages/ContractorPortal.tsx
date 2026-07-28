import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { 
  HardHat, 
  CheckSquare, 
  Camera, 
  FileText, 
  Loader2, 
  X, 
  AlertTriangle,
  GitMerge,
  Home
} from 'lucide-react';

export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'HOLD' | 'INSPECTION' | 'COMPLETED';

interface PhotoItem {
  id: string;
  url: string;
  caption?: string | null;
  createdAt: string;
}

interface NoteItem {
  id: string;
  content: string;
  createdAt: string;
  createdBy?: { id: string; name: string; role?: string };
}

interface TaskItem {
  id: string;
  title: string;
  name?: string;
  description?: string | null;
  priority: string;
  status: TaskStatus;
  progress: number;
  startDate: string;
  endDate: string;
  labourCount?: number;
  contractorId?: string | null;
  contractor?: { name: string };
  room?: { name: string; floor?: { name: string } };
  subWork?: { name: string; category?: { name: string } };
  photos?: PhotoItem[];
  notes?: NoteItem[];
}

const ContractorPortal: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Contractor Filter State
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Photo Upload Modal State
  const [activePhotoTask, setActivePhotoTask] = useState<TaskItem | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Notes Modal State
  const [activeNoteTask, setActiveNoteTask] = useState<TaskItem | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchContractorTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await client.get('/api/tasks');
      setTasks(res.data);
    } catch (err: any) {
      console.error('Failed to load contractor tasks:', err);
      setError(err.response?.data?.error || 'Failed to load assigned tasks from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractorTasks();
  }, []);

  // Update Status & Progress
  const handleUpdateStatus = async (task: TaskItem, newStatus: TaskStatus) => {
    let newProg = task.progress;
    if (newStatus === 'NOT_STARTED') newProg = 0;
    else if (newStatus === 'IN_PROGRESS' && newProg === 0) newProg = 50;
    else if (newStatus === 'INSPECTION') newProg = 90;
    else if (newStatus === 'COMPLETED') newProg = 100;

    try {
      await client.put(`/api/tasks/${task.id}`, {
        status: newStatus,
        progress: newProg,
      });
      fetchContractorTasks();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleUpdateProgress = async (task: TaskItem, newProgress: number) => {
    let newStatus = task.status;
    if (newProgress === 0) newStatus = 'NOT_STARTED';
    else if (newProgress > 0 && newProgress < 90 && newStatus !== 'HOLD') newStatus = 'IN_PROGRESS';
    else if (newProgress >= 90 && newProgress < 100 && newStatus !== 'HOLD') newStatus = 'INSPECTION';
    else if (newProgress === 100) newStatus = 'COMPLETED';

    try {
      await client.put(`/api/tasks/${task.id}`, {
        status: newStatus,
        progress: newProgress,
      });
      fetchContractorTasks();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update progress');
    }
  };

  // Upload Photo to Supabase
  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePhotoTask || !photoFile) return;

    setUploadingPhoto(true);
    try {
      const payload = new FormData();
      payload.append('photo', photoFile);
      payload.append('taskId', activePhotoTask.id);
      if (photoCaption) payload.append('caption', photoCaption);

      await client.post('/api/photos/upload', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setActivePhotoTask(null);
      setPhotoFile(null);
      setPhotoCaption('');
      fetchContractorTasks();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to upload photo to Supabase Storage');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Post Rich Text Note
  const handlePostNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNoteTask || !noteContent.trim()) return;

    setSubmittingNote(true);
    try {
      const payload = new FormData();
      payload.append('taskId', activeNoteTask.id);
      payload.append('content', noteContent);

      await client.post('/api/notes', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setActiveNoteTask(null);
      setNoteContent('');
      fetchContractorTasks();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to post note');
    } finally {
      setSubmittingNote(false);
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'NOT_STARTED': return 'bg-slate-800 text-slate-400 border-slate-700';
      case 'IN_PROGRESS': return 'bg-brand-500/10 text-brand-400 border-brand-500/20';
      case 'HOLD': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'INSPECTION': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER BANNER */}
      <div className="glass-panel p-6 rounded-2xl border-l-4 border-amber-500 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1">
              <HardHat className="w-3 h-3" /> Contractor Workspace
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
            Subcontractor Task Execution Portal
          </h3>
          <p className="text-xs text-slate-400">
            View assigned site tasks, update status, upload site inspection photos, and publish execution notes.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-white/5 text-xs font-bold text-slate-300">
          <CheckSquare className="w-4 h-4 text-brand-400" />
          <span>{filteredTasks.length} Assigned Tasks Active</span>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="glass-card p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-1">Status Filter:</span>
          {([
            { id: 'ALL', label: 'All Tasks' },
            { id: 'NOT_STARTED', label: 'Not Started' },
            { id: 'IN_PROGRESS', label: 'In Progress' },
            { id: 'HOLD', label: 'Hold' },
            { id: 'INSPECTION', label: 'Inspection' },
            { id: 'COMPLETED', label: 'Completed' },
          ] as const).map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                statusFilter === s.id
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-slate-800/40 border border-slate-700/30 text-slate-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-200 text-sm rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ASSIGNED TASKS GRID LIST */}
      {loading ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Loading Assigned Tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 text-sm font-semibold">No Tasks Found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="glass-card p-5 rounded-2xl space-y-4 relative group">
              
              {/* HEADER: Title & Badges */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold">
                    {task.subWork && (
                      <span className="flex items-center gap-1 text-amber-400 font-extrabold uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <GitMerge className="w-3 h-3" />
                        {task.subWork.name}
                      </span>
                    )}

                    {task.room && (
                      <span className="flex items-center gap-1 text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        <Home className="w-3 h-3 text-slate-500" />
                        {task.room.name}
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-extrabold text-white leading-tight">
                    {task.title || task.name}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black border px-2.5 py-1 rounded-lg uppercase tracking-wider ${getStatusBadge(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              </div>

              {/* UPDATE STATUS BUTTONS & PROGRESS SLIDER */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-white/5 space-y-3">
                
                {/* 1. UPDATE STATUS CONTROLS */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-400">Update Status:</span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(['NOT_STARTED', 'IN_PROGRESS', 'HOLD', 'INSPECTION', 'COMPLETED'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(task, st)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                          task.status === st
                            ? 'bg-brand-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. PROGRESS SLIDER */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-300">Completion Indicator</span>
                    <span className="text-amber-400 font-extrabold">{task.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={task.progress}
                    onChange={(e) => handleUpdateProgress(task, Number(e.target.value))}
                    className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              </div>

              {/* ACTION BUTTONS: UPLOAD PHOTOS & POST NOTES */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActivePhotoTask(task)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-300 hover:bg-brand-500 hover:text-white font-bold text-xs transition-all shadow-sm"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                  </button>

                  <button
                    onClick={() => setActiveNoteTask(task)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-600 hover:text-white font-bold text-xs transition-all shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Publish Note</span>
                  </button>
                </div>

                <div className="text-[10px] text-slate-500 font-semibold">
                  {new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* UPLOAD PHOTO MODAL */}
      {activePhotoTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl shadow-2xl relative space-y-4">
            <button
              onClick={() => setActivePhotoTask(null)}
              className="absolute right-4 top-4 p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-brand-400" />
                Upload Site Inspection Photo
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Task: <strong className="text-white">{activePhotoTask.title || activePhotoTask.name}</strong>
              </p>
            </div>

            <form onSubmit={handleUploadPhoto} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Select Image File *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setPhotoFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-600 file:text-white hover:file:bg-brand-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Photo Caption
                </label>
                <input
                  type="text"
                  placeholder="e.g. Electrical conduit pipe fitting verified"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActivePhotoTask(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingPhoto || !photoFile}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50"
                >
                  {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PUBLISH NOTE MODAL */}
      {activeNoteTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl shadow-2xl relative space-y-4">
            <button
              onClick={() => setActiveNoteTask(null)}
              className="absolute right-4 top-4 p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Publish Site Execution Note
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Task: <strong className="text-white">{activeNoteTask.title || activeNoteTask.name}</strong>
              </p>
            </div>

            <form onSubmit={handlePostNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Note Content *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter site execution update, material status, or contractor log..."
                  className="w-full p-3 rounded-xl glass-input text-xs"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveNoteTask(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingNote || !noteContent.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50"
                >
                  {submittingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ContractorPortal;
