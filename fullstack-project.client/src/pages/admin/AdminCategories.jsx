import { useState, useEffect } from 'react';
import { categoriesApi } from '../../api/services';
import { LoadingSpinner, Modal } from '../../components/UI';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm = { name: '', description: '', icon: '', imageUrl: '' };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    setLoading(true);
    categoriesApi.getAll().then(res => setCategories(res.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description, icon: c.icon, imageUrl: c.imageUrl }); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { await categoriesApi.update(editing.id, form); toast.success('Updated'); }
      else { await categoriesApi.create(form); toast.success('Created'); }
      setModalOpen(false); fetch();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try { await categoriesApi.delete(id); toast.success('Deleted'); fetch(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="page-header">Categories</h1><p className="text-gray-500">Manage service and product categories</p></div>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Category</button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map(c => (
            <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
              <div className="relative">
                <img src={c.imageUrl || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'} alt={c.name} className="w-full h-36 object-cover" />
                <div className="absolute top-3 left-3 text-3xl">{c.icon}</div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1">{c.name}</h3>
                <p className="text-gray-400 text-xs mb-4 line-clamp-2">{c.description}</p>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(c)} className="flex-1 btn-secondary text-xs py-2"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="flex-1 btn-danger text-xs py-2"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSave} className="space-y-3">
          {[
            { label: 'Name', key: 'name' },
            { label: 'Icon (emoji)', key: 'icon' },
            { label: 'Image URL', key: 'imageUrl' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input className="input-field" value={form[f.key]} required={f.key === 'name'} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
            </div>
          ))}
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
