import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { servicesApi, reviewsApi } from '../api/services';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { StarRating, LoadingSpinner } from '../components/UI';
import { ShoppingCart, User, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ServiceDetailPage() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      servicesApi.get(id),
      reviewsApi.getAll({ serviceId: id })
    ]).then(([s, r]) => {
      setService(s.data);
      setReviews(r.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await addToCart(null, service.id);
      toast.success('Service added to cart!');
      navigate('/cart');
    } catch { toast.error('Failed to add to cart'); }
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (!service) return <div className="text-center py-16">Service not found</div>;

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

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card sticky top-20">
            <h3 className="font-semibold text-gray-800 mb-4">Book This Service</h3>
            <div className="text-3xl font-bold text-blue-600 mb-1">
              ${service.price} <span className="text-sm text-gray-400 font-normal">/ {service.priceType}</span>
            </div>
            <button onClick={handleBook}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-4">
              <ShoppingCart className="w-5 h-5" /> Book Now
            </button>
            <hr className="my-4" />
            {/* Worker Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{service.workerName}</p>
                <p className="text-sm text-gray-400">Service Provider</p>
              </div>
            </div>
            <Link to={`/workers/${service.workerId}`}
              className="block text-center text-sm text-blue-600 hover:underline mt-3">
              View Worker Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
