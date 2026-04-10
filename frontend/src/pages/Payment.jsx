import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Lock, CheckCircle2, ShieldCheck, Sparkle } from 'lucide-react';
import { initiatePayment } from '../services/paymentService';
import { bookFlight } from '../services/flightService';
import { bookHotel } from '../services/hotelService';
import { bookPackage } from '../services/packageService';
import Loader from '../components/common/Loader';

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!state || !state.item) return null;

  const { type, item } = state;
  const totalAmount = (item.price || item.pricePerNight) - 25;

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Technical Booking
      let bookingResponse;
      if (type === 'FLIGHT') {
        bookingResponse = await bookFlight({ flightId: item.id, seats: 1 });
      } else if (type === 'HOTEL') {
        bookingResponse = await bookHotel({ hotelId: item.id, checkIn: "2024-06-01", checkOut: "2024-06-05", rooms: 1 });
      } else {
        bookingResponse = await bookPackage({ packageId: item.id, people: 1 });
      }

      // 2. Technical Payment
      await initiatePayment({
        bookingRef: `NEST-${bookingResponse.id}`,
        bookingType: type,
        amount: totalAmount
      });

      setSuccess(true);
      setTimeout(() => navigate('/profile'), 3000);
    } catch (err) {
      console.error("Payment or booking failed", err);
      alert("Something went wrong with the transaction.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-surface z-[200] flex items-center justify-center p-8">
         <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
            <div className="w-24 h-24 signature-gradient rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-sky-500/40">
               <CheckCircle2 size={48} className="text-white" />
            </div>
            <h1 className="text-5xl font-headline font-black text-primary-container tracking-tighter">Your sanctuary <br/>is secured.</h1>
            <p className="text-xl text-on-surface-variant font-medium italic">We've sent your itinerary and digital keys to your email. Redirecting to your voyages...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 min-h-screen">
      {loading && <Loader fullPage />}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
         <div className="space-y-12">
            <section className="space-y-3">
               <span className="text-secondary font-headline font-extrabold tracking-[0.3em] text-[10px] uppercase">Final Step</span>
               <h1 className="text-5xl font-headline font-black text-primary-container tracking-tighter italic">Secure Payment.</h1>
               <p className="text-on-surface-variant font-medium text-lg italic">Complete your transaction using our encrypted cloud portal.</p>
            </section>

            {/* Mock Card Preview */}
            <div className="relative group perspective-1000 max-w-md">
               <div className="bg-slate-900 h-60 rounded-[2.5rem] p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden ring-1 ring-white/10 italic">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="flex justify-between items-start relative z-10">
                     <Sparkle size={32} className="text-sky-400" />
                     <span className="text-xs font-black tracking-widest text-slate-400 uppercase">Premium Voyage</span>
                  </div>
                  <div className="space-y-4 relative z-10">
                     <p className="text-2xl font-headline font-bold text-white tracking-[0.2em]">••••  ••••  ••••  4829</p>
                     <div className="flex gap-8">
                        <div>
                           <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Expires</p>
                           <p className="text-sm font-bold text-slate-300">12/28</p>
                        </div>
                        <div>
                           <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Cardholder</p>
                           <p className="text-sm font-bold text-slate-300 uppercase italic">Your Name</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md">
               <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-low border border-slate-50 italic">
                  <ShieldCheck size={20} className="text-secondary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">PCI Level 1</span>
               </div>
               <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-low border border-slate-50 italic">
                  <Lock size={20} className="text-secondary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">256-bit Encrypted</span>
               </div>
            </div>
         </div>

         <div className="bg-white rounded-[3rem] p-10 md:p-14 editorial-shadow border border-slate-50">
            <form onSubmit={handlePayment} className="space-y-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-[0.2em] uppercase text-on-surface-variant italic ml-1">Card Network</label>
                  <div className="flex gap-4">
                     {['Visa', 'Mastercard', 'Amex'].map((brand) => (
                        <div key={brand} className="flex-1 py-3 text-center rounded-xl bg-surface-container-low border-2 border-transparent hover:border-secondary/20 cursor-pointer font-bold text-xs transition-all uppercase tracking-widest">
                           {brand}
                        </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-[0.2em] uppercase text-on-surface-variant italic ml-1">Cardholder Name</label>
                  <input className="w-full bg-surface-container-low border-none rounded-xl py-4 px-6 text-sm font-bold uppercase focus:ring-2 focus:ring-secondary/20 transition-all italic" placeholder="Name as on card" required type="text" />
               </div>

               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black tracking-[0.2em] uppercase text-on-surface-variant italic ml-1">Card Number</label>
                     <div className="relative">
                        <input className="w-full bg-surface-container-low border-none rounded-xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-secondary/20 transition-all" placeholder="0000 0000 0000 0000" required type="text" />
                        <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-[0.2em] uppercase text-on-surface-variant italic ml-1">Expiry</label>
                        <input className="w-full bg-surface-container-low border-none rounded-xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-secondary/20 transition-all text-center" placeholder="MM/YY" required type="text" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-[0.2em] uppercase text-on-surface-variant italic ml-1">CVC</label>
                        <input className="w-full bg-surface-container-low border-none rounded-xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-secondary/20 transition-all text-center" placeholder="•••" required type="password" />
                     </div>
                  </div>
               </div>

               <button 
                  type="submit"
                  className="signature-gradient w-full py-5 rounded-full text-white font-headline font-bold text-xl tracking-tight shadow-xl shadow-sky-500/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
               >
                  Authorize Payment (${totalAmount})
               </button>
            </form>
         </div>
      </div>
    </div>
  );
};

export default Payment;
