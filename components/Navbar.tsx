
import React, { useState, useEffect, useRef } from 'react';
import { User, Menu, X, ChevronRight, LogOut, LayoutDashboard, CalendarCheck } from 'lucide-react';
import { ViewState } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSystemConfig } from '../context/SystemConfigContext';

interface NavbarProps {
    currentView: ViewState;
    onViewChange: (view: ViewState) => void;
    onOpenLogin: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange, onOpenLogin }) => {
  const { user, logout, isAuthenticated, hasRole } = useAuth();
  const { config } = useSystemConfig();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  const showNotification = !!config.homepageNotification && currentView === 'HOME';

  const NAV_LINKS: { name: string; view: ViewState }[] = [
    { name: 'Home', view: 'HOME' },
    { name: 'Rooms', view: 'ROOMS' },
    { name: 'Experiences', view: 'EXPERIENCES' },
    { name: `About ${config.hotelName.split(' ')[0]}`, view: 'ABOUT' },
  ];

  // Scroll effect logic
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  // Click outside dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Don't show Navbar on Dashboard (Moved after hooks)
  if (currentView === 'DASHBOARD') return null;

  const handleNavClick = (view: ViewState) => {
      onViewChange(view);
      setMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
      logout();
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
      onViewChange('HOME');
  };

  const goToDashboard = () => {
      onViewChange('DASHBOARD');
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
  }

  const goToProfile = () => {
      onViewChange('MY_PROFILE');
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
  }

  const goToReservations = () => {
      onViewChange('MY_RESERVATIONS');
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
  }

  const isInternalUser = hasRole(['ADMIN', 'STAFF']);

  // Calculate Initial
  const userInitial = user ? user.name.charAt(0).toUpperCase() : '';

  return (
    <>
      {/* --- NOTIFICATION BAR --- */}
      {showNotification && (
        <div className="fixed top-0 left-0 w-full z-[110] bg-gradient-to-r from-yellow-700 via-yellow-600 to-yellow-700 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest text-center py-2 px-4 shadow-lg animate-[fadeIn_0.5s]">
          {config.homepageNotification}
        </div>
      )}

      <nav 
        className={`fixed left-0 w-full z-[100] transition-all duration-500 ease-in-out px-6 sm:px-12 py-6 flex justify-between items-center ${
          showNotification ? 'top-8' : 'top-0'
        } ${
          scrolled || currentView !== 'HOME' ? 'bg-black/90 backdrop-blur-md py-4 border-b border-white/5' : 'bg-gradient-to-b from-black/80 via-black/20 to-transparent'
        }`}
      >
        {/* --- LOGO (Left) --- */}
        <div 
            className="flex-shrink-0 cursor-pointer group z-[101]"
            onClick={() => handleNavClick('HOME')}
        >
          <h1 className="text-luxury-gold font-['Playfair_Display'] text-xl sm:text-2xl font-bold tracking-[0.2em] relative uppercase">
            {config.hotelName}
            <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-yellow-500 transition-all duration-500 group-hover:w-full"></span>
          </h1>
        </div>

        {/* --- DESKTOP MENU (Center) --- */}
        <div className="hidden lg:flex items-center gap-10 xl:gap-14 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {NAV_LINKS.map((link) => (
            <button 
              key={link.name} 
              onClick={() => handleNavClick(link.view)}
              className={`font-['Poppins'] text-[11px] font-medium uppercase tracking-[0.15em] transition-colors relative group py-2 ${
                  currentView === link.view ? 'text-yellow-400' : 'text-white/90 hover:text-yellow-400'
              }`}
            >
              {link.name}
              <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-yellow-500 transition-transform duration-300 origin-left ${currentView === link.view ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
            </button>
          ))}
        </div>

        {/* --- USER AREA (Right) --- */}
        <div className="flex items-center gap-6 z-[101]">
          {/* Guest Reservations Icon Button (Visible if not logged in or if customer) */}
          {(!isAuthenticated || (user && !isInternalUser)) && (
              <button 
                onClick={goToReservations}
                className="hidden sm:flex flex-col items-center gap-1 group mr-2 focus:outline-none"
                title="My Reservations"
              >
                  <div className="w-10 h-10 rounded-full border border-white/20 group-hover:border-yellow-500/50 flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(234,179,8,0.3)] bg-white/5 backdrop-blur-sm">
                     <CalendarCheck size={18} className="text-white group-hover:text-yellow-400 transition-colors" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/70 group-hover:text-yellow-500 transition-colors">
                      Trips
                  </span>
              </button>
          )}

          {/* Login / Profile */}
          {isAuthenticated && user ? (
             <div className="relative hidden sm:block" ref={dropdownRef}>
                 <button 
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex flex-col items-center gap-1 group focus:outline-none"
                 >
                     <div className="relative w-10 h-10 rounded-full border border-white/20 group-hover:border-yellow-500/50 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(234,179,8,0.3)] bg-white/5 backdrop-blur-sm">
                         {/* Replaced Image with Initial */}
                         <span className="font-['Playfair_Display'] font-bold text-lg text-white group-hover:text-yellow-400">
                             {userInitial}
                         </span>
                     </div>
                     <span className="block text-white/90 font-['Poppins'] text-[9px] font-bold uppercase tracking-widest group-hover:text-yellow-400 transition-colors">
                        {user.name.split(' ')[0]}
                     </span>
                 </button>

                 {/* Dropdown Menu */}
                 {profileDropdownOpen && (
                     <div className="absolute top-full right-0 mt-4 w-56 bg-[#0a0a0a] border border-white/10 rounded-sm shadow-2xl animate-[fadeIn_0.2s_ease-out]">
                         <div className="p-4 border-b border-white/5">
                             <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Signed in as</p>
                             <p className="text-white text-sm font-bold truncate">{user.email}</p>
                         </div>
                         <div className="py-2">
                             {isInternalUser && (
                                <button onClick={goToDashboard} className="w-full text-left px-4 py-3 text-sm text-yellow-400 hover:bg-white/5 transition-colors flex items-center gap-2 font-bold bg-yellow-900/10">
                                     <LayoutDashboard size={14} /> Dashboard
                                </button>
                             )}
                             <button onClick={goToProfile} className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-yellow-500 transition-colors flex items-center gap-2">
                                 <User size={14} /> Account Settings
                             </button>
                             {/* Only show Reservations for Customers in dropdown */}
                             {!isInternalUser && (
                                 <button onClick={goToReservations} className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-yellow-500 transition-colors flex items-center gap-2">
                                     <CalendarCheck size={14} /> My Reservations
                                 </button>
                             )}
                         </div>
                         <div className="border-t border-white/5 py-2">
                             <button 
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2"
                             >
                                 <LogOut size={14} /> Sign Out
                             </button>
                         </div>
                     </div>
                 )}
             </div>
          ) : (
             <div 
                className="flex flex-col items-center gap-1 cursor-pointer group"
                onClick={onOpenLogin}
             >
                <div className="relative w-10 h-10 rounded-full border border-white/20 group-hover:border-yellow-500/50 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(234,179,8,0.3)] bg-white/5 backdrop-blur-sm">
                  <User size={18} className="text-white group-hover:text-yellow-400 transition-colors" />
                </div>
                
                <span className="hidden sm:block text-white/90 font-['Poppins'] text-[9px] font-bold uppercase tracking-widest group-hover:text-yellow-400 transition-colors">
                  Sign In
                </span>
              </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white hover:text-yellow-400 transition-colors p-1"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* --- MOBILE MENU OVERLAY --- */}
      <div 
        className={`fixed inset-0 z-[90] bg-[#0a0a0a]/95 backdrop-blur-3xl transition-all duration-500 lg:hidden flex flex-col justify-center px-8 ${
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
         {/* User Info Mobile */}
         {isAuthenticated && user && (
             <div className="absolute top-24 left-8 right-8 pb-6 border-b border-white/10 flex items-center gap-4 animate-[fadeIn_0.5s]">
                 <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 flex items-center justify-center bg-white/5">
                     {/* Replaced Image with Initial */}
                     <span className="font-['Playfair_Display'] font-bold text-2xl text-white">
                         {userInitial}
                     </span>
                 </div>
                 <div>
                     <div className="text-white font-['Playfair_Display'] text-xl">{user.name}</div>
                     <div className="text-gray-500 text-xs uppercase tracking-widest">Account</div>
                 </div>
             </div>
         )}

         <div className="space-y-6 mt-12">
            {isInternalUser && (
                 <button 
                    onClick={goToDashboard}
                    className={`flex w-full items-center justify-between text-2xl font-['Playfair_Display'] font-bold tracking-wide border-b border-white/10 pb-4 text-yellow-500 ${
                    mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}
                    style={{ transitionDelay: `0ms`, transitionDuration: '500ms' }}
                >
                    <span>Dashboard</span>
                    <LayoutDashboard size={24} />
                </button>
            )}

            {NAV_LINKS.map((link, index) => (
              <button 
                key={link.name}
                onClick={() => handleNavClick(link.view)}
                className={`flex w-full items-center justify-between text-2xl sm:text-3xl font-['Playfair_Display'] font-bold tracking-wide border-b border-white/10 pb-4 group ${
                  mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                } ${currentView === link.view ? 'text-yellow-500' : 'text-white'}`}
                style={{ transitionDelay: `${(index + 1) * 100}ms`, transitionDuration: '500ms' }}
              >
                <span className="group-hover:text-yellow-500 transition-colors">{link.name}</span>
                <ChevronRight size={24} className="text-gray-600 group-hover:text-yellow-500 group-hover:translate-x-2 transition-all" />
              </button>
            ))}

            <button 
                onClick={goToReservations}
                className={`flex w-full items-center justify-between text-2xl sm:text-3xl font-['Playfair_Display'] font-bold tracking-wide border-b border-white/10 pb-4 group ${
                mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                } text-white`}
                style={{ transitionDelay: `500ms`, transitionDuration: '500ms' }}
            >
                <span className="group-hover:text-yellow-500 transition-colors">My Reservations</span>
            </button>

            {isAuthenticated && (
                <button 
                    onClick={goToProfile}
                    className={`flex w-full items-center justify-between text-2xl sm:text-3xl font-['Playfair_Display'] font-bold tracking-wide border-b border-white/10 pb-4 group ${
                    mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    } text-white`}
                    style={{ transitionDelay: `600ms`, transitionDuration: '500ms' }}
                >
                    <span className="group-hover:text-yellow-500 transition-colors">Account Settings</span>
                </button>
            )}
         </div>
         
         <div className={`mt-12 pt-8 border-t border-white/10 grid grid-cols-2 gap-4 ${
             mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
           }`}
           style={{ transitionDelay: '700ms', transitionDuration: '500ms' }}
         >
             {isAuthenticated ? (
                 <button onClick={handleLogout} className="py-4 border border-red-500/50 rounded text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all">
                    Sign Out
                 </button>
             ) : (
                 <button onClick={() => { onOpenLogin(); setMobileMenuOpen(false); }} className="py-4 border border-white/20 rounded text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all">
                    Sign In
                 </button>
             )}
             
             <button 
                onClick={() => { handleNavClick('ROOMS'); }}
                className="py-4 bg-yellow-600 rounded text-xs font-bold uppercase tracking-widest text-white hover:bg-yellow-500 transition-all shadow-lg"
             >
                Book Now
             </button>
         </div>
      </div>
    </>
  );
};

export default Navbar;
