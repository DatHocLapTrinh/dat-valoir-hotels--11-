
import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Users, Search, ChevronDown, Minus, Plus, X, Check, ChevronLeft, ChevronRight, Facebook, Instagram, Youtube, Twitter, MousePointer2, MapPin, BedDouble } from 'lucide-react'; 
import { SLIDES, LOCATIONS } from '../constants';
import { Slide, ViewState } from '../types';
import CalendarPopup from './CalendarPopup';

// --- UTILS & SUB-COMPONENTS (GuestSelector, GuestPopup) ---

const formatDateDisplay = (dateString: string) => {
  if (!dateString) return "Select Date";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

const getTodayString = () => new Date().toISOString().split('T')[0];

const ROOM_TYPES = [
  { id: 'all', label: 'All Types' },
  { id: 'standard', label: 'Standard Room' },
  { id: 'deluxe', label: 'Deluxe Room' },
  { id: 'suite', label: 'Suite Room' },
];

interface GuestSelectorProps {
  guests: { adults: number; children: number };
  onUpdate: (type: 'adults' | 'children', operation: 'inc' | 'dec') => void;
}
const GuestSelector: React.FC<GuestSelectorProps> = ({ guests, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex flex-col">
          <span className="font-bold text-base text-white">Adults</span>
          <span className="text-xs text-gray-400">Ages 13 or above</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={(e) => { e.stopPropagation(); onUpdate('adults', 'dec'); }} className={`w-8 h-8 flex items-center justify-center rounded-full border transition-colors ${guests.adults <= 1 ? 'border-white/10 text-gray-600 cursor-not-allowed' : 'border-white/30 text-white hover:border-yellow-500 hover:text-yellow-500'}`} disabled={guests.adults <= 1}><Minus size={16} /></button>
          <span className="w-8 text-center font-bold text-lg tabular-nums text-white">{guests.adults}</span>
          <button onClick={(e) => { e.stopPropagation(); onUpdate('adults', 'inc'); }} className="w-8 h-8 flex items-center justify-center rounded-full border border-white/30 text-white hover:border-yellow-500 hover:text-yellow-500 transition-colors"><Plus size={16} /></button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-bold text-base text-white">Children</span>
          <span className="text-xs text-gray-400">Ages 2 - 12</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={(e) => { e.stopPropagation(); onUpdate('children', 'dec'); }} className={`w-8 h-8 flex items-center justify-center rounded-full border transition-colors ${guests.children <= 0 ? 'border-white/10 text-gray-600 cursor-not-allowed' : 'border-white/30 text-white hover:border-yellow-500 hover:text-yellow-500'}`} disabled={guests.children <= 0}><Minus size={16} /></button>
          <span className="w-8 text-center font-bold text-lg tabular-nums text-white">{guests.children}</span>
          <button onClick={(e) => { e.stopPropagation(); onUpdate('children', 'inc'); }} className="w-8 h-8 flex items-center justify-center rounded-full border border-white/30 text-white hover:border-yellow-500 hover:text-yellow-500 transition-colors"><Plus size={16} /></button>
        </div>
      </div>
    </div>
  );
};

interface GuestPopupProps {
  guests: { adults: number; children: number };
  onUpdate: (type: 'adults' | 'children', operation: 'inc' | 'dec') => void;
  onApply: (e?: React.MouseEvent) => void;
  className?: string; 
  arrowPosition?: string;
}
const GuestPopup: React.FC<GuestPopupProps> = ({ guests, onUpdate, onApply, className, arrowPosition }) => {
  return (
    <div className={`absolute bg-[#0a0a0a]/95 backdrop-blur-2xl text-white rounded-2xl shadow-2xl p-6 z-[60] border border-white/10 animate-[showContent_0.2s_ease-out] cursor-default w-[300px] sm:w-[320px] ${className}`} onClick={(e) => e.stopPropagation()}>
        <GuestSelector guests={guests} onUpdate={onUpdate} />
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
            <button onClick={onApply} className="px-6 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black rounded-full text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_5px_15px_rgba(234,179,8,0.3)] flex items-center gap-2"><Check size={14} />APPLY</button>
        </div>
        <div className={`absolute w-4 h-4 bg-[#0a0a0a] transform rotate-45 border-r border-b border-white/10 ${arrowPosition}`}></div>
    </div>
  );
};

// --- MAIN COMPONENT ---

interface SliderProps {
  onNavigate: (view: ViewState, payload?: string) => void;
}

const Slider: React.FC<SliderProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<Slide[]>(SLIDES);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // --- BOOKING STATE ---
  const [location, setLocation] = useState<string>('all');
  const [roomType, setRoomType] = useState<string>('all');
  const [checkIn, setCheckIn] = useState<string>(getTodayString());
  const [checkOut, setCheckOut] = useState<string>(""); 
  const [guests, setGuests] = useState({ adults: 2, children: 0 });
  const [tempGuests, setTempGuests] = useState({ adults: 2, children: 0 });
  const [activePopup, setActivePopup] = useState<string>('none');
  
  const searchBarDesktopRef = useRef<HTMLDivElement>(null);
  const searchBarMobileRef = useRef<HTMLDivElement>(null);

  // --- SLIDER LOGIC ---
  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
        handleNext(false); // Auto play
    }, 8000);
  };

  const handleNext = (manual = true) => {
    if (manual) resetInterval();
    setItems((prev) => {
      const copy = [...prev];
      const first = copy.shift();
      if (first) copy.push(first);
      return copy;
    });
  };

  const handlePrev = () => {
    resetInterval();
    setItems((prev) => {
      const copy = [...prev];
      const last = copy.pop();
      if (last) copy.unshift(last);
      return copy;
    });
  };

  useEffect(() => {
    resetInterval();
    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // --- POPUP LOGIC ---
  useEffect(() => {
    if (activePopup === 'guests') {
      setTempGuests(guests);
    }
  }, [activePopup]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isOutsideDesktop = searchBarDesktopRef.current && !searchBarDesktopRef.current.contains(target);
      const isOutsideMobile = searchBarMobileRef.current && !searchBarMobileRef.current.contains(target);
      if (isOutsideDesktop && isOutsideMobile) setActivePopup('none');
    }
    if (activePopup !== 'none') document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activePopup]);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setCheckOut(tomorrow.toISOString().split('T')[0]);
  }, []);

  const updateTempGuests = (type: 'adults' | 'children', operation: 'inc' | 'dec') => {
    setTempGuests(prev => {
      const current = prev[type];
      let newValue = current;
      if (operation === 'inc') newValue = current + 1;
      if (operation === 'dec') newValue = current > 0 ? current - 1 : 0;
      if (type === 'adults' && newValue < 1 && operation === 'dec') return prev; 
      return { ...prev, [type]: newValue };
    });
  };

  const handleApplyGuests = (e?: React.MouseEvent) => {
    if(e) e.stopPropagation();
    setGuests(tempGuests);
    setActivePopup('none');
  };

  const handleDateSelect = (type: 'checkin' | 'checkout', date: string) => {
    if (type === 'checkin') {
        setCheckIn(date);
        setActivePopup('checkout'); 
        if (new Date(checkOut) <= new Date(date)) {
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);
            setCheckOut(nextDay.toISOString().split('T')[0]);
        }
    } else {
        setCheckOut(date);
        setActivePopup('none');
    }
  };

  const togglePopup = (popupName: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setActivePopup(activePopup === popupName ? 'none' : popupName);
  }

  const handleSearch = () => {
    if (!checkIn || !checkOut) {
        alert("Please select both check-in and check-out dates.");
        return;
    }
    const searchParams = {
      location,
      roomType,
      checkIn,
      checkOut,
      guests
    };
    onNavigate('ROOMS', JSON.stringify(searchParams));
  };

  // Calculate slide index for display
  const currentSlideIndex = items[0].id;

  const totalSlides = SLIDES.length;

  return (
    <div className="relative w-full h-[100vh] overflow-hidden bg-black shadow-2xl">
      {/* CINEMATIC NOISE OVERLAY */}
      <div className="bg-noise"></div>
      
      {/* --- SLIDES --- */}
      <div className="absolute inset-0">
        {items.map((item, index) => {
          let positionClasses = "";
          let contentClasses = "hidden";
          let brightness = "brightness-50";
          const commonCardClasses = "absolute transition-all duration-[2500ms] ease-[cubic-bezier(0.19,1,0.22,1)] will-change-[width,height,top,left,border-radius,transform] shadow-2xl bg-center bg-cover bg-no-repeat transform-gpu";

          if (index === 0) { // HERO
            positionClasses = "top-0 left-0 w-full h-full rounded-none z-10 overflow-hidden translate-x-0 translate-y-0";
            contentClasses = "block animate-show-content";
            brightness = "brightness-100"; 
          } else if (index === 1) { // CARD 1
            positionClasses = "top-[62%] sm:top-1/2 left-[50%] sm:left-[60%] w-[130px] h-[200px] sm:w-[300px] sm:h-[480px] -translate-x-1/2 sm:translate-x-0 -translate-y-1/2 rounded-[20px] z-40 overflow-hidden";
            brightness = "brightness-90"; 
          } else if (index === 2) { // CARD 2
            positionClasses = "top-[62%] sm:top-1/2 left-[calc(50%+140px)] sm:left-[calc(60%+320px)] w-[130px] h-[200px] sm:w-[300px] sm:h-[480px] -translate-x-1/2 sm:translate-x-0 -translate-y-1/2 rounded-[20px] z-30 overflow-hidden";
            brightness = "brightness-75";
          } else if (index === 3) { // CARD 3
            positionClasses = "top-[62%] sm:top-1/2 left-[calc(50%+280px)] sm:left-[calc(60%+640px)] w-[130px] h-[200px] sm:w-[300px] sm:h-[480px] -translate-x-1/2 sm:translate-x-0 -translate-y-1/2 rounded-[20px] z-20 overflow-hidden";
            brightness = "brightness-50";
          } else { // HIDDEN
            positionClasses = "top-[62%] sm:top-1/2 left-[calc(50%+800px)] w-[300px] h-[480px] -translate-x-1/2 sm:translate-x-0 -translate-y-1/2 rounded-[20px] z-0 opacity-0 overflow-hidden";
          }

          return (
            <div key={item.id} className={`${commonCardClasses} ${positionClasses}`} style={{ backgroundImage: `url(${item.image})` }}>
              <div className={`absolute inset-0 bg-black/10 transition-all duration-[2500ms] ${brightness === 'brightness-100' ? 'bg-black/20' : 'bg-black/50'}`}></div>

              <div className={`absolute top-[12%] sm:top-[25%] translate-y-0 sm:-translate-y-1/2 left-[5%] sm:left-[8%] w-[90%] sm:w-[45%] text-left text-white ${contentClasses}`} style={{ opacity: 0 }}>
                <div className="font-bold tracking-[0.2em] uppercase text-yellow-400 text-xs sm:text-sm mb-3 sm:mb-4 opacity-0 animate-[showContent_0.5s_0.7s_ease-in-out_1_forwards] flex items-center gap-3">
                    <span className="w-8 sm:w-12 h-[1px] bg-yellow-400 inline-block shadow-[0_0_10px_rgba(250,204,21,0.8)]"></span>
                    {item.location}
                </div>
                
                {/* --- LUXURY TITLE --- */}
                <h2 className="text-luxury-white text-4xl sm:text-6xl lg:text-8xl font-bold font-['Playfair_Display'] mb-4 sm:mb-6 uppercase leading-tight opacity-0 animate-[showContent_0.5s_0.9s_ease-in-out_1_forwards] drop-shadow-2xl tracking-wide">
                  {item.name}
                </h2>

                <p className="mb-6 sm:mb-10 text-sm sm:text-lg font-light text-gray-300 opacity-0 animate-[showContent_0.5s_1.1s_ease-in-out_1_forwards] border-l border-yellow-500/50 pl-4 sm:pl-6 leading-relaxed max-w-[100%] sm:max-w-[90%] drop-shadow-md bg-black/30 p-3 sm:p-4 rounded-r-lg backdrop-blur-sm line-clamp-3 sm:line-clamp-none">
                  {item.description}
                </p>

                <div className="hidden sm:flex flex-wrap gap-3 sm:gap-5 opacity-0 animate-[showContent_0.5s_1.3s_ease-in-out_1_forwards]">
                    <button 
                      onClick={() => onNavigate(item.action.view, item.action.payload)}
                      className="px-6 sm:px-10 py-3 sm:py-4 bg-white/10 border border-white/20 text-white font-bold uppercase tracking-widest text-[10px] sm:text-sm hover:bg-white hover:text-black hover:scale-105 transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-pointer rounded-sm backdrop-blur-md"
                    >
                      DISCOVER
                    </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- SCROLL INDICATOR --- */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 hidden sm:flex flex-col items-center gap-2 animate-pulse text-white/50">
          <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-white/50 to-transparent"></div>
      </div>

      {/* --- SLIDE COUNTER --- */}
      <div className="absolute top-24 right-6 sm:right-12 z-50 text-right hidden sm:block">
        <div className="text-white font-['Playfair_Display'] text-5xl font-bold opacity-20 relative inline-block">
             <span className="text-8xl absolute -top-8 -right-4 opacity-10 blur-[1px]">{currentSlideIndex}</span>
             {String(currentSlideIndex).padStart(2, '0')} 
             <span className="text-2xl font-light mx-2 text-gray-500">/</span> 
             <span className="text-2xl font-light text-gray-500">{String(totalSlides).padStart(2, '0')}</span>
        </div>
      </div>

      {/* --- NAVIGATION CONTROLS --- */}
      <div className="absolute z-50 bottom-24 right-4 sm:right-12 flex gap-4 animate-[showContent_0.5s_1.5s_ease-in-out_1_forwards] opacity-0">
         <button 
           onClick={() => handlePrev()}
           className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/20 bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white hover:text-black hover:scale-110 transition-all duration-300 group"
         >
            <ChevronLeft size={24} strokeWidth={1.5} className="group-hover:-translate-x-1 transition-transform" />
         </button>
         <button 
            onClick={() => handleNext(true)}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/20 bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white hover:text-black hover:scale-110 transition-all duration-300 group"
         >
            <ChevronRight size={24} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
         </button>
      </div>

      {/* --- SOCIAL LINKS --- */}
      <div className="absolute z-50 bottom-8 left-6 sm:left-12 flex flex-col gap-6 hidden sm:flex animate-[showContent_0.5s_1.7s_ease-in-out_1_forwards] opacity-0">
         <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-white/40 to-white/10 mx-auto"></div>
         <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Visit us on Facebook" className="text-gray-400 hover:text-yellow-400 hover:scale-125 transition-all duration-300"><Facebook size={20} strokeWidth={1.5} /></a>
         <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Visit us on Instagram" className="text-gray-400 hover:text-yellow-400 hover:scale-125 transition-all duration-300"><Instagram size={20} strokeWidth={1.5} /></a>
         <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" aria-label="Visit us on YouTube" className="text-gray-400 hover:text-yellow-400 hover:scale-125 transition-all duration-300"><Youtube size={20} strokeWidth={1.5} /></a>
         <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Visit us on Twitter" className="text-gray-400 hover:text-yellow-400 hover:scale-125 transition-all duration-300"><Twitter size={20} strokeWidth={1.5} /></a>
      </div>

      {/* --- SEARCH BARS (Mobile/Desktop) --- */}
      <div className="absolute z-50 bottom-4 w-full px-3 flex lg:hidden justify-center pointer-events-none">
        <div 
            ref={searchBarMobileRef}
            className="pointer-events-auto bg-black/80 backdrop-blur-2xl border border-white/10 p-2 rounded-[20px] grid grid-cols-2 items-center gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.8)] w-full max-w-[350px] animate-[showContent_0.5s_1.5s_ease-in-out_1_forwards] opacity-0 translate-y-10"
        >
            <div 
                className="relative flex items-center gap-2 px-3 py-2 w-full bg-white/5 rounded-xl cursor-pointer active:scale-95 transition-transform group col-span-2 border border-transparent hover:border-white/10"
                onClick={(e) => togglePopup('location', e)}
            >
                <MapPin size={16} className="text-yellow-500 shrink-0" />
                <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Location</span>
                    <span className="text-xs font-semibold text-white group-hover:text-yellow-200">{LOCATIONS.find(l => l.id === location)?.label || 'All Locations'}</span>
                </div>
                {activePopup === 'location' && (
                    <div className="absolute bottom-full left-0 mb-4 bg-[#0a0a0a]/95 backdrop-blur-2xl text-white rounded-2xl shadow-2xl p-4 z-[60] border border-white/10 w-[200px] animate-[showContent_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
                        {[{id: 'all', label: 'All Locations'}, ...LOCATIONS].map(loc => (
                            <div key={loc.id} onClick={() => { setLocation(loc.id); setActivePopup('none'); }} className="px-4 py-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors text-sm">
                                {loc.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div 
                className="relative flex items-center gap-2 px-3 py-2 w-full bg-white/5 rounded-xl cursor-pointer active:scale-95 transition-transform group col-span-1 border border-transparent hover:border-white/10"
                onClick={(e) => togglePopup('checkin', e)}
            >
                <CalendarIcon size={16} className="text-yellow-500 shrink-0" />
                <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Check-in</span>
                    <span className="text-xs font-semibold text-white group-hover:text-yellow-200">{formatDateDisplay(checkIn)}</span>
                </div>
                {activePopup === 'checkin' && (
                    <CalendarPopup 
                        selectedDate={checkIn}
                        onChange={(d) => handleDateSelect('checkin', d)}
                        minDate={getTodayString()}
                        className="bottom-full left-0 mb-4"
                        arrowPosition="-bottom-2 left-8"
                    />
                )}
            </div>
            <div 
                className="relative flex items-center gap-2 px-3 py-2 w-full bg-white/5 rounded-xl cursor-pointer active:scale-95 transition-transform group col-span-1 border border-transparent hover:border-white/10"
                onClick={(e) => togglePopup('checkout', e)}
            >
                <CalendarIcon size={16} className="text-yellow-500 shrink-0" />
                <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Check-out</span>
                    <span className="text-xs font-semibold text-white group-hover:text-yellow-200">{formatDateDisplay(checkOut)}</span>
                </div>
                 {activePopup === 'checkout' && (
                    <CalendarPopup 
                        selectedDate={checkOut}
                        onChange={(d) => handleDateSelect('checkout', d)}
                        minDate={checkIn}
                        className="bottom-full right-0 mb-4"
                        arrowPosition="-bottom-2 right-8"
                    />
                )}
            </div>
            <div 
                className="relative flex items-center gap-2 px-3 py-2 w-full bg-white/5 rounded-xl cursor-pointer transition-transform group col-span-1 border border-transparent hover:border-white/10"
                onClick={(e) => togglePopup('roomType', e)}
            >
                <BedDouble size={16} className="text-yellow-500 shrink-0" />
                <div className="flex flex-col truncate">
                    <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Room</span>
                    <span className="text-xs font-semibold text-white group-hover:text-yellow-200 truncate">{ROOM_TYPES.find(r => r.id === roomType)?.label || 'All Types'}</span>
                </div>
                {activePopup === 'roomType' && (
                    <div className="absolute bottom-full left-0 mb-4 bg-[#0a0a0a]/95 backdrop-blur-2xl text-white rounded-2xl shadow-2xl p-4 z-[60] border border-white/10 w-[200px] animate-[showContent_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
                        {ROOM_TYPES.map(type => (
                            <div key={type.id} onClick={() => { setRoomType(type.id); setActivePopup('none'); }} className="px-4 py-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors text-sm">
                                {type.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div 
                className="relative flex items-center gap-2 px-3 py-2 w-full bg-white/5 rounded-xl cursor-pointer transition-transform group col-span-1 justify-between border border-transparent hover:border-white/10"
                onClick={(e) => togglePopup('guests', e)}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <Users size={16} className="text-yellow-500 shrink-0" />
                    <div className="flex flex-col truncate">
                        <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Guests</span>
                        <span className="text-xs font-semibold text-white group-hover:text-yellow-200 truncate">
                            {guests.adults} Adl, {guests.children} Chd
                        </span>
                    </div>
                </div>

                {activePopup === 'guests' && (
                    <GuestPopup 
                        guests={tempGuests} 
                        onUpdate={updateTempGuests} 
                        onApply={handleApplyGuests}
                        className="bottom-full right-0 mb-4" 
                        arrowPosition="-bottom-2 right-10"
                    />
                )}
            </div>
            <button 
                onClick={handleSearch}
                className="w-full bg-yellow-600 text-white hover:bg-yellow-500 active:scale-95 transition-all duration-300 rounded-xl p-2 font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg col-span-2 h-10"
            >
                <Search size={18} />
                <span className="text-xs font-bold">SEARCH</span>
            </button>

        </div>
      </div>
      <div className="hidden lg:flex absolute z-50 bottom-12 w-full px-4 justify-center pointer-events-none">
        <div 
            ref={searchBarDesktopRef}
            className="pointer-events-auto bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-2 rounded-full flex items-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-[showContent_0.5s_1.5s_ease-in-out_1_forwards] opacity-0 translate-y-10 ring-1 ring-white/5"
        >
            <div 
                className="relative flex items-center gap-3 px-5 py-3.5 w-[160px] hover:bg-white/5 transition rounded-full cursor-pointer group border-r border-white/5"
                onClick={(e) => togglePopup('location', e)}
            >
                <MapPin size={18} className="text-yellow-500 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col truncate">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold group-hover:text-gray-300 transition-colors">Location</span>
                    <span className="text-sm font-semibold text-white group-hover:text-yellow-400 transition-colors font-['Poppins'] truncate">{LOCATIONS.find(l => l.id === location)?.label || 'All Locations'}</span>
                </div>
                {activePopup === 'location' && (
                    <div className="absolute bottom-full left-0 mb-6 bg-[#0a0a0a]/95 backdrop-blur-2xl text-white rounded-2xl shadow-2xl p-4 z-[60] border border-white/10 w-[200px] animate-[showContent_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
                        {[{id: 'all', label: 'All Locations'}, ...LOCATIONS].map(loc => (
                            <div key={loc.id} onClick={() => { setLocation(loc.id); setActivePopup('none'); }} className="px-4 py-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors text-sm">
                                {loc.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div 
                className="relative flex items-center gap-3 px-5 py-3.5 w-[160px] hover:bg-white/5 transition rounded-full cursor-pointer group border-r border-white/5"
                onClick={(e) => togglePopup('roomType', e)}
            >
                <BedDouble size={18} className="text-yellow-500 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col truncate">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold group-hover:text-gray-300 transition-colors">Room Type</span>
                    <span className="text-sm font-semibold text-white group-hover:text-yellow-400 transition-colors font-['Poppins'] truncate">{ROOM_TYPES.find(r => r.id === roomType)?.label || 'All Types'}</span>
                </div>
                {activePopup === 'roomType' && (
                    <div className="absolute bottom-full left-0 mb-6 bg-[#0a0a0a]/95 backdrop-blur-2xl text-white rounded-2xl shadow-2xl p-4 z-[60] border border-white/10 w-[200px] animate-[showContent_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
                        {ROOM_TYPES.map(type => (
                            <div key={type.id} onClick={() => { setRoomType(type.id); setActivePopup('none'); }} className="px-4 py-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors text-sm">
                                {type.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div 
                className="relative flex items-center gap-3 px-5 py-3.5 w-[150px] hover:bg-white/5 transition rounded-full cursor-pointer group border-r border-white/5"
                onClick={(e) => togglePopup('checkin', e)}
            >
                <CalendarIcon size={18} className="text-yellow-500 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold group-hover:text-gray-300 transition-colors">Check-in</span>
                    <span className="text-sm font-semibold text-white group-hover:text-yellow-400 transition-colors font-['Poppins']">{formatDateDisplay(checkIn)}</span>
                </div>
                {activePopup === 'checkin' && (
                    <CalendarPopup 
                        selectedDate={checkIn}
                        onChange={(d) => handleDateSelect('checkin', d)}
                        minDate={getTodayString()}
                        className="bottom-full left-0 mb-6"
                        arrowPosition="-bottom-2 left-10"
                    />
                )}
            </div>
            <div 
                className="relative flex items-center gap-3 px-5 py-3.5 w-[150px] hover:bg-white/5 transition rounded-full cursor-pointer group border-r border-white/5"
                onClick={(e) => togglePopup('checkout', e)}
            >
                <CalendarIcon size={18} className="text-yellow-500 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold group-hover:text-gray-300 transition-colors">Check-out</span>
                    <span className="text-sm font-semibold text-white group-hover:text-yellow-400 transition-colors font-['Poppins']">{formatDateDisplay(checkOut)}</span>
                </div>
                {activePopup === 'checkout' && (
                    <CalendarPopup 
                        selectedDate={checkOut}
                        onChange={(d) => handleDateSelect('checkout', d)}
                        minDate={checkIn}
                        className="bottom-full left-0 mb-6"
                        arrowPosition="-bottom-2 left-10"
                    />
                )}
            </div>
            <div 
                className="relative flex items-center gap-3 px-5 py-3.5 w-[180px] hover:bg-white/5 transition rounded-full cursor-pointer group"
                onClick={(e) => togglePopup('guests', e)}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <Users size={18} className="text-yellow-500 shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="flex flex-col truncate">
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold group-hover:text-gray-300 transition-colors">Guests</span>
                        <span className="text-sm font-semibold text-white group-hover:text-yellow-400 transition-colors truncate font-['Poppins']">
                            {guests.adults} Adl, {guests.children} Kids
                        </span>
                    </div>
                </div>
                <ChevronDown size={14} className={`text-gray-500 shrink-0 ml-auto transition-transform duration-300 ${activePopup === 'guests' ? 'rotate-180' : ''}`} />
                {activePopup === 'guests' && (
                    <GuestPopup 
                        guests={tempGuests} 
                        onUpdate={updateTempGuests} 
                        onApply={handleApplyGuests}
                        className="bottom-full left-0 sm:left-auto sm:right-0 mb-6" 
                        arrowPosition="-bottom-2 right-10"
                    />
                )}
            </div>
            <div className="pl-2">
                <button 
                    onClick={handleSearch}
                    className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-700 text-white hover:brightness-110 hover:scale-105 transition-all duration-300 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(234,179,8,0.4)] group border border-white/10"
                >
                    <Search size={22} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Slider;
