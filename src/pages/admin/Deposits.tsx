import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { apiFetch } from '../../lib/api';

const Deposits: React.FC = () => {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDeposits = async () => {
    try {
      const data = await apiFetch('/admin/deposits');
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
      await apiFetch(`/admin/deposits/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      loadDeposits();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">DEPOSIT <span className="text-paybee-green">VERIFICATION</span></h1>
        <p className="text-slate-500">Review and approve incoming network liquidity.</p>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-paybee-green animate-pulse">SCANNING BLOCKCHAIN RECORDS...</div>
        ) : deposits.length === 0 ? (
          <div className="glass p-10 text-center text-slate-500 rounded-2xl">NO DEPOSITS FOUND</div>
        ) : deposits.map(dep => (
          <div key={dep.id} className="glass p-6 rounded-2xl border-white/5 group hover:border-paybee-green/20 transition-all">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-paybee-green/10 flex items-center justify-center text-paybee-green border border-paybee-green/20">
                  <Download />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Terminal ID</div>
                  <div className="font-bold text-lg text-white">{dep.user?.fullName || 'Unknown'}</div>
                  <div className="text-xs text-slate-500">{dep.user?.email}</div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  dep.status === 'approved' ? 'bg-paybee-green/20 text-paybee-green' : 
                  dep.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 'bg-paybee-yellow/20 text-paybee-yellow'
                }`}>
                  {dep.status}
                </span>
                <div className="text-[10px] text-slate-600 mt-2">{new Date(dep.createdAt).toLocaleString()}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 bg-white/5 p-6 rounded-xl border border-white/5">
              <div>
                <div className="text-[10px] text-slate-500 uppercase mb-1">Amount</div>
                <div className="font-mono text-xl text-paybee-green font-bold">${dep.amount}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase mb-1">Network</div>
                <div className="font-medium text-white">{dep.network}</div>
              </div>
              <div className="col-span-2">
                <div className="text-[10px] text-slate-500 uppercase mb-1">TXID / HASH</div>
                <div className="font-mono text-xs text-slate-400 break-all">{dep.txid}</div>
              </div>
            </div>

            {dep.proofUrl && (
              <div className="mb-8">
                <div className="text-[10px] text-slate-500 uppercase mb-3">Verification Evidence</div>
                <img src={dep.proofUrl} className="w-full max-w-md rounded-xl border border-white/10 shadow-2xl" alt="Proof" />
              </div>
            )}

            {dep.status === 'pending' && (
              <div className="flex gap-4">
                <button 
                  onClick={() => handleUpdate(dep.id, 'approved')}
                  className="flex-1 btn-primary py-3 text-sm font-bold flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  APPROVE TRANSACTION
                </button>
                <button 
                  onClick={() => handleUpdate(dep.id, 'rejected')}
                  className="flex-1 py-3 text-sm font-bold border border-red-500/30 text-red-500 rounded-xl hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                >
                  <XCircle size={18} />
                  REJECT
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Deposits;
