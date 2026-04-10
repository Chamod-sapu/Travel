import React, { useState } from 'react';
import { MapPin, Calendar, Search } from 'lucide-react';

const HotelSearch = ({ onSearch }) => {
  const [params, setParams] = useState({ location: '', checkIn: '', checkOut: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(params);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl editorial-shadow grid grid-cols-1 md:grid-cols-4 gap-6 items-end max-w-6xl mx-auto -mt-12 relative z-10 border border-slate-100">
      <div className="space-y-2 pl-2">
        <label className="block text-[10px] font-bold text-on-surface-variant tracking-[0.2em] uppercase">Location</label>
        <div className="relative group">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary text-sm" size={18} />
          <input 
            className="w-full pl-10 pr-4 py-3 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-secondary focus:bg-white transition-all text-sm font-medium" 
            placeholder="Where are you going?" 
            type="text"
            value={params.location}
            onChange={(e) => setParams({...params, location: e.target.value})}
            required
          />
        </div>
      </div>
      <div className="space-y-2 pl-2">
        <label className="block text-[10px] font-bold text-on-surface-variant tracking-[0.2em] uppercase">Check-in</label>
        <div className="relative group">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary text-sm" size={18} />
          <input 
            className="w-full pl-10 pr-4 py-3 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-secondary focus:bg-white transition-all text-sm font-medium" 
            type="date"
            value={params.checkIn}
            onChange={(e) => setParams({...params, checkIn: e.target.value})}
            required
          />
        </div>
      </div>
      <div className="space-y-2 pl-2">
        <label className="block text-[10px] font-bold text-on-surface-variant tracking-[0.2em] uppercase">Check-out</label>
        <div className="relative group">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary text-sm" size={18} />
          <input 
            className="w-full pl-10 pr-4 py-3 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-secondary focus:bg-white transition-all text-sm font-medium" 
            type="date"
            value={params.checkOut}
            onChange={(e) => setParams({...params, checkOut: e.target.value})}
            required
          />
        </div>
      </div>
      <button 
        onClick={handleSubmit}
        className="signature-gradient text-white font-bold py-3 px-8 rounded-full h-[48px] flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-sky-500/20 text-sm"
      >
        <Search size={18} /> Search Stays
      </button>
    </div>
  );
};

export default HotelSearch;
