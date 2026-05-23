import { useState, useEffect } from 'react';
import { reviewsApi } from '../../api/services';
import { LoadingSpinner, StarRating } from '../../components/UI';
import { Star, MessageSquare } from 'lucide-react';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewsApi.getAll().then(res => setReviews(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const avg = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Reviews & Ratings</h1>
          <p className="text-gray-500">Monitor customer feedback</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-3 text-center">
          <div className="text-3xl font-bold text-yellow-600">{avg}</div>
          <StarRating rating={parseFloat(avg)} count={reviews.length} />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Customer', 'Rating', 'Service/Product', 'Comment', 'Date'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reviews.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="table-td font-medium">{r.customerName || 'Customer'}</td>
                  <td className="table-td"><StarRating rating={r.rating} /></td>
                  <td className="table-td text-gray-500 text-xs">{r.serviceName || r.productName || '-'}</td>
                  <td className="table-td text-gray-600 text-sm max-w-xs truncate">{r.comment || '-'}</td>
                  <td className="table-td text-gray-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {reviews.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No reviews yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
