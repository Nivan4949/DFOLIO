import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { 
  AlertTriangle, 
  Plus, 
  Edit3, 
  Trash2, 
  Loader2, 
  X,
  Home,
  CheckSquare,
  HardHat,
  Camera,
  FileText,
  Calendar,
  Download
} from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';

interface RoomOption {
  id: string;
  name: string;
  floor: {
    name: string;
    project: {
      name: string;
    };
  };
}

interface TaskOption {
  id: string;
  name: string;
  title?: string;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
  role: string;
}

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

export type SnagStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type SnagPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface SnagItem {
  id: string;
  title: string;
  description?: string | null;
  priority: SnagPriority;
  status: SnagStatus;
  dueDate?: string | null;
  projectId: string;
  roomId: string;
  taskId?: string | null;
  assignedToId?: string | null;
  room?: RoomOption | null;
  task?: TaskOption | null;
  assignedTo?: UserOption | null;
  createdBy?: { id: string; name: string } | null;
  photos?: PhotoItem[];
  notes?: NoteItem[];
}

const Snags: React.FC = () => {
  const [snags, setSnags] = useState<SnagItem[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [tasks, setTasks] = useState<TaskOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingSnag, setEditingSnag] = useState<SnagItem | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'HIGH' as SnagPriority,
    status: 'OPEN' as SnagStatus,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    roomId: '',
    taskId: '',
    assignedToId: '',
    photoFile: null as File | null,
  });

  const [submitting, setSubmitting] = useState(false);

  // Active Snag Details / Photo & Notes Drawer State
  const [activeSnag, setActiveSnag] = useState<SnagItem | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [snagsRes, roomsRes, tasksRes, usersRes] = await Promise.all([
        client.get('/api/snags'),
        client.get('/api/rooms'),
        client.get('/api/tasks'),
        client.get('/api/auth/users').catch(() => ({ data: [] })),
      ]);

      setSnags(snagsRes.data);
      setRooms(roomsRes.data);
      setTasks(tasksRes.data);
      setUsers(usersRes.data || []);
      if (roomsRes.data.length > 0 && !formData.roomId) {
        setFormData(prev => ({ ...prev, roomId: roomsRes.data[0].id }));
      }
    } catch (err: any) {
      console.error('Failed to fetch snags dependencies:', err);
      setError(err.response?.data?.error || 'Failed to load snag list from PostgreSQL database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingSnag(null);
    setFormData({
      title: '',
      description: '',
      priority: 'HIGH',
      status: 'OPEN',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      roomId: rooms.length > 0 ? rooms[0].id : '',
      taskId: '',
      assignedToId: '',
      photoFile: null,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (snag: SnagItem) => {
    setEditingSnag(snag);
    setFormData({
      title: snag.title,
      description: snag.description || '',
      priority: snag.priority || 'HIGH',
      status: snag.status || 'OPEN',
      dueDate: snag.dueDate ? snag.dueDate.split('T')[0] : '',
      roomId: snag.roomId,
      taskId: snag.taskId || '',
      assignedToId: snag.assignedToId || '',
      photoFile: null,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.roomId) {
      alert('Please fill in Snag Title and select a Room.');
      return;
    }

    setSubmitting(true);
    try {
      let uploadedPhotoUrl = '';
      if (formData.photoFile) {
        const photoData = new FormData();
        photoData.append('photo', formData.photoFile);
        photoData.append('caption', `Defect Snag: ${formData.title}`);
        
        // Upload photo via API
        const uploadRes = await client.post('/api/photos/upload', photoData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedPhotoUrl = uploadRes.data?.url || '';
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate,
        roomId: formData.roomId,
        taskId: formData.taskId || null,
        assignedToId: formData.assignedToId || null,
        photoUrl: uploadedPhotoUrl || undefined,
      };

      if (editingSnag) {
        // UPDATE
        await client.put(`/api/snags/${editingSnag.id}`, payload);
      } else {
        // CREATE
        await client.post('/api/snags', payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save snag record to database');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete snag '${title}'?`)) return;

    try {
      await client.delete(`/api/snags/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete snag');
    }
  };

  const handleCycleStatus = async (snag: SnagItem) => {
    const cycle: SnagStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    const idx = cycle.indexOf(snag.status);
    const nextStatus = cycle[(idx + 1) % cycle.length];

    try {
      await client.put(`/api/snags/${snag.id}`, { status: nextStatus });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update snag status');
    }
  };

  const handleAddSnagNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSnag || !newNoteContent.trim()) return;

    setSubmittingNote(true);
    try {
      const payload = new FormData();
      payload.append('snagId', activeSnag.id);
      payload.append('content', newNoteContent);

      await client.post('/api/notes', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const res = await client.get(`/api/snags/${activeSnag.id}`);
      setActiveSnag(res.data);
      setNewNoteContent('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add snag note');
    } finally {
      setSubmittingNote(false);
    }
  };

  const getPriorityBadge = (prio: string) => {
    switch (prio) {
      case 'URGENT': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'HIGH': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusBadge = (status: SnagStatus) => {
    switch (status) {
      case 'OPEN': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'IN_PROGRESS': return 'bg-brand-500/10 text-brand-400 border-brand-500/20';
      case 'RESOLVED': return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'CLOSED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const filteredSnags = snags.filter(s => {
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && s.priority !== priorityFilter) return false;
    return true;
  });

  const handleExportCSV = () => {
    const formatted = snags.map((s) => ({
      Snag_ID: s.id,
      Title: s.title,
      Status: s.status,
      Priority: s.priority,
      DueDate: s.dueDate ? s.dueDate.split('T')[0] : '',
      AssignedLabour: s.assignedTo?.name || 'Unassigned',
      Room: s.room?.name || 'Unassigned',
      Floor: s.room?.floor?.name || 'Unassigned',
      Task: s.task?.name || 'Unassigned',
      Description: s.description || '',
    }));
    exportToCSV(formatted, 'DFOLIO_Defect_Snag_List');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER WITH CONTROLS */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Snag & Defect Management
          </h3>
          <p className="text-xs text-slate-400">
            Track site defects with Photo, Priority, Deadline, Assigned Labour, Status, Notes, Room, and Task context.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-1.5 py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs transition-all"
            title="Export Defect Snag List to CSV File"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export CSV
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 py-2 px-4 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-xs transition-all shadow-[0_4px_15px_rgba(239,68,68,0.25)]"
          >
            <Plus className="w-4 h-4" />
            Create Snag
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="glass-card p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-1">Status:</span>
          {([
            { id: 'ALL', label: 'All' },
            { id: 'OPEN', label: 'Open' },
            { id: 'IN_PROGRESS', label: 'In Progress' },
            { id: 'RESOLVED', label: 'Resolved' },
            { id: 'CLOSED', label: 'Closed' },
          ] as const).map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                statusFilter === s.id
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-slate-800/40 border border-slate-700/30 text-slate-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl glass-input text-xs cursor-pointer bg-slate-900"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-200 text-sm rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* SNAGS GRID LIST */}
      {loading ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Connecting to PostgreSQL Database...</p>
        </div>
      ) : filteredSnags.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 text-sm font-semibold">No Snags Found</p>
          <p className="text-slate-500 text-xs mt-1">Create your first snag and assign Room, Task, Labour, Deadline & Photo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSnags.map((snag) => {
            const hasPhoto = snag.photos && snag.photos.length > 0;
            const photoUrl = hasPhoto ? snag.photos![0].url : null;

            return (
              <div key={snag.id} className="glass-card p-5 rounded-2xl space-y-4 relative group flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Photo Preview Thumbnail */}
                  {photoUrl ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-white/5">
                      <img src={photoUrl} alt={snag.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white flex items-center gap-1">
                        <Camera className="w-3 h-3 text-brand-400" /> Photo Attached
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-xl bg-slate-900/50 border border-dashed border-slate-800 flex items-center justify-center text-slate-600">
                      <Camera className="w-8 h-8 opacity-40" />
                    </div>
                  )}

                  {/* Room & Task context tags */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
                    {snag.room && (
                      <span className="flex items-center gap-1 text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        <Home className="w-3 h-3 text-slate-400" />
                        {snag.room.floor?.project?.name ? `${snag.room.floor.project.name} → ` : ''}{snag.room.floor?.name} → {snag.room.name}
                      </span>
                    )}

                    {snag.task && (
                      <span className="flex items-center gap-1 text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                        <CheckSquare className="w-3 h-3 text-brand-400" />
                        Task: {snag.task.name}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="text-base font-extrabold text-white leading-tight">
                      {snag.title}
                    </h4>
                    {snag.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{snag.description}</p>
                    )}
                  </div>

                  {/* Assigned Labour & Deadline */}
                  <div className="space-y-1.5 pt-1 text-[11px]">
                    <div className="flex items-center justify-between text-slate-300 font-semibold">
                      <span className="flex items-center gap-1 text-slate-400">
                        <HardHat className="w-3.5 h-3.5 text-amber-400" />
                        Assigned Labour:
                      </span>
                      <span className="text-white font-bold">{snag.assignedTo?.name || 'Unassigned'}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300 font-semibold">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-red-400" />
                        Deadline:
                      </span>
                      <span className="text-red-300 font-bold">
                        {snag.dueDate ? new Date(snag.dueDate).toLocaleDateString() : 'No Deadline'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls & Badges */}
                <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCycleStatus(snag)}
                      className={`text-[9px] font-black border px-2 py-0.5 rounded-md uppercase tracking-wider transition-all ${getStatusBadge(snag.status)}`}
                      title="Click to cycle status"
                    >
                      {snag.status}
                    </button>

                    <span className={`text-[9px] font-black border px-2 py-0.5 rounded-md uppercase tracking-wider ${getPriorityBadge(snag.priority)}`}>
                      {snag.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveSnag(snag)}
                      className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all"
                      title="View Details & Notes"
                    >
                      <FileText className="w-4 h-4 text-purple-400" />
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(snag)}
                      className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all"
                      title="Edit Snag"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(snag.id, snag.title)}
                      className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-all"
                      title="Delete Snag"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED SNAG & NOTES DRAWER MODAL */}
      {activeSnag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl glass-panel p-6 rounded-2xl shadow-2xl relative my-8 space-y-6">
            <button
              onClick={() => setActiveSnag(null)}
              className="absolute right-4 top-4 p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black border px-2 py-0.5 rounded uppercase tracking-wider ${getStatusBadge(activeSnag.status)}`}>
                  {activeSnag.status}
                </span>
                <span className={`text-[9px] font-black border px-2 py-0.5 rounded uppercase tracking-wider ${getPriorityBadge(activeSnag.priority)}`}>
                  {activeSnag.priority}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-2">{activeSnag.title}</h3>
              {activeSnag.description && (
                <p className="text-xs text-slate-300 mt-1">{activeSnag.description}</p>
              )}
            </div>

            {/* Photos Carousel */}
            {activeSnag.photos && activeSnag.photos.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-brand-400" /> Defect Inspection Photos
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {activeSnag.photos.map((p) => (
                    <img key={p.id} src={p.url} alt="Snag defect" className="w-full aspect-video object-cover rounded-xl border border-white/10" />
                  ))}
                </div>
              </div>
            )}

            {/* ADD NOTE TO SNAG */}
            <form onSubmit={handleAddSnagNote} className="p-4 bg-slate-900/60 rounded-xl border border-white/10 space-y-3">
              <div className="text-xs font-extrabold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Add Snag Resolution Note
              </div>
              <textarea
                required
                rows={2}
                placeholder="Enter snag inspection update, resolution note, or worker instruction..."
                className="w-full p-3 rounded-xl glass-input text-xs"
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingNote || !newNoteContent.trim()}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50"
                >
                  {submittingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post Note'}
                </button>
              </div>
            </form>

            {/* NOTES FEED */}
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {activeSnag.notes && activeSnag.notes.length > 0 ? (
                activeSnag.notes.map((n) => (
                  <div key={n.id} className="p-3 bg-slate-950/50 rounded-xl border border-white/5 text-xs text-slate-300 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                      <span>{n.createdBy?.name || 'Inspector'} ({n.createdBy?.role || 'Staff'})</span>
                      <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p>{n.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic text-center py-4">No notes posted on this snag yet.</p>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-white/5">
              <button
                onClick={() => setActiveSnag(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT SNAG MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl shadow-2xl relative my-8">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              {editingSnag ? 'Edit Defect Snag' : 'Create Defect Snag'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Specify Title, Photo, Priority, Deadline, Assigned Labour, Status, Room, and Task context.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Snag Title / Defect Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wall Crack near Switchboard / Uneven Tile Joint"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Photo Upload Input */}
              {!editingSnag && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Attach Defect Photo (Supabase Storage)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, photoFile: e.target.files ? e.target.files[0] : null })}
                    className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Priority & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Priority
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm cursor-pointer bg-slate-900 font-semibold"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as SnagPriority })}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Status
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm cursor-pointer bg-slate-900 font-semibold"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as SnagStatus })}
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              {/* Deadline & Assigned Labour */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Deadline Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm cursor-pointer bg-slate-900"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Assigned Labour / Contractor
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm cursor-pointer bg-slate-900"
                    value={formData.assignedToId}
                    onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                  >
                    <option value="">-- Select Assigned Labour --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Room & Task */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Select Room *
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm cursor-pointer bg-slate-900"
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.floor?.project?.name ? `${r.floor.project.name} → ` : ''}{r.floor?.name} → {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Related Execution Task (Optional)
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm cursor-pointer bg-slate-900"
                    value={formData.taskId}
                    onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
                  >
                    <option value="">-- No Task Assigned --</option>
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name || t.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description / Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Defect Description / Observations
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe defect location, required fix, or quality concern..."
                  className="w-full p-3 rounded-xl glass-input text-sm"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || rooms.length === 0}
                  className="flex items-center gap-2 py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-xs transition-all shadow-[0_4px_15px_rgba(239,68,68,0.25)] disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingSnag ? 'Save Changes' : 'Create Snag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Snags;
