import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import client from '../api/client';
import { 
  CheckSquare, 
  Plus, 
  Edit3, 
  Trash2, 
  Loader2, 
  AlertTriangle, 
  X,
  Clock,
  CheckCircle2,
  ShieldCheck,
  PauseCircle,
  PlayCircle,
  Camera,
  ImageIcon,
  Upload,
  FileText,
  Paperclip,
  Bold,
  Italic,
  List,
  ExternalLink,
  User as UserIcon,
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

interface CategoryOption {
  id: string;
  name: string;
}

interface SubWorkOption {
  id: string;
  name: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
}

interface UserOption {
  id: string;
  name: string;
  email: string;
  role: string;
}

export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'HOLD' | 'INSPECTION' | 'COMPLETED';

interface PhotoItem {
  id: string;
  url: string;
  caption?: string | null;
  createdAt: string;
  uploadedBy?: { id: string; name: string };
}

interface NoteItem {
  id: string;
  content: string;
  attachmentUrl?: string | null;
  createdAt: string;
  createdBy?: { id: string; name: string; email?: string; role?: string };
}

interface TaskItem {
  id: string;
  title: string;
  name?: string;
  description?: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: TaskStatus;
  startDate: string;
  endDate: string;
  estimatedDays?: number;
  progress: number; // Completion %
  projectId: string;
  roomId?: string | null;
  subWorkId?: string | null;
  contractorId?: string | null;
  supervisorId?: string | null;
  labourCount?: number;
  room?: RoomOption | null;
  subWork?: SubWorkOption | null;
  contractor?: UserOption | null;
  supervisor?: UserOption | null;
  assignedTo?: UserOption | null;
  photos?: PhotoItem[];
  notes?: NoteItem[];
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [subWorks, setSubWorks] = useState<SubWorkOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Task Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'NOT_STARTED' as TaskStatus,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    progress: 0,
    roomId: '',
    categoryId: '',
    subWorkId: '',
    contractorId: '',
    supervisorId: '',
    labourCount: 2,
  });

  const [submitting, setSubmitting] = useState(false);

  // Gallery Modal State
  const [activeGalleryTask, setActiveGalleryTask] = useState<TaskItem | null>(null);
  const [taskPhotos, setTaskPhotos] = useState<PhotoItem[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoCaption, setPhotoCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Notes Modal State (Rich Text, Attachments, Author, Timestamp)
  const [activeNotesTask, setActiveNotesTask] = useState<TaskItem | null>(null);
  const [taskNotes, setTaskNotes] = useState<NoteItem[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteAttachment, setNoteAttachment] = useState<File | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [tasksRes, roomsRes, categoriesRes, subWorksRes, usersRes] = await Promise.all([
        client.get('/api/tasks'),
        client.get('/api/rooms'),
        client.get('/api/categories'),
        client.get('/api/subworks'),
        client.get('/api/auth/users').catch(() => ({ data: [] })),
      ]);

      setTasks(tasksRes.data);
      setRooms(roomsRes.data);
      setCategories(categoriesRes.data);
      setSubWorks(subWorksRes.data);
      setUsers(usersRes.data || []);
    } catch (err: any) {
      console.error('Failed to fetch tasks dependencies:', err);
      setError(err.response?.data?.error || 'Failed to load task records from PostgreSQL database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: 0,
      roomId: '',
      categoryId: '',
      subWorkId: '',
      contractorId: '',
      supervisorId: '',
      labourCount: 2,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (task: TaskItem) => {
    setEditingTask(task);
    const catId = task.subWork?.category?.id || '';
    setFormData({
      title: task.title || task.name || '',
      description: task.description || '',
      priority: task.priority || 'MEDIUM',
      status: task.status || 'NOT_STARTED',
      startDate: task.startDate ? task.startDate.split('T')[0] : '',
      endDate: task.endDate ? task.endDate.split('T')[0] : '',
      progress: task.progress || 0,
      roomId: task.roomId || '',
      categoryId: catId,
      subWorkId: task.subWorkId || '',
      contractorId: task.contractorId || '',
      supervisorId: task.supervisorId || '',
      labourCount: task.labourCount || 1,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.startDate || !formData.endDate) {
      alert('Please fill in Task Title, Start Date, and End Date.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingTask) {
        // UPDATE
        await client.put(`/api/tasks/${editingTask.id}`, formData);
      } else {
        // CREATE
        await client.post('/api/tasks', formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save task to database');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete task '${title}'?`)) return;

    try {
      await client.delete(`/api/tasks/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete task');
    }
  };

  const handleCycleStatus = async (task: TaskItem) => {
    const statusCycle: TaskStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'HOLD', 'INSPECTION', 'COMPLETED'];
    const currentIndex = statusCycle.indexOf(task.status);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];

    try {
      await client.put(`/api/tasks/${task.id}`, { status: nextStatus });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  // GALLERY & SUPABASE STORAGE LOGIC
  const handleOpenGallery = async (task: TaskItem) => {
    setActiveGalleryTask(task);
    setLoadingPhotos(true);
    setSelectedFile(null);
    setPhotoCaption('');
    try {
      const res = await client.get(`/api/photos/task/${task.id}`);
      setTaskPhotos(res.data);
    } catch (err: any) {
      console.error('Failed to load gallery photos:', err);
      setTaskPhotos([]);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGalleryTask) return;
    if (!selectedFile) {
      alert('Please select an image file to upload.');
      return;
    }

    setUploadingPhoto(true);
    try {
      const uploadData = new FormData();
      uploadData.append('photo', selectedFile);
      uploadData.append('taskId', activeGalleryTask.id);
      if (photoCaption) uploadData.append('caption', photoCaption);

      await client.post('/api/photos/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const res = await client.get(`/api/photos/task/${activeGalleryTask.id}`);
      setTaskPhotos(res.data);
      setSelectedFile(null);
      setPhotoCaption('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to upload photo to Supabase Storage');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!window.confirm('Are you sure you want to delete this photo from Supabase storage?')) return;

    try {
      await client.delete(`/api/photos/${photoId}`);
      if (activeGalleryTask) {
        const res = await client.get(`/api/photos/task/${activeGalleryTask.id}`);
        setTaskPhotos(res.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete photo');
    }
  };

  // RICH TEXT NOTES & ATTACHMENT LOGIC
  const handleOpenNotesModal = async (task: TaskItem) => {
    setActiveNotesTask(task);
    setLoadingNotes(true);
    setNoteContent('');
    setNoteAttachment(null);
    try {
      const res = await client.get(`/api/notes/task/${task.id}`);
      setTaskNotes(res.data);
    } catch (err: any) {
      console.error('Failed to load task notes:', err);
      setTaskNotes([]);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleAddRichTag = (tagType: 'bold' | 'italic' | 'list' | 'heading') => {
    switch (tagType) {
      case 'bold':
        setNoteContent(prev => prev + ' <b>bold text</b> ');
        break;
      case 'italic':
        setNoteContent(prev => prev + ' <i>italic text</i> ');
        break;
      case 'list':
        setNoteContent(prev => prev + '\n• Note point item 1\n• Note point item 2\n');
        break;
      case 'heading':
        setNoteContent(prev => prev + '\n<h3>Section Header</h3>\n');
        break;
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNotesTask) return;
    if (!noteContent.trim()) {
      alert('Please enter note content.');
      return;
    }

    setSubmittingNote(true);
    try {
      const payload = new FormData();
      payload.append('taskId', activeNotesTask.id);
      payload.append('content', noteContent);
      if (noteAttachment) {
        payload.append('attachment', noteAttachment);
      }

      await client.post('/api/notes', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const res = await client.get(`/api/notes/task/${activeNotesTask.id}`);
      setTaskNotes(res.data);
      setNoteContent('');
      setNoteAttachment(null);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add note');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await client.delete(`/api/notes/${noteId}`);
      if (activeNotesTask) {
        const res = await client.get(`/api/notes/task/${activeNotesTask.id}`);
        setTaskNotes(res.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete note');
    }
  };

  const getStatusConfig = (status: TaskStatus) => {
    switch (status) {
      case 'NOT_STARTED':
        return { label: 'Not Started', badge: 'bg-slate-800 text-slate-400 border-slate-700/50', barBg: 'bg-slate-700', icon: Clock };
      case 'IN_PROGRESS':
        return { label: 'In Progress', badge: 'bg-brand-500/10 text-brand-400 border-brand-500/20', barBg: 'bg-brand-500', icon: PlayCircle };
      case 'HOLD':
        return { label: 'Hold', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', barBg: 'bg-amber-500', icon: PauseCircle };
      case 'INSPECTION':
        return { label: 'Inspection', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20', barBg: 'bg-purple-500', icon: ShieldCheck };
      case 'COMPLETED':
        return { label: 'Completed', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', barBg: 'bg-emerald-500', icon: CheckCircle2 };
      default:
        return { label: status, badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20', barBg: 'bg-brand-500', icon: Clock };
    }
  };

  // Filter SubWorks by selected category inside form modal
  const filteredSubWorkOptions = subWorks.filter(sw => {
    if (!formData.categoryId) return true;
    return sw.categoryId === formData.categoryId;
  });

  // Filter Tasks list
  const filteredTasks = tasks.filter(t => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    return true;
  });

  // Role options
  const contractorOptions = users.filter(u => u.role === 'CONTRACTOR' || u.role === 'ADMIN' || u.role === 'PROJECT_MANAGER');
  const supervisorOptions = users.filter(u => u.role === 'SITE_ENGINEER' || u.role === 'ADMIN' || u.role === 'PROJECT_MANAGER');

  const handleExportCSV = () => {
    const formatted = tasks.map((t) => ({
      Task_ID: t.id,
      Task_Title: t.title || t.name,
      Status: t.status,
      Priority: t.priority,
      Progress_Percent: t.progress,
      Start_Date: t.startDate ? t.startDate.split('T')[0] : '',
      End_Date: t.endDate ? t.endDate.split('T')[0] : '',
      Contractor: t.contractor?.name || 'Unassigned',
      Supervisor: t.supervisor?.name || 'Unassigned',
      Room: t.room?.name || 'Unassigned',
      Labour_Count: t.labourCount || 1,
    }));
    exportToCSV(formatted, 'DFOLIO_Task_Execution_Schedule');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER WITH CONTROLS */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-brand-400" />
            Execution Tasks & Rich Text Notes
          </h3>
          <p className="text-xs text-slate-400">
            Rich Text notes, attachments, timestamping, and author tracking per Task.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-1.5 py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs transition-all"
            title="Export Task Schedule to CSV File"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export CSV
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 py-2 px-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-xs transition-all shadow-[0_4px_15px_rgba(14,160,234,0.2)]"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        </div>
      </div>

      {/* FILTER BAR FOR ALL 5 STATUSES */}
      <div className="glass-card p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-1">Progress Status:</span>
          {([
            { id: 'ALL', label: 'All' },
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
                  ? 'bg-brand-600 text-white shadow-md'
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

      {/* ARCHITECTURAL TABLE-LIST HYBRID */}
      {loading ? (
        <div className="arch-card p-12 text-center">
          <Loader2 className="w-8 h-8 text-[#16171A] dark:text-[#F4F2ED] animate-spin mx-auto mb-3" />
          <p className="text-[#6E7179] dark:text-[#A0A4AD] text-xs font-medium uppercase tracking-wider">Connecting to PostgreSQL...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="arch-card p-16 text-center">
          <CheckSquare className="w-12 h-12 text-[#8C8F99] mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-[#16171A] dark:text-[#F4F2ED]">No Works Registered</h3>
          <p className="text-xs text-[#6E7179] dark:text-[#A0A4AD] mt-1 max-w-xs mx-auto">
            Create your first work task and attach site notes & photographic logs.
          </p>
        </div>
      ) : (
        <div className="arch-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8E5DF] dark:border-[#2B2D34] bg-[#FAF8F5] dark:bg-[#121316] text-[10px] font-semibold uppercase tracking-wider text-[#6E7179] dark:text-[#A0A4AD]">
                  <th className="p-4">Work / Task</th>
                  <th className="p-4">Category & Sub Work</th>
                  <th className="p-4">Location / Room</th>
                  <th className="p-4">Contractor</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Completion</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DF]/60 dark:divide-[#2B2D34]/60">
                {filteredTasks.map((task) => {
                  const statusConfig = getStatusConfig(task.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr 
                      key={task.id} 
                      className="hover:bg-[#FAF8F5] dark:hover:bg-[#121316]/50 transition-colors group"
                    >
                      {/* Task Title */}
                      <td className="p-4 font-semibold text-[#16171A] dark:text-[#F4F2ED]">
                        <div className="font-medium text-sm leading-snug">{task.title || task.name}</div>
                        <div className="text-[10px] text-[#6E7179] dark:text-[#A0A4AD] font-mono mt-0.5">
                          {new Date(task.startDate).toLocaleDateString()} &nbsp;—&nbsp; {new Date(task.endDate).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Category & Sub Work */}
                      <td className="p-4 text-[#16171A] dark:text-[#F4F2ED]">
                        <div className="font-medium">{task.subWork?.category?.name || 'General'}</div>
                        <div className="text-[10px] text-[#6E7179] dark:text-[#A0A4AD]">{task.subWork?.name || 'Standard Work'}</div>
                      </td>

                      {/* Room / Location */}
                      <td className="p-4 text-[#6E7179] dark:text-[#A0A4AD]">
                        {task.room ? (
                          <span>{task.room.floor?.name} &nbsp;→&nbsp; {task.room.name}</span>
                        ) : (
                          <span className="italic opacity-60">Unassigned</span>
                        )}
                      </td>

                      {/* Contractor */}
                      <td className="p-4 font-medium text-[#16171A] dark:text-[#F4F2ED]">
                        {task.contractor?.name || 'Contractor Team'}
                      </td>

                      {/* Priority */}
                      <td className="p-4">
                        <span className={`text-[9px] font-mono uppercase px-2 py-0.5 border ${
                          task.priority === 'URGENT' 
                            ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 border-rose-200' 
                            : task.priority === 'HIGH'
                            ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-200'
                            : 'bg-stone-50 dark:bg-stone-900 text-[#6E7179] border-stone-200'
                        }`}>
                          {task.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <button
                          onClick={() => handleCycleStatus(task)}
                          className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#16171A] dark:text-[#F4F2ED] hover:underline"
                          title="Click to cycle status"
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{statusConfig.label}</span>
                        </button>
                      </td>

                      {/* Progress */}
                      <td className="p-4 w-32">
                        <div className="flex items-center gap-2">
                          <div className="w-full h-1 bg-[#E8E5DF] dark:bg-[#2B2D34] overflow-hidden">
                            <div className="h-full bg-[#16171A] dark:bg-[#F4F2ED]" style={{ width: `${Math.max(4, task.progress)}%` }} />
                          </div>
                          <span className="font-mono text-[10px] font-bold text-[#16171A] dark:text-[#F4F2ED]">{task.progress}%</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenNotesModal(task)}
                            className="p-1.5 hover:bg-[#EFECE6] dark:hover:bg-[#23252C] text-[#6E7179] hover:text-[#16171A] dark:hover:text-[#F4F2ED]"
                            title="Notes & Site Log"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenGallery(task)}
                            className="p-1.5 hover:bg-[#EFECE6] dark:hover:bg-[#23252C] text-[#6E7179] hover:text-[#16171A] dark:hover:text-[#F4F2ED]"
                            title="Photo Inspection"
                          >
                            <Camera className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(task)}
                            className="p-1.5 hover:bg-[#EFECE6] dark:hover:bg-[#23252C] text-[#6E7179] hover:text-[#16171A] dark:hover:text-[#F4F2ED]"
                            title="Edit Work"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(task.id, task.title || task.name || 'Work')}
                            className="p-1.5 hover:bg-rose-50 text-[#6E7179] hover:text-rose-600"
                            title="Delete Work"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RICH TEXT NOTES MODAL (Rich Text, Attachments, Author, Timestamp) */}
      {activeNotesTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-3xl glass-panel p-6 rounded-2xl shadow-2xl relative my-8 space-y-6">
            <button
              onClick={() => setActiveNotesTask(null)}
              className="absolute right-4 top-4 p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Task Notes & Site Log
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Task: <strong className="text-white">{activeNotesTask.title || activeNotesTask.name}</strong>
              </p>
            </div>

            {/* CREATE RICH TEXT NOTE FORM */}
            <form onSubmit={handleCreateNote} className="p-4 bg-slate-900/60 rounded-xl border border-white/10 space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-xs font-extrabold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add Rich Text Note & Attachment
                </div>

                {/* RICH TEXT FORMATTING TOOLBAR */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-white/10">
                  <button
                    type="button"
                    onClick={() => handleAddRichTag('bold')}
                    className="p-1 hover:bg-white/10 text-slate-300 rounded text-xs font-bold"
                    title="Bold text"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddRichTag('italic')}
                    className="p-1 hover:bg-white/10 text-slate-300 rounded text-xs"
                    title="Italic text"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddRichTag('heading')}
                    className="p-1 hover:bg-white/10 text-slate-300 rounded text-xs font-extrabold"
                    title="Section Heading"
                  >
                    H
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddRichTag('list')}
                    className="p-1 hover:bg-white/10 text-slate-300 rounded text-xs"
                    title="Bullet List"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* TEXTAREA */}
              <textarea
                required
                rows={3}
                placeholder="Enter rich text site note, inspection observation, or execution details..."
                className="w-full p-3 rounded-xl glass-input text-xs font-sans text-slate-200"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />

              {/* ATTACHMENT FILE INPUT */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-slate-400" />
                  <input
                    type="file"
                    onChange={(e) => setNoteAttachment(e.target.files ? e.target.files[0] : null)}
                    className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-purple-950 file:text-purple-300 hover:file:bg-purple-900 cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingNote || !noteContent.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50 shadow-md ml-auto"
                >
                  {submittingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Note'}
                </button>
              </div>
            </form>

            {/* NOTES FEED (AUTHOR, TIMESTAMP, CONTENT, ATTACHMENT) */}
            {loadingNotes ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 text-purple-400 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-400">Loading task notes from PostgreSQL...</p>
              </div>
            ) : taskNotes.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
                <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">No Notes Added Yet</p>
                <p className="text-xs text-slate-500 mt-1">Publish site notes with rich text formatting and file attachments.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {taskNotes.map((note) => (
                  <div key={note.id} className="glass-card p-4 rounded-xl space-y-3 relative group">
                    
                    {/* Header: Author & Timestamp */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center text-purple-300 font-extrabold text-xs">
                          <UserIcon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">
                            {note.createdBy?.name || 'Author'}
                            {note.createdBy?.role && (
                              <span className="text-[9px] text-purple-400 font-extrabold uppercase tracking-wider ml-2 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                                {note.createdBy.role}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Rich Text Rendered Content */}
                    <div 
                      className="text-xs text-slate-200 leading-relaxed whitespace-pre-line bg-slate-950/40 p-3 rounded-lg border border-white/5 font-sans"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.content) }}
                    />

                    {/* Attachment Link */}
                    {note.attachmentUrl && (
                      <div className="pt-1">
                        <a
                          href={note.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-300 text-[11px] font-bold transition-all border border-slate-700"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>View Attachment</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setActiveNotesTask(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all"
              >
                Close Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHOTO GALLERY MODAL */}
      {activeGalleryTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-3xl glass-panel p-6 rounded-2xl shadow-2xl relative my-8 space-y-6">
            <button
              onClick={() => setActiveGalleryTask(null)}
              className="absolute right-4 top-4 p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-brand-400" />
                Task Photo Gallery & Supabase Storage
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Task: <strong className="text-white">{activeGalleryTask.title || activeGalleryTask.name}</strong>
              </p>
            </div>

            {/* UPLOAD FORM */}
            <form onSubmit={handleUploadPhoto} className="p-4 bg-slate-900/60 rounded-xl border border-white/10 space-y-3">
              <div className="text-xs font-extrabold text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-4 h-4" />
                Upload New Site Inspection Photo
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Select Image File *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-600 file:text-white hover:file:bg-brand-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Photo Caption / Inspection Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Switchboard conduit wiring verified"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={uploadingPhoto || !selectedFile}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50 shadow-md"
                >
                  {uploadingPhoto ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Uploading to Supabase...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" /> Upload Photo
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* GALLERY GRID */}
            {loadingPhotos ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 text-brand-500 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-400">Loading task photos from Supabase Storage...</p>
              </div>
            ) : taskPhotos.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
                <ImageIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">No Photos Uploaded Yet</p>
                <p className="text-xs text-slate-500 mt-1">Upload execution photos to attach them to this task.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-1">
                {taskPhotos.map((photo) => (
                  <div key={photo.id} className="glass-card rounded-xl overflow-hidden group relative space-y-2 p-2">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-950">
                      <img
                        src={photo.url}
                        alt={photo.caption || 'Task photo'}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        title="Delete Photo from Supabase Storage"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-1">
                      {photo.caption && (
                        <p className="text-xs font-semibold text-white truncate">{photo.caption}</p>
                      )}
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                        <span>{photo.uploadedBy?.name || 'Site Member'}</span>
                        <span>{new Date(photo.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setActiveGalleryTask(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all"
              >
                Close Gallery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT TASK MODAL */}
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
              {editingTask ? 'Edit Execution Task' : 'Create Execution Task'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Configure Task details and select from the 5 standardized progress statuses.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Switchboard Installation & Inspection"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Progress Status
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm cursor-pointer bg-slate-900 font-semibold"
                    value={formData.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as TaskStatus;
                      let newProg = formData.progress;
                      if (newStatus === 'NOT_STARTED') newProg = 0;
                      else if (newStatus === 'IN_PROGRESS' && newProg === 0) newProg = 50;
                      else if (newStatus === 'INSPECTION') newProg = 90;
                      else if (newStatus === 'COMPLETED') newProg = 100;
                      setFormData({ ...formData, status: newStatus, progress: newProg });
                    }}
                  >
                    <option value="NOT_STARTED">Not Started (0%)</option>
                    <option value="IN_PROGRESS">In Progress (1-89%)</option>
                    <option value="HOLD">Hold (Paused)</option>
                    <option value="INSPECTION">Inspection (90%)</option>
                    <option value="COMPLETED">Completed (100%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Priority
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm cursor-pointer bg-slate-900"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="p-4 bg-slate-900/60 rounded-xl border border-white/10 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-300">Completion % Indicator</span>
                  <span className="text-brand-400 font-extrabold text-sm">{formData.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  value={formData.progress}
                  onChange={(e) => {
                    const prog = Number(e.target.value);
                    let st = formData.status;
                    if (prog === 0) st = 'NOT_STARTED';
                    else if (prog > 0 && prog < 90 && st !== 'HOLD') st = 'IN_PROGRESS';
                    else if (prog >= 90 && prog < 100 && st !== 'HOLD') st = 'INSPECTION';
                    else if (prog === 100) st = 'COMPLETED';
                    setFormData({ ...formData, progress: prog, status: st });
                  }}
                />
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getStatusConfig(formData.status).barBg}`}
                    style={{ width: `${Math.max(4, formData.progress)}%` }}
                  />
                </div>
              </div>

              {/* WORKFORCE ASSIGNMENTS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Contractor
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs cursor-pointer bg-slate-900"
                    value={formData.contractorId}
                    onChange={(e) => setFormData({ ...formData, contractorId: e.target.value })}
                  >
                    <option value="">-- Select Contractor --</option>
                    {contractorOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Supervisor
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs cursor-pointer bg-slate-900"
                    value={formData.supervisorId}
                    onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value })}
                  >
                    <option value="">-- Select Supervisor --</option>
                    {supervisorOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm cursor-pointer bg-slate-900"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm cursor-pointer bg-slate-900"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Assign Room */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Assign Room (Optional)
                </label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs cursor-pointer bg-slate-900"
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                >
                  <option value="">-- No Room Assigned --</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.floor?.project?.name ? `${r.floor.project.name} → ` : ''}{r.floor?.name} → {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assign Category & Sub Work */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Assign Category
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs cursor-pointer bg-slate-900"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, subWorkId: '' })}
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Assign Sub Work
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs cursor-pointer bg-slate-900"
                    value={formData.subWorkId}
                    onChange={(e) => setFormData({ ...formData, subWorkId: e.target.value })}
                  >
                    <option value="">-- Select Sub Work --</option>
                    {filteredSubWorkOptions.map((sw) => (
                      <option key={sw.id} value={sw.id}>
                        {sw.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                  disabled={submitting}
                  className="flex items-center gap-2 py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-xs transition-all shadow-[0_4px_15px_rgba(14,160,234,0.2)] disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
