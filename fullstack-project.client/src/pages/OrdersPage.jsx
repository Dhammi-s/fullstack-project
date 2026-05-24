import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ordersApi, chatApi } from '../api/services';
import { StatusBadge, LoadingSpinner, EmptyState } from '../components/UI';
import { Package, Eye, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatLoadingId, setChatLoadingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    ordersApi.getAll().then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  const handleChat = async (order) => {
    if (!order.workerId) { toast.error('No worker assigned yet'); return; }
    setChatLoadingId(order.id);
    try {
      await chatApi.sendMessage({
        receiverId: order.workerId,
        message: `Hi! I have a question about my order #${order.orderNumber}${order.serviceTitle ? ` (${order.serviceTitle})` : ''}.`,
      });
      navigate(`/chat/${order.workerId}`);
    } catch {
      navigate(`/chat/${order.workerId}`);
    } finally {
      setChatLoadingId(null);
    }
  };

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
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="font-semibold text-gray-800">{order.orderNumber}</h3>
                    <StatusBadge status={order.status} />
                    <StatusBadge status={order.paymentStatus} />
                    {order.paymentMethod === 'COD' && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">💵 COD</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                  {order.serviceTitle && <p className="text-sm text-gray-600 mt-1">Service: <span className="font-medium">{order.serviceTitle}</span></p>}
                  {order.workerName && <p className="text-sm text-gray-600 mt-0.5">Worker: <span className="font-medium">{order.workerName}</span></p>}
                  {order.scheduledAt && (
                    <p className="text-sm text-blue-600 mt-0.5">📅 {new Date(order.scheduledAt).toLocaleString()}</p>
                  )}
                  {order.items?.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">{order.items.length} item(s)</p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xl font-bold text-blue-600">${order.totalAmount}</span>
                  {order.workerId && (
                    <button onClick={() => handleChat(order)} disabled={chatLoadingId === order.id}
                      className="flex items-center gap-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-xl font-medium transition-colors disabled:opacity-50">
                      {chatLoadingId === order.id
                        ? <div className="w-3.5 h-3.5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                        : <MessageCircle className="w-3.5 h-3.5" />}
                      Chat
                    </button>
                  )}
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


