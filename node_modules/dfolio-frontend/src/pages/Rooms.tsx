import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { 
  Home, 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  Loader2, 
  AlertTriangle, 
  X,
  Building2
} from 'lucide-react';

interface FloorOption {
  id: string;
  name: string;
  number: number;
  project: {
    id: string;
    name: string;
  };
}

interface RoomItem {
  id: string;
  name: string;
  floorId: string;
  floor: {
    id: string;
    name: string;
    project: {
      id: string;
      name: string;
    };
  };
  _count?: {
    tasks: number;
    snags: number;
  };
}

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [floors, setFloors] = useState<FloorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFloorFilter, setSelectedFloorFilter] = useState<string>('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    floorId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch rooms and floor options from database
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [roomsRes, floorsRes] = await Promise.all([
        client.get('/api/rooms'),
        client.get('/api/floors'),
      ]);
      setRooms(roomsRes.data);
      setFloors(floorsRes.data);
      if (floorsRes.data.length > 0 && !formData.floorId) {
        setFormData(prev => ({ ...prev, floorId: floorsRes.data[0].id }));
      }
    } catch (err: any) {
      console.error('Failed to fetch rooms/floors:', err);
      setError(err.response?.data?.error || 'Database connection error or failed to load rooms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingRoom(null);
    setFormData({
      name: '',
      floorId: floors.length > 0 ? floors[0].id : '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (room: RoomItem) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      floorId: room.floorId,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.floorId) {
      alert('Please fill in room name and select a parent floor.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingRoom) {
        // UPDATE
        await client.put(`/api/rooms/${editingRoom.id}`, formData);
      } else {
        // CREATE
        await client.post('/api/rooms', formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save room to database');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;

    try {
      await client.delete(`/api/rooms/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete room');
    }
  };

  const filteredRooms = rooms.filter(r => {
    if (selectedFloorFilter === 'ALL') return true;
    return r.floorId === selectedFloorFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER & CONTROLS */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <Home className="w-5 h-5 text-brand-400" />
            Room Management
          </h3>
          <p className="text-xs text-slate-400">Each room is assigned to a specific floor and site portfolio.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Floor filter */}
          <select
            value={selectedFloorFilter}
            onChange={(e) => setSelectedFloorFilter(e.target.value)}
            className="px-3 py-2 rounded-xl glass-input text-xs cursor-pointer bg-slate-900"
          >
            <option value="ALL">All Floors ({floors.length})</option>
            {floors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.project.name} - {f.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 py-2 px-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-xs transition-all shadow-[0_4px_15px_rgba(14,160,234,0.2)]"
          >
            <Plus className="w-4 h-4" />
            Create Room
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-200 text-sm rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ROOMS LIST */}
      {loading ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Connecting to PostgreSQL...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <Home className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 text-sm font-semibold">No Rooms Found</p>
          <p className="text-slate-500 text-xs mt-1">Create your first room and link it to a floor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => (
            <div key={room.id} className="glass-card p-5 rounded-2xl space-y-4 relative group">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-brand-400 uppercase tracking-widest">
                    <Building2 className="w-3 h-3 text-brand-500" />
                    {room.floor.project.name}
                  </div>
                  <h4 className="text-base font-extrabold text-white mt-1 group-hover:text-brand-300 transition-colors">
                    {room.name}
                  </h4>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(room)}
                    className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all"
                    title="Edit Room"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-all"
                    title="Delete Room"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  {room.floor.name}
                </span>
                
                <div className="flex gap-3 font-bold text-[10px]">
                  <span><strong className="text-white">{room._count?.tasks || 0}</strong> Tasks</span>
                  <span><strong className="text-red-400">{room._count?.snags || 0}</strong> Snags</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT ROOM MODAL */}
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
              {editingRoom ? 'Edit Room' : 'Create Room'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Assign room name and link to its parent floor.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Parent Floor
                </label>
                {floors.length === 0 ? (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-xl">
                    No floors exist yet. Create a floor first before adding rooms.
                  </div>
                ) : (
                  <select
                    required
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm cursor-pointer bg-slate-900"
                    value={formData.floorId}
                    onChange={(e) => setFormData({ ...formData, floorId: e.target.value })}
                  >
                    {floors.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.project.name} → {f.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Room Name / Designation
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Bedroom, Kitchen, Room 102"
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
                  disabled={submitting || floors.length === 0}
                  className="flex items-center gap-2 py-2 px-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-xs transition-all shadow-[0_4px_15px_rgba(14,160,234,0.2)] disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingRoom ? 'Save Changes' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
