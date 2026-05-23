import { DollarSign, TrendingUp, Star, ShoppingCart, ArrowUpRight, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const earningsData = [
  { week: 'W1', earnings: 480, jobs: 6 }, { week: 'W2', earnings: 620, jobs: 8 },
  { week: 'W3', earnings: 390, jobs: 5 }, { week: 'W4', earnings: 750, jobs: 10 },
  { week: 'W5', earnings: 580, jobs: 7 }, { week: 'W6', earnings: 900, jobs: 12 },
  { week: 'W7', earnings: 840, jobs: 11 }, { week: 'W8', earnings: 1100, jobs: 14 },
];

const transactions = [
  { id: 1, desc: 'Pipe Repair - Johnson', date: 'Today, 2:30 PM', amount: 75, status: 'Paid' },
  { id: 2, desc: 'Drain Cleaning - Smith', date: 'Yesterday', amount: 50, status: 'Paid' },
  { id: 3, desc: 'Furniture Assembly - Brown', date: 'Dec 20', amount: 135, status: 'Paid' },
  { id: 4, desc: 'Electrical Check - Williams', date: 'Dec 19', amount: 85, status: 'Pending' },
  { id: 5, desc: 'Cabinet Install - Davis', date: 'Dec 18', amount: 240, status: 'Paid' },
];

export default function WorkerEarnings() {
  const total = transactions.filter(t => t.status === 'Paid').reduce((a, b) => a + b.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="page-header">Earnings</h1><p className="text-gray-500">Track your income and payments</p></div>
        <button className="btn-secondary"><Download className="w-4 h-4" /> Export</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'This Month', value: '$2,340', icon: DollarSign, color: 'bg-green-500', change: '+18%' },
          { label: 'Total Earnings', value: `$${total}`, icon: TrendingUp, color: 'bg-blue-500', change: '+31%' },
          { label: 'Avg per Job', value: '$82', icon: Star, color: 'bg-purple-500', change: '' },
          { label: 'Jobs Done', value: '28', icon: ShoppingCart, color: 'bg-orange-500', change: '+8%' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className={`${s.color} w-10 h-10 rounded-xl flex items-center justify-center`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              {s.change && <span className="flex items-center text-green-600 text-xs font-semibold"><ArrowUpRight className="w-3 h-3" />{s.change}</span>}
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-gray-500 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Earnings Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-5">Weekly Earnings (Last 8 Weeks)</h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={earningsData}>
            <defs>
              <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v, n) => [n === 'earnings' ? `$${v}` : v, n]} />
            <Area type="monotone" dataKey="earnings" stroke="#10B981" strokeWidth={2.5} fill="url(#earnGrad)" name="earnings" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Transaction History</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {transactions.map(t => (
            <div key={t.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.status === 'Paid' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  <DollarSign className={`w-5 h-5 ${t.status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`} />
                </div>
                <div>
                  <div className="font-medium text-gray-800 text-sm">{t.desc}</div>
                  <div className="text-gray-400 text-xs">{t.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${t.status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>+${t.amount}</div>
                <div className={`text-xs ${t.status === 'Paid' ? 'text-green-500' : 'text-yellow-500'}`}>{t.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
