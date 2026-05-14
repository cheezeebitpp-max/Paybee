import React, { useState, useEffect } from 'react';
import { 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  History,
  Eye
} from 'lucide-react';
import { apiFetch } from '../../lib/api';

const Deposits: React.FC = () => {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadDeposits = async () => {
    try {
      const data = await apiFetch('/api/admin/deposits');
      setDeposits(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeposits();
  }, []);

  const handleUpdate = async (id: string, status: string) => {
    if (!confirm(`Are you sure you want to ${status} this deposit?`)) return;
    try {
      await apiFetch(`/api/admin/deposits/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      loadDeposits();
    } catch (err: any) { alert(err.message); }
  };

  const filteredDeposits = deposits.filter(dep => 
    dep.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    dep.txid?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: deposits.reduce((acc, d) => acc + d.amount, 0),
    pendingCount: deposits.filter(d => d.status === 'pending').length,
    volume24h: deposits
      .filter(d => new Date(d.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000)
      .reduce((acc, d) => acc + d.amount, 0)
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#0F1014]">Global Deposits</h1>
          <p className="text-gray-500">Review and approve incoming network liquidity. Manual verification required for all TRC20/ERC20 transfers.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
            Download Report
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#2E7D32]/10 border border-[#2E7D32]/30 rounded-xl">
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7CB342] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7CB342]"></span>
             </span>
             <span className="text-xs font-bold text-[#7CB342] uppercase tracking-wide">Syncing Nodes</span>
          </div>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Deposits Card (Dark Pattern) */}
        <div className="bg-[#0F1014] rounded-[2rem] p-8 shadow-xl relative overflow-hidden text-white flex flex-col justify-between min-h-[180px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#7CB342]/10 rounded-full filter blur-[40px] translate-x-1/4 -translate-y-1/4"></div>
          <div className="relative z-10">
            <p className="text-gray-400 font-medium text-sm tracking-wide uppercase mb-1">Total System Deposits</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-display font-bold text-white tracking-tight">{stats.total.toLocaleString()}</span>
              <span className="text-[#7CB342] font-bold text-lg">USDT</span>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-2 text-xs text-gray-500">
             <TrendingUp className="w-4 h-4 text-[#7CB342]" /> All-time liquidity
          </div>
        </div>

        {/* Pending Review Card (White Pattern) */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[180px]">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 font-medium text-sm tracking-wide uppercase">Pending Review</p>
            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-4xl font-display font-bold text-[#0F1014] tracking-tight">{stats.pendingCount}</span>
          </div>
          <div className="text-xs text-gray-400 font-bold text-orange-600 uppercase tracking-tighter">Needs Immediate Action</div>
        </div>

        {/* Total Volume 24h Card (White Pattern) */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[180px]">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 font-medium text-sm tracking-wide uppercase">Total Volume (24h)</p>
            <div className="w-8 h-8 rounded-full bg-[#2E7D32]/10 flex items-center justify-center text-[#2E7D32]">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-4xl font-display font-bold text-[#0F1014] tracking-tight">{stats.volume24h.toLocaleString()}</span>
          </div>
          <div className="text-xs text-gray-400">Rolling window liquidity</div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <h3 className="font-bold text-lg text-[#0F1014]">Deposit Ledger</h3>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search TXID or User..." 
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
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">TXID / Network</th>
                <th className="px-6 py-4 font-medium">Proof</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-600 font-sans">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Loading ledger records...</td></tr>
              ) : filteredDeposits.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No deposit records found.</td></tr>
              ) : filteredDeposits.map((dep) => (
                <tr key={dep.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-bold text-[#0F1014]">{dep.user?.fullName}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-tighter">{dep.user?.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono font-bold text-[#2E7D32]">+{dep.amount.toFixed(2)} <span className="text-xs text-gray-400">USDT</span></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-[10px] text-gray-400">{dep.txid?.slice(0, 20)}...</span>
                      <span className="text-[10px] font-bold text-[#7CB342]">{dep.network}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {dep.proofUrl ? (
                      <a 
                        href={dep.proofUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-bold text-[#2E7D32] hover:text-[#7CB342] transition-colors"
                      >
                        <Eye className="w-4 h-4" /> View Proof
                      </a>
                    ) : (
                      <span className="text-gray-300 text-xs italic">No Proof</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                      dep.status === 'approved' 
                      ? 'bg-green-50 text-green-700 border-green-100' 
                      : dep.status === 'rejected'
                      ? 'bg-red-50 text-red-700 border-red-100'
                      : 'bg-orange-50 text-orange-700 border-orange-100'
                    }`}>
                      {dep.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {dep.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleUpdate(dep.id, 'approved')}
                          className="p-2 bg-green-50 text-green-600 border border-green-100 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"
                          title="Approve Deposit"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleUpdate(dep.id, 'rejected')}
                          className="p-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          title="Reject Deposit"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-300 italic text-xs">Processed</span>
                    )}
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

export default Deposits;
