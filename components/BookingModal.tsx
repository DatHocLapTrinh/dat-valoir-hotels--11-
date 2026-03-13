
import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Users, Building2, Wallet, Check, ChevronRight, ChevronLeft, Lock, Clock, ArrowRight, Landmark } from 'lucide-react';
import CalendarPopup from './CalendarPopup';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { useSystemConfig } from '../context/SystemConfigContext';

type BookingType = 'ROOM' | 'EXPERIENCE';

interface BookingModalProps {
  item: any; // Can be Room or Experience object
  type?: BookingType;
  isOpen: boolean;
  onClose: () => void;
  initialDates?: { checkIn: string; checkOut: string };
  initialGuests?: { adults: number; children: number };
}

type PaymentMethod = 'credit_card' | 'bank_transfer' | 'pay_at_counter';

const formatDateDisplay = (dateString: string) => {
  if (!dateString) return "Select Date";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Helper to calculate nights between two dates
const calculateNights = (start: string, end: string) => {
    if (!start || !end) return 0;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
};

// Helper to parse price string (e.g., "$2,500" -> 2500)
const parsePrice = (priceString: string) => {
    if (!priceString) return 0;
    return parseInt(priceString?.replace(/[^0-9]/g, ''), 10);
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
};

const BookingModal: React.FC<BookingModalProps> = ({ item, type = 'ROOM', isOpen, onClose, initialDates, initialGuests }) => {
  const { user } = useAuth();
  const { addBooking } = useBooking();
  const { config } = useSystemConfig();

  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string>('');
  
  // Form State
  const [dates, setDates] = useState({ checkIn: initialDates?.checkIn || '', checkOut: initialDates?.checkOut || '' });
  const [guests, setGuests] = useState({ adults: initialGuests?.adults || 2, children: initialGuests?.children || 0 });
  const [userInfo, setUserInfo] = useState({ name: '', email: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [specialRequest, setSpecialRequest] = useState('');
  const [totalCost, setTotalCost] = useState<string>('');
  const [serviceFeeAmount, setServiceFeeAmount] = useState<number>(0);

  // Calendar State
  const [activeDateInput, setActiveDateInput] = useState<'checkIn' | 'checkOut' | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Dynamic Price Calculation
  useEffect(() => {
    if (type === 'ROOM') {
        const nights = calculateNights(dates.checkIn, dates.checkOut);
        const basePrice = parsePrice(item.price);
        
        if (nights > 0 && basePrice > 0) {
            const roomTotal = basePrice * nights;
            const fee = roomTotal * (config.defaultServiceFee / 100);
            setServiceFeeAmount(fee);
            setTotalCost(formatCurrency(roomTotal + fee));
        } else {
            setTotalCost(item.price); // Fallback to base price display
            setServiceFeeAmount(0);
        }
    } else {
        setTotalCost(item.price || "Upon Request");
        setServiceFeeAmount(0);
    }
  }, [dates, item.price, type, config.defaultServiceFee]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsSuccess(false);
      setIsProcessing(false);
      setCreatedBookingId('');
      setActiveDateInput(null);
      setDates({ checkIn: initialDates?.checkIn || '', checkOut: initialDates?.checkOut || '' });
      setGuests({ adults: initialGuests?.adults || 2, children: initialGuests?.children || 0 });
      // Pre-fill user info if logged in
      if (user) {
          setUserInfo({
              name: user.name,
              email: user.email,
              phone: ''
          });
      } else {
          setUserInfo({ name: '', email: '', phone: '' });
      }
    }
  }, [isOpen, user, initialDates, initialGuests]);

  // Handle click outside to close calendar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setActiveDateInput(null);
      }
    }
    if (activeDateInput) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDateInput]);

  if (!isOpen) return null;

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = () => {
    setIsProcessing(true);
    
    // Simulate API Call & Add to Context
    setTimeout(() => {
      // Create Booking in Context
      const newBooking = addBooking({
          type: type,
          itemDetails: {
              id: item.id,
              name: item.name || item.title,
              image: item.image,
              location: item.location
          },
          dates: {
              checkIn: dates.checkIn,
              checkOut: type === 'ROOM' ? dates.checkOut : undefined,
              startTime: type === 'EXPERIENCE' ? item.details?.startTime : undefined
          },
          guests: guests,
          totalPrice: totalCost,
          paymentMethod: paymentMethod // PASSING THE ACTUAL PAYMENT METHOD
      }, userInfo.email); // Pass manual email for guests

      setCreatedBookingId(newBooking.id);

      // --- CRITICAL FOR GUESTS: SAVE BOOKING ID TO LOCAL STORAGE ---
      if (!user) {
          const currentGuestIds = JSON.parse(localStorage.getItem('datvaloir_guest_ids') || '[]');
          if (!currentGuestIds.includes(newBooking.id)) {
              currentGuestIds.push(newBooking.id);
              localStorage.setItem('datvaloir_guest_ids', JSON.stringify(currentGuestIds));
          }
      }

      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
  };

  const handleDateChange = (inputType: 'checkIn' | 'checkOut', date: string) => {
    if (type === 'EXPERIENCE') {
        // Experience only has one date
        setDates({ ...dates, checkIn: date });
        setActiveDateInput(null);
        return;
    }

    if (inputType === 'checkIn') {
        setDates({ ...dates, checkIn: date });
        // Automatically switch to checkout if checkout is empty or before checkin
        if (!dates.checkOut || new Date(dates.checkOut) <= new Date(date)) {
            setActiveDateInput('checkOut');
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);
            setDates(prev => ({...prev, checkIn: date, checkOut: nextDay.toISOString().split('T')[0]}));
        } else {
             setActiveDateInput(null);
        }
    } else {
        setDates({ ...dates, checkOut: date });
        setActiveDateInput(null);
    }
  };

  // SUCCESS VIEW
  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]" onClick={onClose}></div>
        <div className="relative bg-[#0a0a0a] border border-luxury-gold/30 w-full max-w-md p-8 rounded-lg text-center shadow-2xl animate-[scaleIn_0.3s_ease-out]">
            <div className="w-20 h-20 bg-luxury-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(234,179,8,0.4)]">
                <Check size={40} className="text-black" />
            </div>
            <h2 className="text-3xl font-['Playfair_Display'] text-white mb-2">
                {type === 'ROOM' ? 'Reservation Confirmed' : 'Experience Booked'}
            </h2>
            <div className="bg-white/5 p-3 rounded mb-4 inline-block">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Confirmation ID</p>
                <p className="text-lg font-mono font-bold text-luxury-gold select-all">{createdBookingId}</p>
            </div>
            <p className="text-gray-400 text-sm mb-6">
                Thank you, <span className="text-white font-bold">{userInfo.name}</span>. 
                Your {type === 'ROOM' ? 'stay' : 'journey'} at <span className="text-luxury-gold">{item.name || item.title}</span> has been secured. 
                A confirmation email has been sent to {userInfo.email}.
            </p>
            
            <div className="space-y-3">
                 <button 
                    onClick={() => {
                        window.location.hash = ''; 
                        onClose();
                        // Hacky way to simulate navigation if App exposes it globally or via Event
                        const navEvent = new CustomEvent('navigate-to-reservations');
                        window.dispatchEvent(navEvent);
                    }} 
                    className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                 >
                    View My Reservations <ArrowRight size={14} />
                </button>
                <button 
                    onClick={onClose} 
                    className="w-full py-4 bg-transparent border border-white/10 text-gray-400 font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative bg-[#0a0a0a] w-full max-w-5xl h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-xl shadow-2xl flex flex-col sm:flex-row overflow-hidden border border-white/10 animate-[showContent_0.3s_ease-out]">
        
        {/* --- LEFT SIDE: SUMMARY --- */}
        <div className="w-full sm:w-1/3 bg-[#111] p-6 sm:p-8 flex flex-col border-b sm:border-b-0 sm:border-r border-white/5 relative">
            <button onClick={onClose} className="absolute top-4 left-4 p-2 text-gray-500 hover:text-white sm:hidden z-20">
                <X size={24} />
            </button>
            
            <div className="mb-6 relative h-48 sm:h-64 rounded-lg overflow-hidden shrink-0 mt-8 sm:mt-0">
                <img src={item.image} alt={item.name || item.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                    <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest block mb-1">
                        {type === 'ROOM' ? 'Selected Suite' : 'Selected Journey'}
                    </span>
                    <h3 className="text-xl font-['Playfair_Display'] text-white leading-tight">{item.name || item.title}</h3>
                </div>
            </div>

            <div className="space-y-4 flex-grow">
                <div className="flex justify-between items-center text-sm border-b border-white/10 pb-4">
                    <span className="text-gray-400">{type === 'ROOM' ? 'Total Estimate' : 'Est. Price'}</span>
                    <span className="text-xl font-['Playfair_Display'] text-white">{totalCost}</span>
                </div>
                {type === 'ROOM' && (
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                        <span>Rate Breakdown</span>
                        <span>{item.price} x {calculateNights(dates.checkIn, dates.checkOut)} nights</span>
                    </div>
                )}

                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Location</span>
                    <span className="text-white text-right">{item.location}</span>
                </div>
                
                {/* Dynamic Date Summary */}
                {dates.checkIn && (
                    <div className="mt-4 p-4 bg-white/5 rounded border border-white/10 animate-[fadeIn_0.3s]">
                        {type === 'ROOM' ? (
                            <>
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>Check-in</span>
                                    <span>Check-out</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-white">
                                    <span>{dates.checkIn}</span>
                                    <span>{dates.checkOut || '...'}</span>
                                </div>
                            </>
                        ) : (
                             <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 mb-1">Date</span>
                                    <span className="text-sm font-bold text-white">{dates.checkIn}</span>
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="text-xs text-gray-400 mb-1">Start Time</span>
                                    <span className="text-sm font-bold text-white">{item.details?.startTime}</span>
                                </div>
                             </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-auto pt-6 text-[10px] text-gray-500 text-center uppercase tracking-widest hidden sm:block">
                Dat Valoir Secure Booking
            </div>
        </div>

        {/* --- RIGHT SIDE: WIZARD FORM --- */}
        <div className="w-full sm:w-2/3 bg-[#0a0a0a] flex flex-col h-full">
            {/* Header Steps */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0a0a0a]">
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${step === s ? 'bg-white text-black border-white' : step > s ? 'bg-yellow-600 text-black border-yellow-600' : 'bg-transparent text-gray-600 border-gray-800'}`}>
                                {step > s ? <Check size={14} /> : s}
                            </div>
                            {s < 4 && <div className={`w-8 sm:w-16 h-[1px] mx-2 transition-colors ${step > s ? 'bg-yellow-600' : 'bg-gray-800'}`}></div>}
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-white hidden sm:block">
                    <X size={24} />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-grow p-6 sm:p-10 overflow-y-auto custom-scrollbar">
                
                {/* STEP 1: ITINERARY */}
                {step === 1 && (
                    <div className="space-y-8 animate-[fadeIn_0.3s]">
                        <h2 className="text-2xl font-['Playfair_Display'] text-white">Your Itinerary</h2>
                        
                        <div className={`grid ${type === 'ROOM' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-6 relative`} ref={calendarRef}>
                            {/* Inputs */}
                            <div className="space-y-2 relative">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                                    {type === 'ROOM' ? 'Check-In Date' : 'Experience Date'}
                                </label>
                                <div 
                                    onClick={() => setActiveDateInput('checkIn')}
                                    className={`relative w-full bg-[#111] border rounded p-4 text-white cursor-pointer transition-colors hover:border-white/30 ${activeDateInput === 'checkIn' ? 'border-yellow-500' : 'border-white/10'}`}
                                >
                                    <span className={dates.checkIn ? "text-white font-bold" : "text-gray-500"}>
                                        {formatDateDisplay(dates.checkIn)}
                                    </span>
                                    <Calendar className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${activeDateInput === 'checkIn' ? 'text-yellow-500' : 'text-gray-500'}`} size={18} />
                                </div>
                                {activeDateInput === 'checkIn' && (
                                    <div className="absolute top-full left-0 mt-2 z-50">
                                        <CalendarPopup 
                                            selectedDate={dates.checkIn}
                                            onChange={(d) => handleDateChange('checkIn', d)}
                                            minDate={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                )}
                            </div>

                            {type === 'ROOM' && (
                                <div className="space-y-2 relative">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Check-Out Date</label>
                                    <div 
                                        onClick={() => setActiveDateInput('checkOut')}
                                        className={`relative w-full bg-[#111] border rounded p-4 text-white cursor-pointer transition-colors hover:border-white/30 ${activeDateInput === 'checkOut' ? 'border-yellow-500' : 'border-white/10'}`}
                                    >
                                        <span className={dates.checkOut ? "text-white font-bold" : "text-gray-500"}>
                                            {formatDateDisplay(dates.checkOut)}
                                        </span>
                                        <Calendar className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${activeDateInput === 'checkOut' ? 'text-yellow-500' : 'text-gray-500'}`} size={18} />
                                    </div>
                                    {activeDateInput === 'checkOut' && (
                                        <div className="absolute top-full right-0 sm:left-0 sm:right-auto mt-2 z-50">
                                            <CalendarPopup 
                                                selectedDate={dates.checkOut}
                                                onChange={(d) => handleDateChange('checkOut', d)}
                                                minDate={dates.checkIn || new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                             {type === 'EXPERIENCE' && (
                                <div className="space-y-2">
                                     <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Time Slot</label>
                                     <div className="w-full bg-[#111] border border-white/10 rounded p-4 text-gray-400 flex items-center justify-between">
                                         <span className="text-white font-bold">{item.details?.startTime}</span>
                                         <Clock size={18} />
                                     </div>
                                </div>
                             )}
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-4">Guests</label>
                            <div className="flex items-center gap-8">
                                <div className="flex items-center justify-between w-full p-4 bg-[#111] rounded border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <Users size={18} className="text-yellow-500" />
                                        <span className="text-white">Adults</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setGuests({...guests, adults: Math.max(1, guests.adults - 1)})} className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black">-</button>
                                        <span className="text-white font-bold w-4 text-center">{guests.adults}</span>
                                        <button 
                                            onClick={() => setGuests({...guests, adults: Math.min(config.maxGuestsPerRoom, guests.adults + 1)})} 
                                            disabled={guests.adults >= config.maxGuestsPerRoom}
                                            className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between w-full p-4 bg-[#111] rounded border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <Users size={18} className="text-yellow-500" />
                                        <span className="text-white">Children</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setGuests({...guests, children: Math.max(0, guests.children - 1)})} className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black">-</button>
                                        <span className="text-white font-bold w-4 text-center">{guests.children}</span>
                                        <button onClick={() => setGuests({...guests, children: guests.children + 1})} className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: GUEST DETAILS */}
                {step === 2 && (
                    <div className="space-y-6 animate-[fadeIn_0.3s]">
                        <h2 className="text-2xl font-['Playfair_Display'] text-white">Personal Details</h2>
                         {/* Guest mode warning */}
                         {!user && (
                            <div className="p-4 bg-yellow-900/10 border border-yellow-500/20 rounded flex gap-3">
                                <Lock size={18} className="text-yellow-500 shrink-0 mt-1" />
                                <p className="text-xs text-gray-400">
                                    You are booking as a <strong>Guest</strong>. A receipt will be saved to this device, but creating an account is recommended for easier management.
                                </p>
                            </div>
                        )}
                        <div className="space-y-4">
                            <input 
                                type="text" 
                                placeholder="Full Name" 
                                className="w-full bg-[#111] border border-white/10 rounded p-4 text-white focus:border-yellow-500 outline-none"
                                value={userInfo.name}
                                onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                            />
                            <input 
                                type="email" 
                                placeholder="Email Address" 
                                className="w-full bg-[#111] border border-white/10 rounded p-4 text-white focus:border-yellow-500 outline-none"
                                value={userInfo.email}
                                onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                            />
                            <input 
                                type="tel" 
                                placeholder="Phone Number" 
                                className="w-full bg-[#111] border border-white/10 rounded p-4 text-white focus:border-yellow-500 outline-none"
                                value={userInfo.phone}
                                onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                            />
                        </div>
                    </div>
                )}

                {/* STEP 3: PAYMENT */}
                {step === 3 && (
                    <div className="space-y-6 animate-[fadeIn_0.3s]">
                        <h2 className="text-2xl font-['Playfair_Display'] text-white">Payment Method</h2>
                        <div className="grid grid-cols-1 gap-4">
                            {/* Option 1: Credit Card */}
                            <label className={`relative p-6 rounded-lg border cursor-pointer transition-all ${paymentMethod === 'credit_card' ? 'bg-[#1a1a1a] border-yellow-500' : 'bg-[#111] border-white/10 hover:border-white/30'}`}>
                                <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'credit_card'} onChange={() => setPaymentMethod('credit_card')} />
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'credit_card' ? 'border-yellow-500' : 'border-gray-500'}`}>
                                            {paymentMethod === 'credit_card' && <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>}
                                        </div>
                                        <span className="font-bold text-white">Credit Card (Guarantee Only)</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-8 h-5 bg-white rounded"></div>
                                        <div className="w-8 h-5 bg-white rounded"></div>
                                    </div>
                                </div>
                                {paymentMethod === 'credit_card' && (
                                    <div className="space-y-4 animate-[slideDown_0.3s_ease-out]">
                                        <p className="text-xs text-gray-400 mb-2">No charge will be made today. Your card is needed to guarantee the reservation.</p>
                                        <input type="text" placeholder="Card Number" className="w-full bg-black border border-white/10 rounded p-3 text-white text-sm" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="text" placeholder="MM / YY" className="w-full bg-black border border-white/10 rounded p-3 text-white text-sm" />
                                            <input type="text" placeholder="CVC" className="w-full bg-black border border-white/10 rounded p-3 text-white text-sm" />
                                        </div>
                                    </div>
                                )}
                            </label>

                            {/* Option 2: Bank Transfer */}
                            <label className={`relative p-6 rounded-lg border cursor-pointer transition-all ${paymentMethod === 'bank_transfer' ? 'bg-[#1a1a1a] border-yellow-500' : 'bg-[#111] border-white/10 hover:border-white/30'}`}>
                                <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} />
                                <div className="flex items-center gap-3 mb-2">
                                     <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'bank_transfer' ? 'border-yellow-500' : 'border-gray-500'}`}>
                                        {paymentMethod === 'bank_transfer' && <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Landmark size={20} className={paymentMethod === 'bank_transfer' ? 'text-white' : 'text-gray-500'} />
                                        <span className="font-bold text-white">Bank Transfer</span>
                                    </div>
                                </div>
                                {paymentMethod === 'bank_transfer' && (
                                    <div className="mt-4 pt-4 border-t border-white/10 animate-[slideDown_0.3s_ease-out]">
                                        <p className="text-xs text-gray-400 mb-4">Please transfer the total amount to the following bank account to secure your booking.</p>
                                        <div className="bg-[#050505] p-4 rounded border border-white/5 space-y-2 text-sm font-mono text-gray-300">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Bank:</span>
                                                <span className="text-white">Dat Valoir International Bank</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Account No:</span>
                                                <span className="text-luxury-gold tracking-widest">9999-8888-7777</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Account Name:</span>
                                                <span className="text-white">DAT VALOIR HOTELS GROUP</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">SWIFT/BIC:</span>
                                                <span className="text-white">DVIBVN</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </label>

                            {/* Option 3: Pay at Counter */}
                             <label className={`relative p-6 rounded-lg border cursor-pointer transition-all ${paymentMethod === 'pay_at_counter' ? 'bg-[#1a1a1a] border-yellow-500' : 'bg-[#111] border-white/10 hover:border-white/30'}`}>
                                <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'pay_at_counter'} onChange={() => setPaymentMethod('pay_at_counter')} />
                                <div className="flex items-center gap-3">
                                     <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'pay_at_counter' ? 'border-yellow-500' : 'border-gray-500'}`}>
                                        {paymentMethod === 'pay_at_counter' && <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Wallet size={20} className={paymentMethod === 'pay_at_counter' ? 'text-white' : 'text-gray-500'} />
                                        <span className="font-bold text-white">Pay at Property</span>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                )}

                {/* STEP 4: CONFIRMATION */}
                {step === 4 && (
                    <div className="space-y-8 animate-[fadeIn_0.3s]">
                         <div className="space-y-4">
                            <h2 className="text-2xl font-['Playfair_Display'] text-white">Special Requests</h2>
                            <textarea 
                                placeholder={type === 'EXPERIENCE' ? "Dietary restrictions, allergies..." : "Anniversary arrangement..."}
                                className="w-full bg-[#111] border border-white/10 rounded p-4 text-white focus:border-yellow-500 outline-none h-32 resize-none"
                                value={specialRequest}
                                onChange={(e) => setSpecialRequest(e.target.value)}
                            ></textarea>
                         </div>

                         <div className="border-t border-white/10 pt-6">
                             <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Review Details</h3>
                             <div className="bg-[#111] p-6 rounded border border-white/10 space-y-3 text-sm">
                                 <div className="flex justify-between">
                                     <span className="text-gray-400">Guest</span>
                                     <span className="text-white">{userInfo.name}</span>
                                 </div>
                                 <div className="flex justify-between">
                                     <span className="text-gray-400">Date</span>
                                     <span className="text-white">
                                         {dates.checkIn} {dates.checkOut ? `— ${dates.checkOut}` : ''}
                                     </span>
                                 </div>
                                 <div className="flex justify-between">
                                     <span className="text-gray-400">Payment Method</span>
                                     <span className="text-white uppercase">
                                         {paymentMethod?.replace(/_/g, ' ')}
                                     </span>
                                 </div>
                                 <div className="pt-3 mt-3 border-t border-white/5 flex justify-between font-bold text-base">
                                     <span className="text-white">Total Estimate</span>
                                     <span className="text-luxury-gold">{totalCost}</span>
                                 </div>
                             </div>
                         </div>
                    </div>
                )}
            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t border-white/10 bg-[#0a0a0a] flex justify-between">
                {step > 1 ? (
                    <button onClick={handleBack} className="px-6 py-3 text-gray-400 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">
                        <ChevronLeft size={16} /> Back
                    </button>
                ) : <div></div>}

                <button 
                    onClick={step === 4 ? handleSubmit : handleNext} 
                    disabled={isProcessing || (step === 1 && !dates.checkIn) || (step === 2 && !userInfo.name)}
                    className="px-8 py-3 bg-white text-black hover:bg-yellow-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? 'Processing...' : step === 4 ? 'Confirm Reservation' : 'Continue'} 
                    {!isProcessing && <ChevronRight size={16} />}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
