import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, XCircle, Banknote, Landmark } from 'lucide-react';
import { apiFetch } from '../../lib/api';

const Payouts: React.FC = () => {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayouts = async () => {
    try {
      const data = await apiFetch('/admin/payouts');
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
    try {
      await apiFetch(`/admin/payouts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      loadPayouts();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">PAYOUT <span className="text-paybee-green">CONTROL</span></h1>
        <p className="text-slate-500">Manage and authorize outbound system withdrawals.</p>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-slate-500 border-b border-white/5">
                <th className="px-6 py-4 font-bold">Recipient</th>
                <th className="px-6 py-4 font-bold">Banking Credentials</th>
                <th className="px-6 py-4 font-bold">Withdrawal Sum</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Operational Logic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center text-paybee-green">RETRIEVING PAYOUT QUEUE...</td></tr>
              ) : payouts.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-slate-500">NO PAYOUTS IN QUEUE</td></tr>
              ) : payouts.map(p => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{p.user?.fullName || 'N/A'}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{p.id.slice(0, 13)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Landmark size={12} className="text-paybee-green" />
                        <span className="font-bold">{p.bankName}</span>
                      </div>
                      <div className="text-slate-500 font-mono">A/C: {p.accountNumber}</div>
                      <div className="text-slate-500 font-mono">IFSC: {p.ifsc}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-paybee-green font-bold text-lg">${p.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter ${
                      p.status === 'approved' ? 'bg-paybee-green/20 text-paybee-green' : 
                      p.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 'bg-paybee-yellow/20 text-paybee-yellow'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {p.status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleUpdate(p.id, 'approved')}
                          className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase bg-paybee-green/10 text-paybee-green border border-paybee-green/30 rounded-lg hover:bg-paybee-green hover:text-white transition-all"
                        >
                          <CheckCircle size={12} />
                          Approve
                        </button>
                        <button 
                          onClick={() => handleUpdate(p.id, 'rejected')}
                          className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                        >
                          <XCircle size={12} />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-600 text-xs italic">Processed</span>
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
