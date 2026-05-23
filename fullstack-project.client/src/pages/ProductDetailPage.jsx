import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsApi, reviewsApi } from '../api/services';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { StarRating, LoadingSpinner } from '../components/UI';
import { ShoppingCart, ArrowLeft, Package, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([productsApi.get(id), reviewsApi.getAll({ productId: id })])
      .then(([p, r]) => { setProduct(p.data); setReviews(r.data); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      for (let i = 0; i < qty; i++) await addToCart(product.id, null);
      toast.success(`${qty} item(s) added to cart!`);
    } catch { toast.error('Failed to add to cart'); }
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (!product) return <div className="text-center py-16">Product not found</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/products" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <img src={product.imageUrl || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800'}
          alt={product.name} className="w-full h-80 object-cover rounded-xl" />
        <div>
          <span className="text-sm text-blue-600 font-medium">{product.categoryName}</span>
          <h1 className="text-3xl font-bold text-gray-800 mt-2 mb-4">{product.name}</h1>
          <StarRating rating={product.rating} count={product.totalReviews} />
          <div className="text-3xl font-bold text-blue-600 mt-4 mb-2">${product.price}</div>
          <p className="text-gray-500 text-sm mb-1">Brand: <span className="text-gray-700 font-medium">{product.brand}</span></p>
          <p className={`text-sm mb-6 font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            <Package className="w-4 h-4 inline mr-1" />
            {product.stock > 0 ? `${product.stock} units in stock` : 'Out of stock'}
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 text-lg hover:bg-gray-50">-</button>
              <span className="px-4 py-2 font-medium">{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-3 py-2 text-lg hover:bg-gray-50">+</button>
            </div>
            <button onClick={handleAddToCart} disabled={product.stock === 0}
              className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? <p className="text-gray-400 text-center py-4">No reviews yet</p> : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="border-b border-gray-50 pb-4 last:border-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{r.userName}</p>
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
  );
}
