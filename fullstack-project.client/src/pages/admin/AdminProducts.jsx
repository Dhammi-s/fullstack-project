import { useState, useEffect } from 'react';
import { productsApi, categoriesApi } from '../../api/services';
import { LoadingSpinner, Modal } from '../../components/UI';
import { Plus, Pencil, Trash2, Search, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm = { name: '', description: '', price: '', stock: '', brand: '', categoryId: '', imageUrl: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    setLoading(true);
    Promise.all([productsApi.getAll(), categoriesApi.getAll()])
      .then(([p, c]) => { setProducts(p.data); setCategories(c.data); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm({ ...p, price: p.price?.toString(), stock: p.stock?.toString(), categoryId: p.categoryId?.toString() }); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock), categoryId: parseInt(form.categoryId) };
      if (editing) { await productsApi.update(editing.id, payload); toast.success('Product updated'); }
      else { await productsApi.create(payload); toast.success('Product created'); }
      setModalOpen(false); fetch();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await productsApi.delete(id); toast.success('Deleted'); fetch(); }
    catch { toast.error('Delete failed'); }
  };

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="page-header">Products</h1><p className="text-gray-500">Manage your product inventory</p></div>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Product</button>
      </div>

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 w-80 shadow-sm">
        <Search className="w-4 h-4 text-gray-400" />
        <input className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
          placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <img src={p.imageUrl || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'}
                alt={p.name} className="w-full h-44 object-cover" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-gray-800 text-sm leading-tight">{p.name}</h3>
                  <span className="badge-blue text-xs flex-shrink-0">{p.brand}</span>
                </div>
                <p className="text-gray-400 text-xs mb-3 line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-green-600">${p.price}</span>
                  <span className={`text-xs font-medium ${p.stock > 10 ? 'text-green-600' : p.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                    Stock: {p.stock}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)} className="flex-1 btn-secondary text-xs py-2"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="flex-1 btn-danger text-xs py-2"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSave} className="space-y-3">
          {[
            { label: 'Product Name', key: 'name', type: 'text' },
            { label: 'Brand', key: 'brand', type: 'text' },
            { label: 'Price ($)', key: 'price', type: 'number' },
            { label: 'Stock', key: 'stock', type: 'number' },
            { label: 'Image URL', key: 'imageUrl', type: 'url' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} className="input-field" value={form[f.key]} required
                onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select className="input-field" value={form.categoryId} required onChange={e => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">Select category...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
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
