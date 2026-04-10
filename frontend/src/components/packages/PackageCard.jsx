import React from 'react';
import { Clock, MapPin, Users, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PackageCard = ({ pkg }) => {
  const navigate = useNavigate();

  const handleBook = () => {
    navigate('/confirm', { state: { type: 'PACKAGE', item: pkg } });
  };

  return (
    <div className="group bg-white rounded-[2.5rem] overflow-hidden editorial-shadow flex flex-col md:flex-row h-auto md:h-80 transition-all duration-500 hover:shadow-2xl border border-slate-50">
      <div className="md:w-1/3 relative h-64 md:h-full overflow-hidden">
        <img 
          src={pkg.imageUrl || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop"} 
          alt={pkg.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute top-4 left-4 bg-primary-container/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
          Bestseller
        </div>
      </div>

      <div className="flex-1 p-8 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-3xl font-headline font-bold text-primary-container tracking-tight leading-none group-hover:text-secondary transition-colors">{pkg.title}</h3>
            <div className="text-right">
              <span className="text-3xl font-black text-secondary font-headline">${pkg.price}</span>
              <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest leading-none mt-1">Full Experience</p>
            </div>
          </div>
          <p className="text-on-surface-variant font-medium text-sm flex items-center gap-1 italic mb-4">
            <MapPin size={14} className="text-secondary" /> {pkg.destination}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 pt-4 border-t border-slate-100">
             <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-tighter">
                <Clock size={14} className="text-secondary" /> {pkg.durationDays} DAYS
             </div>
             <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-tighter">
                <Users size={14} className="text-secondary" /> UP TO {pkg.maxPeople} GUESTS
             </div>
             <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-tighter">
                <CheckCircle2 size={14} className="text-secondary" /> CONCIERGE INCLUDED
             </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-6 pt-6 mt-4 border-t border-slate-50">
           <p className="text-sm text-slate-500 line-clamp-1 max-w-sm">{pkg.description}</p>
           <button 
             onClick={handleBook}
             className="signature-gradient text-white px-10 py-3.5 rounded-full font-bold text-sm shadow-lg shadow-sky-500/10 active:scale-95 transition-all whitespace-nowrap"
           >
             Book Package
           </button>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
