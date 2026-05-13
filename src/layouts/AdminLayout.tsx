import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Repeat, 
  Settings, 
  LogOut,
  Menu,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Deposits', path: '/admin/deposits', icon: ArrowDownCircle },
    { name: 'Payouts', path: '/admin/payouts', icon: ArrowUpCircle },
    { name: 'Trades', path: '/admin/trades', icon: Repeat },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="bg-paybee-black text-white min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 h-screen sticky top-0 flex flex-col hidden lg:flex border-r border-paybee-green/10">
        <div className="p-6 border-b border-paybee-green/10 flex items-center gap-3">
          <img src="/paybee_logo.png" alt="PayBee" className="w-10 h-10 object-contain" />
          <div>
            <span className="font-display font-bold tracking-tighter text-lg">PAYBEE</span>
            <span className="block text-[10px] text-paybee-green -mt-1 font-bold uppercase">Control Center</span>
          </div>
        </div>

        <nav className="flex-1 mt-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-6 py-3 text-sm transition-all border-r-2 ${
                  isActive 
                    ? 'bg-paybee-green/10 text-paybee-green border-paybee-green' 
                    : 'text-slate-500 border-transparent hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-paybee-green/10">
          <button 
            onClick={handleLogout}
            className="flex items-center text-slate-500 hover:text-red-500 transition-colors w-full"
          >
            <LogOut className="w-5 h-5 mr-3" />
            System Exit
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 flex items-center justify-between px-8 sticky top-0 z-50 bg-paybee-black/80 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2"><Menu /></button>
            <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">
              Terminal / {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold uppercase">
                Operator: <span className="text-paybee-green">{user?.fullName || 'ADMIN'}</span>
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-tighter">Status: Online</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-paybee-green/20 border border-paybee-green/40 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-paybee-green" />
            </div>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
