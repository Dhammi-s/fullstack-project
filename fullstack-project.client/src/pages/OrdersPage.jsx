import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../api/services';
import { StatusBadge, LoadingSpinner, EmptyState } from '../components/UI';
import { Package, Eye } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.getAll().then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <EmptyState icon={Package} title="No orders yet" message="Place your first order to get started"
          action={<Link to="/services" className="btn-primary">Browse Services</Link>} />
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="card hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-800">{order.orderNumber}</h3>
                    <StatusBadge status={order.status} />
                    <StatusBadge status={order.paymentStatus} />
                  </div>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                  {order.serviceTitle && <p className="text-sm text-gray-600 mt-1">Service: {order.serviceTitle}</p>}
                  {order.items?.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">{order.items.length} item(s)</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-blue-600">${order.totalAmount}</span>
                  <Link to={`/orders/${order.id}`}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm">
                    <Eye className="w-4 h-4" /> View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
