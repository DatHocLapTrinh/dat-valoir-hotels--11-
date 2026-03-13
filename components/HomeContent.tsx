
import React, { useEffect, useRef } from 'react';
import { ArrowRight, Star, Coffee, Wifi, MapPin } from 'lucide-react';
import { ViewState } from '../types';
import { ROOMS_DATA } from '../constants';

const FEATURES = [
  { title: "Butler Service", icon: <Star size={18} /> },
  { title: "Private Dining", icon: <Coffee size={18} /> },
  { title: "High-Speed Wifi", icon: <Wifi size={18} /> },
  { title: "Prime Location", icon: <MapPin size={18} /> },
];

// Select the Signature Room (Index 0) from each location
const FEATURED_ROOMS = [
  ROOMS_DATA['hanoi'][0],
  ROOMS_DATA['danang'][0],
  ROOMS_DATA['hcmc'][0]
];

interface HomeContentProps {
  onNavigate: (view: ViewState, payload?: string) => void;
}

const HomeContent: React.FC<HomeContentProps> = ({ onNavigate }) => {
  // Use a ref to track if observer has been set up to avoid duplicate setups (though React 18 handles strict mode well with cleanups)
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Logic: Create an observer that looks for elements with 'animate-on-scroll' class
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // When element enters viewport, remove hidden state and add visible state
          entry.target.classList.remove('opacity-0', 'translate-y-10');
          entry.target.classList.add('opacity-100', 'translate-y-0');
          // Optional: Stop observing once animated
          observerRef.current?.unobserve(entry.target);
        }
      });
    };

    observerRef.current = new IntersectionObserver(observerCallback, {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0.1, // Trigger when 10% of the element is visible
    });

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="relative bg-black text-white z-10 w-full">
      
      {/* --- SECTION 1: THE PHILOSOPHY (Zig-zag Layout) --- */}
      <section className="px-6 sm:px-12 py-24 sm:py-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <div className="space-y-8 animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out" style={{transitionDelay: '100ms'}}>
            <span className="text-yellow-500 font-bold tracking-[0.2em] text-xs uppercase flex items-center gap-4">
              <span className="w-12 h-[1px] bg-yellow-500"></span>
              A Legacy of Elegance
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-['Playfair_Display'] leading-tight">
              Where <span className="text-luxury-gold italic pr-2">History</span>
              Meets Modern Luxury
            </h2>
            <p className="text-gray-300 leading-relaxed text-sm sm:text-base font-light font-['Poppins']">
              Dat Valoir is not merely a hotel; it is a sanctuary where time stands still. 
              Drawing inspiration from the golden age of travel, we curate experiences that linger in your memory long after you leave.
              Every detail, from the scent of white tea in the lobby to the thread count of your linens, is orchestrating a symphony of comfort.
            </p>
            
            <div className="grid grid-cols-2 gap-6 pt-4">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-300 font-medium group cursor-default">
                  <div className="p-2 rounded-full bg-white/5 text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black transition-colors duration-300">
                    {f.icon}
                  </div>
                  {f.title}
                </div>
              ))}
            </div>

            <button 
                onClick={() => onNavigate('ABOUT')}
                className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white hover:text-yellow-500 transition-colors group"
            >
              Read Our Story
              <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
            </button>
          </div>

          {/* Image Composition */}
          <div className="relative group animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out" style={{transitionDelay: '300ms'}}>
            <div className="absolute -inset-4 border border-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 scale-95 group-hover:scale-100"></div>
            <div className="relative overflow-hidden rounded-t-[200px] rounded-b-[20px] shadow-2xl aspect-[3/4] lg:aspect-[4/5] opacity-90 group-hover:opacity-100 transition-all duration-700">
               <img 
                 src="https://images.unsplash.com/photo-1560185007-cde436f6a4d0?q=80&w=2070&auto=format&fit=crop" 
                 alt="Interior" 
                 className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[2s]"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-[#1a1a1a] p-6 rounded-full shadow-2xl border border-white/5 hidden sm:block animate-bounce-slow">
                <div className="text-center">
                    <span className="block text-3xl font-['Playfair_Display'] text-luxury-gold font-bold">25</span>
                    <span className="text-[10px] uppercase tracking-widest text-gray-400">Years of<br/>Excellence</span>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 2: CURATED ROOMS (Horizontal Flow) --- */}
      <section className="py-24 bg-[#050505] border-t border-white/5">
        <div className="px-6 sm:px-12 max-w-[1400px] mx-auto animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-16 gap-6">
            <div>
                <span className="text-yellow-500 font-bold tracking-[0.2em] text-xs uppercase mb-4 block">Accommodations</span>
                <h2 className="text-4xl sm:text-5xl font-['Playfair_Display']">Signature Collections</h2>
            </div>
            <button 
                onClick={() => onNavigate('ROOMS')}
                className="px-8 py-3 border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300"
            >
                View All Suites
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURED_ROOMS.map((room, idx) => (
                <div 
                    key={room.id} 
                    className="group relative cursor-pointer" 
                    style={{transitionDelay: `${idx * 150}ms`}}
                    onClick={() => onNavigate('ROOM_DETAIL', room.id)}
                >
                    <div className="overflow-hidden rounded-2xl mb-6 relative aspect-[4/5] shadow-lg">
                        <img 
                            src={room.image} 
                            alt={room.name} 
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 filter brightness-75 group-hover:brightness-100" 
                        />
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-xs font-medium border border-white/10">
                            {room.price}
                        </div>
                        {/* Location Tag */}
                        <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-sm text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 border border-white/5">
                            <MapPin size={10} className="text-luxury-gold"/>
                            {room.location}
                        </div>
                    </div>
                    <h3 className="text-2xl font-['Playfair_Display'] mb-2 group-hover:text-yellow-500 transition-colors">{room.name}</h3>
                    <p className="text-gray-500 text-sm font-['Poppins'] leading-relaxed line-clamp-2">{room.desc}</p>
                    <div className="mt-4 w-12 h-[1px] bg-white/20 group-hover:w-full group-hover:bg-yellow-500 transition-all duration-500"></div>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 3: IMMERSIVE PARALLAX QUOTE --- */}
      <section className="relative py-32 sm:py-48 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
             <img 
                src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop" 
                className="w-full h-full object-cover opacity-30"
                style={{backgroundAttachment: 'fixed'}}
                alt="Background"
             />
             <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
        </div>
        <div className="relative z-10 text-center max-w-4xl px-6 animate-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-['Playfair_Display'] italic leading-snug text-white/90">
                "We do not sell a room key, we unlock <span className="text-luxury-gold">memories</span>."
            </h2>
            <div className="mt-8 text-sm font-bold tracking-[0.3em] uppercase text-gray-400">
                The Dat Valoir Promise
            </div>
        </div>
      </section>
    </div>
  );
};

export default HomeContent;
