import React, { useState, useEffect } from 'react';
import { 
  Banknote, 
  Landmark, 
  CheckCircle, 
  XCircle, 
  Search, 
  TrendingDown, 
  Clock, 
  Wallet,
  ArrowRight,
  ExternalLink,
  History,
  CreditCard
} from 'lucide-react';
import { apiFetch } from '../../lib/api';

const Payouts: React.FC = () => {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadPayouts = async () => {
    try {
      const data = await apiFetch('/api/admin/payouts');
      setPayouts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayouts();
  }, []);

  const handleUpdate = async (id: string, status: string) => {
    if (!confirm(`Are you sure you want to mark this payout as ${status}?`)) return;
    try {
      await apiFetch(`/api/admin/payouts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      loadPayouts();
    } catch (err: any) { alert(err.message); }
  };

  const filteredPayouts = payouts.filter(p => 
    p.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.accountNumber?.includes(searchTerm)
  );

  const stats = {
    pending: payouts.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0),
    pendingCount: payouts.filter(p => p.status === 'pending').length,
    processed: payouts.filter(p => p.status === 'approved').reduce((acc, p) => acc + p.amount, 0)
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#0F1014]">Payout Control</h1>
          <p className="text-gray-500">Manage and authorize outbound system withdrawals. Verify bank credentials before processing.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
            Batch Export
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
             </span>
             <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Liquidity Stable</span>
          </div>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Pending Payouts Card (Dark Pattern) */}
        <div className="bg-[#0F1014] rounded-[2rem] p-8 shadow-xl relative overflow-hidden text-white flex flex-col justify-between min-h-[180px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full filter blur-[40px] translate-x-1/4 -translate-y-1/4"></div>
          <div className="relative z-10">
            <p className="text-gray-400 font-medium text-sm tracking-wide uppercase mb-1">Total Pending Payouts</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-display font-bold text-white tracking-tight">{stats.pending.toLocaleString()}</span>
              <span className="text-red-500 font-bold text-lg">USDT</span>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-2 text-xs text-gray-500">
             <Clock className="w-4 h-4 text-red-500" /> {stats.pendingCount} requests in queue
          </div>
        </div>

        {/* Total Processed Card (White Pattern) */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[180px]">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 font-medium text-sm tracking-wide uppercase">Total Processed</p>
            <div className="w-8 h-8 rounded-full bg-[#2E7D32]/10 flex items-center justify-center text-[#2E7D32]">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-4xl font-display font-bold text-[#0F1014] tracking-tight">{stats.processed.toLocaleString()}</span>
          </div>
          <div className="text-xs text-gray-400 uppercase font-bold tracking-tighter text-green-600">Successfully Paid</div>
        </div>

        {/* Wallet Reserve Card (White Pattern) */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[180px]">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 font-medium text-sm tracking-wide uppercase">Wallet Reserve</p>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-4xl font-display font-bold text-[#0F1014] tracking-tight">Unlimited</span>
          </div>
          <div className="text-xs text-gray-400">System treasury status</div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <h3 className="font-bold text-lg text-[#0F1014]">Payout Queue</h3>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search Recipient or A/C..." 
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
                <th className="px-6 py-4 font-medium">Recipient</th>
                <th className="px-6 py-4 font-medium">Bank Details</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-600 font-sans">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Loading payout queue...</td></tr>
              ) : filteredPayouts.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No payout requests in queue.</td></tr>
              ) : filteredPayouts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-bold text-[#0F1014]">{p.user?.fullName}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-tighter">ID: {p.id.slice(0, 8)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Landmark className="w-3 h-3 text-[#2E7D32]" />
                        <span className="font-bold text-[#0F1014] text-xs">{p.bankName}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">A/C: {p.accountNumber}</div>
                      <div className="text-[10px] text-gray-400 font-mono font-bold">IFSC: {p.ifsc}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono font-bold text-red-600">-{p.amount.toFixed(2)} <span className="text-xs text-gray-400">USDT</span></div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                      p.status === 'approved' 
                      ? 'bg-green-50 text-green-700 border-green-100' 
                      : p.status === 'rejected'
                      ? 'bg-red-50 text-red-700 border-red-100'
                      : 'bg-orange-50 text-orange-700 border-orange-100'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {p.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleUpdate(p.id, 'approved')}
                          className="px-4 py-2 bg-[#0F1014] text-white rounded-lg text-[10px] font-bold uppercase hover:bg-[#2E7D32] transition-all shadow-sm"
                        >
                          Mark as Paid
                        </button>
                        <button 
                          onClick={() => handleUpdate(p.id, 'rejected')}
                          className="p-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          title="Reject"
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

export default Payouts;
