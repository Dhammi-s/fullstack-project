import { useState, useEffect } from 'react';
import { ordersApi, usersApi } from '../../api/services';
import { LoadingSpinner, StatusBadge, Modal } from '../../components/UI';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Filter, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['All', 'Pending', 'Confirmed', 'InProgress', 'Completed', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [assignModal, setAssignModal] = useState(null); // order object
  const [assigningId, setAssigningId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    Promise.all([ordersApi.getAll(), usersApi.getWorkers()])
      .then(([ordRes, workRes]) => {
        setOrders(ordRes.data || []);
        setWorkers(workRes.data || []);
      })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { void fetchOrders(); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await ordersApi.updateStatus(id, status);
      toast.success('Status updated');
      fetchOrders();
    } catch { toast.error('Failed to update status'); }
    finally { setUpdatingId(null); }
  };

  const handleAssignWorker = async (workerId) => {
    if (!assignModal) return;
    setAssigningId(assignModal.id);
    try {
      await ordersApi.assignWorker(assignModal.id, workerId);
      toast.success('Worker assigned & notified!');
      setAssignModal(null);
      fetchOrders();
    } catch { toast.error('Failed to assign worker'); }
    finally { setAssigningId(null); }
  };

  const filtered = orders.filter(o => {
    const matchSearch = o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Orders Management</h1>
        <p className="text-gray-500">Manage orders, assign workers and update statuses</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex-1 min-w-48 shadow-sm">
          <Search className="w-4 h-4 text-gray-400" />
          <input className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
            placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm outline-none bg-transparent text-gray-600">
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {STATUS_OPTIONS.slice(1).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`p-3 rounded-xl border text-sm font-medium transition-all ${statusFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'}`}>
            {s}: <span className="font-bold">{orders.filter(o => o.status === s).length}</span>
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Order #', 'Customer', 'Type', 'Amount', 'Payment', 'Method', 'Worker', 'Status', 'Scheduled', 'Actions'].map(h => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td">
                      <Link to={`/orders/${order.id}`} className="font-mono font-semibold text-blue-600 hover:text-blue-800">
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="table-td font-medium">{order.customerName}</td>
                    <td className="table-td"><span className="badge-gray">{order.orderType}</span></td>
                    <td className="table-td font-bold text-green-600">${Number(order.totalAmount || 0).toFixed(2)}</td>
                    <td className="table-td"><StatusBadge status={order.paymentStatus} /></td>
                    <td className="table-td">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${order.paymentMethod === 'COD' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        {order.paymentMethod === 'COD' ? '💵 COD' : '💳 Online'}
                      </span>
                    </td>
                    <td className="table-td text-gray-500 text-sm">
                      {order.workerName || <span className="text-gray-300">Unassigned</span>}
                    </td>
                    <td className="table-td"><StatusBadge status={order.status} /></td>
                    <td className="table-td text-gray-400 text-xs">
                      {order.scheduledAt ? new Date(order.scheduledAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1">
                        <select value={order.status}
                          disabled={updatingId === order.id}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none text-gray-600 bg-white hover:border-blue-400 transition-colors disabled:opacity-50">
                          {['Pending','Confirmed','InProgress','Completed','Cancelled'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {order.orderType === 'Service' && (
                          <button onClick={() => setAssignModal(order)}
                            className="p-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                            title="Assign Worker">
                            <UserPlus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No orders found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assign Worker Modal */}
      <Modal open={!!assignModal} onClose={() => setAssignModal(null)} title={`Assign Worker — ${assignModal?.orderNumber}`}>
        <p className="text-sm text-gray-500 mb-4">
          Select a worker to assign to this {assignModal?.serviceTitle || 'service'} order.
          They will receive a notification immediately.
        </p>
        {assignModal?.scheduledAt && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-sm text-blue-700">
            📅 Scheduled: {new Date(assignModal.scheduledAt).toLocaleString()}
          </div>
        )}
        {workers.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No available workers found.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {workers.map(w => (
              <button key={w.id} onClick={() => handleAssignWorker(w.id)}
                disabled={!!assigningId}
                className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl transition-all text-left disabled:opacity-50">
                <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {w.fullName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{w.fullName}</p>
                  <p className="text-xs text-gray-400 truncate">{w.skills || 'No skills listed'}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-green-600">${w.hourlyRate}/hr</p>
                  <p className="text-xs text-yellow-500">⭐ {(w.rating || 0).toFixed(1)}</p>
                </div>
                {assigningId === assignModal?.id && (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
