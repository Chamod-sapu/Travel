import React, { useState } from 'react';
import { MapPin, Compass, Calendar, Search } from 'lucide-react';

const FlightSearch = ({ onSearch }) => {
  const [params, setParams] = useState({ origin: '', destination: '', date: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(params);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-2xl shadow-slate-900/10 max-w-6xl mx-auto -mt-12 relative z-10 border border-slate-100">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-on-primary-container tracking-wider uppercase pl-1">Origin</label>
          <div className="relative group">
            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors" />
            <input 
              className="w-full pl-12 pr-4 py-4 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-secondary focus:bg-white transition-all text-sm font-medium" 
              placeholder="London (LHR)" 
              type="text"
              value={params.origin}
              onChange={(e) => setParams({...params, origin: e.target.value})}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-bold text-on-primary-container tracking-wider uppercase pl-1">Destination</label>
          <div className="relative group">
            <Compass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors" />
            <input 
              className="w-full pl-12 pr-4 py-4 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-secondary focus:bg-white transition-all text-sm font-medium" 
              placeholder="New York (JFK)" 
              type="text"
              value={params.destination}
              onChange={(e) => setParams({...params, destination: e.target.value})}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-bold text-on-primary-container tracking-wider uppercase pl-1">Date</label>
          <div className="relative group">
            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors" />
            <input 
              className="w-full pl-12 pr-4 py-4 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-secondary focus:bg-white transition-all text-sm font-medium" 
              type="date"
              value={params.date}
              onChange={(e) => setParams({...params, date: e.target.value})}
              required
            />
          </div>
        </div>
        <div className="flex items-end">
          <button className="signature-gradient w-full py-4 rounded-full text-white font-bold shadow-lg shadow-sky-500/20 hover:scale-[1.02] active:scale-95 transition-all text-sm flex items-center justify-center gap-2" type="submit">
            <Search size={18} /> Search Flights
          </button>
        </div>
      </form>
    </div>
  );
};

export default FlightSearch;
