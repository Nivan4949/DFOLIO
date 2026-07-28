import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { 
  FolderKanban, 
  Plus, 
  Edit3, 
  Trash2, 
  Loader2, 
  AlertTriangle, 
  X,
  Sparkles,
  Layers
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  subWorks?: { id: string; name: string }[];
  _count?: {
    subWorks: number;
  };
}

const PRESET_EXAMPLES = ['Civil', 'Electrical', 'Plumbing', 'Painting', 'Interior'];

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await client.get('/api/categories');
      setCategories(res.data);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
      setError(err.response?.data?.error || 'Database connection error or failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddModal = (initialName: string = '') => {
    setEditingCategory(null);
    setCategoryName(initialName);
    setShowModal(true);
  };

  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      alert('Please enter a category name.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        // UPDATE
        await client.put(`/api/categories/${editingCategory.id}`, { name: categoryName });
      } else {
        // CREATE
        await client.post('/api/categories', { name: categoryName });
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete category '${name}'?`)) return;

    try {
      await client.delete(`/api/categories/${id}`);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete category');
    }
  };

  const handleQuickAddPreset = async (presetName: string) => {
    // Check if already exists
    const exists = categories.some(c => c.name.toLowerCase() === presetName.toLowerCase());
    if (exists) {
      alert(`Category '${presetName}' is already created.`);
      return;
    }

    try {
      await client.post('/api/categories', { name: presetName });
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.error || `Failed to add ${presetName}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER & CONTROLS */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-brand-400" />
            Work Categories
          </h3>
          <p className="text-xs text-slate-400">Classify site activities into standard trade sectors.</p>
        </div>

        <button
          onClick={() => handleOpenAddModal('')}
          className="flex items-center justify-center gap-2 py-2 px-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-xs transition-all shadow-[0_4px_15px_rgba(14,160,234,0.2)]"
        >
          <Plus className="w-4 h-4" />
          Create Category
        </button>
      </div>

      {/* QUICK PRESET SEEDERS */}
      <div className="glass-card p-4 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Sparkles className="w-4 h-4 text-brand-400" />
          Quick Add Industry Examples:
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_EXAMPLES.map((example) => {
            const isAdded = categories.some(c => c.name.toLowerCase() === example.toLowerCase());
            return (
              <button
                key={example}
                onClick={() => handleQuickAddPreset(example)}
                disabled={isAdded}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isAdded
                    ? 'bg-slate-800/40 border border-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-brand-500/10 border border-brand-500/20 text-brand-300 hover:bg-brand-500/20 hover:text-white'
                }`}
              >
                {isAdded ? '✓' : '+'} {example}
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

      {/* CATEGORIES GRID */}
      {loading ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Connecting to PostgreSQL...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 text-sm font-semibold">No Categories Found</p>
          <p className="text-slate-500 text-xs mt-1">Click a quick example above or create a custom work category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="glass-card p-5 rounded-2xl space-y-4 relative group">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-center text-brand-400 font-extrabold text-sm">
                    {cat.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-white group-hover:text-brand-300 transition-colors">
                      {cat.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Work Sector
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(cat)}
                    className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all"
                    title="Edit Category"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-all"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 font-semibold text-slate-500">
                  <Layers className="w-3.5 h-3.5" />
                  Sub-Works
                </span>
                <span className="font-bold text-white">
                  {cat._count?.subWorks || 0} Defined
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT CATEGORY MODAL */}
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
              {editingCategory ? 'Edit Work Category' : 'Create Work Category'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Enter trade category name (e.g. Civil, Electrical, Plumbing, Painting, Interior).
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Civil, Electrical, Plumbing..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
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
                  disabled={submitting}
                  className="flex items-center gap-2 py-2 px-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-xs transition-all shadow-[0_4px_15px_rgba(14,160,234,0.2)] disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
