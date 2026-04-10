import React, { useState, useEffect } from 'react';
import FlightSearch from '../components/flights/FlightSearch';
import FlightCard from '../components/flights/FlightCard';
import Loader from '../components/common/Loader';
import { searchFlights } from '../services/flightService';

const Flights = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Initial load
  useEffect(() => {
    handleSearch({});
  }, []);

  const handleSearch = async (params) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await searchFlights(params);
      setFlights(data);
    } catch (err) {
      console.error("Flight search failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen pb-20">
      {/* Search Hero Part */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1544016768-982d1554f0b9?q=80&w=2070&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover brightness-50" 
          alt="Luxury aviation"
        />
        <div className="relative z-10 text-center space-y-4 px-8">
           <span className="text-secondary font-headline font-bold uppercase tracking-[0.3em] text-xs">Aviation Excellence</span>
           <h1 className="text-5xl md:text-7xl font-extrabold text-white font-headline tracking-tighter">Elevated Journeys.</h1>
           <p className="text-slate-300 max-w-lg mx-auto font-medium">Seamless bookings across our global premium aviation network.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-8">
        <FlightSearch onSearch={handleSearch} />

        <div className="mt-20 space-y-12">
          <div className="flex justify-between items-end border-b border-slate-100 pb-8">
            <div>
               <h2 className="text-3xl font-headline font-bold text-primary-container italic">Available Itineraries</h2>
               <p className="text-on-surface-variant font-medium mt-1">Found {flights.length} matches for your selection.</p>
            </div>
            <div className="flex gap-2">
               <span className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary font-bold text-xs ring-1 ring-secondary/20 italic">NEW</span>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center"><Loader /></div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {flights.length > 0 ? (
                flights.map(flight => <FlightCard key={flight.id} flight={flight} />)
              ) : hasSearched && (
                <div className="text-center py-20 bg-white rounded-[3rem] editorial-shadow border border-dashed border-slate-200">
                  <p className="text-on-surface-variant font-headline text-xl font-medium">No flights found for this route.</p>
                  <p className="text-sm text-slate-400 mt-2 italic">Try a different departure city or date.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Flights;
