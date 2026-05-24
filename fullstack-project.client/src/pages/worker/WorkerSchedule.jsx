import { useState, useEffect } from 'react';
import { ordersApi } from '../../api/services';
import { LoadingSpinner, StatusBadge } from '../../components/UI';
import { Calendar, Clock, MapPin, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WorkerSchedule() {
  const [scheduled, setScheduled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const today = new Date();
  const todayDate = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await ordersApi.getScheduled();
      setScheduled(res.data || []);
    } catch {
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  const handleUpdate = async (id, status) => {
    setUpdatingId(id);
    try {
      await ordersApi.updateStatus(id, status);
      toast.success(`Marked as ${status}`);
      load();
    } catch {
      toast.error('Failed to update');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter to today's scheduled jobs
  const todayJobs = scheduled.filter(o => {
    if (!o.scheduledAt) return false;
    const d = new Date(o.scheduledAt);
    return d.toDateString() === today.toDateString();
  });

  // Upcoming (future)
  const upcoming = scheduled.filter(o => {
    if (!o.scheduledAt) return false;
    return new Date(o.scheduledAt) > today;
  });

  const statusColor = {
    Completed: 'bg-green-50 border-green-200',
    InProgress: 'bg-blue-50 border-blue-200',
    Pending: 'bg-yellow-50 border-yellow-200',
    Confirmed: 'bg-purple-50 border-purple-200',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-header">My Schedule</h1>
          <p className="text-gray-500">{todayDate}</p>
        </div>
        <button onClick={load} disabled={loading}
          className="btn-secondary flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Week View */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-bold text-gray-800 mb-4">This Week</h2>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, i) => {
            const dayDate = new Date(today);
            const todayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;
            dayDate.setDate(today.getDate() - todayIdx + i);
            const isToday = dayDate.toDateString() === today.toDateString();
            const hasJobs = scheduled.some(o => o.scheduledAt && new Date(o.scheduledAt).toDateString() === dayDate.toDateString());
            return (
              <div key={day} className={`text-center p-3 rounded-xl transition-all ${isToday ? 'bg-blue-600 text-white' : 'hover:bg-gray-50 text-gray-600'}`}>
                <div className="text-xs font-medium mb-1">{day}</div>
                <div className={`text-lg font-bold ${isToday ? 'text-white' : 'text-gray-800'}`}>{dayDate.getDate()}</div>
                {hasJobs && (
                  <div className="flex justify-center mt-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-yellow-300' : 'bg-blue-500'}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {/* Today's Jobs */}
          <div>
            <h2 className="font-bold text-gray-800 mb-4">Today's Jobs ({todayJobs.length})</h2>
            {todayJobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
                <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No jobs scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayJobs.map(order => (
                  <div key={order.id} className={`border ${statusColor[order.status] || 'bg-gray-50 border-gray-200'} rounded-2xl p-5 flex items-center gap-4`}>
                    <div className="text-center min-w-[60px]">
                      <div className="text-sm font-bold text-gray-800">
                        {new Date(order.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="w-px h-12 bg-gray-200" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{order.serviceTitle || order.orderNumber}</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1 font-medium">{order.customerName}</span>
                        {order.address && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{order.address}</span>}
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${order.paymentMethod === 'COD' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                          {order.paymentMethod === 'COD' ? '💵 Cash on Delivery' : '💳 Online'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={order.status} />
                      {order.status === 'Pending' || order.status === 'Confirmed' ? (
                        <button onClick={() => handleUpdate(order.id, 'InProgress')}
                          disabled={updatingId === order.id}
                          className="btn-primary text-xs py-1.5 px-3">
                          {updatingId === order.id ? '…' : 'Start'}
                        </button>
                      ) : order.status === 'InProgress' ? (
                        <button onClick={() => handleUpdate(order.id, 'Completed')}
                          disabled={updatingId === order.id}
                          className="btn-success text-xs py-1.5 px-3">
                          {updatingId === order.id ? '…' : '✓ Complete'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h2 className="font-bold text-gray-800 mb-4">Upcoming ({upcoming.length})</h2>
              <div className="space-y-3">
                {upcoming.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
                    <div className="text-center min-w-[70px]">
                      <div className="text-sm font-bold text-gray-800">
                        {new Date(order.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(order.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="w-px h-10 bg-gray-200" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{order.serviceTitle || order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{order.customerName} {order.address ? `· ${order.address}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={order.status} />
                      <span className="text-sm font-bold text-green-600">${Number(order.totalAmount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Today's Jobs", value: todayJobs.length, icon: Calendar, color: 'bg-blue-500' },
          { label: 'Completed Today', value: todayJobs.filter(s => s.status === 'Completed').length, icon: CheckCircle, color: 'bg-green-500' },
          { label: 'Upcoming', value: upcoming.length, icon: Clock, color: 'bg-purple-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
            <div className={`${s.color} w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-gray-500 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

