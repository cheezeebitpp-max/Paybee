import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  ShieldAlert, 
  CheckCircle, 
  Zap, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  Activity,
  ArrowDownCircle,
  Clock,
  Lock,
  Plus,
  Settings,
  ShieldCheck,
  Database,
  History
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Welcome Section (Exactly like userdashboard.html) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#0F1014]">System Overview</h1>
          <p className="text-gray-500">Welcome back, {user?.fullName || 'Super Admin'}. Here is the platform state.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
            Export Ledger
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#2E7D32]/10 border border-[#2E7D32]/30 rounded-xl">
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7CB342] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7CB342]"></span>
             </span>
             <span className="text-xs font-bold text-[#7CB342] uppercase tracking-wide">System Online</span>
          </div>
        </div>
      </div>

      {/* Top Stats Grid (Exactly like userdashboard.html) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Stats Card (Dark - matches wallet card) */}
        <div className="md:col-span-2 bg-[#0F1014] rounded-[2rem] p-8 shadow-xl relative overflow-hidden text-white flex flex-col justify-between min-h-[220px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#7CB342]/10 rounded-full filter blur-[60px] translate-x-1/4 -translate-y-1/4"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-gray-400 font-medium text-sm tracking-wide uppercase mb-1">Total Platform Escrow</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-display font-bold text-white tracking-tight">
                  1,452,890.00
                </span>
                <span className="text-[#7CB342] font-bold text-lg">USDT</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                <span className="text-[#7CB342] font-bold">+12.5%</span> volume increase in the last 24 hours.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
              <TrendingUp className="w-6 h-6 text-[#FFC107]" />
            </div>
          </div>

          <div className="relative z-10 flex gap-4 mt-8">
            <button className="px-6 py-2.5 bg-[#FFC107] text-[#0F1014] rounded-xl text-sm font-bold hover:bg-white transition-colors">Audit Ledger</button>
            <button className="px-6 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl text-sm font-bold hover:bg-white/20 transition-colors backdrop-blur-md">Fee Settings</button>
          </div>
        </div>

        {/* Small Stats Card (White - matches locked escrow card) */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-500 font-medium text-sm tracking-wide uppercase">Active P2P Trades</p>
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-bold text-[#0F1014] tracking-tight">342</span>
              <span className="text-gray-400 font-bold text-sm">TOTAL</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">45 trades pending confirmation</p>
            <a href="#" className="text-sm font-bold text-[#2E7D32] hover:text-[#7CB342] transition-colors flex items-center gap-1">
              View All Trades <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Priority Action Banner (Exactly like userdashboard.html banner) */}
      <div className="bg-gradient-to-r from-red-600 to-[#0F1014] rounded-2xl p-0.5 relative overflow-hidden shadow-lg">
        <div className="bg-white rounded-[0.9rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="relative flex h-10 w-10 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-30"></span>
              <span className="relative inline-flex rounded-full h-10 w-10 bg-red-500/20 items-center justify-center border border-red-500">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">High Priority Dispute</span>
                <span className="text-sm text-gray-400 font-mono">Trade #TR-9042</span>
              </div>
              <h3 className="font-bold text-lg text-[#0F1014]">Buyer @AlexB vs Seller @MerchantPro</h3>
              <p className="text-sm text-gray-500">Buyer has uploaded payment proof. Seller claims non-receipt. Evidence review required.</p>
            </div>
          </div>
          <div className="w-full md:w-auto shrink-0 text-right">
            <p className="text-xs text-gray-400 mb-2">Opened <span className="font-bold text-red-500 font-mono">2 hours ago</span></p>
            <button className="w-full md:w-auto px-6 py-2.5 bg-[#0F1014] text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors">
              Review Evidence
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Quick Actions & Live Ledger (Exactly like userdashboard.html bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions (Sidebar style) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
          <h3 className="font-bold text-lg text-[#0F1014] mb-4">Admin Operations</h3>
          <div className="space-y-3 flex-1">
            {[
              { title: 'Manage Users', desc: 'Verify KYC and account status', icon: Users, color: 'text-[#2E7D32]', bg: 'bg-[#2E7D32]/10' },
              { title: 'Content CMS', desc: 'Edit marketing and FAQ copy', icon: Database, color: 'text-[#7CB342]', bg: 'bg-[#7CB342]/10' },
              { title: 'System Settings', desc: 'Configure fees and limits', icon: Settings, color: 'text-gray-600', bg: 'bg-gray-100' }
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

        {/* Live Ledger Activity (Table style) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-lg text-[#0F1014]">Live System Ledger</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-[#7CB342]">
               <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7CB342] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#7CB342]"></span>
               </span>
               Real-time Syncing
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Event Type</th>
                  <th className="px-6 py-4 font-medium">Value</th>
                  <th className="px-6 py-4 font-medium">Metadata</th>
                  <th className="px-6 py-4 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-600 font-mono">
                <tr className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors">
                        <Lock className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-[#0F1014]">ESCROW_LOCK</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-blue-600">500.00 USDT</td>
                  <td className="px-6 py-4 text-xs text-gray-400">TX: a4b9...c21</td>
                  <td className="px-6 py-4 text-gray-400">14:02:45</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2E7D32]/10 flex items-center justify-center text-[#2E7D32] group-hover:bg-[#2E7D32]/20 transition-colors">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-[#0F1014]">TRADE_SETTLE</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-[#2E7D32]">1,250.00 USDT</td>
                  <td className="px-6 py-4 text-xs text-gray-400">Confirmed by @seller99</td>
                  <td className="px-6 py-4 text-gray-400">14:01:12</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors group cursor-pointer border-l-4 border-l-red-500">
                  <td className="px-6 py-4 pl-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-white">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-red-600">DEPOSIT_FLAG</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-red-600">--</td>
                  <td className="px-6 py-4 text-xs text-red-400/70">Invalid TXID submitted</td>
                  <td className="px-6 py-4 text-gray-400">13:58:05</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
