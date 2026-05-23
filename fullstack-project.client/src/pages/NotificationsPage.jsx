import { useState, useEffect } from 'react';
import { notificationsApi } from '../api/services';
import { LoadingSpinner } from '../components/UI';
import { Bell, CheckCheck, Info, CheckCircle, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const typeIcon = {
  Success: <CheckCircle className="w-5 h-5 text-green-500" />,
  Info: <Info className="w-5 h-5 text-blue-500" />,
  Warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  Error: <X className="w-5 h-5 text-red-500" />,
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    notificationsApi.getAll().then(res => setNotifs(res.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const markRead = async (id) => {
    try { await notificationsApi.markRead(id); fetch(); } catch {}
  };

  const markAllRead = async () => {
    try { await notificationsApi.markAllRead(); fetch(); toast.success('All marked as read'); } catch {}
  };

  const unread = notifs.filter(n => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Notifications</h1>
          <p className="text-gray-500">{unread} unread notification{unread !== 1 ? 's' : ''}</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-sm">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-2">
          {notifs.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <Bell className="w-14 h-14 mx-auto mb-3 opacity-30" />
              <p className="text-lg">All caught up! No notifications.</p>
            </div>
          )}
          {notifs.map(n => (
            <div key={n.id}
              onClick={() => !n.isRead && markRead(n.id)}
              className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${n.isRead ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-200 hover:bg-blue-100'}`}>
              <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${n.isRead ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                {typeIcon[n.type] || <Info className="w-5 h-5 text-blue-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold ${n.isRead ? 'text-gray-600' : 'text-gray-900'}`}>{n.title}</p>
                  {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
