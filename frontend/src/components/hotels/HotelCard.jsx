import React from 'react';
import { Star, MapPin, Waves, Sparkles, Wifi } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HotelCard = ({ hotel }) => {
  const navigate = useNavigate();

  const handleBook = () => {
    navigate('/confirm', { state: { type: 'HOTEL', item: hotel } });
  };

  return (
    <div className="group bg-surface-container-low rounded-[2rem] overflow-hidden editorial-shadow transition-all duration-500 hover:-translate-y-2 border border-transparent hover:border-slate-100">
      <div className="relative h-72 overflow-hidden">
        <img 
          src={hotel.imageUrl || "https://images.unsplash.com/photo-1571011234227-856779781f0a?q=80&w=2070&auto=format&fit=crop"} 
          alt={hotel.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-secondary text-xs font-bold flex items-center gap-1 shadow-sm">
          <Star size={12} fill="currentColor" /> {hotel.rating || '4.9'}
        </div>
        <div className="absolute bottom-4 left-4 flex gap-2">
           <span className="bg-primary-container/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Top Rated</span>
        </div>
      </div>
      
      <div className="p-8 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-headline font-bold text-primary tracking-tight leading-none">{hotel.name}</h3>
            <div className="flex items-center text-on-surface-variant mt-2 text-sm font-medium italic">
              <MapPin size={14} className="mr-1 text-secondary" /> {hotel.location}
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-3xl font-black text-secondary font-headline leading-none">${hotel.pricePerNight}</span>
            <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-[0.2em] mt-1">per night</span>
          </div>
        </div>

        <div className="flex gap-4 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-1 text-xs text-on-surface-variant font-bold uppercase tracking-tighter">
            <Waves size={14} className="text-secondary" /> POOL
          </div>
          <div className="flex items-center gap-1 text-xs text-on-surface-variant font-bold uppercase tracking-tighter">
            <Sparkles size={14} className="text-secondary" /> SPA
          </div>
          <div className="flex items-center gap-1 text-xs text-on-surface-variant font-bold uppercase tracking-tighter">
            <Wifi size={14} className="text-secondary" /> WIFI
          </div>
        </div>

        <button 
          onClick={handleBook}
          className="w-full signature-gradient text-white py-4 rounded-full font-bold text-sm shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all"
        >
          Book Sanctuary
        </button>
      </div>
    </div>
  );
};

export default HotelCard;
