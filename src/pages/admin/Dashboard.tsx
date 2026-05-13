import React, { useState, useEffect } from 'react';
import { 
  Users, 
  PlusCircle, 
  MinusCircle, 
  Repeat, 
  AlertTriangle,
  Download,
  Upload,
  Activity
} from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await apiFetch('/admin/stats');
        setStats(data);
      } catch (err) {
        console.error('Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <div className="text-paybee-green animate-pulse">SYNCING WITH CORE...</div>;

  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">SYSTEM <span className="text-paybee-green">OVERVIEW</span></h1>
        <p className="text-slate-500">Live operational data from the PayBee network core.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        <StatCard icon={Users} title="Total Users" value={stats?.totalUsers} status="SYSTEM_READY" />
        <StatCard icon={PlusCircle} title="Total Deposits" value={stats?.totalDeposits} status="WALLET_SYNCED" />
        <StatCard icon={MinusCircle} title="Total Payouts" value={stats?.totalPayouts} status="LIQUIDITY_OK" />
        <StatCard icon={Repeat} title="Total Trades" value={stats?.totalTrades} status="P2P_ACTIVE" />
      </div>

      {/* Secondary Stats / Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-2xl border-paybee-yellow/20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-paybee-yellow flex items-center gap-2">
              <AlertTriangle />
              CRITICAL ACTIONS
            </h2>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Awaiting Verification</span>
          </div>

          <div className="space-y-6">
            <ActionItem 
              icon={Download} 
              title="Pending Deposits" 
              value={stats?.pendingDeposits} 
              color="text-paybee-yellow" 
              bg="bg-paybee-yellow/20" 
            />
            <ActionItem 
              icon={Upload} 
              title="Pending Payouts" 
              value={stats?.pendingPayouts} 
              color="text-red-500" 
              bg="bg-red-500/20" 
            />

            <div className="mt-6">
              <Link to="/admin/deposits" className="btn-primary w-full block text-center py-3 text-xs">OPEN ACTION QUEUE</Link>
            </div>
          </div>
        </div>

        <div className="glass p-8 rounded-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">NETWORK ACTIVITY</h2>
            <Activity className="text-paybee-green" />
          </div>
          <div className="space-y-4">
            <ActivityItem text="New user registered: David K." time="2m ago" color="bg-paybee-green glow-green" />
            <ActivityItem text="Trade #TR-7218 completed: 450 USDT" time="5m ago" color="bg-paybee-yellow" />
            <ActivityItem text="Deposit approved for: Alpha Trader" time="12m ago" color="bg-paybee-green" />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value, status }: any) => (
  <div className="glass p-6 rounded-2xl relative overflow-hidden group">
    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon className="w-32 h-32 text-paybee-green" />
    </div>
    <div className="text-slate-400 text-xs uppercase tracking-widest mb-4">{title}</div>
    <div className="text-4xl font-bold text-white mb-2">{value ?? '---'}</div>
    <div className="text-[10px] text-paybee-green font-bold">{status}</div>
  </div>
);

const ActionItem = ({ icon: Icon, title, value, color, bg }: any) => (
  <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center ${color}`}>
        <Icon />
      </div>
      <div>
        <div className="font-bold">{title}</div>
        <div className="text-xs text-slate-500">Action Required</div>
      </div>
    </div>
    <div className={`text-2xl font-bold ${color}`}>{value ?? 0}</div>
  </div>
);

const ActivityItem = ({ text, time, color }: any) => (
  <div className="flex items-center gap-4 text-sm border-b border-white/5 pb-4">
    <div className={`w-2 h-2 rounded-full ${color}`}></div>
    <div className="flex-1">{text}</div>
    <div className="text-xs text-slate-500">{time}</div>
  </div>
);

export default Dashboard;
