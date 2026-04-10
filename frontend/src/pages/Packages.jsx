import React, { useState, useEffect } from 'react';
import PackageCard from '../components/packages/PackageCard';
import Loader from '../components/common/Loader';
import { getPackages } from '../services/packageService';
import { Package } from 'lucide-react';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getPackages({});
        setPackages(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="bg-surface min-h-screen pb-20">
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover brightness-[0.4]" 
          alt="Packages hero"
        />
        <div className="relative z-10 text-center space-y-4 px-8">
           <span className="text-secondary font-headline font-bold uppercase tracking-[0.3em] text-xs">Full Experiences</span>
           <h1 className="text-5xl md:text-7xl font-extrabold text-white font-headline tracking-tighter">Iconic Escapes.</h1>
           <p className="text-slate-300 max-w-lg mx-auto font-medium">Bundled luxury experiences curated by our local travel experts.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="flex items-center gap-4 mb-16 border-b border-slate-100 pb-8 justify-between">
           <div>
              <h2 className="text-4xl font-headline font-bold text-primary-container tracking-tight italic">Our Signature Bundles</h2>
              <p className="text-on-surface-variant mt-1 italic">Handpicked global tours for the discerning explorer.</p>
           </div>
           <div className="p-3 bg-secondary-container/20 rounded-2xl text-secondary">
              <Package size={28} />
           </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><Loader /></div>
        ) : (
          <div className="grid grid-cols-1 gap-12 max-w-5xl mx-auto">
            {packages.length > 0 ? (
              packages.map(pkg => <PackageCard key={pkg.id} pkg={pkg} />)
            ) : (
              <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm italic text-on-surface-variant text-xl font-headline">
                No active tour packages available at this time.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Packages;
