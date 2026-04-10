import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, CheckCircle } from 'lucide-react';
import { register } from '../services/authService';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register({ fullName, email, password });
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-surface relative overflow-hidden px-8">
      <div className="absolute top-0 -left-20 w-96 h-96 bg-secondary-fixed/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-lg relative">
        <div className="relative bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 overflow-hidden border border-slate-50">
          <div className="h-2 w-full absolute top-0 left-0 signature-gradient"></div>
          
          <div className="mb-10 text-center">
            <h1 className="font-headline text-4xl font-extrabold text-on-surface tracking-tighter mb-2">Join the journey.</h1>
            <p className="text-on-surface-variant font-medium italic">Create an account to start planning your next sanctuary.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold">
               {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="space-y-2">
              <label className="block text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant italic ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors" size={20} />
                <input 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface-container-low border-none focus:ring-2 focus:ring-secondary/20 focus:bg-white transition-all font-medium placeholder:text-outline/40" 
                  placeholder="Your Name" required type="text"
                  value={fullName} onChange={e => setFullName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant italic ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors" size={20} />
                <input 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface-container-low border-none focus:ring-2 focus:ring-secondary/20 focus:bg-white transition-all font-medium placeholder:text-outline/40" 
                  placeholder="voyager@travelnest.com" required type="email"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant italic ml-1">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors" size={20} />
                <input 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface-container-low border-none focus:ring-2 focus:ring-secondary/20 focus:bg-white transition-all font-medium placeholder:text-outline/40" 
                  placeholder="••••••••" required type="password"
                  value={password} onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                disabled={loading}
                className="w-full signature-gradient text-white font-headline font-bold py-5 px-8 rounded-full shadow-xl shadow-sky-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50" 
                type="submit"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="font-body text-on-surface-variant font-medium">
              Already a member? 
              <Link className="text-secondary font-bold hover:underline ml-1 italic" to="/login">Sign In</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl flex items-center gap-3 border border-white shadow-sm">
            <div className="w-10 h-10 rounded-full signature-gradient flex items-center justify-center text-white">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container leading-none">Global Access</p>
              <p className="text-[10px] text-on-surface-variant mt-1 italic">Explore worldwide</p>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl flex items-center gap-3 border border-white shadow-sm">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white">
              <Lock size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container leading-none">Cloud Secured</p>
              <p className="text-[10px] text-on-surface-variant mt-1 italic">Your privacy matters</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
