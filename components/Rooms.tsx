
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Star, Check, Maximize, ArrowUpRight, Lock, Calendar, Users, SearchX } from 'lucide-react';
import { ROOMS_DATA, LOCATIONS } from '../constants';
import { ViewState } from '../types';
import BookingModal from './BookingModal';
import { useSystemConfig } from '../context/SystemConfigContext';
import { useBooking } from '../context/BookingContext';

interface RoomsProps {
  initialLocation?: string | null;
  onNavigate?: (view: ViewState, payload?: string) => void;
}

interface SearchParams {
  checkIn: string;
  checkOut: string;
  guests: { adults: number; children: number };
  location?: string;
  roomType?: string;
}

const Rooms: React.FC<RoomsProps> = ({ initialLocation, onNavigate }) => {
  const [activeLocation, setActiveLocation] = useState('hanoi');
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [animateKey, setAnimateKey] = useState(0); 
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { config } = useSystemConfig();
  const { bookings } = useBooking();
  
  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<any>(null);

  // Sync initial location or search params if provided
  useEffect(() => {
    if (initialLocation) {
      try {
        const parsed = JSON.parse(initialLocation);
        if (parsed.checkIn && parsed.checkOut && parsed.guests) {
          setSearchParams(parsed);
          setActiveLocation('search_results');
        }
      } catch (e) {
        // Not JSON, treat as location string
        if (LOCATIONS.some(loc => loc.id === initialLocation)) {
          setActiveLocation(initialLocation);
          setSearchParams(null);
        }
      }
    } else {
      setSearchParams(null);
      if (activeLocation === 'search_results') {
        setActiveLocation('hanoi');
      }
    }
  }, [initialLocation]);

  // Handle Location Switch
  const handleLocationChange = (id: string) => {
    if (id === activeLocation) return;
    setActiveLocation(id);
    if (id !== 'search_results') {
        setSearchParams(null);
    }
    setAnimateKey(prev => prev + 1);
  };

  const handleRoomClick = (roomId: string) => {
    if (onNavigate) {
      onNavigate('ROOM_DETAIL', roomId);
    }
  };

  const handleBookNow = (room: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRoomForBooking(room);
    setIsBookingOpen(true);
  };

  // Filter rooms based on search params
  const displayedRooms = useMemo(() => {
    if (activeLocation !== 'search_results' || !searchParams) {
      return ROOMS_DATA[activeLocation] || [];
    }

    const requestedStart = new Date(searchParams.checkIn).getTime();
    const requestedEnd = new Date(searchParams.checkOut).getTime();
    const totalGuests = searchParams.guests.adults + searchParams.guests.children;

    // Flatten all rooms
    let allRooms = Object.values(ROOMS_DATA).flat();

    if (searchParams.location && searchParams.location !== 'all') {
      allRooms = ROOMS_DATA[searchParams.location] || [];
    }

    return allRooms.filter(room => {
      // 1. Check guest capacity (assuming maxGuestsPerRoom applies to total guests or adults. Let's use config.maxGuestsPerRoom for adults for now, or total. The prompt says maxGuestsPerRoom is for adults in BookingModal. Let's just check if adults <= config.maxGuestsPerRoom)
      if (searchParams.guests.adults > config.maxGuestsPerRoom) return false;

      // 2. Check room type
      if (searchParams.roomType && searchParams.roomType !== 'all') {
        const typeMap: Record<string, string> = {
          'standard': 'Standard',
          'deluxe': 'Deluxe',
          'suite': 'Suite'
        };
        const targetType = typeMap[searchParams.roomType];
        if (targetType && !room.name.includes(targetType)) return false;
      }

      // 3. Check availability
      const hasOverlap = bookings.some(booking => {
        if (booking.itemDetails.id !== room.id || booking.status === 'CANCELLED' || booking.type !== 'ROOM') return false;
        
        const bookingStart = new Date(booking.dates.checkIn).getTime();
        const bookingEnd = new Date(booking.dates.checkOut!).getTime();
        
        // Overlap condition: requested start is before booking end AND requested end is after booking start
        return requestedStart < bookingEnd && requestedEnd > bookingStart;
      });

      return !hasOverlap;
    });
  }, [activeLocation, searchParams, bookings, config.maxGuestsPerRoom]);

  // Setup Animation Observer

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0', 'translate-y-12');
          entry.target.classList.add('opacity-100', 'translate-y-0');
          observerRef.current?.unobserve(entry.target);
        }
      });
    };

    observerRef.current = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '0px',
      threshold: 0.15,
    });

    const elements = document.querySelectorAll('.animate-room-scroll');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [activeLocation, animateKey]);

  return (
    <div className="bg-[#050505] min-h-screen w-full text-white pt-24 pb-20">
      
      {/* --- HEADER SECTION --- */}
      <div className="px-6 sm:px-12 text-center mb-16 animate-[showContent_1s_ease-out]">
        <span className="text-luxury-gold text-xs font-bold tracking-[0.3em] uppercase block mb-4">
          The Signature Collection
        </span>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-['Playfair_Display'] mb-6">
          Sanctuaries of <span className="italic text-gray-400 font-light">Silence</span>
        </h1>
        <p className="max-w-2xl mx-auto text-gray-400 font-light text-sm sm:text-base leading-relaxed">
          From the timeless charm of Hanoi to the coastal grandeur of Da Nang and the vibrant energy of Saigon. 
          Discover our three signature suites at each destination, curated for the few.
        </p>
      </div>

      {/* --- LOCATION TABS --- */}
      <div className="sticky top-20 z-40 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 mb-20 transition-all duration-300">
        <div className="flex justify-center gap-8 sm:gap-16 px-6 py-6 overflow-x-auto custom-scrollbar">
            {activeLocation === 'search_results' && (
              <button
                className={`group flex flex-col items-center gap-2 min-w-max transition-all duration-500 relative pb-2 outline-none`}
              >
                <span className={`text-sm sm:text-base font-bold tracking-[0.15em] uppercase font-['Playfair_Display'] transition-colors duration-500 text-white`}>
                  Search Results
                </span>
                <span className={`text-[9px] tracking-widest uppercase transition-colors duration-500 text-luxury-gold`}>
                  Available Suites
                </span>
                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-yellow-500 transition-all duration-500 scale-x-100 opacity-100`}></span>
              </button>
            )}
            {LOCATIONS.map((loc) => (
              <button
                key={loc.id}
                onClick={() => handleLocationChange(loc.id)}
                className={`group flex flex-col items-center gap-2 min-w-max transition-all duration-500 relative pb-2 outline-none`}
              >
                <span className={`text-sm sm:text-base font-bold tracking-[0.15em] uppercase font-['Playfair_Display'] transition-colors duration-500 ${activeLocation === loc.id ? 'text-white' : 'text-gray-600 group-hover:text-gray-400'}`}>
                  {loc.label}
                </span>
                <span className={`text-[9px] tracking-widest uppercase transition-colors duration-500 ${activeLocation === loc.id ? 'text-luxury-gold' : 'text-transparent group-hover:text-gray-700'}`}>
                  {loc.tagline}
                </span>
                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-yellow-500 transition-all duration-500 ${activeLocation === loc.id ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}`}></span>
              </button>
            ))}
        </div>
      </div>

      {/* --- SEARCH PARAMS SUMMARY --- */}
      {activeLocation === 'search_results' && searchParams && (
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 mb-12 animate-[showContent_0.5s_ease-out]">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 bg-[#111] border border-white/10 rounded-full py-4 px-8 w-fit mx-auto">
                {searchParams.location && searchParams.location !== 'all' && (
                    <>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <MapPin size={16} className="text-yellow-500" />
                            <span>{LOCATIONS.find(l => l.id === searchParams.location)?.label}</span>
                        </div>
                        <div className="w-[1px] h-4 bg-white/20 hidden sm:block"></div>
                    </>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Calendar size={16} className="text-yellow-500" />
                    <span>{new Date(searchParams.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(searchParams.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="w-[1px] h-4 bg-white/20 hidden sm:block"></div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Users size={16} className="text-yellow-500" />
                    <span>{searchParams.guests.adults} Adults, {searchParams.guests.children} Kids</span>
                </div>
                {searchParams.roomType && searchParams.roomType !== 'all' && (
                    <>
                        <div className="w-[1px] h-4 bg-white/20 hidden sm:block"></div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <span className="text-yellow-500 font-bold">Room:</span>
                            <span className="capitalize">{searchParams.roomType}</span>
                        </div>
                    </>
                )}
            </div>
        </div>
      )}

      {/* --- ROOM LIST --- */}
      <div key={animateKey} className="max-w-[1400px] mx-auto px-6 sm:px-12 space-y-32">
        {displayedRooms.length === 0 ? (
            <div className="text-center py-20 animate-[showContent_0.5s_ease-out]">
                <SearchX size={48} className="mx-auto text-gray-600 mb-6" />
                <h3 className="text-2xl font-['Playfair_Display'] text-white mb-2">No Suites Available</h3>
                <p className="text-gray-400">Please try adjusting your dates or guest count.</p>
            </div>
        ) : (
            displayedRooms.map((room, index) => {
              const isEven = index % 2 === 0;
              return (
                <div 
                  key={room.id} 
                  className={`flex flex-col lg:flex-row gap-12 lg:gap-24 items-center animate-room-scroll opacity-0 translate-y-12 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${!isEven ? 'lg:flex-row-reverse' : ''}`}
                >

              <div 
                className="w-full lg:w-3/5 relative group cursor-pointer"
                onClick={() => handleRoomClick(room.id)}
              >
                {/* Image Border Effect */}
                <div className="absolute inset-0 border border-white/10 translate-x-4 translate-y-4 rounded-sm transition-transform duration-500 group-hover:translate-x-6 group-hover:translate-y-6"></div>
                
                {/* Main Image Container */}
                <div className="relative overflow-hidden aspect-[16/10] shadow-2xl rounded-sm">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700 z-10"></div>
                  <img 
                    src={room.image} 
                    alt={room.name} 
                    className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-[1.5s]" 
                  />
                  
                  {/* Price Tag Overlay */}
                  <div className="absolute bottom-0 left-0 bg-[#0a0a0a] text-white px-6 py-4 z-20 border-t border-r border-white/10">
                    <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Starting at</span>
                    <span className="font-['Playfair_Display'] text-xl font-bold text-luxury-gold">{room.price} <span className="text-sm font-normal text-gray-500 text-white/60">/ night</span></span>
                  </div>
                  
                  {/* View Details Hover Overlay */}
                  <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="w-20 h-20 rounded-full border border-white/50 bg-black/40 backdrop-blur-sm flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-500">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white">View</span>
                      </div>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-2/5 space-y-8">
                <div onClick={() => handleRoomClick(room.id)} className="cursor-pointer">
                    <div className="flex items-center gap-4 text-xs font-bold tracking-widest text-luxury-gold uppercase mb-3">
                        <div className="flex items-center gap-1">
                           <Star size={12} className="fill-yellow-500 text-yellow-500" />
                           <Star size={12} className="fill-yellow-500 text-yellow-500" />
                           <Star size={12} className="fill-yellow-500 text-yellow-500" />
                           <Star size={12} className="fill-yellow-500 text-yellow-500" />
                           <Star size={12} className="fill-yellow-500 text-yellow-500" />
                        </div>
                        <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                        <span>{room.size}</span>
                    </div>
                    
                    <h2 className="text-4xl sm:text-5xl font-['Playfair_Display'] leading-tight mb-4 group-hover:text-luxury-gold transition-colors duration-500">
                      {room.name}
                    </h2>
                    
                    <div className="flex items-center gap-2 mb-6 text-gray-400 text-sm italic">
                        <MapPin size={14} />
                        <span>{room.view}</span>
                    </div>

                    <p className="text-gray-400 font-light leading-relaxed text-sm sm:text-base border-l-2 border-white/10 pl-6 py-1">
                      {room.desc}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-2 py-6 border-t border-b border-white/5">
                  {room.features.map((feat: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-xs sm:text-sm text-gray-300 group/feat">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-600 group-hover/feat:bg-yellow-400 transition-colors"></div>
                        {feat}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                    <button 
                        onClick={() => handleRoomClick(room.id)}
                        className="flex-1 sm:flex-none px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-yellow-500 hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                        Explore Suite
                    </button>
                    {config.enableBooking ? (
                        <button 
                             onClick={(e) => handleBookNow(room, e)}
                             className="flex-1 sm:flex-none px-8 py-4 border border-white/20 text-white font-bold uppercase tracking-widest text-xs hover:border-yellow-500 hover:text-yellow-500 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                        >
                            Reserve Now
                            <ArrowUpRight size={16} className="group-hover/btn:rotate-45 transition-transform"/>
                        </button>
                    ) : (
                        <button 
                             disabled
                             className="flex-1 sm:flex-none px-8 py-4 border border-white/10 text-gray-500 font-bold uppercase tracking-widest text-xs cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Lock size={14} />
                            Unavailable
                        </button>
                    )}
                </div>
              </div>
            </div>
          );
        })
        )}
      </div>
      
      {/* --- BOTTOM CTA --- */}
      <div className="mt-32 text-center pb-12 animate-room-scroll opacity-0 translate-y-12 transition-all duration-1000">
           <p className="text-gray-500 italic font-['Playfair_Display'] mb-4">"Not finding what you are looking for?"</p>
           <a 
              href="mailto:reservations@datvaloir.com?subject=Private Concierge Request - Signature Collection"
              className="inline-block text-white border-b border-yellow-500 pb-1 text-xs font-bold uppercase tracking-widest hover:text-yellow-500 transition-colors"
           >
               Contact Private Concierge
           </a>
      </div>

      {/* --- BOOKING MODAL --- */}
      {selectedRoomForBooking && (
        <BookingModal 
          item={selectedRoomForBooking} 
          isOpen={isBookingOpen} 
          onClose={() => setIsBookingOpen(false)} 
          initialDates={searchParams ? { checkIn: searchParams.checkIn, checkOut: searchParams.checkOut } : undefined}
          initialGuests={searchParams ? searchParams.guests : undefined}
        />
      )}

    </div>
  );
};

export default Rooms;
