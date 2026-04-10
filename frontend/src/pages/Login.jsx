import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Check } from 'lucide-react';
import { login as apiLogin } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiLogin(email, password);
      login(data.user, data.token);
      const origin = location.state?.from?.pathname || '/';
      navigate(origin);
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-surface relative overflow-hidden px-8">
      <div className="absolute top-0 -left-20 w-96 h-96 bg-secondary-fixed/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-primary-fixed/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-5xl flex flex-col md:flex-row bg-white rounded-[2rem] overflow-hidden editorial-shadow relative z-10">
        {/* Decorative Side */}
        <div className="hidden md:block md:w-1/2 relative min-h-[600px]">
          <img 
            src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070&auto=format&fit=crop" 
            className="absolute inset-0 w-full h-full object-cover" 
            alt="Beach view"
          />
          <div className="absolute inset-0 bg-primary-container/30 backdrop-blur-[2px]"></div>
          <div className="absolute bottom-12 left-12 right-12 text-white">
            <h2 className="font-headline text-4xl font-extrabold tracking-tight mb-4 leading-tight">Elevating every journey, <br/>from departure to destination.</h2>
            <p className="text-white/80 font-body text-base max-w-sm leading-relaxed italic">Join our exclusive community of travelers and access curated sanctuaries worldwide.</p>
          </div>
        </div>

        {/* Form Side */}
        <div className="w-full md:w-1/2 p-12 md:p-16 flex flex-col justify-center">
          <div className="mb-12">
            <span className="font-headline font-black text-3xl tracking-tighter text-primary-container">TravelNest</span>
          </div>

          <div className="mb-10">
            <h1 className="font-headline text-4xl font-extrabold text-on-surface mb-2 tracking-tight">Welcome back</h1>
            <p className="text-on-surface-variant text-base font-medium">Please enter your details to access your itineraries.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="font-label text-xs font-bold tracking-[0.1em] text-on-surface-variant uppercase ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors" size={20} />
                <input 
                  className="w-full bg-surface-container-low border-none rounded-xl px-12 py-4 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-secondary focus:bg-white transition-all outline-none font-medium" 
                  autoComplete="email" required type="email" placeholder="explorer@travelnest.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-label text-xs font-bold tracking-[0.1em] text-on-surface-variant uppercase ml-1">Password</label>
                <Link to="#" className="text-xs font-bold text-secondary hover:underline transition-all uppercase tracking-widest italic">Forgot?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors" size={20} />
                <input 
                  className="w-full bg-surface-container-low border-none rounded-xl px-12 py-4 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-secondary focus:bg-white transition-all outline-none font-medium" 
                  autoComplete="current-password" required type={showPassword ? "text" : "password"} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                />
                <button 
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3 py-2 pl-1">
              <input className="w-5 h-5 rounded border-outline-variant text-secondary focus:ring-secondary cursor-pointer" id="remember" type="checkbox"/>
              <label className="text-sm text-on-surface-variant cursor-pointer font-medium" htmlFor="remember">Keep me signed in</label>
            </div>

            <button 
              disabled={loading}
              className="signature-gradient w-full py-5 rounded-full text-white font-headline font-bold text-lg tracking-tight shadow-xl shadow-sky-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 flex items-center justify-center" 
              type="submit"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-slate-100 text-center">
            <p className="text-on-surface-variant font-medium">
              Don't have an account? 
              <Link className="text-secondary font-bold hover:underline ml-1" to="/register">Register for free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
