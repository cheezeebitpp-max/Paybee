import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  ShieldAlert, 
  Search, 
  Filter, 
  MoreVertical, 
  ShieldCheck, 
  Wallet,
  ArrowRight,
  ExternalLink,
  Ban,
  CheckCircle2
} from 'lucide-react';
import { apiFetch } from '../../lib/api';

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadUsers = async () => {
    try {
      const data = await apiFetch('/api/admin/users');
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    try {
      await apiFetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      loadUsers();
    } catch (err: any) { alert(err.message); }
  };

  const handleVerifyKYC = async (id: string) => {
    try {
      await apiFetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ kycStatus: 'verified' })
      });
      loadUsers();
    } catch (err: any) { alert(err.message); }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    pendingKYC: users.filter(u => u.kycStatus === 'pending').length
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#0F1014]">User Directory</h1>
          <p className="text-gray-500">Manage system identities, verify KYC, and monitor account status.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
            Export CSV
          </button>
          <button className="px-4 py-2 bg-[#0F1014] text-white rounded-xl text-sm font-bold hover:bg-[#2E7D32] transition-all shadow-lg">
            Add New User
          </button>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Users Card (Dark Pattern) */}
        <div className="bg-[#0F1014] rounded-[2rem] p-8 shadow-xl relative overflow-hidden text-white flex flex-col justify-between min-h-[180px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#7CB342]/10 rounded-full filter blur-[40px] translate-x-1/4 -translate-y-1/4"></div>
          <div className="relative z-10">
            <p className="text-gray-400 font-medium text-sm tracking-wide uppercase mb-1">Total Registered Users</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-display font-bold text-white tracking-tight">{stats.total}</span>
              <span className="text-[#7CB342] font-bold text-lg">USERS</span>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-2 text-xs text-gray-500">
             <Users className="w-4 h-4" /> Global Identity Pool
          </div>
        </div>

        {/* Active Today Card (White Pattern) */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[180px]">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 font-medium text-sm tracking-wide uppercase">Active Today</p>
            <div className="w-8 h-8 rounded-full bg-[#2E7D32]/10 flex items-center justify-center text-[#2E7D32]">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-4xl font-display font-bold text-[#0F1014] tracking-tight">{stats.active}</span>
          </div>
          <div className="text-xs text-gray-400">Account status set to ACTIVE</div>
        </div>

        {/* Pending KYC Card (White Pattern) */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[180px]">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 font-medium text-sm tracking-wide uppercase">Pending KYC</p>
            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-4xl font-display font-bold text-[#0F1014] tracking-tight">{stats.pendingKYC}</span>
          </div>
          <div className="text-xs text-gray-400">Identity verification requests</div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <h3 className="font-bold text-lg text-[#0F1014]">User Directory</h3>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Name / Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">KYC Status</th>
                <th className="px-6 py-4 font-medium">System Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-600">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Loading user directory...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No users match your search.</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-[#0F1014] font-bold border border-gray-200 group-hover:bg-[#2E7D32]/10 group-hover:border-[#2E7D32]/20 transition-colors">
                        {user.fullName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-bold text-[#0F1014]">{user.fullName}</div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                      user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' 
                      ? 'bg-purple-50 text-purple-700 border-purple-100' 
                      : 'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.kycStatus === 'verified' ? 'bg-[#2E7D32]' : 'bg-orange-500'}`}></div>
                      <span className="capitalize">{user.kycStatus || 'pending'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                      user.status === 'ACTIVE' 
                      ? 'bg-green-50 text-green-700 border-green-100' 
                      : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        className={`p-2 rounded-lg border transition-all ${
                          user.status === 'ACTIVE' 
                          ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white' 
                          : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-600 hover:text-white'
                        }`}
                        title={user.status === 'ACTIVE' ? 'Ban User' : 'Unban User'}
                      >
                        {user.status === 'ACTIVE' ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleVerifyKYC(user.id)}
                        disabled={user.kycStatus === 'verified'}
                        className="p-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-[#0F1014] hover:text-white disabled:opacity-30 transition-all"
                        title="Verify KYC"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-[#0F1014] hover:text-white transition-all"
                        title="View Profile"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
