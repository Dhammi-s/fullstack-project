import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/services';
import { LoadingSpinner, StatusBadge } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, DollarSign, Star, Wrench, CheckCircle, Clock, TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const weeklyData = [
  { day: 'Mon', jobs: 2, earnings: 140 },
  { day: 'Tue', jobs: 3, earnings: 225 },
  { day: 'Wed', jobs: 1, earnings: 75 },
  { day: 'Thu', jobs: 4, earnings: 320 },
  { day: 'Fri', jobs: 5, earnings: 425 },
  { day: 'Sat', jobs: 3, earnings: 270 },
  { day: 'Sun', jobs: 2, earnings: 150 },
];

export default function WorkerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    dashboardApi.worker()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="text-center py-20 text-gray-500">Failed to load dashboard</div>;

  const pieData = [
    { name: 'Completed', value: data.completedOrders, color: '#10B981' },
    { name: 'Pending', value: data.pendingOrders, color: '#F59E0B' },
    { name: 'In Progress', value: data.totalOrders - data.completedOrders - data.pendingOrders, color: '#3B82F6' },
  ];

  const stats = [
    { label: 'Total Earnings', value: `$${(data.totalEarnings || 0).toFixed(2)}`, icon: DollarSign, color: 'bg-green-500', bg: 'bg-green-50' },
    { label: 'Total Jobs', value: data.totalOrders, icon: ShoppingCart, color: 'bg-blue-500', bg: 'bg-blue-50' },
    { label: 'Completed', value: data.completedOrders, icon: CheckCircle, color: 'bg-teal-500', bg: 'bg-teal-50' },
    { label: 'Pending', value: data.pendingOrders, icon: Clock, color: 'bg-yellow-500', bg: 'bg-yellow-50' },
    { label: 'My Services', value: data.totalServices, icon: Wrench, color: 'bg-purple-500', bg: 'bg-purple-50' },
    { label: 'Avg Rating', value: (data.averageRating || 0).toFixed(1), icon: Star, color: 'bg-pink-500', bg: 'bg-pink-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.fullName?.split(' ')[0]} 👋</h1>
            <p className="text-green-100 mt-1">Here's your performance overview</p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              <span className="text-green-100 text-sm">Available for jobs</span>
            </div>
          </div>
          <div className="text-center hidden md:block">
            <div className="text-5xl font-bold text-yellow-300">{(data.averageRating || 0).toFixed(1)}</div>
            <div className="flex justify-center mt-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-4 h-4 ${i <= Math.round(data.averageRating || 0) ? 'text-yellow-300 fill-yellow-300' : 'text-green-300'}`} />
              ))}
            </div>
            <div className="text-green-200 text-xs mt-1">{data.totalReviews} reviews</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 border border-white`}>
            <div className={`${stat.color} w-9 h-9 rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-5">Weekly Performance</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="jobs" fill="#10B981" radius={[6,6,0,0]} name="Jobs" />
              <Bar dataKey="earnings" fill="#3B82F6" radius={[6,6,0,0]} name="Earnings $" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-5">Job Status</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value" paddingAngle={3}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'My Assignments', to: '/worker/assignments', icon: ShoppingCart, color: 'from-blue-500 to-blue-600' },
          { label: 'My Schedule', to: '/worker/schedule', icon: Calendar, color: 'from-green-500 to-green-600' },
          { label: 'My Services', to: '/worker/services', icon: Wrench, color: 'from-purple-500 to-purple-600' },
          { label: 'Earnings', to: '/worker/earnings', icon: DollarSign, color: 'from-orange-500 to-orange-600' },
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
          <h2 className="text-lg font-bold text-gray-800">Recent Assignments</h2>
          <Link to="/worker/assignments" className="btn-outline text-sm py-2">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Order #', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(data.recentOrders || []).map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="table-td font-mono font-semibold text-blue-600">#{order.orderNumber}</td>
                  <td className="table-td font-medium">{order.customerName}</td>
                  <td className="table-td font-bold text-green-600">${order.totalAmount?.toFixed(2)}</td>
                  <td className="table-td"><StatusBadge status={order.status} /></td>
                  <td className="table-td text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!data.recentOrders || data.recentOrders.length === 0) && (
            <div className="text-center py-12 text-gray-400">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              No assignments yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
