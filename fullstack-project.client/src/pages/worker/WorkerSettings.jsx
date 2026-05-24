import { useState, useEffect } from 'react';
import { usersApi, settingsApi } from '../../api/services';
import { LoadingSpinner } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import { Settings, Save, User, Bell, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WorkerSettings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [publicSettings, setPublicSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [showAvailable, setShowAvailable] = useState(true);
  const [notifications, setNotifications] = useState({ newAssignment: true, statusChange: true, payment: true });

  useEffect(() => {
    Promise.all([usersApi.getProfile(), settingsApi.getPublic()])
      .then(([profileRes, settingsRes]) => {
        const p = profileRes.data;
        setProfile(p);
        setShowAvailable(p.isAvailable ?? true);
        setPublicSettings(settingsRes.data);
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await usersApi.updateProfile({
        fullName: profile.fullName,
        phone: profile.phone,
        address: profile.address,
        profileImage: profile.profileImage,
        skills: profile.skills,
        bio: profile.bio,
        hourlyRate: profile.hourlyRate,
        isAvailable: showAvailable,
      });
      toast.success('Profile settings saved!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!profile) return null;

  const Section = ({ icon: Icon, title, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 p-5 border-b border-gray-100 bg-gray-50">
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-green-600" />
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
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${value ? 'bg-green-600' : 'bg-gray-300'}`}>
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${value ? 'translate-x-7' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-header flex items-center gap-2"><Settings className="w-7 h-7" /> Worker Settings</h1>
          <p className="text-gray-500">Manage your availability, notifications and profile preferences</p>
        </div>
      </div>

      <Section icon={User} title="Profile & Availability">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
            <input type="number" className="input-field w-full" value={profile.hourlyRate || 0}
              onChange={e => setProfile(p => ({ ...p, hourlyRate: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
            <input className="input-field w-full" value={profile.skills || ''} placeholder="Plumbing, Electrical, ..."
              onChange={e => setProfile(p => ({ ...p, skills: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea rows={3} className="input-field w-full resize-none" value={profile.bio || ''}
              onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} placeholder="Tell customers about yourself..." />
          </div>
        </div>
        <Toggle label="Available for New Jobs"
          desc="When off, you won't appear in search results and won't receive new assignments"
          value={showAvailable}
          onChange={() => setShowAvailable(v => !v)} />
        <button onClick={handleSaveProfile} disabled={savingProfile}
          className="btn-primary flex items-center gap-2">
          {savingProfile ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {savingProfile ? 'Saving…' : 'Save Profile Settings'}
        </button>
      </Section>

      <Section icon={Bell} title="Notification Preferences">
        <Toggle label="New Assignment Notifications"
          desc="Get notified when admin assigns a job to you"
          value={notifications.newAssignment}
          onChange={() => setNotifications(n => ({ ...n, newAssignment: !n.newAssignment }))} />
        <Toggle label="Order Status Updates"
          desc="Get notified when customer changes or cancels an order"
          value={notifications.statusChange}
          onChange={() => setNotifications(n => ({ ...n, statusChange: !n.statusChange }))} />
        <Toggle label="Payment Notifications"
          desc="Get notified when payment is confirmed"
          value={notifications.payment}
          onChange={() => setNotifications(n => ({ ...n, payment: !n.payment }))} />
        <p className="text-xs text-gray-400">Note: Notification preferences are saved locally on this device.</p>
      </Section>

      {publicSettings && (
        <Section icon={Eye} title="Platform Info (Read Only)">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Platform Name', publicSettings.siteName],
              ['Currency', publicSettings.currency],
              ['COD Available', publicSettings.allowCOD ? '✅ Yes' : '❌ No'],
              ['Online Payment', publicSettings.allowOnlinePayment ? '✅ Yes' : '❌ No'],
              ['Show Your Ratings', publicSettings.showWorkerRatings ? '✅ Yes' : '❌ No'],
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
