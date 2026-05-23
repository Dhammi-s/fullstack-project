import { useState, useEffect } from 'react';
import { usersApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/UI';
import { User, Mail, Phone, MapPin, Save, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '', address: '', bio: '', skills: '', hourlyRate: '' });

  useEffect(() => {
    usersApi.getProfile()
      .then(res => {
        const d = res.data;
        setForm({ fullName: d.fullName || '', phone: d.phone || '', address: d.address || '', bio: d.bio || '', skills: d.skills || '', hourlyRate: d.hourlyRate?.toString() || '' });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await usersApi.updateProfile({ ...form, hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : undefined });
      const token = localStorage.getItem('token');
      login({ ...user, fullName: form.fullName }, token);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="page-header">My Profile</h1>
        <p className="text-gray-500">Update your personal information</p>
      </div>

      {/* Avatar Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white flex items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
            {form.fullName?.[0] || user?.fullName?.[0] || 'U'}
          </div>
          <div className="absolute bottom-0 right-0 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-yellow-300 transition-colors">
            <Camera className="w-3.5 h-3.5 text-gray-800" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold">{form.fullName || user?.fullName}</h2>
          <p className="text-blue-200">{user?.email}</p>
          <span className="inline-block mt-2 bg-white/20 px-3 py-1 rounded-full text-sm font-medium">{user?.role}</span>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" /> Full Name
              </label>
              <input className="input-field" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" /> Phone
              </label>
              <input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 8900" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" /> Email (read-only)
            </label>
            <input className="input-field opacity-60" value={user?.email || ''} disabled />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" /> Address
            </label>
            <input className="input-field" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Your address" />
          </div>

          {user?.role === 'Worker' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Skills</label>
                <input className="input-field" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="Plumbing, Electrical..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Hourly Rate ($)</label>
                <input type="number" className="input-field" value={form.hourlyRate} onChange={e => setForm({ ...form, hourlyRate: e.target.value })} placeholder="25" />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
            <textarea className="input-field" rows={4} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about yourself..." />
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full py-3 text-base">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
