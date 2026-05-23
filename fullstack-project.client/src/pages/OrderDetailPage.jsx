import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersApi, paymentApi } from '../api/services';
import { StatusBadge, LoadingSpinner } from '../components/UI';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ArrowLeft, CreditCard, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const stripePromise = loadStripe('pk_test_51SSAQMBOxzp7UNACrQhTObyfADb8Hmm9L3NMqHrT3lsz2jgmwO4VEzhb565BvrJBQUtTknMxtp80TQ4BuNIAG9ST00NZCttpXn');

function PaymentForm({ order, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    try {
      const { data } = await paymentApi.createIntent({ orderId: order.id });
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) }
      });
      if (result.error) {
        toast.error(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        await paymentApi.confirm(order.id, result.paymentIntent.id);
        toast.success('Payment successful!');
        onSuccess();
      }
    } catch { toast.error('Payment failed'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <CardElement options={{ style: { base: { fontSize: '16px', color: '#374151' } } }} />
      </div>
      <button type="submit" disabled={loading || !stripe}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2">
        <CreditCard className="w-5 h-5" />
        {loading ? 'Processing...' : `Pay $${order.totalAmount}`}
      </button>
    </form>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paid, setPaid] = useState(false);

  const fetchOrder = useCallback(() => {
    ordersApi.get(id).then(r => setOrder(r.data)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!order) return <div className="text-center py-16">Order not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/orders" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      {paid && (
        <div className="card bg-green-50 border-green-200 flex items-center gap-3 mb-6">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <p className="text-green-700 font-medium">Payment successful! Your order has been confirmed.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{order.orderNumber}</h1>
                <p className="text-gray-500 text-sm mt-1">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Order Type:</span> <span className="font-medium">{order.orderType}</span></div>
              <div><span className="text-gray-500">Payment:</span> <StatusBadge status={order.paymentStatus} /></div>
              <div><span className="text-gray-500">Customer:</span> <span className="font-medium">{order.customerName}</span></div>
              {order.workerName && <div><span className="text-gray-500">Worker:</span> <span className="font-medium">{order.workerName}</span></div>}
              {order.address && <div className="col-span-2"><span className="text-gray-500">Address:</span> <span className="font-medium">{order.address}</span></div>}
              {order.notes && <div className="col-span-2"><span className="text-gray-500">Notes:</span> <span className="font-medium">{order.notes}</span></div>}
            </div>
          </div>

          {/* Items */}
          {order.items?.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-gray-800 mb-4">Order Items</h2>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100"><th className="text-left pb-2">Item</th><th className="text-right pb-2">Qty</th><th className="text-right pb-2">Price</th><th className="text-right pb-2">Total</th></tr></thead>
                <tbody>
                  {order.items.map(item => (
                    <tr key={item.id} className="border-b border-gray-50">
                      <td className="py-2">{item.productName}</td>
                      <td className="text-right py-2">{item.quantity}</td>
                      <td className="text-right py-2">${item.unitPrice}</td>
                      <td className="text-right py-2 font-medium">${item.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary & Payment */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-4">Order Total</h2>
            <div className="text-3xl font-bold text-blue-600">${order.totalAmount}</div>
            <div className="mt-2"><StatusBadge status={order.paymentStatus} /></div>
          </div>

          {order.paymentStatus === 'Pending' && !paid && (
            <div className="card">
              <h2 className="font-semibold text-gray-800 mb-4">Pay Now</h2>
              <Elements stripe={stripePromise}>
                <PaymentForm order={order} onSuccess={() => { setPaid(true); fetchOrder(); }} />
              </Elements>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
