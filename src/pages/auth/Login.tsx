import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import gsap from 'gsap';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const target = (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? '/admin' : '/dashboard';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Animations
  useEffect(() => {
    gsap.from(".branding-content > *", {
      x: -30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "power3.out",
      delay: 0.2
    });

    gsap.to(".form-element", {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.08,
      ease: "power2.out",
      delay: 0.4
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      login(data.user, data.token);
      
      // Redirect based on role
      const target = (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') ? '/admin' : '/dashboard';
      navigate(target);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white text-[#1A1A1A] font-sans antialiased selection:bg-[#7CB342] selection:text-[#0F1014] h-screen flex overflow-hidden">
      
      {/* LEFT PANEL: Branding & Aesthetics */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0F1014] relative flex-col justify-between p-12 overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#2E7D32]/20 rounded-full filter blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-[#FFC107]/10 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        </div>

        <div className="relative z-10 flex justify-between items-center">
          <Link to="/">
            <img src="/logo.webp" alt="PayBee" className="h-12 w-auto object-contain scale-110 origin-left" />
          </Link>
          <Link to="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Home
          </Link>
        </div>

        <div className="relative z-10 my-auto branding-content">
          <div className="inline-block px-4 py-1.5 rounded-full border border-[#FFC107]/30 bg-[#FFC107]/10 text-[#FFC107] text-xs font-bold tracking-wide mb-8 uppercase">
            Welcome Back
          </div>
          <h1 className="font-display text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
            Access Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7CB342] to-[#FFC107]">Secure Vault.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md leading-relaxed mb-12">
            Log in to manage your USDT, view active trades, confirm bank transfers, and track your ledger history.
          </p>

          <div className="relative w-48 h-48 animate-bounce" style={{ animationDuration: '4s' }}>
             <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#2E7D32]/20 to-transparent border border-[#2E7D32]/50 transform rotate-12"></div>
             <div className="absolute inset-4 rounded-3xl bg-[#0F1014] border-2 border-[#7CB342]/30 flex items-center justify-center transform -rotate-6 shadow-[0_0_30px_rgba(124,179,66,0.15)]">
                <Shield className="w-16 h-16 text-[#7CB342] drop-shadow-[0_0_15px_rgba(124,179,66,0.8)]" />
             </div>
          </div>
        </div>

        <div className="relative z-10 flex gap-8 text-sm text-gray-400 branding-content">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#7CB342]"></div>
            AES-256 Encrypted
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#7CB342]"></div>
            2FA Protected
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Login Form */}
      <div className="w-full lg:w-[55%] bg-white h-full overflow-y-auto custom-scroll flex items-center justify-center">
        <div className="w-full max-w-xl px-6 py-24 sm:px-12 lg:px-20">
          
          <div className="mb-10 form-element opacity-0 translate-y-4">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0F1014] mb-3">Log In</h2>
            <p className="text-gray-500 text-base">New to PayBee? <Link to="/register" className="text-[#2E7D32] font-bold hover:text-[#7CB342] transition-colors">Create an account</Link></p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative form-element opacity-0 translate-y-4">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-800 outline-none transition-all focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]"
                placeholder="Email Address"
                required
              />
            </div>

            <div className="relative form-element opacity-0 translate-y-4">
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-800 outline-none transition-all focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]"
                placeholder="Password"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 form-element opacity-0 translate-y-4">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-4 w-4 text-[#2E7D32] border-gray-300 rounded focus:ring-[#2E7D32]" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer">Remember me</label>
              </div>
              <Link to="/forgot-password" size-sm className="font-bold text-[#2E7D32] hover:text-[#7CB342] text-sm">Forgot password?</Link>
            </div>

            <div className="pt-4 form-element opacity-0 translate-y-4">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0F1014] text-white font-bold rounded-xl py-4 hover:bg-[#2E7D32] transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Log In
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-400 mt-12 form-element opacity-0">
            Protected by 256-bit SSL encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
