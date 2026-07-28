import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { 
  GitMerge, 
  FolderKanban,
  Plus, 
  Edit3, 
  Trash2, 
  Loader2, 
  AlertTriangle, 
  X,
  Sparkles,
  CheckSquare,
  ArrowRight
} from 'lucide-react';

interface CategoryOption {
  id: string;
  name: string;
}

interface SubWorkItem {
  id: string;
  name: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  _count?: {
    tasks: number;
  };
}

const PRESET_EXAMPLES = [
  { category: 'Electrical', name: 'Switch Fitting' },
  { category: 'Electrical', name: 'Light Fitting' },
  { category: 'Electrical', name: 'Fan Installation' },
  { category: 'Plumbing', name: 'Pipe Fitting' },
  { category: 'Plumbing', name: 'Sanitary Fixtures' },
  { category: 'Civil', name: 'Brickwork Masonry' },
  { category: 'Civil', name: 'Slab Shuttering' },
];

const SubWorks: React.FC = () => {
  const [subWorks, setSubWorks] = useState<SubWorkItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingSubWork, setEditingSubWork] = useState<SubWorkItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [subWorksRes, categoriesRes] = await Promise.all([
        client.get('/api/subworks'),
        client.get('/api/categories'),
      ]);
      setSubWorks(subWorksRes.data);
      setCategories(categoriesRes.data);
      if (categoriesRes.data.length > 0 && !formData.categoryId) {
        setFormData(prev => ({ ...prev, categoryId: categoriesRes.data[0].id }));
      }
    } catch (err: any) {
      console.error('Failed to fetch sub works:', err);
      setError(err.response?.data?.error || 'Database connection error or failed to load sub works.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = (initialName: string = '', catId: string = '') => {
    setEditingSubWork(null);
    setFormData({
      name: initialName,
      categoryId: catId || (categories.length > 0 ? categories[0].id : ''),
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (item: SubWorkItem) => {
    setEditingSubWork(item);
    setFormData({
      name: item.name,
      categoryId: item.categoryId,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.categoryId) {
      alert('Please fill in sub-work name and select a parent category.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingSubWork) {
        // UPDATE
        await client.put(`/api/subworks/${editingSubWork.id}`, formData);
      } else {
        // CREATE
        await client.post('/api/subworks', formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save sub work');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete sub work '${name}'?`)) return;

    try {
      await client.delete(`/api/subworks/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete sub work');
    }
  };

  const handleQuickAddPreset = async (presetName: string, categoryName: string) => {
    // Find category ID
    let targetCat = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    
    // If category doesn't exist, create it first
    if (!targetCat) {
      try {
        const catRes = await client.post('/api/categories', { name: categoryName });
        targetCat = catRes.data;
      } catch (err: any) {
        alert(err.response?.data?.error || `Failed to create parent category ${categoryName}`);
        return;
      }
    }

    if (!targetCat) return;

    // Check if subwork already exists under this category
    const exists = subWorks.some(sw => 
      sw.name.toLowerCase() === presetName.toLowerCase() && sw.categoryId === targetCat?.id
    );

    if (exists) {
      alert(`Sub Work '${presetName}' already exists under '${categoryName}'.`);
      return;
    }

    try {
      await client.post('/api/subworks', {
        name: presetName,
        categoryId: targetCat.id,
      });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || `Failed to add ${presetName}`);
    }
  };

  const filteredSubWorks = subWorks.filter(sw => {
    if (selectedCategoryFilter === 'ALL') return true;
    return sw.categoryId === selectedCategoryFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER & CONTROLS */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-brand-400" />
            Sub Works Breakdown
          </h3>
          <p className="text-xs text-slate-400">Hierarchical task items assigned to specific work categories.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl glass-input text-xs cursor-pointer bg-slate-900"
          >
            <option value="ALL">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => handleOpenAddModal('', selectedCategoryFilter !== 'ALL' ? selectedCategoryFilter : '')}
            className="flex items-center gap-2 py-2 px-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-xs transition-all shadow-[0_4px_15px_rgba(14,160,234,0.2)]"
          >
            <Plus className="w-4 h-4" />
            Create Sub Work
          </button>
        </div>
      </div>

      {/* QUICK PRESET EXAMPLES */}
      <div className="glass-card p-4 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Sparkles className="w-4 h-4 text-brand-400" />
          Quick Add Breakdown Examples (Category → Sub Work):
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_EXAMPLES.map((ex, idx) => {
            const isAdded = subWorks.some(
              sw => sw.name.toLowerCase() === ex.name.toLowerCase() && sw.category.name.toLowerCase() === ex.category.toLowerCase()
            );
            return (
              <button
                key={idx}
                onClick={() => handleQuickAddPreset(ex.name, ex.category)}
                disabled={isAdded}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isAdded
                    ? 'bg-slate-800/40 border border-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-brand-500/10 border border-brand-500/20 text-brand-300 hover:bg-brand-500/20 hover:text-white'
                }`}
              >
                <span>{ex.category}</span>
                <ArrowRight className="w-3 h-3 text-brand-500" />
                <span>{ex.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-200 text-sm rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* SUB WORKS GRID */}
      {loading ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Connecting to PostgreSQL...</p>
        </div>
      ) : filteredSubWorks.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <GitMerge className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 text-sm font-semibold">No Sub Works Found</p>
          <p className="text-slate-500 text-xs mt-1">Use the quick add buttons above or create custom sub works linked to a category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubWorks.map((sw) => (
            <div key={sw.id} className="glass-card p-5 rounded-2xl space-y-4 relative group">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-brand-400 uppercase tracking-widest">
                    <FolderKanban className="w-3 h-3 text-brand-500" />
                    {sw.category.name}
                  </div>
                  <h4 className="text-base font-extrabold text-white mt-1 group-hover:text-brand-300 transition-colors">
                    {sw.name}
                  </h4>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(sw)}
                    className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all"
                    title="Edit Sub Work"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(sw.id, sw.name)}
                    className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-all"
                    title="Delete Sub Work"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 font-semibold text-slate-500">
                  <CheckSquare className="w-3.5 h-3.5" />
                  Linked Execution Tasks
                </span>
                <span className="font-bold text-white">
                  {sw._count?.tasks || 0} Tasks
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT SUB WORK MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              {editingSubWork ? 'Edit Sub Work' : 'Create Sub Work'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Assign sub-work title and link to its parent trade category.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Parent Category
                </label>
                {categories.length === 0 ? (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-xl">
                    No categories exist yet. Create a category first before adding sub-works.
                  </div>
                ) : (
                  <select
                    required
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm cursor-pointer bg-slate-900"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Sub Work Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Switch Fitting, Light Fitting, Fan Installation"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || categories.length === 0}
                  className="flex items-center gap-2 py-2 px-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-xs transition-all shadow-[0_4px_15px_rgba(14,160,234,0.2)] disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingSubWork ? 'Save Changes' : 'Create Sub Work'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubWorks;
