import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { 
  Building2, 
  MapPin, 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  Loader2, 
  AlertTriangle, 
  X,
  ArrowUpRight
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

const ARCH_PROJECT_PHOTOS = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
];

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected Project for Detail Inspection
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // Form Modal State
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

  const handleOpenAddModal = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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

  const handleOpenEditModal = (proj: ProjectItem, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete project '${name}'?`)) return;

    try {
      await client.delete(`/api/projects/${id}`);
      if (selectedProject?.id === id) setSelectedProject(null);
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete project');
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8E5DF] dark:border-[#2B2D34] pb-6">
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#6E7179] dark:text-[#A0A4AD]">
            DEVELOPMENT PORTFOLIO
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#16171A] dark:text-[#F4F2ED] tracking-tight mt-1">
            Projects Portfolio
          </h2>
          <p className="text-xs text-[#6E7179] dark:text-[#A0A4AD] mt-1 max-w-xl">
            Architectural projects, structural execution levels, and site development portfolios.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="arch-btn-primary flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Initialize Project
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs rounded-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* PROJECTS LIST GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 arch-skeleton" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="arch-card p-16 text-center">
          <Building2 className="w-12 h-12 text-[#8C8F99] mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-[#16171A] dark:text-[#F4F2ED]">No Projects Yet</h3>
          <p className="text-xs text-[#6E7179] dark:text-[#A0A4AD] mt-1 max-w-xs mx-auto">
            Your first project will appear here once created in the portfolio manager.
          </p>
          <button 
            onClick={handleOpenAddModal}
            className="arch-btn-primary mt-6 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, idx) => {
            const photoUrl = ARCH_PROJECT_PHOTOS[idx % ARCH_PROJECT_PHOTOS.length];
            return (
              <div 
                key={project.id} 
                onClick={() => setSelectedProject(project)}
                className="arch-card arch-image-card group h-[380px] cursor-pointer"
              >
                <img 
                  src={photoUrl} 
                  alt={project.name} 
                  loading="lazy" 
                />

                {/* Top Tags */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <span className="text-[9px] font-mono uppercase tracking-widest bg-[#16171A]/90 text-[#FAF8F5] px-2.5 py-1 backdrop-blur-md">
                    {project.status}
                  </span>
                </div>

                {/* Top Action Triggers */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                  <button
                    onClick={(e) => handleOpenEditModal(project, e)}
                    className="p-2 bg-white/90 dark:bg-black/90 text-[#16171A] dark:text-[#F4F2ED] hover:bg-white backdrop-blur-md transition-all"
                    title="Edit Project"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(project.id, project.name, e)}
                    className="p-2 bg-white/90 dark:bg-black/90 text-rose-600 hover:bg-rose-50 backdrop-blur-md transition-all"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Image Overlay */}
                <div className="arch-image-overlay">
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 space-y-3">
                    {project.location && (
                      <div className="text-[10px] font-semibold text-white/70 uppercase tracking-widest flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {project.location}
                      </div>
                    )}
                    
                    <h3 className="font-serif text-2xl font-bold text-white tracking-tight leading-snug">
                      {project.name}
                    </h3>

                    {project.description && (
                      <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-white/20 text-xs text-white/90">
                      <span className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-white/70" />
                        <span><strong>{project._count?.floors || 0}</strong> Floors</span>
                        <span>•</span>
                        <span><strong>{project._count?.tasks || 0}</strong> Works</span>
                        <span>•</span>
                        <span><strong>{project._count?.snags || 0}</strong> Snags</span>
                      </span>

                      <div className="flex items-center gap-1 font-semibold text-white">
                        <span>Inspect</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🏛️ PROJECT DETAIL INSPECTION MODAL / DRAWER */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-4xl bg-white dark:bg-[#18191D] border border-[#E8E5DF] dark:border-[#2B2D34] shadow-arch dark:shadow-arch-dark relative my-8 overflow-hidden">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute right-4 top-4 z-20 p-2 bg-black/60 text-white hover:bg-black transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Hero Banner */}
            <div className="relative h-72 bg-[#EFECE6] dark:bg-[#121316]">
              <img 
                src={ARCH_PROJECT_PHOTOS[0]} 
                alt={selectedProject.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-8 flex flex-col justify-end text-white">
                <div className="text-[10px] font-mono uppercase tracking-widest text-white/70">
                  {selectedProject.status} &nbsp;•&nbsp; {selectedProject.location || 'Site Development'}
                </div>
                <h2 className="font-serif text-3xl font-bold tracking-tight mt-1">
                  {selectedProject.name}
                </h2>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-8 space-y-8">
              
              {/* SECTION: OVERVIEW */}
              <div className="space-y-3">
                <div className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#6E7179] dark:text-[#A0A4AD]">
                  PROJECT OVERVIEW
                </div>
                <p className="text-sm text-[#16171A] dark:text-[#F4F2ED] leading-relaxed">
                  {selectedProject.description || 'No detailed overview description specified for this construction portfolio.'}
                </p>
              </div>

              {/* SECTION: PROGRESS BREAKDOWN */}
              <div className="space-y-4 pt-4 border-t border-[#E8E5DF] dark:border-[#2B2D34]">
                <div className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#6E7179] dark:text-[#A0A4AD]">
                  TRADE PROGRESS ESTIMATION
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-[#FAF8F5] dark:bg-[#121316] border border-[#E8E5DF] dark:border-[#2B2D34] space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>Civil & Foundation</span>
                      <span className="font-mono">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E8E5DF] dark:bg-[#2B2D34] overflow-hidden">
                      <div className="h-full bg-[#16171A] dark:bg-[#F4F2ED] w-[85%]" />
                    </div>
                  </div>

                  <div className="p-3 bg-[#FAF8F5] dark:bg-[#121316] border border-[#E8E5DF] dark:border-[#2B2D34] space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>Electrical Systems</span>
                      <span className="font-mono">70%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E8E5DF] dark:bg-[#2B2D34] overflow-hidden">
                      <div className="h-full bg-[#16171A] dark:bg-[#F4F2ED] w-[70%]" />
                    </div>
                  </div>

                  <div className="p-3 bg-[#FAF8F5] dark:bg-[#121316] border border-[#E8E5DF] dark:border-[#2B2D34] space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>Plumbing & Mechanical</span>
                      <span className="font-mono">60%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E8E5DF] dark:bg-[#2B2D34] overflow-hidden">
                      <div className="h-full bg-[#16171A] dark:bg-[#F4F2ED] w-[60%]" />
                    </div>
                  </div>

                  <div className="p-3 bg-[#FAF8F5] dark:bg-[#121316] border border-[#E8E5DF] dark:border-[#2B2D34] space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>Interior & Finishes</span>
                      <span className="font-mono">40%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E8E5DF] dark:bg-[#2B2D34] overflow-hidden">
                      <div className="h-full bg-[#16171A] dark:bg-[#F4F2ED] w-[40%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* METRICS METADATA ROW */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E8E5DF] dark:border-[#2B2D34] text-center">
                <div className="p-4 bg-[#FAF8F5] dark:bg-[#121316]">
                  <div className="text-[10px] font-semibold text-[#6E7179] dark:text-[#A0A4AD] uppercase">Levels</div>
                  <div className="font-serif text-2xl font-bold mt-1">{selectedProject._count?.floors || 0}</div>
                </div>

                <div className="p-4 bg-[#FAF8F5] dark:bg-[#121316]">
                  <div className="text-[10px] font-semibold text-[#6E7179] dark:text-[#A0A4AD] uppercase">Works</div>
                  <div className="font-serif text-2xl font-bold mt-1">{selectedProject._count?.tasks || 0}</div>
                </div>

                <div className="p-4 bg-[#FAF8F5] dark:bg-[#121316]">
                  <div className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 uppercase">Snags</div>
                  <div className="font-serif text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{selectedProject._count?.snags || 0}</div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="arch-btn-secondary"
                >
                  Close Inspection
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PROJECT MODAL */}
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
              {editingProject ? 'Edit Project' : 'Initialize Project'}
            </h3>
            <p className="text-xs text-[#6E7179] dark:text-[#A0A4AD] mb-6">
              Specify architectural project scope, location, and execution timeline.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-[#6E7179] dark:text-[#A0A4AD] uppercase tracking-wider mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Azeez Residence — Block A"
                  className="w-full p-2.5 arch-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#6E7179] dark:text-[#A0A4AD] uppercase tracking-wider mb-1.5">
                  Location / Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sector 62, Noida"
                  className="w-full p-2.5 arch-input"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[#6E7179] dark:text-[#A0A4AD] uppercase tracking-wider mb-1.5">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full p-2.5 arch-input"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#6E7179] dark:text-[#A0A4AD] uppercase tracking-wider mb-1.5">
                    Target Completion
                  </label>
                  <input
                    type="date"
                    className="w-full p-2.5 arch-input"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#6E7179] dark:text-[#A0A4AD] uppercase tracking-wider mb-1.5">
                  Status Scope
                </label>
                <select
                  className="w-full p-2.5 arch-input cursor-pointer"
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
                <label className="block text-[10px] font-semibold text-[#6E7179] dark:text-[#A0A4AD] uppercase tracking-wider mb-1.5">
                  Editorial Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Architectural residential villa featuring 3 levels..."
                  className="w-full p-2.5 arch-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="arch-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="arch-btn-primary flex items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingProject ? 'Save Changes' : 'Initialize'}
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
