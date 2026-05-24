import { useState, useEffect } from 'react';
import { settingsApi } from '../../api/services';
import { LoadingSpinner } from '../../components/UI';
import { Settings, Save, Globe, DollarSign, Shield, Eye, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

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

const SettingsField = ({ label, value, onChange, type = 'text' }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      className="input-field w-full" />
  </div>
);

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi.get()
      .then(r => setSettings(r.data))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.update(settings);
      toast.success('Settings saved successfully!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  const set = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  if (loading) return <LoadingSpinner />;
  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-header flex items-center gap-2"><Settings className="w-7 h-7" /> Platform Settings</h1>
          <p className="text-gray-500">Control what customers and workers see and can do</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="btn-primary flex items-center gap-2">
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>

      <Section icon={Globe} title="Site Information">
        <SettingsField label="Site Name" value={settings.siteName} onChange={v => set('siteName', v)} />
        <SettingsField label="Contact Email" value={settings.siteEmail} onChange={v => set('siteEmail', v)} type="email" />
        <SettingsField label="Contact Phone" value={settings.sitePhone} onChange={v => set('sitePhone', v)} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select value={settings.currency} onChange={e => set('currency', e.target.value)} className="input-field w-full">
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="PKR">PKR (₨)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </Section>

      <Section icon={DollarSign} title="Payment Options">
        <Toggle label="Allow Cash on Delivery (COD)"
          desc="Customers can pay in cash when the worker arrives"
          value={settings.allowCOD}
          onChange={() => toggle('allowCOD')} />
        <Toggle label="Allow Online Payment"
          desc="Customers can pay online via Stripe"
          value={settings.allowOnlinePayment}
          onChange={() => toggle('allowOnlinePayment')} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Platform Fee (%)</label>
          <input type="number" min="0" max="100" value={settings.platformFeePercent}
            onChange={e => set('platformFeePercent', Number(e.target.value))}
            className="input-field w-32" />
          <p className="text-xs text-gray-400 mt-1">Percentage deducted from worker earnings</p>
        </div>
      </Section>

      <Section icon={Eye} title="Visibility & Features">
        <Toggle label="Show Worker Ratings to Customers"
          desc="Display star ratings on worker profiles and service listings"
          value={settings.showWorkerRatings}
          onChange={() => toggle('showWorkerRatings')} />
        <Toggle label="Allow Public Registration"
          desc="New users can create accounts. Disable to make it invite-only."
          value={settings.allowRegistration}
          onChange={() => toggle('allowRegistration')} />
      </Section>

      <Section icon={Shield} title="Admin Controls">
        <Toggle label="Require Admin Approval for New Services"
          desc="Worker-created services must be approved before they appear publicly"
          value={settings.requireAdminApproval}
          onChange={() => toggle('requireAdminApproval')} />
        <Toggle label="Maintenance Mode"
          desc="Put the site in maintenance mode. Only admins can log in."
          value={settings.maintenanceMode}
          onChange={() => toggle('maintenanceMode')} />
      </Section>

      {/* Preview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
        <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Current Public Config</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          {[
            ['Site Name', settings.siteName],
            ['Currency', settings.currency],
            ['COD Enabled', settings.allowCOD ? '✅ Yes' : '❌ No'],
            ['Online Pay', settings.allowOnlinePayment ? '✅ Yes' : '❌ No'],
            ['Show Ratings', settings.showWorkerRatings ? '✅ Yes' : '❌ No'],
            ['Registration', settings.allowRegistration ? '✅ Open' : '❌ Closed'],
            ['Admin Approval', settings.requireAdminApproval ? '✅ Required' : '❌ Off'],
            ['Maintenance', settings.maintenanceMode ? '⚠️ ON' : '✅ Off'],
            ['Platform Fee', `${settings.platformFeePercent}%`],
          ].map(([k, v]) => (
            <div key={k} className="bg-white rounded-xl p-3 border border-blue-100">
              <div className="text-xs text-gray-400">{k}</div>
              <div className="font-semibold text-gray-800">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
