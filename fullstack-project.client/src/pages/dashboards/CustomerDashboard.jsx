import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/services';
import { LoadingSpinner, StatusBadge } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, DollarSign, CheckCircle, Clock, Package, Wrench, Star, AlertCircle, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const spendingData = [
  { month: 'Aug', spent: 120 }, { month: 'Sep', spent: 85 }, { month: 'Oct', spent: 210 },
  { month: 'Nov', spent: 165 }, { month: 'Dec', spent: 340 }, { month: 'Jan', spent: 95 },
];

export default function CustomerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    dashboardApi.customer()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="text-center py-20 text-gray-500">Failed to load dashboard</div>;

  const stats = [
    { label: 'Total Orders', value: data.totalOrders, icon: ShoppingCart, color: 'bg-blue-500', bg: 'from-blue-50 to-blue-100' },
    { label: 'Total Spent', value: `$${(data.totalSpent || 0).toFixed(2)}`, icon: DollarSign, color: 'bg-green-500', bg: 'from-green-50 to-green-100' },
    { label: 'Completed', value: data.completedOrders, icon: CheckCircle, color: 'bg-teal-500', bg: 'from-teal-50 to-teal-100' },
    { label: 'Pending', value: data.pendingOrders, icon: Clock, color: 'bg-yellow-500', bg: 'from-yellow-50 to-yellow-100' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
        <div className="relative">
          <h1 className="text-3xl font-bold">Hello, {user?.fullName?.split(' ')[0]} 👋</h1>
          <p className="text-blue-100 mt-1">Track your orders and manage your services</p>
          <div className="flex gap-3 mt-5">
            <Link to="/services" className="bg-white text-blue-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm inline-flex items-center gap-2">
              <Wrench className="w-4 h-4" /> Book Service
            </Link>
            <Link to="/products" className="bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-400 transition-colors text-sm border border-blue-400 inline-flex items-center gap-2">
              <Package className="w-4 h-4" /> Shop Now
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className={`bg-gradient-to-br ${stat.bg} rounded-2xl p-5 border border-white`}>
            <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Spending Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-1">Spending History</h2>
        <p className="text-gray-500 text-sm mb-5">Your last 6 months spending</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={spendingData}>
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => [`$${v}`, 'Spent']} />
            <Area type="monotone" dataKey="spent" stroke="#6366F1" strokeWidth={2.5} fill="url(#spendGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'My Orders', to: '/orders', icon: ShoppingCart, color: 'from-blue-500 to-blue-600' },
          { label: 'Browse Services', to: '/services', icon: Wrench, color: 'from-green-500 to-green-600' },
          { label: 'Shop Products', to: '/products', icon: Package, color: 'from-purple-500 to-purple-600' },
          { label: 'My Profile', to: '/profile', icon: Star, color: 'from-orange-500 to-orange-600' },
        ].map(a => (
          <Link key={a.label} to={a.to}
            className={`bg-gradient-to-br ${a.color} text-white rounded-2xl p-5 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-200`}>
            <a.icon className="w-8 h-8 mx-auto mb-2 opacity-90" />
            <div className="font-semibold text-sm">{a.label}</div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
          <Link to="/orders" className="btn-outline text-sm py-2">View All <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Order #', 'Amount', 'Status', 'Date', 'Action'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(data.recentOrders || []).map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="table-td font-mono font-semibold text-blue-600">#{order.orderNumber}</td>
                  <td className="table-td font-bold text-green-600">${order.totalAmount?.toFixed(2)}</td>
                  <td className="table-td"><StatusBadge status={order.status} /></td>
                  <td className="table-td text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="table-td">
                    <Link to={`/orders/${order.id}`} className="text-blue-600 hover:text-blue-800 text-xs font-semibold">View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!data.recentOrders || data.recentOrders.length === 0) && (
            <div className="text-center py-12 text-gray-400">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              No orders yet. <Link to="/services" className="text-blue-500 hover:underline">Book your first service!</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
