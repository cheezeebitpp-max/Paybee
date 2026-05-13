import React, { useState, useEffect } from 'react';
import { Repeat, Eye, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';
import { apiFetch } from '../../lib/api';

const Trades: React.FC = () => {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrades = async () => {
    try {
      const data = await apiFetch('/admin/trades');
      setTrades(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrades();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">TRADE <span className="text-paybee-green">MONITORING</span></h1>
        <p className="text-slate-500">Real-time surveillance of P2P network exchanges.</p>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-paybee-green animate-pulse"></div>
            Live Network Stream
          </div>
          <div className="text-[10px] text-slate-600 font-mono">ENCRYPTION: AES-256</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-slate-500 border-b border-white/5">
                <th className="px-6 py-4 font-bold">Protocol ID</th>
                <th className="px-6 py-4 font-bold">Exchange Volume</th>
                <th className="px-6 py-4 font-bold">Network Status</th>
                <th className="px-6 py-4 font-bold">Execution Time</th>
                <th className="px-6 py-4 font-bold text-right">Surveillance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center text-paybee-green">INTERCEPTING P2P PACKETS...</td></tr>
              ) : trades.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-slate-500">NO TRADES DETECTED</td></tr>
              ) : trades.map(t => (
                <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-500 group-hover:text-paybee-green transition-colors">
                        <Repeat size={16} />
                      </div>
                      <span className="font-mono text-sm text-white">{t.id.slice(0, 13)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-paybee-yellow font-bold">${t.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter flex items-center w-fit gap-1 ${
                      t.status === 'completed' ? 'bg-paybee-green/20 text-paybee-green' : 
                      t.status === 'disputed' ? 'bg-red-500/20 text-red-500' : 'bg-paybee-yellow/20 text-paybee-yellow'
                    }`}>
                      {t.status === 'completed' ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(t.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-1 ml-auto">
                      <Eye size={12} />
                      View Logs
                    </button>
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

export default Trades;
