import { Link } from 'react-router-dom';
import { ShieldOff, ArrowLeft, Home } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-6xl font-bold text-gray-800 mb-4">403</h1>
        <h2 className="text-2xl font-bold text-gray-700 mb-3">Access Denied</h2>
        <p className="text-gray-500 mb-8">You don't have permission to view this page. Please log in with an authorized account.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary"><Home className="w-4 h-4" /> Go Home</Link>
          <Link to="/login" className="btn-secondary"><ArrowLeft className="w-4 h-4" /> Sign In</Link>
        </div>
      </div>
    </div>
  );
}
