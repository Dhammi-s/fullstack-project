import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, ordersApi } from '../../api/services';
import { LoadingSpinner, StatusBadge } from '../../components/UI';
import {
  Users, ShoppingCart, DollarSign, Package,
  Wrench, Star, CheckCircle, Clock, BarChart2, ArrowUpRight, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']; // eslint-disable-line no-unused-vars

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-3">
        <p className="font-semibold text-gray-700 text-sm mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="text-sm">
            {p.name}: {p.name === 'revenue' || p.name === 'earnings' ? `$${Number(p.value).toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [dashRes, ordersRes] = await Promise.all([dashboardApi.admin(), ordersApi.getAll()]);
      setData(dashRes.data);
      setOrders(ordersRes.data || []);
    } catch { /* ignore */ }
    if (isRefresh) setRefreshing(false); else setLoading(false);
  };

  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="text-center py-20 text-gray-500">Failed to load dashboard</div>;

  // Build monthly chart data from real orders
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthlyMap = {};
  orders.forEach(o => {
    const d = new Date(o.createdAt);
    const key = monthNames[d.getMonth()];
    if (!monthlyMap[key]) monthlyMap[key] = { month: key, revenue: 0, orders: 0 };
    monthlyMap[key].orders++;
    if (o.paymentStatus === 'Paid') monthlyMap[key].revenue += Number(o.totalAmount || 0);
  });
  const monthlyRevenue = monthNames
    .filter(m => monthlyMap[m])
    .map(m => monthlyMap[m]);

  // Status breakdown for pie
  const statusCount = {};
  orders.forEach(o => { statusCount[o.status] = (statusCount[o.status] || 0) + 1; });

  const orderStatusData = [
    { name: 'Pending', value: data.pendingOrders, color: '#F59E0B' },
    { name: 'Completed', value: data.completedOrders, color: '#10B981' },
    { name: 'Other', value: Math.max(0, data.totalOrders - data.pendingOrders - data.completedOrders), color: '#3B82F6' },
  ].filter(d => d.value > 0);

  const stats = [
    { label: 'Total Revenue', value: `$${(data.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-green-500', change: '' },
    { label: 'Total Orders', value: data.totalOrders, icon: ShoppingCart, color: 'bg-blue-500', change: '' },
    { label: 'Total Users', value: data.totalUsers, icon: Users, color: 'bg-purple-500', change: '' },
    { label: 'Total Products', value: data.totalProducts, icon: Package, color: 'bg-orange-500', change: '' },
    { label: 'Total Services', value: data.totalServices, icon: Wrench, color: 'bg-cyan-500', change: '' },
    { label: 'Active Workers', value: data.totalWorkers, icon: Star, color: 'bg-pink-500', change: '' },
    { label: 'Pending Orders', value: data.pendingOrders, icon: Clock, color: 'bg-yellow-500', change: '' },
    { label: 'Completed', value: data.completedOrders, icon: CheckCircle, color: 'bg-teal-500', change: '' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Live platform overview â€” {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => load(true)} disabled={refreshing}
            className="btn-secondary flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshingâ€¦' : 'Refresh'}
          </button>
          <Link to="/admin/orders" className="btn-primary flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" /> View Orders
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              {stat.change && (
                <span className="flex items-center text-green-600 text-xs font-semibold">
                  <ArrowUpRight className="w-3 h-3" /> {stat.change}
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Revenue & Orders</h2>
          <p className="text-gray-500 text-sm mb-4">Monthly breakdown from real data</p>
          {monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2.5} fill="url(#rg)" name="revenue" />
                <Bar dataKey="orders" fill="#10B981" radius={[4,4,0,0]} name="orders" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No order data yet</div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Order Status</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                {orderStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [v, 'Orders']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {orderStatusData.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Bar */}
      {monthlyRevenue.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Monthly Order Volume</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyRevenue} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="#3B82F6" radius={[6,6,0,0]} name="orders" />
              <Bar dataKey="revenue" fill="#10B981" radius={[6,6,0,0]} name="revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
            <p className="text-gray-500 text-sm">Latest 10 orders</p>
          </div>
          <Link to="/admin/orders" className="btn-outline text-sm py-2">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Order #', 'Customer', 'Amount', 'Payment', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(data.recentOrders || []).map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-td font-mono font-semibold text-blue-600">#{order.orderNumber}</td>
                  <td className="table-td font-medium">{order.customerName}</td>
                  <td className="table-td font-bold text-green-600">${Number(order.totalAmount || 0).toFixed(2)}</td>
                  <td className="table-td">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${order.paymentMethod === 'COD' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {order.paymentMethod || 'Online'}
                    </span>
                  </td>
                  <td className="table-td"><StatusBadge status={order.status} /></td>
                  <td className="table-td text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="table-td">
                    <Link to={`/orders/${order.id}`} className="text-blue-600 hover:text-blue-800 text-xs font-semibold">View â†’</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Add Product', to: '/admin/products', icon: Package, color: 'from-blue-500 to-blue-600' },
          { label: 'Add Service', to: '/admin/services', icon: Wrench, color: 'from-green-500 to-green-600' },
          { label: 'Manage Users', to: '/admin/users', icon: Users, color: 'from-purple-500 to-purple-600' },
          { label: 'Categories', to: '/admin/categories', icon: BarChart2, color: 'from-orange-500 to-orange-600' },
        ].map(a => (
          <Link key={a.label} to={a.to}
            className={`bg-gradient-to-br ${a.color} text-white rounded-2xl p-5 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-200`}>
            <a.icon className="w-8 h-8 mx-auto mb-2 opacity-90" />
            <div className="font-semibold text-sm">{a.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
