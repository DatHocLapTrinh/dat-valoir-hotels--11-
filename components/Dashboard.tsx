
import React, { useState } from 'react';
import { 
  LayoutDashboard, Calendar, Settings, LogOut, 
  TrendingUp, ShieldAlert, Key, Menu, UserCog, User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { useUserDatabase } from '../context/UserContext'; // Import User Context
import { ViewState } from '../types';
import DashboardOverview from './dashboard/DashboardOverview';
import DashboardBookings from './dashboard/DashboardBookings';
import DashboardFinancials from './dashboard/DashboardFinancials';
import DashboardUsers from './dashboard/DashboardUsers'; 
import DashboardSystemConfig from './dashboard/DashboardSystemConfig';
import DashboardGuests from './dashboard/DashboardGuests';
import DashboardServiceRequests from './dashboard/DashboardServiceRequests';
import { BellRing } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: ViewState) => void;
}

type DashboardView = 'OVERVIEW' | 'BOOKINGS' | 'GUESTS_READONLY' | 'USERS_MANAGE' | 'FINANCIALS' | 'SETTINGS' | 'SERVICE_REQUESTS';

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  
  const [currentView, setCurrentView] = useState<DashboardView>('OVERVIEW');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // --- PERMISSION CHECK ---
  if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
      return (
          <div className="min-h-screen bg-black flex items-center justify-center text-white font-['Playfair_Display']">
              <div className="text-center">
                <ShieldAlert size={48} className="mx-auto text-red-500 mb-4" />
                <h1 className="text-2xl">Access Denied</h1>
                <p className="text-gray-500 text-sm mt-2">You do not have permission to view this portal.</p>
              </div>
          </div>
      );
  }

  const isAdmin = user.role === 'ADMIN';

  const MENU_ITEMS = [
    { id: 'OVERVIEW', label: 'Overview', icon: <LayoutDashboard size={18} />, adminOnly: false },
    { id: 'BOOKINGS', label: 'Bookings', icon: <Calendar size={18} />, adminOnly: false },
    { id: 'SERVICE_REQUESTS', label: 'Service Requests', icon: <BellRing size={18} />, adminOnly: false },
    { id: 'GUESTS_READONLY', label: 'Guest Directory', icon: <UserIcon size={18} />, adminOnly: false },
    { id: 'USERS_MANAGE', label: 'Users & Staff', icon: <UserCog size={18} />, adminOnly: true }, 
    { id: 'FINANCIALS', label: 'Financials', icon: <TrendingUp size={18} />, adminOnly: true },
    { id: 'SETTINGS', label: 'System Config', icon: <Settings size={18} />, adminOnly: true },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex pt-20 overflow-hidden font-['Poppins']">
      
      {/* --- SIDEBAR --- */}
      <aside className={`fixed z-40 top-20 left-0 h-[calc(100vh-80px)] bg-[#0a0a0a] border-r border-white/5 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0 lg:w-20'}`}>
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className={`flex items-center gap-3 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100 lg:hidden'}`}>
                  <div className="w-8 h-8 rounded bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20">
                      {isAdmin ? <ShieldAlert size={16} /> : <Key size={16} />}
                  </div>
                  <div className={`${!sidebarOpen && 'hidden'}`}>
                      <h3 className="text-xs font-bold text-white uppercase tracking-widest">{isAdmin ? 'Admin' : 'Staff'}</h3>
                  </div>
              </div>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-white lg:hidden">
                  <Menu size={20} />
              </button>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
              {MENU_ITEMS.map((item) => {
                  if (item.adminOnly && !isAdmin) return null;
                  const isActive = currentView === item.id;
                  return (
                    <button 
                        key={item.id}
                        onClick={() => setCurrentView(item.id as DashboardView)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-all group relative ${isActive ? 'bg-white/10 text-yellow-400 font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        title={!sidebarOpen ? item.label : ''}
                    >
                        <div className={`${isActive ? 'text-yellow-400' : 'text-gray-400 group-hover:text-white'}`}>
                            {item.icon}
                        </div>
                        <span className={`transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
                            {item.label}
                        </span>
                        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-yellow-500 rounded-r"></div>}
                    </button>
                  );
              })}
          </nav>

          <div className="p-4 border-t border-white/5">
              <button 
                onClick={() => onNavigate('HOME')}
                className="w-full flex items-center gap-3 p-3 text-gray-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors text-sm"
              >
                  <LogOut size={18} />
                  <span className={`${sidebarOpen ? 'block' : 'hidden'}`}>Exit Portal</span>
              </button>
          </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className={`flex-1 transition-all duration-300 p-4 sm:p-8 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar ${sidebarOpen ? 'ml-64' : 'ml-0 lg:ml-20'}`}>
          
          {/* Top Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 animate-[fadeIn_0.5s] relative z-30">
              <div>
                  <h1 className="text-2xl sm:text-3xl font-['Playfair_Display'] text-white">
                      {MENU_ITEMS.find(i => i.id === currentView)?.label}
                  </h1>
                  <p className="text-gray-500 text-xs mt-1">Real-time data management for Dat Valoir Hotels.</p>
              </div>
              
              <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                  
                  {/* --- USER PROFILE (Search & Notifications Removed) --- */}
                  <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                          <div className="text-xs font-bold text-white">{user.name}</div>
                          <div className="text-[9px] text-luxury-gold uppercase tracking-wider">{user.role}</div>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-white/5 border border-white/20 flex items-center justify-center font-bold text-white">
                         {user.name.charAt(0).toUpperCase()}
                      </div>
                  </div>
              </div>
          </header>

          {/* DYNAMIC VIEW CONTENT */}
          <div className="animate-[fadeIn_0.3s_ease-out]">
              {currentView === 'OVERVIEW' && <DashboardOverview onNavigateToBookings={() => setCurrentView('BOOKINGS')} />}
              {currentView === 'BOOKINGS' && <DashboardBookings />}
              {currentView === 'SERVICE_REQUESTS' && <DashboardServiceRequests />}
              {currentView === 'GUESTS_READONLY' && <DashboardGuests />}
              {currentView === 'USERS_MANAGE' && <DashboardUsers />} 
              {currentView === 'FINANCIALS' && <DashboardFinancials />}
              {currentView === 'SETTINGS' && <DashboardSystemConfig />}
          </div>

      </main>
    </div>
  );
};

export default Dashboard;
