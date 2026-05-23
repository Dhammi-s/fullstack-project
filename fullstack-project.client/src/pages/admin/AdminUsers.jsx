import { useState, useEffect } from 'react';
import { usersApi } from '../../api/services';
import { LoadingSpinner, StatusBadge } from '../../components/UI';
import { Users, Search, ToggleLeft, ToggleRight, Mail, Phone, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    usersApi.getAllUsers()
      .then(res => setUsers(res.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggle = async (id) => {
    try {
      await usersApi.toggleStatus(id);
      toast.success('Status updated');
      fetchUsers();
    } catch { toast.error('Failed'); }
  };

  const filtered = users.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const roleColor = { Admin: 'badge-purple', Worker: 'badge-green', Customer: 'badge-blue' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">User Management</h1>
          <p className="text-gray-500">Manage all registered users</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 w-72 shadow-sm">
          <Search className="w-4 h-4 text-gray-400" />
          <input className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
            placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">{filtered.length} users found</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {u.fullName?.[0] || 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{u.fullName}</div>
                          {u.phone && <div className="text-xs text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" />{u.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-gray-500">{u.email}</td>
                    <td className="table-td">
                      <span className={roleColor[u.role] || 'badge-gray'}>{u.role}</span>
                    </td>
                    <td className="table-td">
                      <span className={u.isActive ? 'badge-green' : 'badge-red'}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-td text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="table-td">
                      <button onClick={() => handleToggle(u.id)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                        {u.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No users found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
