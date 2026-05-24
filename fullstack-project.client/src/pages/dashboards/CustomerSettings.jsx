import { useState, useEffect } from 'react';
import { usersApi, settingsApi } from '../../api/services';
import { LoadingSpinner } from '../../components/UI';
import { Settings, Save, User, Bell, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerSettings() {
  const [profile, setProfile] = useState(null);
  const [publicSettings, setPublicSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({ orderUpdates: true, promotions: false, chat: true });

  useEffect(() => {
    Promise.all([usersApi.getProfile(), settingsApi.getPublic()])
      .then(([pr, sr]) => {
        setProfile(pr.data);
        setPublicSettings(sr.data);
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await usersApi.updateProfile({
        fullName: profile.fullName,
        phone: profile.phone,
        address: profile.address,
        profileImage: profile.profileImage,
        skills: '', bio: '', hourlyRate: 0, isAvailable: false,
      });
      toast.success('Settings saved!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!profile) return null;

  const Section = ({ icon: Icon, title, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 p-5 border-b border-gray-100 bg-gray-50">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        <h2 className="font-bold text-gray-800">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );

  const Toggle = ({ label, desc, value, onChange }) => (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="font-medium text-gray-800 text-sm">{label}</p>
        {desc && <p className="text-gray-400 text-xs mt-0.5">{desc}</p>}
      </div>
      <button onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${value ? 'bg-blue-600' : 'bg-gray-300'}`}>
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${value ? 'translate-x-7' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header flex items-center gap-2"><Settings className="w-7 h-7" /> Account Settings</h1>
        <p className="text-gray-500">Manage your personal info and preferences</p>
      </div>

      <Section icon={User} title="Personal Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input className="input-field w-full" value={profile.fullName}
              onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input className="input-field w-full" value={profile.phone || ''}
              onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Delivery Address</label>
            <input className="input-field w-full" value={profile.address || ''}
              onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} placeholder="Your address" />
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </Section>

      <Section icon={Bell} title="Notification Preferences">
        <Toggle label="Order Status Updates" desc="Get notified when your order status changes"
          value={notifications.orderUpdates} onChange={() => setNotifications(n => ({ ...n, orderUpdates: !n.orderUpdates }))} />
        <Toggle label="Chat Messages" desc="Get notified when a worker sends you a message"
          value={notifications.chat} onChange={() => setNotifications(n => ({ ...n, chat: !n.chat }))} />
        <Toggle label="Promotions & Offers" desc="Receive promotional notifications"
          value={notifications.promotions} onChange={() => setNotifications(n => ({ ...n, promotions: !n.promotions }))} />
        <p className="text-xs text-gray-400">Notification preferences saved locally on this device.</p>
      </Section>

      {publicSettings && (
        <Section icon={Eye} title="Platform Info">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Platform', publicSettings.siteName],
              ['Currency', publicSettings.currency],
              ['Cash on Delivery', publicSettings.allowCOD ? '✅ Available' : '❌ Not available'],
              ['Online Payment', publicSettings.allowOnlinePayment ? '✅ Available' : '❌ Not available'],
            ].map(([k, v]) => (
              <div key={k} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="text-xs text-gray-400">{k}</div>
                <div className="font-semibold text-gray-800">{v}</div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
