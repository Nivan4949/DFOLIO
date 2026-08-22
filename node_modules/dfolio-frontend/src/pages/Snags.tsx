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
  HardHat,
  Download,
  Sliders
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

// Architectural Before / After Draggable Slider Component
const BeforeAfterSlider: React.FC<{ beforeUrl: string; afterUrl: string }> = ({ beforeUrl, afterUrl }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pos);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleMove(e.touches[0].clientX, rect);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    handleMove(e.clientX, rect);
  };

  return (
    <div 
      className="before-after-slider h-80 cursor-ew-resize relative"
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* After Image (Background) */}
      <img src={afterUrl} alt="After Fix" className="w-full h-full object-cover absolute inset-0" />
      <div className="absolute top-3 right-3 bg-emerald-600 text-white font-mono text-[9px] uppercase px-2 py-0.5 z-10 font-bold">
        AFTER FIX
      </div>

      {/* Before Image (Clipped Overlay) */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <img src={beforeUrl} alt="Before Fix" className="w-full h-full object-cover max-w-none" style={{ width: '100%', height: '100%' }} />
        <div className="absolute top-3 left-3 bg-rose-600 text-white font-mono text-[9px] uppercase px-2 py-0.5 z-10 font-bold">
          BEFORE (DEFECT)
        </div>
      </div>

      {/* Draggable Vertical Divider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl z-20"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white dark:bg-[#121316] border border-[#16171A] text-[#16171A] dark:text-[#F4F2ED] rounded-full flex items-center justify-center shadow-lg">
          <Sliders className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

const Snags: React.FC = () => {
  const [snags, setSnags] = useState<SnagItem[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
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

  // Active Snag Details & Before/After Modal
  const [activeSnag, setActiveSnag] = useState<SnagItem | null>(null);
  const [compareSnag, setCompareSnag] = useState<SnagItem | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [snagsRes, roomsRes, usersRes] = await Promise.all([
        client.get('/api/snags'),
        client.get('/api/rooms'),
        client.get('/api/auth/users').catch(() => ({ data: [] })),
      ]);

      setSnags(snagsRes.data);
      setRooms(roomsRes.data);
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

  const handleOpenEditModal = (snag: SnagItem, e: React.MouseEvent) => {
    e.stopPropagation();
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
        await client.put(`/api/snags/${editingSnag.id}`, payload);
      } else {
        await client.post('/api/snags', payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save snag record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete snag '${title}'?`)) return;

    try {
      await client.delete(`/api/snags/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete snag');
    }
  };

  const handleCycleStatus = async (snag: SnagItem, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const DEFAULT_BEFORE_IMG = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80';
  const DEFAULT_AFTER_IMG = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80';

  return (
    <div className="space-y-10 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8E5DF] dark:border-[#2B2D34] pb-6">
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#6E7179] dark:text-[#A0A4AD]">
            QUALITY ASSURANCE & SNAGGING
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#16171A] dark:text-[#F4F2ED] tracking-tight mt-1">
            Snag & Defect Control
          </h2>
          <p className="text-xs text-[#6E7179] dark:text-[#A0A4AD] mt-1 max-w-xl">
            Image-first quality defect management, location tagging, and before/after resolution verification.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={handleExportCSV}
            className="arch-btn-secondary flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>

          <button
            onClick={handleOpenAddModal}
            className="arch-btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Snag
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8E5DF] dark:border-[#2B2D34] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#6E7179] dark:text-[#A0A4AD] mr-2">STATUS:</span>
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs font-mono px-3 py-1 border transition-all ${
                statusFilter === s
                  ? 'bg-[#16171A] dark:bg-[#F4F2ED] text-[#FAF8F5] dark:text-[#16171A] border-[#16171A] dark:border-[#F4F2ED]'
                  : 'bg-transparent border-[#E8E5DF] dark:border-[#2B2D34] text-[#6E7179] dark:text-[#A0A4AD] hover:border-[#16171A]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#6E7179] dark:text-[#A0A4AD]">PRIORITY:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="p-1.5 arch-input font-mono text-xs cursor-pointer"
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
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs rounded-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* IMAGE-FIRST SNAG CARDS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-80 arch-skeleton" />
          ))}
        </div>
      ) : filteredSnags.length === 0 ? (
        <div className="arch-card p-16 text-center">
          <AlertTriangle className="w-12 h-12 text-[#8C8F99] mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-[#16171A] dark:text-[#F4F2ED]">No Snags Logged</h3>
          <p className="text-xs text-[#6E7179] dark:text-[#A0A4AD] mt-1 max-w-xs mx-auto">
            Log defect items with room tagging and defect photos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSnags.map((snag) => {
            const hasPhoto = snag.photos && snag.photos.length > 0;
            const photoUrl = hasPhoto ? snag.photos![0].url : DEFAULT_BEFORE_IMG;

            return (
              <div 
                key={snag.id} 
                onClick={() => setActiveSnag(snag)}
                className="arch-card arch-image-card group h-[380px] cursor-pointer flex flex-col justify-between"
              >
                {/* Visual Image Banner */}
                <img 
                  src={photoUrl} 
                  alt={snag.title} 
                  loading="lazy" 
                />

                {/* Top Status & Priority Tags */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <button
                    onClick={(e) => handleCycleStatus(snag, e)}
                    className="text-[9px] font-mono uppercase tracking-widest bg-[#16171A]/90 text-[#FAF8F5] px-2 py-0.5 backdrop-blur-md hover:underline cursor-pointer"
                    title="Click to cycle status"
                  >
                    {snag.status}
                  </button>
                  <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 backdrop-blur-md ${
                    snag.priority === 'URGENT' ? 'bg-rose-600 text-white' : 'bg-black/60 text-white'
                  }`}>
                    {snag.priority}
                  </span>
                </div>

                {/* Top Action Triggers */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setCompareSnag(snag); }}
                    className="p-2 bg-white/90 dark:bg-black/90 text-[#16171A] dark:text-[#F4F2ED] hover:bg-white backdrop-blur-md transition-all"
                    title="Compare Before / After"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleOpenEditModal(snag, e)}
                    className="p-2 bg-white/90 dark:bg-black/90 text-[#16171A] dark:text-[#F4F2ED] hover:bg-white backdrop-blur-md transition-all"
                    title="Edit Snag"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(snag.id, snag.title, e)}
                    className="p-2 bg-white/90 dark:bg-black/90 text-rose-600 hover:bg-white backdrop-blur-md transition-all"
                    title="Delete Snag"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Content Overlay */}
                <div className="arch-image-overlay">
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 space-y-2">
                    {snag.room && (
                      <div className="text-[10px] font-semibold text-white/70 uppercase tracking-widest flex items-center gap-1">
                        <Home className="w-3.5 h-3.5" /> {snag.room.floor?.name} &nbsp;→&nbsp; {snag.room.name}
                      </div>
                    )}

                    <h3 className="font-serif text-xl font-bold text-white tracking-tight leading-snug">
                      {snag.title}
                    </h3>

                    <div className="flex items-center justify-between pt-2 border-t border-white/20 text-xs text-white/90">
                      <span className="flex items-center gap-1">
                        <HardHat className="w-3.5 h-3.5 text-white/70" />
                        {snag.assignedTo?.name || 'Unassigned'}
                      </span>

                      <div className="font-mono text-[10px] text-white">
                        Due: {snag.dueDate ? new Date(snag.dueDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 🏛️ BEFORE / AFTER COMPARISON VIEWER MODAL */}
      {compareSnag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-[#18191D] border border-[#E8E5DF] dark:border-[#2B2D34] p-8 shadow-arch relative my-8 space-y-6">
            <button
              onClick={() => setCompareSnag(null)}
              className="absolute right-4 top-4 p-1 text-[#6E7179] hover:text-[#16171A] dark:hover:text-[#F4F2ED]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#6E7179] dark:text-[#A0A4AD]">
                INTERACTIVE COMPARISON VIEWER
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#16171A] dark:text-[#F4F2ED] mt-1">
                Before / After Verification: {compareSnag.title}
              </h3>
              <p className="text-xs text-[#6E7179] dark:text-[#A0A4AD] mt-1">
                Drag the divider slider left or right to compare initial defect state against resolved work.
              </p>
            </div>

            {/* Draggable Split Viewer */}
            <BeforeAfterSlider 
              beforeUrl={compareSnag.photos && compareSnag.photos.length > 0 ? compareSnag.photos[0].url : DEFAULT_BEFORE_IMG}
              afterUrl={compareSnag.photos && compareSnag.photos.length > 1 ? compareSnag.photos[1].url : DEFAULT_AFTER_IMG}
            />

            <div className="flex justify-end pt-2">
              <button onClick={() => setCompareSnag(null)} className="arch-btn-secondary">
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED SNAG DRAWER MODAL */}
      {activeSnag && !compareSnag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-[#18191D] border border-[#E8E5DF] dark:border-[#2B2D34] p-8 shadow-arch relative my-8 space-y-6">
            <button
              onClick={() => setActiveSnag(null)}
              className="absolute right-4 top-4 p-1 text-[#6E7179] hover:text-[#16171A] dark:hover:text-[#F4F2ED]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-[#6E7179] dark:text-[#A0A4AD]">
                {activeSnag.status} &nbsp;•&nbsp; {activeSnag.priority} PRIORITY
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#16171A] dark:text-[#F4F2ED] mt-1">{activeSnag.title}</h3>
              {activeSnag.description && (
                <p className="text-xs text-[#6E7179] dark:text-[#A0A4AD] mt-2 leading-relaxed">{activeSnag.description}</p>
              )}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddSnagNote} className="space-y-3 pt-4 border-t border-[#E8E5DF] dark:border-[#2B2D34]">
              <div className="text-xs font-semibold text-[#16171A] dark:text-[#F4F2ED]">Add Inspection Resolution Note</div>
              <textarea
                required
                rows={2}
                placeholder="Enter inspection update or worker note..."
                className="w-full p-2.5 arch-input"
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingNote || !newNoteContent.trim()}
                  className="arch-btn-primary"
                >
                  {submittingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post Note'}
                </button>
              </div>
            </form>

            <div className="flex justify-end pt-4">
              <button onClick={() => setActiveSnag(null)} className="arch-btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-[#18191D] border border-[#E8E5DF] dark:border-[#2B2D34] p-8 shadow-arch relative my-8">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 p-1 text-[#6E7179] hover:text-[#16171A] dark:hover:text-[#F4F2ED]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl font-bold text-[#16171A] dark:text-[#F4F2ED] mb-1">
              {editingSnag ? 'Edit Snag' : 'Log Defect Snag'}
            </h3>
            <p className="text-xs text-[#6E7179] dark:text-[#A0A4AD] mb-6">
              Enter defect title, priority, room, deadline, and photo evidence.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-[#6E7179] dark:text-[#A0A4AD] uppercase tracking-wider mb-1.5">
                  Snag Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tile Misalignment in Living Room"
                  className="w-full p-2.5 arch-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {!editingSnag && (
                <div>
                  <label className="block text-[10px] font-semibold text-[#6E7179] dark:text-[#A0A4AD] uppercase tracking-wider mb-1.5">
                    Attach Defect Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, photoFile: e.target.files ? e.target.files[0] : null })}
                    className="w-full text-xs text-[#6E7179] dark:text-[#A0A4AD] file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-xs file:font-semibold file:bg-[#16171A] file:text-white cursor-pointer"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[#6E7179] dark:text-[#A0A4AD] uppercase tracking-wider mb-1.5">
                    Priority
                  </label>
                  <select
                    className="w-full p-2.5 arch-input cursor-pointer"
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
                  <label className="block text-[10px] font-semibold text-[#6E7179] dark:text-[#A0A4AD] uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    className="w-full p-2.5 arch-input cursor-pointer"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[#6E7179] dark:text-[#A0A4AD] uppercase tracking-wider mb-1.5">
                    Select Room *
                  </label>
                  <select
                    required
                    className="w-full p-2.5 arch-input cursor-pointer"
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.floor?.name} → {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#6E7179] dark:text-[#A0A4AD] uppercase tracking-wider mb-1.5">
                    Assigned Labour
                  </label>
                  <select
                    className="w-full p-2.5 arch-input cursor-pointer"
                    value={formData.assignedToId}
                    onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                  >
                    <option value="">-- Unassigned --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="arch-btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="arch-btn-primary">
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
