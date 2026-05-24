import { useState, useEffect } from 'react';
import { ordersApi } from '../../api/services';
import { LoadingSpinner, StatusBadge } from '../../components/UI';
import { Link } from 'react-router-dom';
import { ShoppingCart, MapPin, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WorkerAssignments() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    ordersApi.getAll()
      .then(res => setOrders(res.data || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { void fetchOrders(); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  const handleUpdate = async (id, status) => {
    setUpdatingId(id);
    try {
      await ordersApi.updateStatus(id, status);
      toast.success(`Marked as ${status}!`);
      fetchOrders();
    } catch {
      toast.error('Failed to update');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">My Assignments</h1>
        <p className="text-gray-500">Manage your job assignments</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {['All', 'Pending', 'Confirmed', 'InProgress', 'Completed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === s ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400'}`}>
            {s} {s !== 'All' && <span className="ml-1 opacity-70">{orders.filter(o => o.status === s).length}</span>}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {filtered.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="font-mono font-bold text-blue-600 text-sm">#{order.orderNumber}</span>
                    <StatusBadge status={order.status} />
                    <span className="badge-gray text-xs">{order.orderType}</span>
                    {order.paymentMethod === 'COD' && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">💵 Cash on Delivery</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{order.serviceTitle || 'Product Order'}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                    <span className="flex items-center gap-1"><ShoppingCart className="w-3.5 h-3.5" /> {order.customerName}</span>
                    {order.address && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {order.address}</span>}
                    {order.scheduledAt && (
                      <span className="flex items-center gap-1 text-blue-600 font-medium">
                        <Calendar className="w-3.5 h-3.5" /> {new Date(order.scheduledAt).toLocaleString()}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-green-600 font-semibold"><DollarSign className="w-3.5 h-3.5" /> ${Number(order.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(order.status === 'Pending' || order.status === 'Confirmed') && (
                    <button onClick={() => handleUpdate(order.id, 'InProgress')}
                      disabled={updatingId === order.id}
                      className="btn-primary text-xs py-2 flex items-center gap-1 disabled:opacity-50">
                      {updatingId === order.id ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : null}
                      Start Job
                    </button>
                  )}
                  {order.status === 'InProgress' && (
                    <button onClick={() => handleUpdate(order.id, 'Completed')}
                      disabled={updatingId === order.id}
                      className="btn-success text-xs py-2 flex items-center gap-1 disabled:opacity-50">
                      {updatingId === order.id ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : null}
                      ✓ Mark Complete
                    </button>
                  )}
                  <Link to={`/orders/${order.id}`} className="btn-secondary text-xs py-2">Details</Link>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <AlertCircle className="w-14 h-14 mx-auto mb-3 opacity-30" />
              <p className="text-lg">No assignments found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}



