import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Info, ArrowRight, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import gsap from 'gsap';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    countryCode: '+91'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { isAuthenticated, user } = useAuth();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
          phone: `${formData.countryCode}${formData.phone}`
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(true);
      // Wait 2 seconds then redirect to login
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-[#2E7D32]" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-[#0F1014]">Registration Successful!</h2>
          <p className="text-gray-500">Your account has been created. Redirecting you to the login page...</p>
          <div className="animate-pulse flex justify-center">
             <div className="h-1 w-24 bg-[#2E7D32] rounded"></div>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="inline-block px-4 py-1.5 rounded-full border border-[#2E7D32]/30 bg-[#2E7D32]/10 text-[#7CB342] text-xs font-bold tracking-wide mb-8 uppercase">
            Secure P2P Network
          </div>
          <h1 className="font-display text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
            Join the <br />Global Crypto <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7CB342] to-[#FFC107]">Swarm.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md leading-relaxed mb-12">
            Convert USDT to local currency safely. Every account is admin-verified and protected by our hard-lock escrow engine.
          </p>

          <div className="relative w-48 h-48 animate-float">
             <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#2E7D32]/20 to-transparent border border-[#2E7D32]/50 transform -rotate-12" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}></div>
             <div className="absolute inset-4 rounded-3xl bg-[#0F1014] border-2 border-[#FFC107]/30 flex items-center justify-center transform rotate-6 shadow-[0_0_30px_rgba(255,193,7,0.15)]" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}>
                <span className="text-5xl font-bold text-[#FFC107]">₮</span>
             </div>
          </div>
        </div>

        <div className="relative z-10 flex gap-8 text-sm text-gray-400 branding-content">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#7CB342]"></div>
            Admin Verified
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#7CB342]"></div>
            Escrow Protected
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Form */}
      <div className="w-full lg:w-[55%] bg-white h-full overflow-y-auto custom-scroll">
        <div className="w-full max-w-2xl mx-auto px-6 py-24 sm:px-12 lg:px-20">
          
          <div className="mb-10 form-element opacity-0 translate-y-4">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0F1014] mb-3">Create an Account</h2>
            <p className="text-gray-500 text-base">Already have an account? <Link to="/login" className="text-[#2E7D32] font-bold hover:text-[#7CB342] transition-colors">Log in here</Link></p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 form-element opacity-0 translate-y-4">
              <div className="w-full">
                <input 
                  type="text" id="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-800 outline-none transition-all focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]"
                  placeholder="First Name"
                  required
                />
              </div>
              <div className="w-full">
                <input 
                  type="text" id="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-800 outline-none transition-all focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]"
                  placeholder="Last Name"
                  required
                />
              </div>
            </div>

            <div className="form-element opacity-0 translate-y-4">
              <input 
                type="email" id="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-800 outline-none transition-all focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]"
                placeholder="Email Address"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-6 form-element opacity-0 translate-y-4">
              <div className="w-full sm:w-1/3">
                <select 
                  id="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-800 outline-none transition-all focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32] appearance-none cursor-pointer"
                >
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+971">🇦🇪 +971</option>
                </select>
              </div>
              <div className="w-full sm:w-2/3">
                <input 
                  type="tel" id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-800 outline-none transition-all focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]"
                  placeholder="Phone Number"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 form-element opacity-0 translate-y-4">
              <div className="w-full relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
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
              <div className="w-full">
                <input 
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-800 outline-none transition-all focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]"
                  placeholder="Confirm Password"
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 form-element opacity-0 translate-y-4">
              <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-800">
                <strong>Admin Approval Required:</strong> Your account will be reviewed manually. After registration, you will be prompted to complete identity verification (KYC) before you can trade.
              </p>
            </div>

            <div className="flex items-start gap-3 pt-2 form-element opacity-0 translate-y-4">
              <input id="terms" type="checkbox" className="mt-1 w-4 h-4 text-[#2E7D32] border-gray-300 rounded focus:ring-[#2E7D32]" required />
              <label htmlFor="terms" className="text-sm text-gray-500 cursor-pointer">
                I agree to the <Link to="/terms" className="text-[#2E7D32] hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-[#2E7D32] hover:underline">Privacy Policy</Link>.
              </label>
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
                    Create Account
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

export default Register;
