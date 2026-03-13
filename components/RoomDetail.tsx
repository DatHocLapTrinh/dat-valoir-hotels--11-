
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Star, MapPin, Maximize, Calendar, Shield, Coffee, Wifi, Wind, Lock } from 'lucide-react';
import { ROOMS_DATA } from '../constants';
import { ViewState } from '../types';
import BookingModal from './BookingModal';
import { useSystemConfig } from '../context/SystemConfigContext';

interface RoomDetailProps {
  roomId: string;
  onNavigate: (view: ViewState, payload?: string) => void;
}

const RoomDetail: React.FC<RoomDetailProps> = ({ roomId, onNavigate }) => {
  const [room, setRoom] = useState<any>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const { config } = useSystemConfig();

  useEffect(() => {
    // Flatten data to find room
    const allRooms = Object.values(ROOMS_DATA).flat();
    const foundRoom = allRooms.find(r => r.id === roomId);
    if (foundRoom) {
      setRoom(foundRoom);
    }
  }, [roomId]);

  if (!room) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="bg-[#050505] min-h-screen text-white animate-[showContent_0.5s_ease-out]">
      
      {/* --- PARALLAX HERO --- */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-105"
            style={{ backgroundImage: `url(${room.image})` }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#050505]"></div>
        </div>
        
        {/* Navigation Back */}
        <button 
            onClick={() => onNavigate('ROOMS', room.location.toLowerCase())}
            className="absolute top-28 left-6 sm:left-12 z-50 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/80 hover:text-white transition-colors group"
        >
            <div className="p-2 border border-white/20 rounded-full group-hover:border-yellow-500 transition-colors">
                <ArrowLeft size={16} />
            </div>
            Back to Collection
        </button>

        <div className="absolute bottom-0 left-0 w-full px-6 sm:px-12 pb-16 z-20">
            <div className="max-w-4xl animate-[showContent_1s_ease-out]">
                <div className="flex items-center gap-4 text-yellow-500 mb-6 font-bold tracking-[0.2em] text-xs uppercase">
                    <Star size={16} className="fill-yellow-500"/>
                    Signature Collection
                    <span className="w-8 h-[1px] bg-yellow-500"></span>
                    {room.location}
                </div>
                <h1 className="text-5xl sm:text-7xl md:text-8xl font-['Playfair_Display'] leading-none mb-6 text-luxury-white">
                    {room.name}
                </h1>
                <div className="flex flex-col sm:flex-row gap-8 sm:items-center text-sm font-light text-gray-300">
                    <div className="flex items-center gap-2">
                        <Maximize size={18} className="text-luxury-gold"/>
                        <span className="uppercase tracking-wider">{room.size}</span>
                    </div>
                    <div className="w-[1px] h-4 bg-gray-600 hidden sm:block"></div>
                    <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-luxury-gold"/>
                        <span>{room.view}</span>
                    </div>
                    <div className="w-[1px] h-4 bg-gray-600 hidden sm:block"></div>
                    <div className="font-['Playfair_Display'] text-2xl text-white">
                        {room.price} <span className="text-xs font-sans text-gray-500 tracking-wide uppercase">/ Night</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* --- LEFT CONTENT (Story) --- */}
            <div className="lg:col-span-7 space-y-12">
                <div>
                    <h2 className="text-3xl font-['Playfair_Display'] mb-6 italic text-gray-400">The Experience</h2>
                    <p className="text-lg leading-relaxed font-light text-gray-300 font-['Poppins']">
                        {room.longDescription}
                    </p>
                </div>

                {/* Amenities Grid */}
                <div className="border-t border-b border-white/10 py-8">
                     <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-luxury-gold mb-8">Curated Amenities</h3>
                     <div className="grid grid-cols-2 md:grid-cols-2 gap-y-6 gap-x-4">
                        {room.amenities && room.amenities.map((item: string, i: number) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-yellow-500">
                                    <Check size={14} />
                                </div>
                                <span className="text-sm text-gray-300">{item}</span>
                            </div>
                        ))}
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                                <Wifi size={14} />
                            </div>
                            <span className="text-sm text-gray-300">High-Speed Fiber Optic</span>
                        </div>
                        <div className="flex items-center gap-4">
                             <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                                <Coffee size={14} />
                            </div>
                            <span className="text-sm text-gray-300">Artisan Coffee Bar</span>
                        </div>
                     </div>
                </div>
            </div>

            {/* --- RIGHT CONTENT (Booking & Specs) --- */}
            <div className="lg:col-span-5 relative">
                <div className="sticky top-32 bg-[#0a0a0a] border border-white/10 p-8 rounded-sm shadow-2xl">
                    <div className="text-center mb-8">
                        <span className="text-xs uppercase tracking-widest text-gray-500">Starting Rate</span>
                        <div className="text-4xl font-['Playfair_Display'] text-white mt-2">{room.price}</div>
                    </div>
                    
                    {config.enableBooking ? (
                        <button 
                            onClick={() => setIsBookingOpen(true)}
                            className="block w-full py-4 bg-white text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-luxury-gold hover:text-black transition-all mb-4 text-center"
                        >
                            Book Your Stay
                        </button>
                    ) : (
                        <div className="block w-full py-4 bg-white/10 text-gray-400 font-bold uppercase tracking-[0.2em] text-xs mb-4 text-center cursor-not-allowed border border-white/5 flex items-center justify-center gap-2">
                            <Lock size={14} />
                            Booking Unavailable
                        </div>
                    )}

                    <a 
                        href={`mailto:${config.email}?subject=Inquiry - ${room.name}`}
                        className="block w-full py-4 border border-white/20 text-white font-bold uppercase tracking-[0.2em] text-xs hover:bg-white/5 transition-all mb-8 text-center"
                    >
                        Contact Concierge
                    </a>

                    <div className="space-y-4 text-xs text-gray-500 font-medium">
                        <div className="flex items-center gap-3">
                            <Calendar size={14} />
                            <span>Free cancellation up to 48 hours</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Shield size={14} />
                            <span>Best Rate Guarantee</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- VISUAL JOURNEY (Gallery) --- */}
        <div className="py-32">
             <div className="text-center mb-16">
                 <span className="text-luxury-gold text-xs font-bold tracking-[0.3em] uppercase block mb-4">Visual Journey</span>
                 <h2 className="text-4xl sm:text-5xl font-['Playfair_Display']">Inside the {room.name}</h2>
             </div>
             
             {/* Gallery Layout */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[600px] md:h-[500px]">
                 {/* Main large image */}
                 <div className="md:col-span-1 h-full overflow-hidden rounded-sm group relative cursor-pointer">
                     <img 
                        src={room.gallery ? room.gallery[0] : room.image} 
                        className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                        alt="Gallery 1"
                     />
                     <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                 </div>
                 
                 {/* Secondary images grid */}
                 <div className="md:col-span-1 grid grid-rows-2 gap-4 h-full">
                     <div className="overflow-hidden rounded-sm group relative cursor-pointer">
                        <img 
                            src={room.gallery && room.gallery[1] ? room.gallery[1] : room.image} 
                            className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                            alt="Gallery 2"
                        />
                         <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                     </div>
                     <div className="overflow-hidden rounded-sm group relative cursor-pointer">
                        <img 
                            src={room.gallery && room.gallery[2] ? room.gallery[2] : room.image} 
                            className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                            alt="Gallery 3"
                        />
                         <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                     </div>
                 </div>
             </div>
        </div>

      </div>

       {/* --- BOOKING MODAL --- */}
       <BookingModal 
          item={room} 
          isOpen={isBookingOpen} 
          onClose={() => setIsBookingOpen(false)} 
       />
    </div>
  );
};

export default RoomDetail;
