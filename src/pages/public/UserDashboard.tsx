import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  History, 
  ShieldCheck, 
  ShieldAlert,
  Send,
  Plus,
  X,
  CreditCard,
  Landmark
} from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  const loadData = async () => {
    try {
      const [pData, dData, payData] = await Promise.all([
        apiFetch('/user/me'),
        apiFetch('/user/deposits'),
        apiFetch('/user/payouts')
      ]);
      setProfile(pData);
      setDeposits(dData || []);
      setPayouts(payData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-deep-forest text-neon-green">SYNCING WITH SWARM...</div>;

  return (
    <div className="min-h-screen bg-deep-forest text-snow-white p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="font-display text-4xl font-bold mb-2">Welcome Back, <span className="text-honey-gold">{profile?.fullName || 'Trader'}</span></h1>
            <p className="text-gray-400">Manage your assets and secure P2P transactions.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowDepositModal(true)}
              className="px-6 py-3 bg-hive-green text-white font-bold rounded-full hover:bg-neon-green hover:text-deep-forest transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(46,125,50,0.3)]"
            >
              <Plus size={20} /> DEPOSIT USDT
            </button>
            <button 
              onClick={() => setShowPayoutModal(true)}
              className="px-6 py-3 bg-honey-gold text-deep-forest font-bold rounded-full hover:bg-white transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,193,7,0.3)]"
            >
              <Send size={20} /> REQUEST PAYOUT
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar / Profile Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="glass-panel p-8 rounded-3xl border border-white/10 bg-charcoal/30">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 hexagon bg-neon-green flex items-center justify-center text-deep-forest text-2xl font-bold">
                  {profile?.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="text-sm text-gray-500 uppercase tracking-widest font-bold">Account Status</div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase ${profile?.status === 'ACTIVE' ? 'text-neon-green' : 'text-red-500'}`}>
                      {profile?.status}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${profile?.status === 'ACTIVE' ? 'bg-neon-green glow-green' : 'bg-red-500'}`}></div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Current Balance</div>
                  <div className="text-4xl font-display font-bold text-snow-white">₮{profile?.walletBalance?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="pt-6 border-t border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Identity Verification (KYC)</div>
                  <div className={`flex items-center gap-2 p-3 rounded-xl border ${
                    profile?.kycStatus === 'verified' ? 'bg-neon-green/10 border-neon-green/30 text-neon-green' : 'bg-honey-gold/10 border-honey-gold/30 text-honey-gold'
                  }`}>
                    {profile?.kycStatus === 'verified' ? <ShieldCheck /> : <ShieldAlert />}
                    <span className="text-xs font-bold uppercase tracking-wider">{profile?.kycStatus}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Box */}
            <div className="glass-panel p-6 rounded-3xl border border-hive-green/20 bg-hive-green/5">
              <h3 className="font-bold text-lg mb-2">Need Assistance?</h3>
              <p className="text-sm text-gray-400 mb-4">Our support swarm is online 24/7 to help with your trades.</p>
              <button className="text-neon-green font-bold text-sm hover:underline">Open Support Ticket →</button>
            </div>
          </div>

          {/* Main Activity Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-panel p-8 rounded-3xl border border-white/10 min-h-[500px]">
              <div className="flex items-center gap-3 mb-8">
                <History className="text-neon-green" />
                <h2 className="text-xl font-bold tracking-tight uppercase">Recent Transactions</h2>
              </div>

              <div className="space-y-4">
                {deposits.length === 0 && payouts.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-gray-600">
                    <Wallet size={48} className="mb-4 opacity-20" />
                    <p>No transactions detected in your history.</p>
                  </div>
                ) : (
                  <>
                    {[...deposits.map(d => ({...d, type: 'DEPOSIT'})), ...payouts.map(p => ({...p, type: 'PAYOUT'}))]
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((tx, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              tx.type === 'DEPOSIT' ? 'bg-neon-green/20 text-neon-green' : 'bg-honey-gold/20 text-honey-gold'
                            }`}>
                              {tx.type === 'DEPOSIT' ? <ArrowDownCircle size={20} /> : <ArrowUpCircle size={20} />}
                            </div>
                            <div>
                              <div className="font-bold text-sm">{tx.type} {tx.type === 'DEPOSIT' ? `(${tx.network})` : ''}</div>
                              <div className="text-[10px] text-gray-500">{new Date(tx.createdAt).toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-mono font-bold ${tx.type === 'DEPOSIT' ? 'text-neon-green' : 'text-honey-gold'}`}>
                              {tx.type === 'DEPOSIT' ? '+' : '-'}₮{tx.amount.toFixed(2)}
                            </div>
                            <div className={`text-[10px] font-bold uppercase tracking-tighter ${
                              tx.status === 'approved' ? 'text-neon-green' : 
                              tx.status === 'rejected' ? 'text-red-500' : 'text-honey-gold'
                            }`}>
                              {tx.status}
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDepositModal && <DepositModal onClose={() => setShowDepositModal(false)} onRefresh={loadData} />}
      {showPayoutModal && <PayoutModal onClose={() => setShowPayoutModal(false)} onRefresh={loadData} balance={profile?.walletBalance} />}
    </div>
  );
};

const DepositModal = ({ onClose, onRefresh }: any) => {
  const [formData, setFormData] = useState({ amount: '', network: 'TRC20', txid: '', proofUrl: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch('/user/deposits', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      alert('Deposit submitted for verification.');
      onRefresh();
      onClose();
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-forest/90 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg p-8 rounded-3xl border border-neon-green/30 relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X /></button>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-neon-green"><ArrowDownCircle /> SUBMIT DEPOSIT PROOF</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">USDT Amount</label>
              <input 
                type="number" step="0.01" required
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-neon-green"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Network</label>
              <select 
                value={formData.network}
                onChange={e => setFormData({...formData, network: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-neon-green appearance-none"
              >
                <option value="TRC20">TRC20</option>
                <option value="ERC20">ERC20</option>
                <option value="BEP20">BEP20</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Transaction ID (TXID) / Hash</label>
            <input 
              type="text" required
              value={formData.txid}
              onChange={e => setFormData({...formData, txid: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-neon-green font-mono text-sm"
              placeholder="Enter full transaction hash"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Proof URL (Image/Screenshot)</label>
            <input 
              type="url"
              value={formData.proofUrl}
              onChange={e => setFormData({...formData, proofUrl: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-neon-green"
              placeholder="https://imgur.com/..."
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-hive-green py-4 rounded-xl font-bold hover:bg-neon-green hover:text-deep-forest transition-all disabled:opacity-50">
            {loading ? 'SUBMITTING...' : 'CONFIRM DEPOSIT'}
          </button>
        </form>
      </div>
    </div>
  );
};

const PayoutModal = ({ onClose, onRefresh, balance }: any) => {
  const [formData, setFormData] = useState({ amount: '', bankName: '', accountNumber: '', ifsc: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(formData.amount) > balance) return alert('Insufficient balance');
    
    setLoading(true);
    try {
      await apiFetch('/user/payouts', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      alert('Payout request submitted.');
      onRefresh();
      onClose();
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-forest/90 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg p-8 rounded-3xl border border-honey-gold/30 relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X /></button>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-honey-gold"><ArrowUpCircle /> REQUEST PAYOUT</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Amount to Withdraw (USDT)</label>
            <input 
              type="number" step="0.01" required
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-honey-gold text-2xl font-bold"
              placeholder="0.00"
            />
            <div className="mt-2 text-[10px] text-gray-400">Available: ₮{balance?.toFixed(2)}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Bank Name</label>
              <div className="relative">
                <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input 
                  type="text" required
                  value={formData.bankName}
                  onChange={e => setFormData({...formData, bankName: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 focus:outline-none focus:border-honey-gold"
                  placeholder="e.g. HDFC Bank"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">IFSC / Routing Code</label>
              <input 
                type="text" required
                value={formData.ifsc}
                onChange={e => setFormData({...formData, ifsc: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-honey-gold"
                placeholder="IFSC Code"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Account Number</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input 
                type="text" required
                value={formData.accountNumber}
                onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 focus:outline-none focus:border-honey-gold font-mono"
                placeholder="Account Number"
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-honey-gold py-4 rounded-xl font-bold text-deep-forest hover:bg-white transition-all disabled:opacity-50">
            {loading ? 'PROCESSING...' : 'REQUEST WITHDRAWAL'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserDashboard;
