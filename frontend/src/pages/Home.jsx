import React, { useState } from 'react';
import { Plane, Hotel, Package, Search, MapPin, Calendar, Compass, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const [activeTab, setActiveTab] = useState('flights');
  const navigate = useNavigate();

  const featuredDestinations = [
    { title: "Kyoto, Japan", category: "CULTURAL ESCAPE", desc: "Experience the timeless beauty of ancient temples and tranquil bamboo groves.", img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop" },
    { title: "Santorini, Greece", desc: "Sun-drenched vistas and blue-domed wonders.", img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2040&auto=format&fit=crop" },
    { title: "St. Moritz, Switzerland", desc: "Elevated alpine luxury in the heart of the Engadin.", img: "https://images.unsplash.com/photo-1502901664419-fa1ac68a733e?q=80&w=2070&auto=format&fit=crop" }
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            className="w-full h-full object-cover brightness-[0.85]" 
            src="https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=2070&auto=format&fit=crop" 
            alt="Beach serenity"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary-container/40 to-surface"></div>
        </div>
        
        <div className="container mx-auto px-8 relative z-10 pt-20">
          <div className="max-w-4xl">
            <span className="inline-block px-4 py-1 rounded-full bg-secondary-container/20 text-secondary border border-secondary/20 font-label text-[0.6875rem] uppercase tracking-[0.1em] mb-6 backdrop-blur-md">
              World-Class Travel
            </span>
            <h1 className="font-headline font-extrabold text-white text-6xl md:text-8xl leading-[1.1] mb-12 tracking-tighter">
              Where to <br/><span className="text-secondary-container underline decoration-sky-400">next?</span>
            </h1>

            {/* Multi-tab Search UI */}
            <div className="bg-surface/10 backdrop-blur-xl p-2 rounded-[2rem] shadow-2xl border border-white/20 max-w-3xl">
              <div className="flex gap-1 p-2 mb-2">
                <button 
                  onClick={() => setActiveTab('flights')}
                  className={`${activeTab === 'flights' ? 'signature-gradient text-white' : 'text-slate-200 hover:bg-white/10'} px-6 py-3 rounded-full flex items-center gap-2 font-headline text-sm font-semibold transition-all`}
                >
                  <Plane size={18} /> Flights
                </button>
                <button 
                  onClick={() => setActiveTab('hotels')}
                  className={`${activeTab === 'hotels' ? 'signature-gradient text-white' : 'text-slate-200 hover:bg-white/10'} px-6 py-3 rounded-full flex items-center gap-2 font-headline text-sm font-semibold transition-all`}
                >
                  <Hotel size={18} /> Hotels
                </button>
                <button 
                  onClick={() => setActiveTab('packages')}
                  className={`${activeTab === 'packages' ? 'signature-gradient text-white' : 'text-slate-200 hover:bg-white/10'} px-6 py-3 rounded-full flex items-center gap-2 font-headline text-sm font-semibold transition-all`}
                >
                  <Package size={18} /> Packages
                </button>
              </div>

              <div className="bg-white rounded-[1.5rem] p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                <div className="flex flex-col gap-1 border-r border-slate-100 last:border-0 pl-2">
                  <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold">Location</label>
                  <div className="flex items-center gap-2 text-on-surface font-semibold">
                    <MapPin size={18} className="text-secondary" />
                    <span className="text-sm">Explore city...</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 border-r border-slate-100 last:border-0 pl-2">
                  <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold">Departure</label>
                  <div className="flex items-center gap-2 text-on-surface font-semibold">
                    <Compass size={18} className="text-secondary" />
                    <span className="text-sm">From where?</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 border-r border-slate-100 last:border-0 pl-2">
                  <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold">Dates</label>
                  <div className="flex items-center gap-2 text-on-surface font-semibold">
                    <Calendar size={18} className="text-secondary" />
                    <span className="text-sm">Choose date</span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/${activeTab}`)}
                  className="signature-gradient text-white h-14 rounded-full font-headline font-bold text-base hover:shadow-lg hover:shadow-secondary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Search size={20} /> Search {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-24 bg-surface px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="font-headline font-extrabold text-4xl text-primary tracking-tight mb-4 italic">Featured Escapes</h2>
              <p className="text-on-surface-variant text-lg max-w-xl">Curated collections of the world's most breathtaking destinations.</p>
            </div>
            <Link to="/packages" className="text-secondary font-bold flex items-center gap-2 hover:gap-4 transition-all">
              View All <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-[600px]">
            <div className="md:col-span-8 relative rounded-3xl overflow-hidden group cursor-pointer shadow-xl">
              <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={featuredDestinations[0].img} alt={featuredDestinations[0].title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8">
                <span className="font-label text-[0.6875rem] text-secondary-container uppercase tracking-[0.2em] font-bold mb-2 block">{featuredDestinations[0].category}</span>
                <h3 className="font-headline text-4xl font-bold text-white mb-2">{featuredDestinations[0].title}</h3>
                <p className="text-slate-300 max-w-md">{featuredDestinations[0].desc}</p>
              </div>
            </div>
            <div className="md:col-span-4 grid grid-rows-2 gap-8">
              {featuredDestinations.slice(1).map((dest, i) => (
                <div key={i} className="relative rounded-3xl overflow-hidden group cursor-pointer shadow-lg">
                  <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={dest.img} alt={dest.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6">
                    <h3 className="font-headline text-2xl font-bold text-white mb-1">{dest.title}</h3>
                    <p className="text-slate-300 text-sm italic">{dest.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 px-8 bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <div className="signature-gradient rounded-[3rem] p-16 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 editorial-shadow">
            <div className="relative z-10 max-w-xl">
              <h2 className="font-headline font-bold text-4xl text-white mb-6">Join the Nest Circle</h2>
              <p className="text-sky-100 text-lg mb-8">Get exclusive access to private charters, hotel openings, and curated travel inspiration.</p>
              <div className="flex gap-4 max-w-md">
                <input className="bg-white/20 border border-white/30 text-white placeholder:text-sky-200 rounded-full flex-1 px-6 h-14 focus:outline-none focus:bg-white/30 transition-all" placeholder="Your email address" type="email"/>
                <button className="bg-white text-secondary font-extrabold px-8 h-14 rounded-full hover:shadow-xl transition-all active:scale-95">Subscribe</button>
              </div>
            </div>
            <img className="w-80 hidden md:block relative z-10 rotate-6 drop-shadow-2xl" src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop" alt="Travel journal" />
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
