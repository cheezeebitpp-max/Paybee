import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, token } = useAuth();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (token) navigate('/admin');
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      login(data.user, data.token);
      navigate('/admin');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cyber-hex cyber-grid min-h-screen flex items-center justify-center p-4 bg-paybee-black">
      <div className="glass w-full max-w-md p-8 rounded-2xl border-paybee-green/30 animate-fade-in">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <img src="/paybee_logo.png" alt="PayBee Logo" className="w-32 h-32 object-contain filter drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
          </div>
          <h1 className="text-3xl font-display text-white tracking-widest mb-2 font-bold italic">
            PAYBEE <span className="text-paybee-green">ADMIN</span>
          </h1>
          <p className="text-slate-500 text-xs uppercase tracking-[0.3em]">Authorized Personnel Only</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-xs uppercase tracking-widest text-paybee-green mb-2 font-bold" htmlFor="email">
              Admin Terminal ID (Email)
            </label>
            <input 
              type="email" 
              id="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-paybee-black border border-paybee-green/30 rounded-lg p-3 text-white focus:outline-none focus:border-paybee-green transition-all"
              placeholder="admin@paybee.com"
            />
          </div>

          <div className="mb-8">
            <label className="block text-xs uppercase tracking-widest text-paybee-green mb-2 font-bold" htmlFor="password">
              Security Protocol (Password)
            </label>
            <input 
              type="password" 
              id="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-paybee-black border border-paybee-green/30 rounded-lg p-3 text-white focus:outline-none focus:border-paybee-green transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-4 text-sm font-bold tracking-widest shadow-paybee-yellow/20 disabled:opacity-50"
          >
            {loading ? 'AUTHENTICATING...' : 'LOGIN TO TERMINAL'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-600 uppercase tracking-widest leading-loose">
            Secure connection established via Port 443<br />
            Encryption: AES-256 GCM<br />
            © 2026 PAYBEE CORE SYSTEMS
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
