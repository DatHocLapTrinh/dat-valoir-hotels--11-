
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Users, Calendar, Check, Star, MapPin } from 'lucide-react';
import { EXPERIENCES_DATA } from '../constants';
import { ViewState } from '../types';
import BookingModal from './BookingModal';

interface ExperienceDetailProps {
  experienceId: string;
  onNavigate: (view: ViewState, payload?: string) => void;
}

const ExperienceDetail: React.FC<ExperienceDetailProps> = ({ experienceId, onNavigate }) => {
  const [experience, setExperience] = useState<any>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    const foundExp = EXPERIENCES_DATA.find(e => e.id === experienceId);
    if (foundExp) {
      setExperience(foundExp);
    }
  }, [experienceId]);

  if (!experience) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="bg-[#050505] min-h-screen text-white animate-[showContent_0.5s_ease-out]">
      
      {/* --- HERO HEADER --- */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${experience.image})` }}
        >
            <div className={`absolute inset-0 bg-gradient-to-b ${experience.color} opacity-60`}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
        </div>

        <button 
            onClick={() => onNavigate('EXPERIENCES', experience.id)}
            className="absolute top-28 left-6 sm:left-12 z-50 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/80 hover:text-white transition-colors group"
        >
            <div className="p-2 border border-white/20 rounded-full group-hover:border-yellow-500 transition-colors">
                <ArrowLeft size={16} />
            </div>
            Back to Journeys
        </button>

        <div className="absolute bottom-0 left-0 w-full px-6 sm:px-12 pb-16 z-20">
             <div className="max-w-4xl animate-[showContent_1s_ease-out]">
                <div className="flex items-center gap-4 text-yellow-500 mb-6 font-bold tracking-[0.2em] text-xs uppercase">
                    <MapPin size={16} />
                    {experience.location}
                </div>
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-['Playfair_Display'] leading-none mb-6 text-luxury-white">
                    {experience.title}
                </h1>
                
                {/* Stats Bar */}
                <div className="flex flex-wrap gap-8 items-center border-t border-white/20 pt-6">
                    <div className="flex items-center gap-3">
                        <Clock size={20} className="text-luxury-gold"/>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest text-gray-400">Duration</span>
                            <span className="text-sm font-bold">{experience.details.duration}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Users size={20} className="text-luxury-gold"/>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest text-gray-400">Group Size</span>
                            <span className="text-sm font-bold">{experience.details.groupSize}</span>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <Calendar size={20} className="text-luxury-gold"/>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest text-gray-400">Start Time</span>
                            <span className="text-sm font-bold">{experience.details.startTime}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          {/* --- MAIN CONTENT (Left) --- */}
          <div className="lg:col-span-2">
              <h2 className="text-3xl font-['Playfair_Display'] mb-6 italic text-gray-400">The Journey</h2>
              <p className="text-lg leading-relaxed font-light text-gray-300 font-['Poppins'] mb-12">
                  {experience.longDesc}
              </p>

              {/* Itinerary Timeline */}
              <div className="relative border-l border-white/10 ml-3 pl-12 space-y-12 pb-12">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-luxury-gold mb-8 -ml-12">Itinerary</h3>
                  {experience.itinerary.map((item: any, i: number) => (
                      <div key={i} className="relative group">
                          {/* Timeline Dot */}
                          <div className="absolute -left-[54px] w-4 h-4 rounded-full bg-[#050505] border border-gray-600 group-hover:border-yellow-500 group-hover:bg-yellow-500 transition-all"></div>
                          
                          <span className="inline-block px-3 py-1 bg-white/5 rounded text-xs font-mono text-yellow-500 mb-2">
                              {item.time}
                          </span>
                          <h4 className="text-xl font-['Playfair_Display'] mb-2">{item.activity}</h4>
                          <p className="text-sm text-gray-500 leading-relaxed font-light">{item.desc}</p>
                      </div>
                  ))}
              </div>

              {/* Gallery Grid */}
              <div className="mt-16">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-luxury-gold mb-8">Visual Highlights</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {experience.gallery.map((img: string, i: number) => (
                          <div key={i} className={`overflow-hidden rounded-sm relative group cursor-pointer ${i === 0 ? 'sm:col-span-2 aspect-[16/9]' : 'aspect-[4/3]'}`}>
                              <img 
                                src={img} 
                                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" 
                                alt={`Gallery ${i}`} 
                              />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* --- SIDEBAR (Right) --- */}
          <div className="lg:col-span-1">
               <div className="sticky top-32 bg-[#0a0a0a] border border-white/10 p-8 rounded-sm shadow-2xl">
                   <h3 className="font-['Playfair_Display'] text-2xl mb-6">Inclusions</h3>
                   <ul className="space-y-4 mb-8">
                       {experience.details.inclusions.map((inc: string, i: number) => (
                           <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                               <Check size={16} className="text-yellow-600 shrink-0 mt-0.5" />
                               {inc}
                           </li>
                       ))}
                   </ul>
                   
                   <div className="p-4 bg-white/5 rounded mb-8">
                       <p className="text-xs text-gray-500 italic">
                           "Our concierge team will customize this itinerary to your specific preferences."
                       </p>
                   </div>

                   <button 
                        onClick={() => setIsBookingOpen(true)}
                        className="w-full py-4 bg-white text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-luxury-gold hover:text-black transition-all mb-4 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                   >
                        Request Availability
                   </button>
               </div>
          </div>

      </div>

      {/* --- BOOKING MODAL --- */}
      <BookingModal 
        item={experience} 
        type="EXPERIENCE"
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
      />

    </div>
  );
};

export default ExperienceDetail;
