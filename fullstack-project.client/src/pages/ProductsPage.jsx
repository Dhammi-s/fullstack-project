import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsApi, categoriesApi } from '../api/services';
import { useCart } from '../context/CartContext';
import { StarRating, LoadingSpinner } from '../components/UI';
import { Search, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const { addToCart } = useCart();

  useEffect(() => { categoriesApi.getAll().then(r => setCategories(r.data)); }, []);

  useEffect(() => {
    let cancelled = false;
    const params = {};
    if (search) params.search = search;
    if (selectedCategory) params.categoryId = selectedCategory;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    productsApi.getAll(params).then(r => {
      if (!cancelled) {
        setProducts(r.data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [search, selectedCategory, minPrice, maxPrice]);

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product.id, null);
      toast.success('Added to cart!');
    } catch { toast.error('Please login first'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Shop Products</h1>
        <p className="text-gray-500">Quality tools and materials for all your needs</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pl-10" placeholder="Search products..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-40" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="number" className="input-field w-28" placeholder="Min $" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
        <input type="number" className="input-field w-28" placeholder="Max $" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
      </div>

      {loading ? <LoadingSpinner size="lg" /> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
              <Link to={`/products/${p.id}`}>
                <div className="h-44 overflow-hidden">
                  <img src={p.imageUrl || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400'}
                    alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
              </Link>
              <div className="p-4">
                <span className="text-xs text-blue-600">{p.categoryName}</span>
                <Link to={`/products/${p.id}`}>
                  <h3 className="font-medium text-gray-800 hover:text-blue-600 transition-colors mt-1 line-clamp-2 text-sm">{p.name}</h3>
                </Link>
                <p className="text-xs text-gray-400 mt-1">{p.brand}</p>
                <StarRating rating={p.rating} count={p.totalReviews} />
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-blue-600 text-lg">${p.price}</span>
                  <span className={`text-xs ${p.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
                <button onClick={() => handleAddToCart(p)} disabled={p.stock === 0}
                  className="btn-primary w-full py-2 text-sm mt-2 flex items-center justify-center gap-1">
                  <ShoppingCart className="w-3 h-3" /> Add to Cart
                </button>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="col-span-4 text-center py-16 text-gray-400">No products found.</div>
          )}
        </div>
      )}
    </div>
  );
}
