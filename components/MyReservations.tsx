
import React, { useState, useMemo, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { ViewState } from '../types';
import { Calendar, MapPin, Clock, AlertCircle, ArrowRight, History, Check, X, Search, Mail } from 'lucide-react';

interface MyReservationsProps {
  onNavigate: (view: ViewState, payload?: string) => void;
}

const MyReservations: React.FC<MyReservationsProps> = ({ onNavigate }) => {
  const { bookings, cancelBooking } = useBooking();
  const { user, hasRole } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'HISTORY'>('UPCOMING');
  
  // State for 2-step cancellation
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // --- GUEST LOOKUP STATE ---
  const [lookupId, setLookupId] = useState('');
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupError, setLookupError] = useState('');

  // --- ROLE CHECK: REDIRECT INTERNAL USERS ---
  useEffect(() => {
      if (hasRole(['ADMIN', 'STAFF'])) {
          onNavigate('DASHBOARD');
      }
  }, [user, hasRole, onNavigate]);

  // If internal user, return nothing while redirecting to avoid flash
  if (hasRole(['ADMIN', 'STAFF'])) return null;

  // --- LOGIC: DATA FILTERING ---
  const displayedBookings = useMemo(() => {
    let relevantBookings = [];

    if (user) {
        // Logged-in: Filter by user ID
        relevantBookings = bookings.filter(b => b.userId === user.email);
    } else {
        // Guest: Filter by local storage IDs
        const guestIds: string[] = JSON.parse(localStorage.getItem('datvaloir_guest_ids') || '[]');
        relevantBookings = bookings.filter(b => guestIds.includes(b.id));
    }

    // Sort descending by booking date
    const sorted = relevantBookings.sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime());

    if (activeTab === 'UPCOMING') {
        return sorted.filter(b => b.status === 'CONFIRMED');
    } else {
        return sorted.filter(b => b.status !== 'CONFIRMED');
    }
  }, [bookings, user, activeTab, bookings.length]); // Add bookings.length dependency to refresh on lookup match

  // --- HANDLERS ---

  const handleGuestLookup = (e: React.FormEvent) => {
      e.preventDefault();
      setLookupError('');
      
      const found = bookings.find(b => 
          b.id.toUpperCase() === lookupId.toUpperCase().trim() && 
          b.userId.toLowerCase() === lookupEmail.toLowerCase().trim()
      );

      if (found) {
          // Add to local storage if valid
          const guestIds: string[] = JSON.parse(localStorage.getItem('datvaloir_guest_ids') || '[]');
          if (!guestIds.includes(found.id)) {
              guestIds.push(found.id);
              localStorage.setItem('datvaloir_guest_ids', JSON.stringify(guestIds));
              // Trigger re-render logic via state or window event if needed, but Context update usually handles it
              // Force update via dummy state if needed, but context reference usually suffices
              setLookupId(''); // Clear form on success
              setLookupEmail('');
              setShowToast(true);
              setTimeout(() => setShowToast(false), 3000);
          } else {
              setLookupError("This booking is already in your list.");
          }
      } else {
          setLookupError("Booking not found. Please check your ID and Email.");
      }
  };

  const handleCancelClick = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      e.preventDefault();

      if (confirmCancelId === id) {
          executeCancellation(id);
      } else {
          setConfirmCancelId(id);
      }
  };

  const executeCancellation = async (id: string) => {
      setProcessingId(id);
      try {
          await cancelBooking(id);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 4000);
      } catch (error) {
          console.error("Cancellation failed", error);
          setLookupError("Could not cancel booking. Please try again.");
      } finally {
          setProcessingId(null);
          setConfirmCancelId(null);
      }
  };

  const cancelConfirmation = (e: React.MouseEvent) => {
      e.stopPropagation();
      setConfirmCancelId(null);
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'CONFIRMED': return 'text-green-400 bg-green-900/20 border-green-900/50';
          case 'COMPLETED': return 'text-blue-400 bg-blue-900/20 border-blue-900/50';
          case 'CANCELLED': return 'text-red-400 bg-red-900/20 border-red-900/50';
          default: return 'text-gray-400 bg-gray-800 border-gray-700';
      }
  };

  const formatDate = (dateString: string) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-12 px-6 animate-[fadeIn_0.5s] relative" onClick={() => setConfirmCancelId(null)}>
      
      {/* Toast Notification */}
      {showToast && (
          <div className="fixed top-24 right-6 z-[150] bg-[#1a1a1a] border border-green-500/30 text-white px-6 py-4 rounded shadow-2xl flex items-center gap-3 animate-[slideInRight_0.3s_ease-out]">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 shrink-0">
                  <Check size={16} />
              </div>
              <div>
                  <h4 className="text-sm font-bold">Success</h4>
                  <p className="text-xs text-gray-400">Action completed successfully.</p>
              </div>
          </div>
      )}

      <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-6">
              <div>
                  <h1 className="text-4xl font-['Playfair_Display'] text-white mb-2">
                      {user ? "My Reservations" : "Guest Reservations"}
                  </h1>
                  <p className="text-gray-500 text-sm">
                      {user ? "Manage your stays and experiences." : "View bookings made on this device or lookup a reservation."}
                  </p>
              </div>
              
              <div className="flex gap-4 mt-6 md:mt-0">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveTab('UPCOMING'); }}
                    className={`px-6 py-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'UPCOMING' ? 'border-yellow-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                  >
                      Upcoming
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveTab('HISTORY'); }}
                    className={`px-6 py-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'HISTORY' ? 'border-yellow-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                  >
                      History
                  </button>
              </div>
          </div>

          {/* GUEST LOOKUP FORM (Only if not logged in) */}
          {!user && (
              <div className="mb-12 bg-[#0a0a0a] border border-white/10 rounded-xl p-6 md:p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5"><Search size={100} className="text-white"/></div>
                  <h3 className="text-lg font-['Playfair_Display'] text-white mb-4">Find a Reservation</h3>
                  <form onSubmit={handleGuestLookup} className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                      <div className="w-full md:flex-1 space-y-2">
                          <label className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Booking ID</label>
                          <input 
                            type="text" 
                            placeholder="e.g. RES-ABC12345"
                            className="w-full bg-[#111] border border-white/10 rounded p-3 text-white focus:border-yellow-500 outline-none uppercase font-mono"
                            value={lookupId}
                            onChange={(e) => setLookupId(e.target.value)}
                          />
                      </div>
                      <div className="w-full md:flex-1 space-y-2">
                          <label className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Email Address</label>
                          <input 
                            type="email" 
                            placeholder="Email used for booking"
                            className="w-full bg-[#111] border border-white/10 rounded p-3 text-white focus:border-yellow-500 outline-none"
                            value={lookupEmail}
                            onChange={(e) => setLookupEmail(e.target.value)}
                          />
                      </div>
                      <button 
                        type="submit"
                        disabled={!lookupId || !lookupEmail}
                        className="w-full md:w-auto px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-yellow-500 hover:text-white transition-all rounded disabled:opacity-50 h-[46px]"
                      >
                          Lookup
                      </button>
                  </form>
                  {lookupError && (
                      <div className="mt-4 text-red-400 text-xs flex items-center gap-2">
                          <AlertCircle size={12} /> {lookupError}
                      </div>
                  )}
              </div>
          )}

          {/* Bookings List */}
          <div className="space-y-6">
              {displayedBookings.length === 0 ? (
                  <div className="text-center py-24 bg-[#0a0a0a] border border-white/5 rounded-lg">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        {activeTab === 'UPCOMING' ? <Calendar size={32} className="text-gray-600" /> : <History size={32} className="text-gray-600" />}
                      </div>
                      <h3 className="text-xl font-['Playfair_Display'] text-gray-400 mb-2">
                          {activeTab === 'UPCOMING' ? 'No Upcoming Trips Found' : 'No Booking History Found'}
                      </h3>
                      <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
                          {!user 
                            ? "We couldn't find any bookings saved on this device. Try looking up your reservation above."
                            : activeTab === 'UPCOMING' 
                                ? 'Your journey begins with a single step. Explore our collections and book your next escape.' 
                                : 'Your past adventures will appear here once they are completed or cancelled.'}
                      </p>
                      {activeTab === 'UPCOMING' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); onNavigate('ROOMS'); }}
                            className="px-8 py-3 bg-white text-black hover:bg-yellow-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                          >
                              Explore Rooms
                          </button>
                      )}
                  </div>
              ) : (
                  displayedBookings.map((booking) => (
                      <div 
                        key={booking.id} 
                        className="bg-[#0a0a0a] border border-white/10 rounded-lg overflow-hidden flex flex-col md:flex-row relative group hover:border-white/20 transition-all"
                      >
                          {/* Card Click Area (Navigation) - Absolute to avoid nesting buttons */}
                          <div 
                             className="absolute inset-0 z-0 cursor-pointer"
                             onClick={() => onNavigate(booking.type === 'ROOM' ? 'ROOM_DETAIL' : 'EXPERIENCE_DETAIL', booking.itemDetails.id)}
                          ></div>

                          {/* Image */}
                          <div className="w-full md:w-1/3 aspect-video md:aspect-auto relative overflow-hidden pointer-events-none">
                              <img src={booking.itemDetails.image} alt={booking.itemDetails.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                              <div className="absolute top-4 left-4">
                                  <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(booking.status)}`}>
                                      {booking.status}
                                  </span>
                              </div>
                          </div>

                          {/* Details */}
                          <div className="p-6 md:p-8 flex-1 flex flex-col justify-between relative z-10 pointer-events-none">
                              <div>
                                  <div className="flex justify-between items-start mb-2">
                                      <span className="text-[10px] text-luxury-gold font-bold uppercase tracking-widest">{booking.type}</span>
                                      <span className="text-sm text-gray-500 font-mono">{booking.id}</span>
                                  </div>
                                  <h3 className="text-2xl font-['Playfair_Display'] text-white mb-4 group-hover:text-yellow-500 transition-colors">{booking.itemDetails.name}</h3>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                      <div className="flex items-center gap-3 text-gray-400 text-sm">
                                          <Calendar size={16} className="text-yellow-600/70" />
                                          <span>
                                            {formatDate(booking.dates.checkIn)} 
                                            {booking.dates.checkOut && ` — ${formatDate(booking.dates.checkOut)}`}
                                          </span>
                                      </div>
                                      <div className="flex items-center gap-3 text-gray-400 text-sm">
                                          <MapPin size={16} className="text-yellow-600/70" />
                                          <span>{booking.itemDetails.location}</span>
                                      </div>
                                      {booking.dates.startTime && (
                                          <div className="flex items-center gap-3 text-gray-400 text-sm">
                                              <Clock size={16} className="text-yellow-600/70" />
                                              <span>{booking.dates.startTime}</span>
                                          </div>
                                      )}
                                      <div className="flex items-center gap-3 text-gray-400 text-sm">
                                            <span className="text-yellow-600/70 text-xs font-bold uppercase">Guests:</span>
                                            <span>{booking.guests.adults} Adl, {booking.guests.children} Chd</span>
                                      </div>
                                  </div>
                              </div>

                              <div className="flex items-center justify-between pt-6 border-t border-white/5 pointer-events-auto">
                                  <div className="flex flex-col">
                                      <span className="text-[10px] text-gray-500 uppercase tracking-widest">Total Price</span>
                                      <span className="text-lg font-['Playfair_Display'] text-white">{booking.totalPrice}</span>
                                  </div>
                                  
                                  <div className="flex gap-3 items-center">
                                      {/* --- SMART CANCEL BUTTON --- */}
                                      {booking.status === 'CONFIRMED' && (
                                          <div className="flex items-center gap-2">
                                              {confirmCancelId === booking.id ? (
                                                  <>
                                                      <span className="text-[10px] text-red-500 uppercase font-bold mr-2 animate-pulse">Are you sure?</span>
                                                      <button 
                                                        onClick={(e) => handleCancelClick(e, booking.id)}
                                                        disabled={processingId === booking.id}
                                                        className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 text-[10px] font-bold uppercase tracking-widest rounded transition-all flex items-center gap-2 shadow-lg z-20"
                                                      >
                                                          {processingId === booking.id ? 'Processing...' : 'Yes, Cancel'}
                                                      </button>
                                                      <button 
                                                        onClick={cancelConfirmation}
                                                        className="p-2 border border-white/20 text-gray-400 hover:text-white rounded transition-colors z-20"
                                                      >
                                                          <X size={14} />
                                                      </button>
                                                  </>
                                              ) : (
                                                  <button 
                                                    onClick={(e) => handleCancelClick(e, booking.id)}
                                                    className="px-4 py-2 border border-red-900/30 text-red-400 hover:bg-red-900/10 hover:border-red-500/50 text-[10px] font-bold uppercase tracking-widest rounded transition-all z-20"
                                                  >
                                                      Cancel Booking
                                                  </button>
                                              )}
                                          </div>
                                      )}

                                      <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onNavigate(booking.type === 'ROOM' ? 'ROOM_DETAIL' : 'EXPERIENCE_DETAIL', booking.itemDetails.id)
                                        }}
                                        className="px-4 py-2 bg-white text-black hover:bg-yellow-500 hover:text-white text-[10px] font-bold uppercase tracking-widest rounded transition-all flex items-center gap-2 z-20 ml-2"
                                      >
                                          Details <ArrowRight size={12} />
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))
              )}
          </div>
          
          {/* Policy Note */}
          <div className="mt-12 p-6 bg-[#0a0a0a] border border-white/5 rounded flex items-start gap-4">
              <AlertCircle size={20} className="text-gray-500 shrink-0 mt-1" />
              <div>
                  <h4 className="text-white text-sm font-bold mb-1">Cancellation Policy</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">
                      Cancellations made 48 hours or more prior to the scheduled check-in time or experience start time are fully refundable. 
                      Cancellations made within 48 hours may be subject to a fee equivalent to the first night's stay or 50% of the experience cost.
                      For assistance, please contact our 24/7 concierge.
                  </p>
              </div>
          </div>

      </div>
    </div>
  );
};

export default MyReservations;
    