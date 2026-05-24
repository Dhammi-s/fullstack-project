import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ordersApi, paymentApi, chatApi, reviewsApi } from '../api/services';
import { StatusBadge, LoadingSpinner } from '../components/UI';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ArrowLeft, CreditCard, CheckCircle, MessageCircle, Star, Send, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

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

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}>
          <Star className={`w-7 h-7 transition-colors ${i <= (hover || value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  );
}

function ReviewSection({ order, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      await reviewsApi.create({
        rating,
        comment,
        orderId: order.id,
        workerId: order.workerId || undefined,
        serviceId: order.serviceId || undefined,
      });
      toast.success('Review submitted! Thank you.');
      onReviewSubmitted();
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> Rate this Service
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-gray-500 mb-2">How would you rate your experience?</p>
          <StarPicker value={rating} onChange={setRating} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
          <textarea rows={3} className="input-field w-full resize-none"
            placeholder="Share your experience with the worker and service..."
            value={comment} onChange={e => setComment(e.target.value)} />
        </div>
        <button type="submit" disabled={submitting || rating === 0}
          className="btn-primary flex items-center gap-2 disabled:opacity-50">
          {submitting
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Send className="w-4 h-4" />}
          {submitting ? 'Submitting…' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paid, setPaid] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [chatSending, setChatSending] = useState(false);

  const fetchOrder = useCallback(() => {
    ordersApi.get(id).then(r => setOrder(r.data)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const handleChatWorker = async () => {
    if (!order?.workerId) return;
    setChatSending(true);
    try {
      // Send an opener message so the conversation appears in both inboxes
      await chatApi.sendMessage({
        receiverId: order.workerId,
        message: `Hi! I'm reaching out about my order #${order.orderNumber} — ${order.serviceTitle || 'your service'}. Could we connect?`,
      });
      toast.success('Message sent! Opening chat…');
      navigate(`/chat/${order.workerId}`);
    } catch {
      // Even if send fails, still navigate so they can type manually
      navigate(`/chat/${order.workerId}`);
    } finally {
      setChatSending(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (!order) return <div className="text-center py-16">Order not found</div>;

  const isCompleted = order.status === 'Completed';
  const isCustomer = user?.role === 'Customer';
  const hasWorker = !!order.workerId;
  const canReview = isCompleted && isCustomer && !reviewed;
  const paymentMethod = order.paymentMethod || 'Online';

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
              <div>
                <span className="text-gray-500">Pay Method:</span>{' '}
                <span className={`font-semibold ${paymentMethod === 'COD' ? 'text-orange-600' : 'text-blue-600'}`}>
                  {paymentMethod === 'COD' ? '💵 Cash on Delivery' : '💳 Online'}
                </span>
              </div>
              <div><span className="text-gray-500">Customer:</span> <span className="font-medium">{order.customerName}</span></div>
              {order.workerName && (
                <div>
                  <span className="text-gray-500">Worker:</span>{' '}
                  <span className="font-medium">{order.workerName}</span>
                </div>
              )}
              {order.serviceTitle && (
                <div><span className="text-gray-500">Service:</span> <span className="font-medium">{order.serviceTitle}</span></div>
              )}
              {order.scheduledAt && (
                <div className="col-span-2">
                  <span className="text-gray-500">Scheduled:</span>{' '}
                  <span className="font-medium text-blue-600">{new Date(order.scheduledAt).toLocaleString()}</span>
                </div>
              )}
              {order.address && (
                <div className="col-span-2"><span className="text-gray-500">Address:</span> <span className="font-medium">{order.address}</span></div>
              )}
              {order.notes && (
                <div className="col-span-2"><span className="text-gray-500">Notes:</span> <span className="font-medium">{order.notes}</span></div>
              )}
            </div>
          </div>

          {/* Items */}
          {order.items?.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-gray-800 mb-4">Order Items</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left pb-2">Item</th>
                    <th className="text-right pb-2">Qty</th>
                    <th className="text-right pb-2">Price</th>
                    <th className="text-right pb-2">Total</th>
                  </tr>
                </thead>
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

          {/* Review Section — shown after completion */}
          {canReview && (
            <ReviewSection order={order} onReviewSubmitted={() => setReviewed(true)} />
          )}
          {reviewed && (
            <div className="card bg-yellow-50 border-yellow-200 flex items-center gap-3">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <p className="text-yellow-800 font-medium">Thanks for your review! Your feedback helps others.</p>
            </div>
          )}
        </div>

        {/* Summary & Actions */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-4">Order Total</h2>
            <div className="text-3xl font-bold text-blue-600">${order.totalAmount}</div>
            <div className="mt-2"><StatusBadge status={order.paymentStatus} /></div>
            <Link to={`/invoice/${order.id}`}
              className="mt-4 flex items-center justify-center gap-2 w-full bg-gray-800 hover:bg-gray-900 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">
              <FileText className="w-4 h-4" /> View Invoice
            </Link>
          </div>

          {/* Chat with Worker */}
          {hasWorker && isCustomer && (
            <div className="card">
              <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-500" /> Contact Worker
              </h2>
              <p className="text-sm text-gray-500 mb-3">
                Have a question? Chat directly with <strong>{order.workerName}</strong> about this job.
              </p>
              <button onClick={handleChatWorker} disabled={chatSending}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                {chatSending
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <MessageCircle className="w-4 h-4" />}
                {chatSending ? 'Opening Chat…' : 'Chat with Worker'}
              </button>
            </div>
          )}

          {/* COD reminder */}
          {paymentMethod === 'COD' && order.status !== 'Completed' && (
            <div className="card bg-orange-50 border-orange-200">
              <div className="flex items-start gap-2">
                <span className="text-2xl">💵</span>
                <div>
                  <p className="font-semibold text-orange-800 text-sm">Cash on Delivery</p>
                  <p className="text-orange-700 text-xs mt-1">
                    Please have <strong>${order.totalAmount}</strong> ready in cash when the worker arrives.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Online payment */}
          {order.paymentStatus === 'Pending' && paymentMethod === 'Online' && !paid && (
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


