import { Star } from 'lucide-react';

export function StarRating({ rating, count }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
      ))}
      {count !== undefined && <span className="text-xs text-gray-500 ml-1">({count})</span>}
    </div>
  );
}

export function LoadingSpinner({ size = 'md' }) {
  const sz = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${sz} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    Pending: 'badge-yellow',
    Confirmed: 'badge-blue',
    InProgress: 'badge-blue',
    Completed: 'badge-green',
    Cancelled: 'badge-red',
    Paid: 'badge-green',
    Failed: 'badge-red',
    Refunded: 'badge-gray',
  };
  return <span className={map[status] || 'badge-gray'}>{status}</span>;
}

export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon className="w-16 h-16 text-gray-300 mb-4" />}
      <h3 className="text-lg font-semibold text-gray-600 mb-2">{title}</h3>
      <p className="text-gray-400 mb-6">{message}</p>
      {action}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
