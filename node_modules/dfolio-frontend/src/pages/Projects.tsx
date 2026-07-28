import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  Loader2, 
  AlertTriangle, 
  X 
} from 'lucide-react';

interface ProjectItem {
  id: string;
  name: string;
  description?: string | null;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  status: string;
  _count?: {
    tasks: number;
    snags: number;
    floors: number;
  };
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'ACTIVE',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await client.get('/api/projects');
      setProjects(res.data);
    } catch (err: any) {
      console.error('Failed to fetch projects:', err);
      setError(err.response?.data?.error || 'Database connection error or failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      location: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'ACTIVE',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (proj: ProjectItem) => {
    setEditingProject(proj);
    setFormData({
      name: proj.name,
      description: proj.description || '',
      location: proj.location || '',
      startDate: proj.startDate ? proj.startDate.split('T')[0] : '',
      endDate: proj.endDate ? proj.endDate.split('T')[0] : '',
      status: proj.status || 'ACTIVE',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.startDate) {
      alert('Please fill in Project Name and Start Date.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingProject) {
        await client.put(`/api/projects/${editingProject.id}`, formData);
      } else {
        await client.post('/api/projects', formData);
      }
      setShowModal(false);
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete project '${name}'?`)) return;

    try {
      await client.delete(`/api/projects/${id}`);
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete project');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PLANNING': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'ACTIVE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'COMPLETED': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER & CONTROLS */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-400" />
            Construction Portfolios
          </h3>
          <p className="text-xs text-slate-400">Manage site structures, inspect levels, and track rooms across live database projects.</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 py-2 px-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-xs transition-all shadow-[0_4px_15px_rgba(14,160,234,0.2)]"
        >
          <Plus className="w-4 h-4" />
          Create Project
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-200 text-sm rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* PROJECTS LIST */}
      {loading ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Connecting to PostgreSQL...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 text-sm font-semibold">No Projects Found</p>
          <p className="text-slate-500 text-xs mt-1">Create your first construction portfolio project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="glass-card p-6 rounded-2xl space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-extrabold text-white">{project.name}</h4>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getStatusStyle(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{project.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] font-semibold text-slate-500">
                    {project.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-brand-400" /> {project.location}</span>
                    )}
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-cyan-400" /> Start: {new Date(project.startDate).toLocaleDateString()}</span>
                    {project.endDate && (
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-purple-400" /> Target: {new Date(project.endDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(project)}
                    className="p-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all border border-white/5"
                    title="Edit Project"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id, project.name)}
                    className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl transition-all border border-white/5"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Counts Breakdown */}
              <div className="border-t border-white/5 pt-4 flex flex-wrap items-center justify-between text-xs font-semibold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-brand-400" />
                  Structural Levels & Execution Data
                </span>

                <div className="flex gap-4 font-bold text-[11px]">
                  <span><strong className="text-white">{project._count?.floors || 0}</strong> Floors</span>
                  <span><strong className="text-brand-300">{project._count?.tasks || 0}</strong> Tasks</span>
                  <span><strong className="text-red-400">{project._count?.snags || 0}</strong> Snags</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT PROJECT MODAL */}
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
              {editingProject ? 'Edit Construction Project' : 'Create Construction Project'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Enter site location, project schedule, and portfolio description.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Downtown Tower Phase 1"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Location / Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sector 62, Noida"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

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
                    Target End Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm cursor-pointer bg-slate-900"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Status
                </label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm cursor-pointer bg-slate-900 font-semibold"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="PLANNING">Planning</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Description / Overview
                </label>
                <textarea
                  rows={3}
                  placeholder="Commercial high-rise construction featuring 20 floors of premium grade office space..."
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
                  disabled={submitting}
                  className="flex items-center gap-2 py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-xs transition-all shadow-[0_4px_15px_rgba(14,160,234,0.2)] disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
