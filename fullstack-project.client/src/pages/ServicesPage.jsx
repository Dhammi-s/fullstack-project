import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { servicesApi, categoriesApi } from '../api/services';
import { useCart } from '../context/CartContext';
import { StarRating, LoadingSpinner } from '../components/UI';
import { Search, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();

  // Derive selectedCategory directly from searchParams + local override
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('categoryId') || '');

  useEffect(() => {
    categoriesApi.getAll().then(r => setCategories(r.data));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const params = {};
    if (search) params.search = search;
    if (selectedCategory) params.categoryId = selectedCategory;
    servicesApi.getAll(params).then(r => {
      if (!cancelled) {
        setServices(r.data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [search, selectedCategory]);

  const handleAddToCart = async (service) => {
    try {
      await addToCart(null, service.id);
      toast.success('Added to cart!');
    } catch { toast.error('Please login first'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Our Services</h1>
        <p className="text-gray-500">Professional home services at your doorstep</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pl-10" placeholder="Search services..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field md:w-48" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner size="lg" /> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
              <Link to={`/services/${s.id}`}>
                <div className="h-48 overflow-hidden">
                  <img src={s.imageUrl || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'}
                    alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
              </Link>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs text-blue-600 font-medium">{s.categoryName}</span>
                    <Link to={`/services/${s.id}`}>
                      <h3 className="font-semibold text-gray-800 hover:text-blue-600 transition-colors">{s.title}</h3>
                    </Link>
                  </div>
                  <span className="text-lg font-bold text-blue-600 whitespace-nowrap">${s.price}</span>
                </div>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{s.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <StarRating rating={s.rating} count={s.totalReviews} />
                    <p className="text-xs text-gray-400 mt-1">by {s.workerName}</p>
                  </div>
                  <button onClick={() => handleAddToCart(s)}
                    className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                    <ShoppingCart className="w-3 h-3" /> Book
                  </button>
                </div>
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              No services found. Try adjusting your filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
