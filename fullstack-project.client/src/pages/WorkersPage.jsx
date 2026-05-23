import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersApi } from '../api/services';
import { LoadingSpinner, StarRating } from '../components/UI';
import { Search, MapPin, Star, Briefcase, DollarSign, Filter } from 'lucide-react';

export default function WorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    usersApi.getWorkers({ available: true })
      .then(res => setWorkers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = workers.filter(w =>
    w.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    w.skills?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Our Expert Workers</h1>
          <p className="text-green-100 text-lg mb-8">Find verified professionals for every home service</p>
          <div className="flex items-center gap-3 max-w-md mx-auto bg-white rounded-2xl px-4 py-3 shadow-lg">
            <Search className="w-5 h-5 text-gray-400" />
            <input className="flex-1 outline-none text-gray-700 placeholder-gray-400"
              placeholder="Search by name or skill..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? <LoadingSpinner /> : (
          <>
            <p className="text-gray-500 mb-6">{filtered.length} workers available</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(w => (
                <div key={w.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                      {w.fullName?.[0]}
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg">{w.fullName}</h3>
                    <div className="flex justify-center mt-1.5">
                      <StarRating rating={w.rating || 0} count={w.totalReviews} />
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {w.skills && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Briefcase className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="truncate">{w.skills}</span>
                      </div>
                    )}
                    {w.hourlyRate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span>${w.hourlyRate}/hr</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-green-600 font-medium">Available Now</span>
                    </div>
                  </div>

                  {w.bio && <p className="text-gray-400 text-xs mb-4 line-clamp-2">{w.bio}</p>}

                  <Link to={`/services?workerId=${w.id}`} className="btn-primary w-full text-sm py-2.5">
                    View Services
                  </Link>
                </div>
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <Star className="w-14 h-14 mx-auto mb-3 opacity-30" />
                <p className="text-lg">No workers found</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
