import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Package, Wrench, ShoppingCart, Star,
  MessageCircle, Bell, User, LogOut, Menu, X, DollarSign,
  BarChart2, Calendar, Tag, ChevronRight, Settings
} from 'lucide-react';

function SidebarLink({ to, icon: Icon, label, onClick }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link to={to} onClick={onClick}
      className={active ? 'sidebar-link-active' : 'sidebar-link'}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span>{label}</span>
      {!active && <ChevronRight className="w-3 h-3 ml-auto opacity-30" />}
    </Link>
  );
}

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/services', icon: Wrench, label: 'Services' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/admin/categories', icon: Tag, label: 'Categories' },
  { to: '/admin/reviews', icon: Star, label: 'Reviews' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const workerLinks = [
  { to: '/worker', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/worker/assignments', icon: ShoppingCart, label: 'Assignments' },
  { to: '/worker/schedule', icon: Calendar, label: 'Schedule' },
  { to: '/worker/services', icon: Wrench, label: 'My Services' },
  { to: '/worker/earnings', icon: DollarSign, label: 'Earnings' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/worker/settings', icon: Settings, label: 'Settings' },
];

const customerLinks = [
  { to: '/customer', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/orders', icon: ShoppingCart, label: 'My Orders' },
  { to: '/cart', icon: ShoppingCart, label: 'Cart' },
  { to: '/services', icon: Wrench, label: 'Services' },
  { to: '/products', icon: Package, label: 'Shop' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/customer/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout() {
  const { user, logout, isAdmin, isWorker } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = isAdmin ? adminLinks : isWorker ? workerLinks : customerLinks;
  const roleLabel = isAdmin ? 'Admin Panel' : isWorker ? 'Worker Portal' : 'My Account';
  const roleColor = isAdmin ? 'from-slate-800 to-slate-900' : isWorker ? 'from-green-800 to-green-900' : 'from-blue-700 to-blue-900';

  const Sidebar = ({ onClose }) => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={`bg-gradient-to-b ${roleColor} text-white p-5`}>
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">DailyNeeds</span>
          </Link>
          {onClose && (
            <button onClick={onClose} className="lg:hidden text-white/70 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
            {user?.fullName?.[0] || 'U'}
          </div>
          <div>
            <div className="font-semibold text-sm text-white truncate max-w-[140px]">{user?.fullName}</div>
            <div className="text-white/60 text-xs">{roleLabel}</div>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map(link => (
          <SidebarLink key={link.to} {...link} onClick={onClose} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-gray-100">
        <Link to="/profile" className="sidebar-link mb-1">
          <Settings className="w-5 h-5" /> Settings
        </Link>
        <button onClick={logout} className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600">
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 shadow-sm flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 bg-white h-full shadow-xl">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-sm text-gray-500 hidden lg:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/notifications" className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
              <Bell className="w-5 h-5" />
            </Link>
            <Link to="/chat" className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
              <MessageCircle className="w-5 h-5" />
            </Link>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.fullName?.[0] || 'U'}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
