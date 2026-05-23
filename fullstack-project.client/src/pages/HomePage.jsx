import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesApi, servicesApi, productsApi, usersApi } from '../api/services';
import { StarRating, LoadingSpinner } from '../components/UI';
import { Users, Star, ArrowRight, Clock, Shield, Zap } from 'lucide-react';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      categoriesApi.getAll(),
      servicesApi.getAll(),
      productsApi.getAll(),
      usersApi.getWorkers({ available: true }),
    ]).then(([cats, svcs, prods, wrks]) => {
      setCategories(cats.data.slice(0, 8));
      setServices(svcs.data.slice(0, 6));
      setProducts(prods.data.slice(0, 8));
      setWorkers(wrks.data.slice(0, 4));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Your Home, <span className="text-yellow-400">Our Priority</span>
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Book trusted professionals for plumbing, carpentry, electrical work, cleaning and more. Quality service at your doorstep.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/services" className="bg-white text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors text-lg">
              Book a Service
            </Link>
            <Link to="/products" className="bg-blue-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-400 transition-colors text-lg border border-blue-400">
              Shop Products
            </Link>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto">
            {[
              { label: 'Happy Customers', value: '10K+' },
              { label: 'Skilled Workers', value: '500+' },
              { label: 'Services Completed', value: '50K+' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-yellow-400">{s.value}</div>
                <div className="text-blue-200 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose <span className="text-blue-600">DailyNeeds?</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Trusted Professionals', desc: 'All workers are verified and background-checked', color: 'text-blue-600 bg-blue-50' },
              { icon: Clock, title: 'On-Time Service', desc: 'Workers arrive on time, every time guaranteed', color: 'text-green-600 bg-green-50' },
              { icon: Star, title: 'Top Rated', desc: 'Average 4.8 star rating from real customers', color: 'text-yellow-600 bg-yellow-50' },
              { icon: Zap, title: 'Quick Booking', desc: 'Book in under 2 minutes, service same day', color: 'text-purple-600 bg-purple-50' },
            ].map(f => (
              <div key={f.title} className="text-center p-6">
                <div className={`w-14 h-14 rounded-xl ${f.color} flex items-center justify-center mx-auto mb-4`}>
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold">Service <span className="text-blue-600">Categories</span></h2>
            <Link to="/services" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map(cat => (
                <Link key={cat.id} to={`/services?categoryId=${cat.id}`}
                  className="bg-white rounded-xl p-6 text-center hover:shadow-md hover:-translate-y-1 transition-all border border-gray-100 group">
                  <div className="text-4xl mb-3">{cat.icon}</div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{cat.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{cat.serviceCount} services</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold">Popular <span className="text-blue-600">Services</span></h2>
            <Link to="/services" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map(s => (
              <Link key={s.id} to={`/services/${s.id}`}
                className="bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <img src={s.imageUrl || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'}
                    alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {s.priceType}
                  </span>
                </div>
                <div className="p-4">
                  <span className="text-xs text-blue-600 font-medium">{s.categoryName}</span>
                  <h3 className="font-semibold text-gray-800 mt-1 mb-2">{s.title}</h3>
                  <div className="flex items-center justify-between">
                    <StarRating rating={s.rating} count={s.totalReviews} />
                    <span className="text-lg font-bold text-blue-600">${s.price}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">by {s.workerName}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Shop Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold">Shop <span className="text-blue-600">Products</span></h2>
            <Link to="/products" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map(p => (
              <Link key={p.id} to={`/products/${p.id}`}
                className="bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all overflow-hidden group">
                <div className="h-40 overflow-hidden">
                  <img src={p.imageUrl || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400'}
                    alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-3">
                  <p className="text-xs text-blue-600">{p.categoryName}</p>
                  <h3 className="font-medium text-gray-800 text-sm mt-1 line-clamp-2">{p.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-blue-600">${p.price}</span>
                    <StarRating rating={p.rating} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Workers */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold">Top <span className="text-blue-600">Workers</span></h2>
            <Link to="/workers" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {workers.map(w => (
              <Link key={w.id} to={`/workers/${w.id}`}
                className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-all text-center group">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{w.fullName}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{w.skills}</p>
                <div className="flex items-center justify-center mt-2">
                  <StarRating rating={w.rating} count={w.totalReviews} />
                </div>
                <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${w.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {w.isAvailable ? 'Available' : 'Busy'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-8">Join thousands of satisfied customers. Book a service or shop products today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-blue-600 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors">
              Create Account
            </Link>
            <Link to="/services" className="bg-blue-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-400 transition-colors border border-blue-400">
              Browse Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
