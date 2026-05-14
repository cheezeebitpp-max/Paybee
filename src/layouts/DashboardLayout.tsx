import React, { useState } from 'react';
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
  User as UserIcon,
  FileText,
  Shield,
  Search,
  Bell,
  CheckCircle,
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define Navigation Items based on Role
  const getNavItems = () => {
    const commonItems = [
      { name: 'Settings', path: '/settings', icon: Settings },
    ];

    if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') {
      return [
        { name: 'Admin Home', path: '/admin', icon: Shield },
        { name: 'Manage Users', path: '/admin/users', icon: Users },
        { name: 'Deposits', path: '/admin/deposits', icon: ArrowDownCircle },
        { name: 'Payouts', path: '/admin/payouts', icon: ArrowUpCircle },
        { name: 'Trades', path: '/admin/trades', icon: Repeat },
        { name: 'Content CMS', path: '/admin/cms', icon: FileText },
        ...commonItems
      ];
    }

    return [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'P2P Market', path: '/market', icon: TrendingUp },
      { name: 'My Wallet', path: '/wallet', icon: ArrowDownCircle },
      { name: 'Active Trades', path: '/trades', icon: Repeat, badge: 1 },
      { name: 'Trade History', path: '/history', icon: FileText },
      ...commonItems
    ];
  };

  const navItems = getNavItems();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <div className="min-h-screen flex bg-[#F3F4F6] text-gray-800">
      
      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        bg-[#0F1014] border-r border-gray-800
      `}>
        {/* Logo Section */}
        <div className="h-20 flex items-center px-6 border-b border-gray-800">
          <Link to="/" className="flex items-center gap-3">
             <img src="/logo.webp" alt="PayBee" className="h-10 w-auto object-contain" />
             <div className="flex flex-col">
               <span className="font-display font-bold text-white tracking-tighter text-lg leading-none">PAYBEE</span>
               {isAdmin && <span className="text-[10px] text-[#7CB342] font-bold uppercase tracking-widest mt-1">Admin Core</span>}
             </div>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scroll">
          <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
            {isAdmin ? 'System Menu' : 'Main Navigation'}
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-xl transition-all group
                  ${isActive 
                    ? 'bg-[#2E7D32]/20 text-[#7CB342] border border-[#2E7D32]/30' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#7CB342]' : 'text-gray-500 group-hover:text-white'}`} />
                  <span className="font-medium">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="bg-[#FFC107] text-[#0F1014] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-8">
             <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-all group"
              >
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">System Exit</span>
              </button>
          </div>
        </nav>

        {/* User Badge at bottom */}
        <div className={`p-4 border-t ${isAdmin ? 'border-gray-800 bg-[#0B121F]' : 'border-gray-800 bg-[#1A1A1A]/50'}`}>
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2E7D32] flex items-center justify-center font-bold text-white relative">
                {user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#7CB342] rounded-full border-2 border-[#111827] flex items-center justify-center">
                  <CheckCircle className="w-2 h-2 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold text-white leading-none">{user?.fullName || 'User Session'}</p>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tighter">
                  {user?.role.replace('_', ' ')} • Online
                </p>
              </div>
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="h-20 flex items-center justify-between px-6 shrink-0 z-20 border-b bg-white border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-800"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Context Breadcrumb */}
            <div className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
               <span className={isAdmin ? 'text-gray-600' : 'text-gray-400'}>Terminal</span>
               <span>/</span>
               <span className={isAdmin ? 'text-[#7CB342]' : 'text-[#2E7D32]'}>
                 {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
               </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className={`
              hidden md:flex items-center rounded-full px-4 py-2 w-64 lg:w-96 border transition-all
              ${isAdmin 
                ? 'bg-[#1F2937] border-gray-700 focus-within:border-[#2E7D32]' 
                : 'bg-gray-100 border-transparent focus-within:bg-white focus-within:border-[#2E7D32]'}
            `}>
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="bg-transparent border-none outline-none text-sm ml-2 w-full text-inherit"
              />
            </div>

            <button className={`p-2 rounded-full transition-colors relative ${isAdmin ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-400 hover:bg-gray-100'}`}>
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-inherit"></span>
            </button>

            <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>

            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className={`text-sm font-bold leading-none ${isAdmin ? 'text-white' : 'text-gray-800'}`}>
                  {user?.fullName || 'John Doe'}
                </p>
                <p className="text-[10px] font-bold text-[#2E7D32] uppercase tracking-wide">
                  Verified Level 2
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative custom-scroll">
           {/* Subtle BG pattern */}
           <div className={`absolute inset-0 pointer-events-none opacity-[0.03] ${isAdmin ? 'invert' : ''}`}
                style={{ backgroundImage: 'radial-gradient(#1A1A1A 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
           </div>
           
           <div className="max-w-7xl mx-auto relative z-10">
              <Outlet />
           </div>
        </main>
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
