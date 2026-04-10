import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyFlightBookings } from '../services/flightService';
import { getMyHotelBookings } from '../services/hotelService';
import { getMyPackageBookings } from '../services/packageService';
import Loader from '../components/common/Loader';
import { Plane, Hotel, Package, User, Hash, Calendar, DollarSign, ChevronRight, Compass } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState({ flights: [], hotels: [], packages: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [flights, hotels, packages] = await Promise.all([
          getMyFlightBookings(),
          getMyHotelBookings(),
          getMyPackageBookings()
        ]);
        setBookings({ flights, hotels, packages });
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Left Sidebar: User Profile */}
        <aside className="md:w-1/3 lg:w-1/4">
           <div className="bg-white rounded-[2.5rem] p-10 editorial-shadow text-center border border-slate-50 space-y-8 sticky top-28">
              <div className="relative inline-block">
                 <div className="w-32 h-32 rounded-[2.5rem] signature-gradient flex items-center justify-center p-1 mx-auto">
                    <div className="w-full h-full bg-white rounded-[2.2rem] flex items-center justify-center">
                       <User size={64} className="text-secondary" />
                    </div>
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-secondary rounded-2xl flex items-center justify-center text-white border-4 border-white">
                    <Hash size={18} />
                 </div>
              </div>
              <div>
                 <h2 className="text-3xl font-headline font-black text-primary-container tracking-tighter">{user?.fullName}</h2>
                 <p className="text-on-surface-variant font-medium text-sm italic mt-1">{user?.email}</p>
              </div>
              <div className="pt-8 border-t border-slate-100 flex justify-center gap-4">
                 <div className="text-center">
                    <p className="text-xl font-headline font-black text-secondary">{bookings.flights.length + bookings.hotels.length + bookings.packages.length}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-outline italic">Voyages</p>
                 </div>
                 <div className="w-[1px] h-10 bg-slate-100"></div>
                 <div className="text-center">
                    <p className="text-xl font-headline font-black text-secondary">Elite</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-outline italic">Status</p>
                 </div>
              </div>
              <button className="w-full py-4 border-2 border-slate-100 rounded-full text-xs font-bold uppercase tracking-widest hover:border-secondary/20 hover:text-secondary transition-all italic">Edit Sanctuary Profile</button>
           </div>
        </aside>

        {/* Right Content: Bookings */}
        <div className="flex-1 space-y-12">
           <section className="space-y-4">
              <h1 className="text-4xl font-headline font-black text-primary-container tracking-tighter italic">Your Voyages</h1>
              <p className="text-on-surface-variant font-medium text-lg italic">A chronicle of your curated travels with TravelNest.</p>
           </section>

           {loading ? (
             <div className="py-20 flex justify-center"><Loader /></div>
           ) : (
             <div className="space-y-10">
                {/* Flights */}
                {bookings.flights.length > 0 && (
                  <div className="space-y-6">
                     <div className="flex items-center gap-3 text-secondary italic">
                        <Plane size={24} />
                        <h3 className="font-headline font-bold text-xl uppercase tracking-widest italic">Flight Bookings</h3>
                     </div>
                     <div className="grid gap-4">
                        {bookings.flights.map(b => (
                          <div key={b.id} className="bg-white p-6 rounded-3xl editorial-shadow flex items-center justify-between border border-slate-50 group hover:-translate-y-1 transition-all duration-300">
                             <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-secondary">
                                   <Plane size={24} />
                                </div>
                                <div>
                                   <p className="font-headline font-bold text-lg leading-tight uppercase tracking-tighter italic">Booking #{b.id}</p>
                                   <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">Status: <span className="text-secondary">{b.status}</span></p>
                                </div>
                             </div>
                             <div className="flex items-center gap-12 italic">
                                <div>
                                   <p className="text-[8px] font-black uppercase tracking-[0.2em] text-outline mb-1">Seats</p>
                                   <p className="text-sm font-bold text-on-surface-variant">{b.seats}</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-[8px] font-black uppercase tracking-[0.2em] text-outline mb-1">Total</p>
                                   <p className="text-sm font-bold text-secondary">${b.totalPrice}</p>
                                </div>
                                <ChevronRight size={20} className="text-slate-200 group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                )}

                {/* Hotels */}
                {bookings.hotels.length > 0 && (
                  <div className="space-y-6">
                     <div className="flex items-center gap-3 text-secondary italic">
                        <Hotel size={24} />
                        <h3 className="font-headline font-bold text-xl uppercase tracking-widest italic">Hotel Bookings</h3>
                     </div>
                     <div className="grid gap-4">
                        {bookings.hotels.map(b => (
                          <div key={b.id} className="bg-white p-6 rounded-3xl editorial-shadow flex items-center justify-between border border-slate-50 group hover:-translate-y-1 transition-all">
                             <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-secondary">
                                   <Hotel size={24} />
                                </div>
                                <div>
                                   <p className="font-headline font-bold text-lg leading-tight uppercase tracking-tighter italic">Booking #{b.id}</p>
                                   <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60 italic">STAY: <span className="text-secondary">{b.checkIn} — {b.checkOut}</span></p>
                                </div>
                             </div>
                             <div className="flex items-center gap-12 italic">
                                <div className="text-right">
                                   <p className="text-[8px] font-black uppercase tracking-[0.2em] text-outline mb-1">Total Paid</p>
                                   <p className="text-sm font-bold text-secondary">${b.totalPrice}</p>
                                </div>
                                <ChevronRight size={20} className="text-slate-200 group-hover:text-secondary" />
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                )}

                {/* Empty State */}
                {bookings.flights.length === 0 && bookings.hotels.length === 0 && bookings.packages.length === 0 && (
                  <div className="py-32 bg-white rounded-[3rem] editorial-shadow text-center space-y-6 border border-dashed border-slate-200">
                     <div className="w-20 h-20 rounded-full bg-surface mx-auto flex items-center justify-center text-slate-300">
                        <Compass size={40} className="animate-spin-slow" />
                     </div>
                     <p className="text-xl font-headline font-bold text-on-surface-variant italic">No voyages charted yet.</p>
                     <p className="text-sm text-slate-400 max-w-xs mx-auto italic font-medium">Your next extraordinary experience is waiting to be booked.</p>
                  </div>
                )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
