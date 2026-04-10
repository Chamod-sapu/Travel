import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plane, Hotel, Package, ShieldCheck, Lock, Calendar, MapPin } from 'lucide-react';

const BookingConfirm = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state || !state.item) {
    return <div className="py-20 text-center font-headline font-bold text-2xl">Invalid Booking Data</div>;
  }

  const { type, item } = state;

  const handleProceed = () => {
     navigate('/payment', { state });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 pb-32">
      <div className="mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-secondary font-extrabold group italic tracking-tighter">
          <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Selection
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Summary */}
        <div className="lg:col-span-8 space-y-8">
          <section className="space-y-2">
            <span className="text-secondary font-headline font-extrabold tracking-[0.3em] text-[10px] uppercase">Final Review</span>
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-primary-container leading-tight tracking-tighter">
               Confirm your journey to <br/><span className="text-secondary-container underline decoration-sky-400">{item.destination || item.location || item.title}</span>
            </h1>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Detail Column */}
             <div className="bg-white p-8 rounded-[2.5rem] editorial-shadow relative overflow-hidden group border border-slate-50">
                <div className="absolute top(-4) right(-4) opacity-5 transform rotate-12 scale-150">
                  {type === 'FLIGHT' ? <Plane size={150} /> : type === 'HOTEL' ? <Hotel size={150} /> : <Package size={150} />}
                </div>
                
                <div className="relative z-10">
                   <label className="text-[10px] font-black tracking-[0.2em] text-on-surface-variant uppercase mb-6 block italic">Summary Details</label>
                   
                   {type === 'FLIGHT' && (
                     <div className="space-y-6">
                        <div className="flex justify-between items-center">
                           <div className="text-center md:text-left">
                              <h3 className="text-3xl font-headline font-black">{item.origin}</h3>
                              <p className="text-xs font-bold text-on-surface-variant uppercase mt-1 italic">London, UK</p>
                           </div>
                           <div className="flex flex-col items-center">
                              <Plane size={18} className="text-secondary" />
                              <div className="h-[2px] w-12 bg-slate-100 my-1"></div>
                           </div>
                           <div className="text-center md:text-right">
                              <h3 className="text-3xl font-headline font-black">{item.destination}</h3>
                              <p className="text-xs font-bold text-on-surface-variant uppercase mt-1 italic">Maldives</p>
                           </div>
                        </div>
                        <p className="text-sm font-bold pt-4 border-t border-slate-50 flex items-center gap-2 italic">
                           <ShieldCheck size={16} className="text-secondary" /> Business Class • {item.flightNumber}
                        </p>
                     </div>
                   )}

                   {type === 'HOTEL' && (
                     <div className="space-y-4">
                        <h3 className="text-3xl font-headline font-black leading-tight italic">{item.name}</h3>
                        <p className="text-sm font-medium text-on-surface-variant flex items-center gap-1 italic">
                           <MapPin size={14} className="text-secondary" /> {item.location}
                        </p>
                        <div className="pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                           <div>
                              <p className="text-[10px] font-black text-outline uppercase tracking-widest italic">Booking Ref</p>
                              <p className="text-sm font-bold">STAY-2024</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-black text-outline uppercase tracking-widest italic">Status</p>
                              <p className="text-sm font-bold text-secondary">PREMIUM</p>
                           </div>
                        </div>
                     </div>
                   )}

                   {type === 'PACKAGE' && (
                     <div className="space-y-4">
                        <h3 className="text-3xl font-headline font-black leading-tight italic">{item.title}</h3>
                        <p className="text-sm font-medium text-on-surface-variant italic">{item.durationDays} Days of Excellence</p>
                        <ul className="pt-4 border-t border-slate-50 space-y-2">
                           <li className="flex items-center gap-2 text-xs font-bold italic"><CheckCircle size={14} className="text-secondary" /> {item.maxPeople} Guests Max</li>
                           <li className="flex items-center gap-2 text-xs font-bold italic"><CheckCircle size={14} className="text-secondary" /> Full Concierge Service</li>
                        </ul>
                     </div>
                   )}
                </div>
             </div>

             {/* Protection Card */}
             <div className="bg-primary-container text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col justify-between">
                <div className="relative z-10">
                   <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md mb-6 ring-1 ring-white/20">
                      <ShieldCheck size={32} className="text-sky-300" />
                   </div>
                   <h4 className="text-2xl font-headline font-bold mb-2 tracking-tight">Voyager Protection</h4>
                   <p className="text-slate-300 text-sm italic font-medium">Full refund protection and 24/7 global priority concierge included with your trip.</p>
                </div>
                <div className="mt-8 pt-8 border-t border-white/10 flex gap-2">
                   <span className="px-3 py-1 bg-white/10 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10">Zero Deductible</span>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Checkout Sticky */}
        <aside className="lg:col-span-4 lg:sticky lg:top-28">
           <div className="bg-white rounded-[2.5rem] p-8 md:p-10 editorial-shadow space-y-8 border border-slate-50">
              <h3 className="text-2xl font-headline font-bold italic">Pricing</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-on-surface-variant italic">Base Amount</span>
                    <span className="font-bold font-headline">${item.price || item.pricePerNight}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-on-surface-variant italic">Nest Concierge Fee</span>
                    <span className="font-bold font-headline">$0.00</span>
                 </div>
                 <div className="flex justify-between items-center text-sm font-medium border-t border-slate-50 pt-4">
                    <span className="text-secondary italic font-bold">Voyager Discount</span>
                    <span className="text-secondary font-bold font-headline">-$25.00</span>
                 </div>
                 <div className="pt-6 border-t border-slate-100">
                    <div className="flex justify-between items-end">
                       <span className="text-xl font-headline font-bold italic">Total</span>
                       <span className="text-4xl font-headline font-black text-secondary tracking-tighter">${(item.price || item.pricePerNight) - 25}</span>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <button 
                  onClick={handleProceed}
                  className="w-full signature-gradient text-white font-headline font-bold py-5 rounded-full shadow-2xl shadow-sky-500/30 hover:scale-[1.02] active:scale-95 transition-all text-lg tracking-tight"
                 >
                    Proceed to Payment
                 </button>
                 <div className="flex items-center justify-center gap-2 text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                    <Lock size={12} className="text-secondary" /> Secure SSL Encrypted
                 </div>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
};

export default BookingConfirm;
