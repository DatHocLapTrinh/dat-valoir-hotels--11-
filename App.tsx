
import React, { useState, useEffect } from 'react';
import Slider from './components/Slider';
import Navbar from './components/Navbar';
import HomeContent from './components/HomeContent';
import Rooms from './components/Rooms';
import RoomDetail from './components/RoomDetail';
import Experiences from './components/Experiences';
import ExperienceDetail from './components/ExperienceDetail';
import About from './components/About';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import Dashboard from './components/Dashboard';
import MyProfile from './components/MyProfile';
import MyReservations from './components/MyReservations';
import Chatbot from './components/Chatbot';
import AdminCopilot from './components/AdminCopilot';
import { ViewState } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext'; // Import BookingProvider
import { SystemConfigProvider, useSystemConfig } from './context/SystemConfigContext';
import { UserProvider } from './context/UserContext';
import { ShieldAlert } from 'lucide-react';

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [viewParams, setViewParams] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { config } = useSystemConfig();
  const { user, isLoading } = useAuth();

  const handleNavigation = (view: ViewState, payload?: string) => {
    setCurrentView(view);
    if (payload) {
      setViewParams(payload);
    } else {
      setViewParams(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (role: string) => {
      // Auto-redirect staff/admin to dashboard
      if (role === 'ADMIN' || role === 'STAFF') {
          handleNavigation('DASHBOARD');
      }
  };

  // Event Listener for Modal Navigation requests
  useEffect(() => {
    const handleCustomNav = () => {
        handleNavigation('MY_RESERVATIONS');
    };
    window.addEventListener('navigate-to-reservations', handleCustomNav);
    return () => window.removeEventListener('navigate-to-reservations', handleCustomNav);
  }, []);

  // --- MAINTENANCE MODE CHECK ---
  if (config.maintenanceMode && !isLoading) {
    // Allow access if user is ADMIN or STAFF, otherwise show maintenance screen
    // Note: If user is not logged in, they are blocked.
    // We need to allow LoginModal to be opened even in maintenance mode so admins can login.
    
    const isStaffOrAdmin = user && (user.role === 'ADMIN' || user.role === 'STAFF');

    if (!isStaffOrAdmin) {
      return (
        <div className="w-full min-h-screen bg-black relative overflow-hidden flex flex-col items-center justify-center text-white">
           <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>
           
           <div className="z-10 text-center p-8 max-w-md">
              <ShieldAlert size={64} className="mx-auto text-yellow-500 mb-6 animate-pulse" />
              <h1 className="text-4xl font-['Playfair_Display'] mb-4 text-luxury-gold">System Maintenance</h1>
              <p className="text-gray-400 mb-8 font-['Poppins']">
                We are currently upgrading our luxury experience. <br/>
                Please check back shortly.
              </p>
              
              <div className="p-4 bg-white/5 rounded-lg border border-white/10 mb-8">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Contact Concierge</p>
                <p className="text-lg font-['Playfair_Display']">{config.hotline}</p>
                <p className="text-sm text-gray-400">{config.email}</p>
              </div>

              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="text-xs text-gray-600 hover:text-white transition-colors underline"
              >
                Staff Access
              </button>
           </div>

           <LoginModal 
              isOpen={isLoginModalOpen} 
              onClose={() => setIsLoginModalOpen(false)} 
              onLoginSuccess={handleLoginSuccess}
          />
        </div>
      );
    }
  }

  return (
    <div className="w-full min-h-screen bg-black relative overflow-x-hidden flex flex-col">
      <Navbar 
        currentView={currentView} 
        onViewChange={(view) => handleNavigation(view)} 
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />
      
      <main className="flex-grow">
        {/* View Routing Logic */}
        {currentView === 'HOME' && (
          <>
            <Slider onNavigate={handleNavigation} />
            <HomeContent onNavigate={handleNavigation} />
          </>
        )}

        {currentView === 'ROOMS' && (
          <Rooms initialLocation={viewParams} onNavigate={handleNavigation} />
        )}

        {currentView === 'ROOM_DETAIL' && viewParams && (
          <RoomDetail roomId={viewParams} onNavigate={handleNavigation} />
        )}

        {currentView === 'EXPERIENCES' && (
          <Experiences scrollToId={viewParams} onNavigate={handleNavigation} />
        )}

        {currentView === 'EXPERIENCE_DETAIL' && viewParams && (
            <ExperienceDetail experienceId={viewParams} onNavigate={handleNavigation} />
        )}

        {currentView === 'ABOUT' && (
          <About />
        )}

        {currentView === 'DASHBOARD' && (
            <Dashboard onNavigate={handleNavigation} />
        )}

        {currentView === 'MY_PROFILE' && (
            <MyProfile />
        )}

        {currentView === 'MY_RESERVATIONS' && (
            <MyReservations onNavigate={handleNavigation} />
        )}
      </main>
      
      {/* Global Footer (Hide on Dashboard) */}
      {currentView !== 'DASHBOARD' && (
          <Footer onNavigate={(view) => handleNavigation(view)} />
      )}

      {/* Global Modals */}
      <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
          onLoginSuccess={handleLoginSuccess}
      />

      {/* Global AI Chatbot */}
      {currentView !== 'DASHBOARD' && <Chatbot currentView={currentView} viewParams={viewParams} onNavigate={handleNavigation} />}

      {/* Admin AI Copilot */}
      {currentView === 'DASHBOARD' && <AdminCopilot />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SystemConfigProvider>
        <UserProvider>
          <BookingProvider>
            <AppContent />
          </BookingProvider>
        </UserProvider>
      </SystemConfigProvider>
    </AuthProvider>
  );
}

export default App;
