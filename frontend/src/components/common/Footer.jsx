import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 w-full py-12 font-body text-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-8 max-w-7xl mx-auto">
        <div className="col-span-1">
          <span className="text-2xl font-black text-slate-900 block mb-4 tracking-tighter">TravelNest</span>
          <p className="text-slate-500 mb-6 leading-relaxed">Redefining the standards of travel. Your journey, our masterpiece.</p>
        </div>
        <div>
          <h5 className="font-bold text-slate-900 mb-4 font-headline uppercase tracking-tighter italic">Explore</h5>
          <ul className="space-y-3">
            <li><Link className="text-slate-500 hover:text-secondary transition-all" to="/flights">Flights</Link></li>
            <li><Link className="text-slate-500 hover:text-secondary transition-all" to="/hotels">Hotels</Link></li>
            <li><Link className="text-slate-500 hover:text-secondary transition-all" to="/packages">Packages</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-slate-900 mb-4 font-headline uppercase tracking-tighter italic">Support</h5>
          <ul className="space-y-3">
            <li><a className="text-slate-500 hover:text-secondary transition-all" href="#">Help Center</a></li>
            <li><a className="text-slate-500 hover:text-secondary transition-all" href="#">Privacy Policy</a></li>
            <li><a className="text-slate-500 hover:text-secondary transition-all" href="#">Terms of Service</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-slate-900 mb-4 font-headline uppercase tracking-tighter italic">Stay Updated</h5>
          <div className="flex bg-white rounded-full p-1 shadow-sm border border-slate-200">
            <input className="bg-transparent border-none focus:ring-0 px-4 py-2 w-full text-xs" placeholder="Email address" type="email"/>
            <button className="signature-gradient text-white px-4 py-2 rounded-full text-xs font-bold">Join</button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-8 pt-12 mt-12 border-t border-slate-200 text-center text-slate-400">
        <p>© 2024 TravelNest. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
