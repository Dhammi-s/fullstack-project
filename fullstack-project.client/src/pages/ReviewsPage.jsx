import { useState, useEffect } from 'react';
import { reviewsApi } from '../api/services';
import { LoadingSpinner, StarRating } from '../components/UI';
import { Star, MessageSquare } from 'lucide-react';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewsApi.getAll().then(res => setReviews(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const avg = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Star className="w-14 h-14 mx-auto mb-4 fill-yellow-200 stroke-yellow-200" />
          <div className="text-6xl font-bold mb-2">{avg}</div>
          <StarRating rating={parseFloat(avg)} count={reviews.length} />
          <p className="text-yellow-100 mt-3 text-lg">Based on {reviews.length} verified reviews</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Rating Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="font-bold text-gray-800 mb-4">Rating Breakdown</h2>
          {[5,4,3,2,1].map(star => {
            const count = reviews.filter(r => Math.round(r.rating) === star).length;
            const pct = reviews.length ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 mb-2">
                <span className="text-sm text-gray-600 w-6">{star}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-sm text-gray-400 w-8">{count}</span>
              </div>
            );
          })}
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                      {r.customerName?.[0] || 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{r.customerName || 'Customer'}</div>
                      <div className="text-gray-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <StarRating rating={r.rating} />
                </div>
                {r.comment && <p className="text-gray-600 text-sm leading-relaxed">{r.comment}</p>}
                {r.serviceName && <p className="text-blue-500 text-xs mt-2">Service: {r.serviceName}</p>}
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <MessageSquare className="w-14 h-14 mx-auto mb-3 opacity-30" />
                <p className="text-lg">No reviews yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
