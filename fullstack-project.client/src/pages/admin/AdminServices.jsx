import { useState, useEffect } from 'react';
import { servicesApi, categoriesApi } from '../../api/services';
import { LoadingSpinner, Modal, StarRating } from '../../components/UI';
import { Plus, Pencil, Trash2, Search, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm = { title: '', description: '', price: '', priceType: 'Fixed', categoryId: '', imageUrl: '' };

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    setLoading(true);
    Promise.all([servicesApi.getAll(), categoriesApi.getAll()])
      .then(([s, c]) => { setServices(s.data); setCategories(c.data); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (s) => { setEditing(s); setForm({ ...s, price: s.price?.toString(), categoryId: s.categoryId?.toString() }); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), categoryId: parseInt(form.categoryId) };
      if (editing) { await servicesApi.update(editing.id, payload); toast.success('Updated'); }
      else { await servicesApi.create(payload); toast.success('Created'); }
      setModalOpen(false); fetch();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return;
    try { await servicesApi.delete(id); toast.success('Deleted'); fetch(); }
    catch { toast.error('Delete failed'); }
  };

  const filtered = services.filter(s => s.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="page-header">Services</h1><p className="text-gray-500">Manage all services offered</p></div>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Service</button>
      </div>

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 w-80 shadow-sm">
        <Search className="w-4 h-4 text-gray-400" />
        <input className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
          placeholder="Search services..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => (
            <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <img src={s.imageUrl || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'}
                alt={s.title} className="w-full h-44 object-cover" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-gray-800 text-sm">{s.title}</h3>
                  <span className="badge-blue text-xs flex-shrink-0">{s.priceType}</span>
                </div>
                <p className="text-gray-400 text-xs mb-2 line-clamp-2">{s.description}</p>
                <StarRating rating={s.rating} count={s.totalReviews} />
                <div className="flex items-center justify-between mt-3 mb-3">
                  <span className="text-lg font-bold text-green-600">${s.price}<span className="text-xs text-gray-400">/{s.priceType === 'Hourly' ? 'hr' : 'job'}</span></span>
                  <span className="text-xs text-gray-400">by {s.workerName}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(s)} className="flex-1 btn-secondary text-xs py-2"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                  <button onClick={() => handleDelete(s.id)} className="flex-1 btn-danger text-xs py-2"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Service' : 'Add Service'}>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input className="input-field" value={form.title} required onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input type="number" className="input-field" value={form.price} required onChange={e => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Type</label>
              <select className="input-field" value={form.priceType} onChange={e => setForm({ ...form, priceType: e.target.value })}>
                <option value="Fixed">Fixed</option>
                <option value="Hourly">Hourly</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select className="input-field" value={form.categoryId} required onChange={e => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">Select category...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input type="url" className="input-field" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input-field" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
