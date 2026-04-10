import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Plane, Hotel, Package, User, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0F172A]/80 backdrop-blur-md shadow-2xl shadow-slate-900/20">
      <nav className="flex justify-between items-center px-8 h-20 max-w-7xl mx-auto font-headline tracking-tight">
        <div className="flex items-center gap-12">
          <Link to="/" className="text-2xl font-extrabold text-white tracking-tighter">TravelNest</Link>
          <div className="hidden md:flex gap-8 items-center">
            <NavLink to="/flights" className={({isActive}) => isActive ? "text-white border-b-2 border-sky-500 pb-1" : "text-slate-300 hover:text-white transition-colors"}>Flights</NavLink>
            <NavLink to="/hotels" className={({isActive}) => isActive ? "text-white border-b-2 border-sky-500 pb-1" : "text-slate-300 hover:text-white transition-colors"}>Hotels</NavLink>
            <NavLink to="/packages" className={({isActive}) => isActive ? "text-white border-b-2 border-sky-500 pb-1" : "text-slate-300 hover:text-white transition-colors"}>Packages</NavLink>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              {user?.role === 'ADMIN' && (
                <NavLink to="/admin" className={({isActive}) => isActive ? "text-white border-b-2 border-emerald-500 pb-1" : "text-emerald-400 font-bold hover:text-white transition-colors uppercase text-xs"}>Dashboard</NavLink>
              )}
              <button className="text-slate-300 hover:text-white transition-colors">
                <Bell size={20} />
              </button>
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                  <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center border-2 border-sky-500/30">
                    <User size={20} className="text-sky-400" />
                  </div>
                  <span className="hidden sm:inline font-medium text-sm">{user?.fullName}</span>
                </Link>
                <button onClick={handleLogout} className="text-slate-300 hover:text-red-400 transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-6">
              <Link to="/login" className="text-slate-300 hover:text-white font-medium text-sm">Sign In</Link>
              <Link to="/register" className="signature-gradient text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-sky-500/20">Sign Up</Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
