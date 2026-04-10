import React from 'react';
import { Plane, TrendingUp, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FlightCard = ({ flight }) => {
  const navigate = useNavigate();

  const handleBook = () => {
    navigate('/confirm', { state: { type: 'FLIGHT', item: flight } });
  };

  return (
    <div className="bg-surface-container-low hover:bg-white rounded-[2rem] p-8 transition-all duration-300 group flex flex-col md:flex-row items-center gap-8 editorial-shadow border border-transparent hover:border-slate-100">
      <div className="flex items-center space-x-6 min-w-[200px]">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-50">
          <Plane size={32} className="text-secondary" />
        </div>
        <div>
          <p className="font-headline font-bold text-primary-container text-lg leading-tight">{flight.flightNumber}</p>
          <p className="text-sm font-bold text-outline uppercase tracking-widest mt-1 italic">SkyBound Air</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-between px-8 w-full">
        <div className="text-center md:text-left">
          <p className="text-2xl font-extrabold text-primary-container font-headline">
            {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-sm font-bold text-secondary uppercase italic">{flight.origin}</p>
        </div>

        <div className="flex-1 flex flex-col items-center px-6 opacity-30 group-hover:opacity-100 transition-all duration-500">
          <div className="w-full h-[2px] bg-slate-200 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-container-low group-hover:bg-white transition-colors px-2 text-secondary">
              <Plane size={14} fill="currentColor" />
            </div>
          </div>
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] mt-3 text-outline flex items-center gap-1">
            <Clock size={10} /> DIRECT
          </p>
        </div>

        <div className="text-center md:text-right">
          <p className="text-2xl font-extrabold text-primary-container font-headline">
            {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-sm font-bold text-secondary uppercase italic">{flight.destination}</p>
        </div>
      </div>

      <div className="flex items-center space-x-8 md:border-l border-slate-200 md:pl-8 w-full md:w-auto justify-between md:justify-start">
        <div className="text-right">
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest leading-none">Price per traveler</p>
          <p className="text-3xl font-black text-secondary font-headline mt-1">${flight.price}</p>
        </div>
        <button 
          onClick={handleBook}
          className="px-10 py-4 signature-gradient text-white font-bold rounded-full shadow-lg shadow-sky-500/20 active:scale-95 transition-all whitespace-nowrap text-sm"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default FlightCard;
