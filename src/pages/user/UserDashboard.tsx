import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  ShoppingCart, 
  ShieldCheck, 
  Clock, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  History,
  Lock,
  ArrowRight
} from 'lucide-react';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#0F1014]">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user?.fullName || 'User'}. Here is your overview.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
            Post Sell Ad
          </button>
          <button className="px-4 py-2 bg-[#2E7D32] text-white rounded-xl text-sm font-bold hover:bg-[#7CB342] hover:text-[#0F1014] transition-all shadow-lg shadow-[#2E7D32]/20">
            Buy USDT
          </button>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Wallet Card (Dark) */}
        <div className="md:col-span-2 bg-[#0F1014] rounded-[2rem] p-8 shadow-xl relative overflow-hidden text-white flex flex-col justify-between min-h-[220px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#7CB342]/10 rounded-full filter blur-[60px] translate-x-1/4 -translate-y-1/4"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-gray-400 font-medium text-sm tracking-wide uppercase mb-1">Available USDT Balance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-display font-bold text-white tracking-tight">
                  {user?.walletBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                </span>
                <span className="text-[#7CB342] font-bold text-lg">USDT</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">≈ ${(user?.walletBalance || 0).toLocaleString()} USD / ₹{((user?.walletBalance || 0) * 83.5).toLocaleString()} INR</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
              <ShieldCheck className="w-6 h-6 text-[#FFC107]" />
            </div>
          </div>

          <div className="relative z-10 flex gap-4 mt-8">
            <button className="px-6 py-2.5 bg-[#FFC107] text-[#0F1014] rounded-xl text-sm font-bold hover:bg-white transition-colors">Deposit</button>
            <button className="px-6 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl text-sm font-bold hover:bg-white/20 transition-colors backdrop-blur-md">Withdraw</button>
          </div>
        </div>

        {/* Escrowed / Locked Card */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-500 font-medium text-sm tracking-wide uppercase">In Escrow (Locked)</p>
              <div className="w-8 h-8 rounded-full bg-[#FFC107]/10 flex items-center justify-center">
                <Lock className="w-4 h-4 text-[#FFC107]" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-bold text-[#0F1014] tracking-tight">500.00</span>
              <span className="text-gray-400 font-bold text-sm">USDT</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Locked in 1 active trade</p>
            <a href="#" className="text-sm font-bold text-[#2E7D32] hover:text-[#7CB342] transition-colors flex items-center gap-1">
              View Trade Details <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Active Trade Banner */}
      <div className="bg-gradient-to-r from-[#2E7D32] to-[#0F1014] rounded-2xl p-0.5 relative overflow-hidden shadow-lg">
        <div className="bg-white rounded-[0.9rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="relative flex h-10 w-10 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFC107] opacity-30"></span>
              <span className="relative inline-flex rounded-full h-10 w-10 bg-[#FFC107]/20 items-center justify-center border border-[#FFC107]">
                <Clock className="w-5 h-5 text-[#FFC107]" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#FFC107]/20 text-[#FFC107] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Action Required</span>
                <span className="text-sm text-gray-400 font-mono">Trade #TR-9821</span>
              </div>
              <h3 className="font-bold text-lg text-[#0F1014]">Selling 500 USDT to @AlexB</h3>
              <p className="text-sm text-gray-500">Buyer has uploaded payment proof. Please review and confirm receipt.</p>
            </div>
          </div>
          <div className="w-full md:w-auto shrink-0 text-right">
            <p className="text-xs text-gray-400 mb-2">Timer ends in <span className="font-bold text-red-500 font-mono">14:22</span></p>
            <button className="w-full md:w-auto px-6 py-2.5 bg-[#0F1014] text-white rounded-xl text-sm font-bold hover:bg-[#2E7D32] transition-colors">
              Review Evidence
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Quick Links & Recent History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
          <h3 className="font-bold text-lg text-[#0F1014] mb-4">Quick Actions</h3>
          <div className="space-y-3 flex-1">
            {[
              { title: 'Post a Sell Ad', desc: 'Set your rate and accept fiat', icon: Plus, color: 'text-[#2E7D32]', bg: 'bg-[#2E7D32]/10' },
              { title: 'Browse Buy Offers', desc: 'Find the best USDT rates', icon: ShoppingCart, color: 'text-[#7CB342]', bg: 'bg-[#7CB342]/10' },
              { title: 'Security Settings', desc: 'Manage 2FA and passwords', icon: ShieldCheck, color: 'text-gray-600', bg: 'bg-gray-100' }
            ].map((action, idx) => (
              <a key={idx} href="#" className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                <div className={`w-10 h-10 rounded-full ${action.bg} flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800">{action.title}</p>
                  <p className="text-xs text-gray-500">{action.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-lg text-[#0F1014]">Recent Activity</h3>
            <a href="#" className="text-xs font-bold text-[#2E7D32] hover:text-[#7CB342] transition-colors">View All History</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-600">
                <tr className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors">
                        <ArrowDownCircle className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-800">Deposit (TRC20)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-medium">+1,000.00 <span className="text-gray-400 text-xs">USDT</span></td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded border border-green-200 text-xs font-bold">Completed</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">Today, 10:24 AM</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2E7D32]/10 flex items-center justify-center text-[#2E7D32] group-hover:bg-[#2E7D32]/20 transition-colors">
                        <ShoppingCart className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-800">Bought USDT</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-[#2E7D32]">+250.00 <span className="text-gray-400 text-xs">USDT</span></td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded border border-green-200 text-xs font-bold">Completed</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">Yesterday, 14:05 PM</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
