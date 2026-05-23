import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-9xl font-black text-blue-100 select-none mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Page Not Found</h1>
        <p className="text-gray-500 mb-8">Oops! The page you're looking for doesn't exist. It may have been moved or deleted.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary"><Home className="w-4 h-4" /> Go Home</Link>
          <Link to="/services" className="btn-secondary"><Search className="w-4 h-4" /> Browse Services</Link>
        </div>
      </div>
    </div>
  );
}
