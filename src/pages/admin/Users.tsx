import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Filter, MoreVertical, ShieldCheck, ShieldAlert, Wallet } from 'lucide-react';
import { apiFetch } from '../../lib/api';

const Users: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadUsers = async () => {
    try {
      const data = await apiFetch('/admin/users');
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
    const newStatus = currentStatus === 'ACTIVE' ? 'FROZEN' : 'ACTIVE';
    try {
      await apiFetch(`/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      loadUsers();
    } catch (err: any) { alert(err.message); }
  };

  const handleVerifyKYC = async (id: string) => {
    try {
      await apiFetch(`/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ kycStatus: 'verified' })
      });
      loadUsers();
    } catch (err: any) { alert(err.message); }
  };

  const handleEditBalance = async (id: string) => {
    const amount = prompt('Enter new balance amount:');
    if (amount === null) return;
    try {
      await apiFetch(`/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ walletBalance: parseFloat(amount) })
      });
      loadUsers();
    } catch (err: any) { alert(err.message); }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">USER <span className="text-paybee-green">MANAGEMENT</span></h1>
          <p className="text-slate-500">Provision and monitor system identities.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center justify-center gap-2 px-6 py-3"
        >
          <UserPlus size={18} />
          PROVISION NEW USER
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by name, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-paybee-green transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button className="bg-white/5 p-2 rounded-xl border border-white/10 text-slate-500 hover:text-white transition-all">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-slate-500 border-b border-white/5">
                <th className="px-6 py-4 font-bold">Identity</th>
                <th className="px-6 py-4 font-bold">Email Interface</th>
                <th className="px-6 py-4 font-bold">Wallet Core</th>
                <th className="px-6 py-4 font-bold">Security (KYC)</th>
                <th className="px-6 py-4 font-bold">System Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="p-10 text-center text-paybee-green">LOADING USER DATA...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="p-10 text-center text-slate-500">NO USERS FOUND</td></tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-paybee-green/10 flex items-center justify-center text-paybee-green font-bold border border-paybee-green/20">
                        {user.fullName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-medium text-white">{user.fullName || 'Unknown User'}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{user.id.slice(0, 13)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">{user.email}</td>
                  <td className="px-6 py-4 font-mono text-paybee-green font-bold">${user.walletBalance?.toFixed(2) || '0.00'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter flex items-center w-fit gap-1 ${
                      user.kycStatus === 'verified' ? 'bg-paybee-green/20 text-paybee-green' : 'bg-paybee-yellow/20 text-paybee-yellow'
                    }`}>
                      {user.kycStatus === 'verified' ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                      {user.kycStatus || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter flex items-center w-fit gap-1 ${
                      user.status === 'ACTIVE' ? 'bg-paybee-green/20 text-paybee-green' : 'bg-red-500/20 text-red-500'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-paybee-green shadow-[0_0_5px_#22c55e]' : 'bg-red-500'}`}></div>
                      {user.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        className="p-2 bg-white/5 rounded-lg border border-white/10 text-slate-400 hover:text-white transition-all"
                        title={user.status === 'ACTIVE' ? 'Freeze Account' : 'Activate Account'}
                      >
                        <ShieldAlert size={16} />
                      </button>
                      <button 
                        onClick={() => handleVerifyKYC(user.id)}
                        disabled={user.kycStatus === 'verified'}
                        className="p-2 bg-white/5 rounded-lg border border-white/10 text-slate-400 hover:text-paybee-green disabled:opacity-30 transition-all"
                        title="Verify KYC"
                      >
                        <ShieldCheck size={16} />
                      </button>
                      <button 
                        onClick={() => handleEditBalance(user.id)}
                        className="p-2 bg-white/5 rounded-lg border border-white/10 text-slate-400 hover:text-paybee-yellow transition-all"
                        title="Adjust Balance"
                      >
                        <Wallet size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <CreateUserModal onClose={() => setShowModal(false)} onCreated={loadUsers} />
      )}
    </div>
  );
};

const CreateUserModal = ({ onClose, onCreated }: any) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const fullName = formData.get('fullName');

    try {
      await apiFetch('/admin/users', {
        method: 'POST',
        body: JSON.stringify({ email, fullName })
      });
      alert('User provisioned successfully.');
      onCreated();
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-paybee-black/90 backdrop-blur-sm animate-fade-in">
      <div className="glass w-full max-w-md p-8 rounded-2xl border-paybee-green/30 animate-scale-in">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <UserPlus className="text-paybee-green" />
          PROVISION NEW USER
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Terminal Interface (Email)</label>
            <input type="email" name="email" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-paybee-green transition-all" placeholder="user@example.com" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Identity Reference (Full Name)</label>
            <input type="text" name="fullName" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-paybee-green transition-all" placeholder="John Doe" />
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold border border-white/10 rounded-xl hover:bg-white/5 transition-all">CANCEL</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary py-3 text-sm font-bold disabled:opacity-50">
              {loading ? 'PROVISIONING...' : 'EXECUTE PROVISIONING'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Users;
