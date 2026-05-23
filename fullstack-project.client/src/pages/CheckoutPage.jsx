import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { paymentApi, ordersApi } from '../api/services';
import { LoadingSpinner } from '../components/UI';
import { CreditCard, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const stripePromise = loadStripe('pk_test_51SSAQMBOxzp7UNACrQhTObyfADb8Hmm9L3NMqHrT3lsz2jgmwO4VEzhb565BvrJBQUtTknMxtp80TQ4BuNIAG9ST00NZCttpXn');

const CARD_STYLE = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1F2937',
      fontFamily: 'system-ui, sans-serif',
      '::placeholder': { color: '#9CA3AF' },
    },
    invalid: { color: '#EF4444' },
  },
};

function CheckoutForm({ order }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    try {
      const { data } = await paymentApi.createIntent({ orderId: order.id });
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        await paymentApi.confirm(order.id, result.paymentIntent.id);
        setSucceeded(true);
        toast.success('Payment successful! 🎉');
        setTimeout(() => navigate(`/orders/${order.id}`), 2000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally { setProcessing(false); }
  };

  if (succeeded) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
        <p className="text-gray-500">Redirecting to your order...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card Details</label>
        <div className="border-2 border-gray-200 rounded-xl p-4 focus-within:border-blue-500 transition-colors bg-gray-50">
          <CardElement options={CARD_STYLE} />
        </div>
        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
          <Lock className="w-3 h-3" /> Your payment is secured with 256-bit SSL encryption
        </p>
      </div>

      {/* Test Card Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
        <p className="text-xs font-semibold text-yellow-700 mb-1">🧪 Test Mode - Use demo card:</p>
        <p className="text-xs text-yellow-600 font-mono">4242 4242 4242 4242 | Exp: 12/34 | CVV: 123</p>
      </div>

      <button type="submit" disabled={processing || !stripe} className="btn-primary w-full py-4 text-base">
        <Lock className="w-4 h-4" />
        {processing ? 'Processing...' : `Pay $${order.totalAmount?.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.get(orderId)
      .then(res => setOrder(res.data))
      .catch(() => { toast.error('Order not found'); navigate('/orders'); })
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Order
        </button>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Order #</span>
              <span className="font-mono font-semibold text-blue-600">{order?.orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Type</span>
              <span className="font-medium">{order?.orderType}</span>
            </div>
            <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between">
              <span className="font-semibold text-gray-800">Total</span>
              <span className="font-bold text-xl text-green-600">${order?.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Stripe Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">Secure Payment</h2>
              <p className="text-gray-400 text-xs">Powered by Stripe</p>
            </div>
          </div>
          <Elements stripe={stripePromise}>
            <CheckoutForm order={order} />
          </Elements>
        </div>
      </div>
    </div>
  );
}
