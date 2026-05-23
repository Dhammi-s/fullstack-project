import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/services';
import { LoadingSpinner, StatusBadge } from '../../components/UI';
import {
  Users, ShoppingCart, DollarSign, Package, TrendingUp,
  Wrench, Star, AlertCircle, CheckCircle, Clock, BarChart2, ArrowUpRight
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const monthlyRevenue = [
  { month: 'Jan', revenue: 4200, orders: 38 },
  { month: 'Feb', revenue: 5800, orders: 52 },
  { month: 'Mar', revenue: 7200, orders: 67 },
  { month: 'Apr', revenue: 6400, orders: 58 },
  { month: 'May', revenue: 8900, orders: 81 },
  { month: 'Jun', revenue: 11200, orders: 102 },
  { month: 'Jul', revenue: 9800, orders: 89 },
  { month: 'Aug', revenue: 13400, orders: 121 },
  { month: 'Sep', revenue: 12100, orders: 110 },
  { month: 'Oct', revenue: 15600, orders: 142 },
  { month: 'Nov', revenue: 14200, orders: 129 },
  { month: 'Dec', revenue: 18900, orders: 172 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-3">
        <p className="font-semibold text-gray-700 text-sm mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="text-sm">
            {p.name}: {p.name === 'revenue' ? `$${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.admin()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="text-center py-20 text-gray-500">Failed to load dashboard</div>;

  const orderStatusData = [
    { name: 'Pending', value: data.pendingOrders, color: '#F59E0B' },
    { name: 'Completed', value: data.completedOrders, color: '#10B981' },
    { name: 'Total', value: data.totalOrders - data.pendingOrders - data.completedOrders, color: '#3B82F6' },
  ];

  const userRoleData = [
    { name: 'Customers', value: data.totalCustomers, fill: '#3B82F6' },
    { name: 'Workers', value: data.totalWorkers, fill: '#10B981' },
    { name: 'Admins', value: data.totalUsers - data.totalCustomers - data.totalWorkers, fill: '#8B5CF6' },
  ];

  const stats = [
    { label: 'Total Revenue', value: `$${(data.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-green-500', change: '+23%' },
    { label: 'Total Orders', value: data.totalOrders, icon: ShoppingCart, color: 'bg-blue-500', change: '+18%' },
    { label: 'Total Users', value: data.totalUsers, icon: Users, color: 'bg-purple-500', change: '+12%' },
    { label: 'Total Products', value: data.totalProducts, icon: Package, color: 'bg-orange-500', change: '+5%' },
    { label: 'Total Services', value: data.totalServices, icon: Wrench, color: 'bg-cyan-500', change: '+8%' },
    { label: 'Active Workers', value: data.totalWorkers, icon: Star, color: 'bg-pink-500', change: '+3%' },
    { label: 'Pending Orders', value: data.pendingOrders, icon: Clock, color: 'bg-yellow-500', change: '' },
    { label: 'Completed', value: data.completedOrders, icon: CheckCircle, color: 'bg-teal-500', change: '+31%' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/orders" className="btn-primary">
            <ShoppingCart className="w-4 h-4" /> View Orders
          </Link>
          <Link to="/admin/users" className="btn-secondary">
            <Users className="w-4 h-4" /> Manage Users
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

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Revenue & Orders</h2>
              <p className="text-gray-500 text-sm">Last 12 months performance</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Revenue</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-400 inline-block" /> Orders</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2.5} fill="url(#revenueGrad)" name="revenue" />
              <Area type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2.5} fill="url(#ordersGrad)" name="orders" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Order Status</h2>
          <p className="text-gray-500 text-sm mb-4">Distribution breakdown</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                {orderStatusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
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

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bar Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Monthly Orders</h2>
          <p className="text-gray-500 text-sm mb-5">Order volume per month</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyRevenue} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="#3B82F6" radius={[6, 6, 0, 0]} name="orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User Role Radial */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-1">User Distribution</h2>
          <p className="text-gray-500 text-sm mb-5">Breakdown by role</p>
          <ResponsiveContainer width="100%" height={240}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={userRoleData} startAngle={180} endAngle={0}>
              <RadialBar minAngle={15} background dataKey="value" />
              <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" align="center" />
              <Tooltip formatter={(v, name) => [v, name]} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
            <p className="text-gray-500 text-sm">Latest 10 orders from customers</p>
          </div>
          <Link to="/admin/orders" className="btn-outline text-sm py-2">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Order #', 'Customer', 'Amount', 'Status', 'Date', 'Action'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(data.recentOrders || []).map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-td font-mono font-semibold text-blue-600">#{order.orderNumber}</td>
                  <td className="table-td font-medium">{order.customerName}</td>
                  <td className="table-td font-bold text-green-600">${order.totalAmount?.toFixed(2)}</td>
                  <td className="table-td"><StatusBadge status={order.status} /></td>
                  <td className="table-td text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="table-td">
                    <Link to={`/orders/${order.id}`} className="text-blue-600 hover:text-blue-800 text-xs font-semibold">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!data.recentOrders || data.recentOrders.length === 0) && (
            <div className="text-center py-12 text-gray-400">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              No orders yet
            </div>
          )}
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
