import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { servicesApi, reviewsApi, ordersApi, settingsApi } from '../api/services';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { StarRating, LoadingSpinner } from '../components/UI';
import { ShoppingCart, User, ArrowLeft, Calendar, MapPin, CreditCard, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ServiceDetailPage() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [address, setAddress] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Online');
  const [siteSettings, setSiteSettings] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      servicesApi.get(id),
      reviewsApi.getAll({ serviceId: id }),
      settingsApi.getPublic(),
    ]).then(([s, r, st]) => {
      setService(s.data);
      setReviews(r.data);
      setSiteSettings(st.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!user) { navigate('/login'); return; }
    if (!address.trim()) { toast.error('Please enter your address'); return; }
    setBooking(true);
    try {
      const res = await ordersApi.create({
        orderType: 'Service',
        serviceId: Number(id),
        workerId: service.workerId || undefined,
        address,
        notes,
        scheduledAt: scheduledAt || undefined,
        paymentMethod,
        items: [],
      });
      toast.success(`Service booked! Order #${res.data.orderNumber}`);
      if (paymentMethod === 'Online') {
        navigate(`/checkout/${res.data.id}`);
      } else {
        navigate('/orders');
      }
    } catch {
      toast.error('Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (!service) return <div className="text-center py-16">Service not found</div>;

  const allowCOD = siteSettings?.allowCOD !== false;
  const allowOnline = siteSettings?.allowOnlinePayment !== false;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/services" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Services
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <img src={service.imageUrl || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'}
            alt={service.title} className="w-full h-72 object-cover rounded-xl mb-6" />
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-sm text-blue-600 font-medium">{service.categoryName}</span>
              <h1 className="text-3xl font-bold text-gray-800 mt-1">{service.title}</h1>
            </div>
            <span className="text-2xl font-bold text-blue-600">${service.price}<span className="text-sm text-gray-400">/{service.priceType}</span></span>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <StarRating rating={service.rating} count={service.totalReviews} />
          </div>
          <div className="card mb-6">
            <h2 className="font-semibold text-gray-800 mb-3">About this Service</h2>
            <p className="text-gray-600 leading-relaxed">{service.description}</p>
          </div>

          {/* Reviews */}
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-4">Customer Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No reviews yet</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="border-b border-gray-50 pb-4 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-800">{r.userName}</p>
                        <StarRating rating={r.rating} />
                      </div>
                      <span className="ml-auto text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600 text-sm ml-11">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="space-y-4">
          <div className="card sticky top-20 space-y-4">
            <h3 className="font-semibold text-gray-800">Book This Service</h3>
            <div className="text-3xl font-bold text-blue-600">
              ${service.price} <span className="text-sm text-gray-400 font-normal">/ {service.priceType}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Your Address *
              </label>
              <input className="input-field w-full" placeholder="Enter your full address"
                value={address} onChange={e => setAddress(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Preferred Date & Time
              </label>
              <input type="datetime-local" className="input-field w-full"
                value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0,16)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea rows={2} className="input-field w-full resize-none" placeholder="Any special instructions..."
                value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                {allowOnline && (
                  <button onClick={() => setPaymentMethod('Online')}
                    className={`flex items-center gap-2 p-3 border-2 rounded-xl text-sm font-medium transition-all ${paymentMethod === 'Online' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                    <CreditCard className="w-4 h-4" /> Online
                  </button>
                )}
                {allowCOD && (
                  <button onClick={() => setPaymentMethod('COD')}
                    className={`flex items-center gap-2 p-3 border-2 rounded-xl text-sm font-medium transition-all ${paymentMethod === 'COD' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600'}`}>
                    <Banknote className="w-4 h-4" /> Cash (COD)
                  </button>
                )}
              </div>
              {paymentMethod === 'COD' && (
                <p className="text-xs text-orange-600 mt-1.5 bg-orange-50 rounded-lg p-2">
                  💵 Pay cash directly to the worker when the job is done.
                </p>
              )}
            </div>

            <button onClick={handleBook} disabled={booking || !user}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
              {booking ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
              {booking ? 'Booking…' : 'Book Now'}
            </button>
            {!user && (
              <p className="text-xs text-gray-400 text-center">
                <Link to="/login" className="text-blue-600 hover:underline">Log in</Link> to book this service
              </p>
            )}

            <hr />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{service.workerName}</p>
                <p className="text-sm text-gray-400">Service Provider</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



