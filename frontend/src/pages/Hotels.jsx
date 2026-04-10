import React, { useState, useEffect } from 'react';
import HotelSearch from '../components/hotels/HotelSearch';
import HotelCard from '../components/hotels/HotelCard';
import Loader from '../components/common/Loader';
import { searchHotels } from '../services/hotelService';

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    handleSearch({});
  }, []);

  const handleSearch = async (params) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await searchHotels(params);
      setHotels(data);
    } catch (err) {
      console.error("Hotel search failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen pb-20 font-body">
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover brightness-50" 
          alt="Hotels hero"
        />
        <div className="relative z-10 text-center space-y-4 px-8">
           <span className="text-secondary font-headline font-bold uppercase tracking-[0.3em] text-xs">Curated Sanctuaries</span>
           <h1 className="text-5xl md:text-7xl font-extrabold text-white font-headline tracking-tighter leading-none">Stay Somewhere <br/><span className="text-secondary-container">Extraordinary.</span></h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-8">
        <HotelSearch onSearch={handleSearch} />

        <div className="mt-20">
          <div className="flex items-center justify-between mb-12 border-b border-slate-100 pb-8">
            <h2 className="text-3xl font-headline font-bold text-primary tracking-tight italic">Our Curated Stays</h2>
            <div className="flex gap-4">
               <button className="px-4 py-2 border border-slate-200 rounded-full text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-slate-50">Filter Stays</button>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center"><Loader /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {hotels.length > 0 ? (
                hotels.map(hotel => <HotelCard key={hotel.id} hotel={hotel} />)
              ) : hasSearched && (
                <div className="col-span-full text-center py-20 bg-white rounded-[3rem] shadow-sm border border-dashed border-slate-200 font-headline italic text-on-surface-variant text-xl">
                  No availability found for the selected criteria.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hotels;
