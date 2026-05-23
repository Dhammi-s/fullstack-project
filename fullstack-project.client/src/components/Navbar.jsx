import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { notificationsApi } from '../api/services';
import { ShoppingCart, Bell, Menu, X, User, LogOut, LayoutDashboard, Wrench, Package, MessageCircle, Home, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin, isWorker } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      notificationsApi.getAll().then(res => {
        setNotifCount(res.data.filter(n => !n.isRead).length);
      }).catch(() => { });
    }
  }, [user, location]);

  const handleLogout = () => { logout(); navigate('/'); };

  const dashboardLink = isAdmin ? '/admin' : isWorker ? '/worker' : '/customer';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-blue-600">DailyNeeds</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" /> Home
            </Link>
            <Link to="/services" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1">
              <Wrench className="w-4 h-4" /> Services
            </Link>
            <Link to="/products" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1">
              <Package className="w-4 h-4" /> Shop
            </Link>
            <Link to="/workers" className="text-gray-600 hover:text-blue-600 transition-colors">
              Workers
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Cart */}
                <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-600">
                  <ShoppingCart className="w-5 h-5" />
                  {cart.items?.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {cart.items.length}
                    </span>
                  )}
                </Link>
                {/* Chat */}
                <Link to="/chat" className="p-2 text-gray-600 hover:text-blue-600">
                  <MessageCircle className="w-5 h-5" />
                </Link>
                {/* Notifications */}
                <Link to="/notifications" className="relative p-2 text-gray-600 hover:text-blue-600">
                  <Bell className="w-5 h-5" />
                  {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {notifCount}
                    </span>
                  )}
                </Link>
                {/* User Menu */}
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">{user.fullName?.split(' ')[0]}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link to={dashboardLink} onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <hr className="my-1" />
                      <button onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </>
            )}
            <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 space-y-1">
            <Link to="/" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Home</Link>
            <Link to="/services" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Services</Link>
            <Link to="/products" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Shop</Link>
            <Link to="/workers" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Workers</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
