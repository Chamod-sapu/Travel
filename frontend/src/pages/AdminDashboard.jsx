import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllFlightBookings, createFlight, deleteFlight } from '../services/flightService';
import { getAllHotelBookings, createHotel, deleteHotel } from '../services/hotelService';
import { getAllPackageBookings, createPackage, deletePackage } from '../services/packageService';
import { getAllUsers } from '../services/authService';
import Loader from '../components/common/Loader';
import { 
  BarChart3, Users, Plane, Hotel, Package, Plus, Trash2, Settings, 
  ChevronRight, LayoutDashboard, Globe, AlertCircle, CheckCircle2 
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, flights: 0, hotels: 0, bookings: 0 });
  const [data, setData] = useState({ users: [], flightBookings: [], hotelBookings: [], packageBookings: [] });

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const [users, flights, hotels, packages] = await Promise.all([
          getAllUsers(),
          getAllFlightBookings(),
          getAllHotelBookings(),
          getAllPackageBookings()
        ]);
        
        setData({ 
          users, 
          flightBookings: flights, 
          hotelBookings: hotels, 
          packageBookings: packages 
        });

        setStats({
          users: users.length,
          flights: flights.length,
          hotels: hotels.length,
          bookings: flights.length + hotels.length + packages.length
        });
      } catch (err) {
        console.error("Admin fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <AlertCircle size={64} className="text-red-500 mb-4 animate-bounce" />
        <h2 className="text-3xl font-headline font-black text-primary-container">Access Denied</h2>
        <p className="text-on-surface-variant font-medium mt-2 italic">You must be an administrator to view this sanctuary.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface px-8 py-12">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
        
        {/* Sidebar Nav */}
        <aside className="lg:w-64 space-y-4">
          <div className="bg-white rounded-[2rem] p-6 editorial-shadow border border-slate-50 space-y-2 sticky top-28">
            <div className="flex items-center gap-3 mb-8 px-2">
               <div className="w-10 h-10 rounded-xl signature-gradient flex items-center justify-center text-white">
                  <LayoutDashboard size={20} />
               </div>
               <span className="font-headline font-black text-primary-container text-xl tracking-tighter italic">Console</span>
            </div>
            
            <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<BarChart3 size={18}/>} label="Overview" />
            <NavItem active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={18}/>} label="User Base" />
            <NavItem active={activeTab === 'flights'} onClick={() => setActiveTab('flights')} icon={<Plane size={18}/>} label="Flights" />
            <NavItem active={activeTab === 'hotels'} onClick={() => setActiveTab('hotels')} icon={<Hotel size={18}/>} label="Hotels" />
            <NavItem active={activeTab === 'packages'} onClick={() => setActiveTab('packages')} icon={<Package size={18}/>} label="Packages" />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {loading ? (
            <div className="h-[50vh] flex items-center justify-center">
              <Loader />
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* Header */}
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div>
                    <h1 className="text-4xl font-headline font-black text-primary-container tracking-tighter italic">Command Sanctuary</h1>
                    <p className="text-on-surface-variant font-medium italic mt-1">Orchestrating the future of TravelNest.</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 bg-white border border-slate-100 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:border-secondary/20 transition-all font-label">
                       <Settings size={14}/> Settings
                    </button>
                    <button className="signature-gradient text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-sky-500/20 hover:scale-105 active:scale-95 transition-all">
                       <Plus size={16}/> New Entry
                    </button>
                 </div>
              </header>

              {/* Overview Stats */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard icon={<Users className="text-blue-500"/>} label="Registered" value={stats.users} unit="Citizens" />
                  <StatCard icon={<Plane className="text-sky-500"/>} label="Flight Ops" value={stats.flights} unit="Routes" />
                  <StatCard icon={<Hotel className="text-indigo-500"/>} label="Hotel Assets" value={stats.hotels} unit="Keys" />
                  <StatCard icon={<Globe className="text-secondary"/>} label="Total Flow" value={stats.bookings} unit="Voyages" />
                </div>
              )}

              {/* Data Tables */}
              <div className="bg-white rounded-[2.5rem] editorial-shadow border border-slate-50 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                   <h3 className="font-headline font-black text-2xl text-primary-container tracking-tight italic uppercase">
                      {activeTab === 'overview' ? 'Live System Stream' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Registry`}
                   </h3>
                </div>
                
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-surface-container-low border-b border-slate-50">
                         <tr>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-outline italic">Identity</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-outline italic">Metrics</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-outline italic">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-outline italic text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {activeTab === 'users' && data.users.map(u => (
                          <DataRow key={u.id} 
                            id={`#USER-${u.id}`} 
                            title={u.fullName} 
                            subtitle={u.email} 
                            stat1={u.role} 
                            stat2="Active"
                            isSuccess={true}
                          />
                        ))}
                        {activeTab === 'flights' && data.flightBookings.map(b => (
                          <DataRow key={b.id} 
                            id={`#FLT-${b.id}`} 
                            title={`Flight ${b.id}`} 
                            subtitle={`Route ID: ${b.flightId}`} 
                            stat1={`$${b.totalPrice}`} 
                            stat2={b.status}
                            isSuccess={b.status === 'SUCCESS'}
                          />
                        ))}
                        {activeTab === 'overview' && (
                          <tr className="border-none">
                            <td colSpan="4" className="px-8 py-20 text-center text-on-surface-variant italic font-medium">
                               Select a department from the sidebar to manage Registry units.
                            </td>
                          </tr>
                        )}
                      </tbody>
                   </table>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-300 font-headline font-bold text-sm tracking-tight ${
      active 
      ? 'bg-secondary/10 text-secondary' 
      : 'text-on-surface-variant hover:bg-slate-50'
    }`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span>{label}</span>
    </div>
    {active && <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>}
  </button>
);

const StatCard = ({ icon, label, value, unit }) => (
  <div className="bg-white rounded-[2rem] p-8 editorial-shadow border border-slate-50 group hover:-translate-y-2 transition-all duration-500">
     <div className="flex items-center justify-between mb-6">
        <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-2xl">
           {icon}
        </div>
        <ChevronRight size={18} className="text-slate-100 group-hover:text-secondary group-hover:translate-x-1 transition-all" />
     </div>
     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-outline italic mb-1">{label}</p>
     <div className="flex items-baseline gap-2">
        <span className="text-4xl font-headline font-black text-primary-container tracking-tighter">{value}</span>
        <span className="text-xs font-bold text-on-surface-variant italic opacity-40">{unit}</span>
     </div>
  </div>
);

const DataRow = ({ id, title, subtitle, stat1, stat2, isSuccess }) => (
  <tr className="group hover:bg-slate-50/50 transition-colors">
    <td className="px-8 py-6">
       <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-xs font-black text-outline">
             {id.charAt(1)}
          </div>
          <div>
             <p className="font-headline font-bold text-primary-container tracking-tight italic uppercase">{title}</p>
             <p className="text-[10px] text-on-surface-variant font-medium opacity-60 italic">{subtitle}</p>
          </div>
       </div>
    </td>
    <td className="px-8 py-6">
       <p className="font-headline font-black text-secondary tracking-tighter">{stat1}</p>
       <p className="text-[8px] font-black text-outline uppercase tracking-widest mt-1 italic">Registry Core</p>
    </td>
    <td className="px-8 py-6">
       <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest italic ${
         isSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
       }`}>
          {isSuccess ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>}
          {stat2}
       </div>
    </td>
    <td className="px-8 py-6 text-right">
       <button className="text-outline hover:text-red-500 transition-colors">
          <Trash2 size={18} />
       </button>
    </td>
  </tr>
);

export default AdminDashboard;
