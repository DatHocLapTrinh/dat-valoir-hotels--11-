
import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Compass, Anchor, Utensils, GlassWater, Clock, Users, Calendar } from 'lucide-react';
import { EXPERIENCES_DATA } from '../constants';
import { ViewState } from '../types';
import BookingModal from './BookingModal';

interface ExperiencesProps {
  scrollToId?: string | null;
  onNavigate?: (view: ViewState, payload?: string) => void;
}

const Experiences: React.FC<ExperiencesProps> = ({ scrollToId, onNavigate }) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedExp, setSelectedExp] = useState<any>(null);

  useEffect(() => {
    // Scroll to specific section if ID is provided
    if (scrollToId) {
      const element = document.getElementById(`experience-${scrollToId}`);
      if (element) {
        setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [scrollToId]);

  useEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0', 'translate-y-20');
          entry.target.classList.add('opacity-100', 'translate-y-0');
        }
      });
    };

    observerRef.current = new IntersectionObserver(observerCallback, {
      threshold: 0.2,
    });

    const elements = document.querySelectorAll('.animate-experience');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  const getIcon = (id: string) => {
      switch(id) {
          case 'hanoi': return <Utensils size={24} />;
          case 'danang': return <Anchor size={24} />;
          case 'hcmc': return <GlassWater size={24} />;
          default: return <Compass size={24} />;
      }
  };

  const handleBookNow = (exp: any, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedExp(exp);
      setIsBookingOpen(true);
  };

  return (
    <div className="bg-black text-white min-h-screen pt-20">
      
      {/* --- INTRO HERO --- */}
      <section className="py-24 px-6 text-center animate-[showContent_1s_ease-out]">
         <div className="inline-flex items-center gap-2 text-luxury-gold text-xs font-bold uppercase tracking-[0.3em] mb-6 border border-yellow-500/30 px-4 py-2 rounded-full">
            <Compass size={14} />
            <span>Curated Journeys</span>
         </div>
         <h1 className="text-5xl sm:text-7xl font-['Playfair_Display'] mb-8">
            Beyond <span className="italic text-gray-500 font-light">Accommodation</span>
         </h1>
         <p className="max-w-2xl mx-auto text-gray-400 font-light text-sm sm:text-base leading-relaxed">
            We believe that luxury is not just a place you stay, but a story you live. 
            Dat Valoir has designed three signature experiences to connect you deeply with the spirit of each destination.
         </p>
      </section>

      {/* --- EXPERIENCE SECTIONS (Parallax) --- */}
      <div className="relative w-full">
        {EXPERIENCES_DATA.map((exp, index) => (
          <div 
            key={exp.id} 
            id={`experience-${exp.id}`}
            className="relative w-full h-[100vh] sm:h-[90vh] flex items-center justify-center overflow-hidden border-t border-white/5"
          >
            
            {/* Background Image */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed transition-transform duration-[3s] hover:scale-105"
                style={{ backgroundImage: `url(${exp.image})` }}
            >
                <div className={`absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r ${exp.color} mix-blend-multiply opacity-90`}></div>
                <div className="absolute inset-0 bg-black/30"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
                
                {/* Text Block */}
                <div className={`space-y-8 animate-experience opacity-0 translate-y-20 transition-all duration-1000 ease-out ${index % 2 !== 0 ? 'lg:order-2 lg:text-right items-end' : ''}`}>
                    <div className={`flex items-center gap-4 text-yellow-400 ${index % 2 !== 0 ? 'lg:justify-end' : ''}`}>
                        <span className="w-12 h-[1px] bg-yellow-400"></span>
                        <span className="text-xs font-bold tracking-[0.3em] uppercase">{exp.location}</span>
                    </div>
                    
                    <h2 className="text-4xl sm:text-6xl font-['Playfair_Display'] leading-tight drop-shadow-2xl">
                        {exp.title}
                    </h2>
                    
                    <p className={`text-gray-200 text-sm sm:text-lg leading-relaxed font-light font-['Poppins'] max-w-xl drop-shadow-md ${index % 2 !== 0 ? 'ml-auto' : ''}`}>
                        {exp.shortDesc}
                    </p>

                    {/* Quick Specs */}
                    <div className={`flex gap-6 text-xs font-bold uppercase tracking-widest text-gray-300 ${index % 2 !== 0 ? 'lg:justify-end' : ''}`}>
                         <div className="flex items-center gap-2">
                             <Clock size={16} className="text-luxury-gold" />
                             {exp.details.duration}
                         </div>
                         <div className="flex items-center gap-2">
                             <Users size={16} className="text-luxury-gold" />
                             {exp.details.groupSize}
                         </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-6">
                        <button 
                            onClick={() => onNavigate && onNavigate('EXPERIENCE_DETAIL', exp.id)}
                            className="group px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-yellow-500 hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] inline-flex items-center gap-2"
                        >
                            Discover Journey
                            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform"/>
                        </button>
                        <button 
                             onClick={(e) => handleBookNow(exp, e)}
                             className="px-8 py-4 border border-white/30 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all duration-300 inline-flex items-center gap-2"
                        >
                             Book Now
                        </button>
                    </div>
                </div>

                {/* Visual Decoration */}
                <div className={`hidden lg:flex justify-center animate-experience opacity-0 scale-95 transition-all duration-1000 delay-300 ${index % 2 !== 0 ? 'lg:order-1' : ''}`}>
                     <div className="w-[300px] h-[400px] border border-white/20 rounded-t-[150px] rounded-b-[20px] backdrop-blur-sm bg-white/5 p-4 flex items-center justify-center relative">
                        <div className="absolute inset-4 border border-white/10 rounded-t-[140px] rounded-b-[15px]"></div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-luxury-gold rounded-full flex items-center justify-center mx-auto mb-6 text-black shadow-[0_0_30px_rgba(234,179,8,0.5)]">
                                {getIcon(exp.id)}
                            </div>
                            <span className="block text-4xl font-['Playfair_Display'] font-bold text-white mb-2">0{index + 1}</span>
                            <span className="text-[10px] uppercase tracking-widest text-gray-400">Signature Collection</span>
                        </div>
                     </div>
                </div>

            </div>
          </div>
        ))}
      </div>
      
      {/* --- CTA SECTION --- */}
      <div className="py-24 bg-zinc-900 border-t border-white/10 text-center px-6">
            <h3 className="text-2xl font-['Playfair_Display'] italic text-gray-400 mb-6">"Collect moments, not things."</h3>
            <a 
                href="mailto:reservations@datvaloir.com?subject=Experience Request - Custom Itinerary"
                className="inline-block text-white border-b border-yellow-500 pb-1 text-xs font-bold uppercase tracking-widest hover:text-yellow-500 transition-colors"
            >
                Contact Concierge
            </a>
      </div>

       {/* --- BOOKING MODAL --- */}
      {selectedExp && (
        <BookingModal 
            item={selectedExp} 
            type="EXPERIENCE"
            isOpen={isBookingOpen} 
            onClose={() => setIsBookingOpen(false)} 
        />
      )}

    </div>
  );
};

export default Experiences;
