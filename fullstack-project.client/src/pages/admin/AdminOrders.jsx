import { useState, useEffect } from 'react';
import { ordersApi } from '../../api/services';
import { LoadingSpinner, StatusBadge } from '../../components/UI';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['All', 'Pending', 'Confirmed', 'InProgress', 'Completed', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchOrders = () => {
    setLoading(true);
    ordersApi.getAll()
      .then(res => setOrders(res.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await ordersApi.updateStatus(id, status);
      toast.success('Order status updated');
      fetchOrders();
    } catch { toast.error('Failed to update status'); }
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
        <p className="text-gray-500">Manage and update all customer orders</p>
      </div>

      {/* Filters */}
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

      {/* Stats Row */}
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
                  {['Order #', 'Customer', 'Type', 'Amount', 'Payment', 'Status', 'Date', 'Update Status'].map(h => (
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
                    <td className="table-td">
                      <span className="badge-gray">{order.orderType}</span>
                    </td>
                    <td className="table-td font-bold text-green-600">${order.totalAmount?.toFixed(2)}</td>
                    <td className="table-td"><StatusBadge status={order.paymentStatus} /></td>
                    <td className="table-td"><StatusBadge status={order.status} /></td>
                    <td className="table-td text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="table-td">
                      <select value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none text-gray-600 bg-white hover:border-blue-400 transition-colors">
                        {['Pending','Confirmed','InProgress','Completed','Cancelled'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
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
    </div>
  );
}
