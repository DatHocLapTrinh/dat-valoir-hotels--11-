import React, { useEffect, useRef } from 'react';
import { Award, Users, Clock, Globe, Quote } from 'lucide-react';

const MILESTONES = [
  {
    year: "1998",
    title: "The Genesis",
    description: "Dat Valoir opened its doors in the heart of Hanoi's Old Quarter. Started as a boutique villa with only 12 suites, it quickly became the whispered secret among European diplomats and artists.",
    image: "https://images.unsplash.com/photo-1559136555-930d72f1d300?q=80&w=2070&auto=format&fit=crop"
  },
  {
    year: "2010",
    title: "Coastal Expansion",
    description: "Embracing the pristine coast of Da Nang, we redefined resort luxury. The Ocean Villas introduced the concept of 'Invisible Service' to Central Vietnam, earning our first World Travel Award.",
    image: "https://images.unsplash.com/photo-1540541338287-41700206dee6?q=80&w=2070&auto=format&fit=crop"
  },
  {
    year: "2024",
    title: "Urban Renaissance",
    description: "The launch of Saigon Sky Riverside marks our boldest era yet. A fusion of heritage and futurism, standing tall as a beacon of modern Vietnamese hospitality on the global stage.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
  }
];

const STATS = [
  { label: "Years of Excellence", value: "25+" },
  { label: "Global Awards", value: "50+" },
  { label: "Destinations", value: "03" },
  { label: "Dedicated Staff", value: "400+" },
];

const About: React.FC = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);

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
      threshold: 0.15,
      rootMargin: "0px 0px -100px 0px"
    });

    const elements = document.querySelectorAll('.animate-about');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="bg-[#050505] text-white min-h-screen pt-20 overflow-hidden">
      
      {/* --- HERO SECTION --- */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 grayscale mix-blend-luminosity"></div>
             <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-[#050505]"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 animate-[showContent_1.5s_ease-out]">
            <span className="text-luxury-gold text-xs font-bold tracking-[0.4em] uppercase block mb-6">Since 1998</span>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-['Playfair_Display'] leading-none mb-8">
                The Art of <br/> <span className="italic text-gray-500">Timelessness</span>
            </h1>
            <p className="max-w-xl mx-auto text-gray-400 font-light text-sm sm:text-base leading-relaxed tracking-wide">
                Dat Valoir is not a hotel chain. It is a curated collection of moments, 
                architected for those who seek the poetry in travel.
            </p>
        </div>
      </section>

      {/* --- PHILOSOPHY (Split Screen) --- */}
      <section className="py-24 sm:py-32 px-6 sm:px-12 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
            
            {/* Image Composition */}
            <div className="relative animate-about opacity-0 translate-y-20 transition-all duration-1000 ease-out">
                <div className="w-[80%] ml-auto aspect-[3/4] relative z-10 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1595246140625-573b715e11d3?q=80&w=1887&auto=format&fit=crop" className="w-full h-full object-cover hover:scale-110 transition-transform duration-[2s]" alt="Lobby" />
                </div>
                <div className="absolute top-12 left-0 w-[60%] aspect-[3/4] z-0 opacity-50 overflow-hidden grayscale">
                     <img src="https://images.unsplash.com/photo-1572331165267-854da2b00ca1?q=80&w=1887&auto=format&fit=crop" className="w-full h-full object-cover" alt="Detail" />
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 border border-luxury-gold/30 rounded-full flex items-center justify-center bg-[#050505] z-20">
                    <Quote size={32} className="text-luxury-gold" />
                </div>
            </div>

            {/* Text */}
            <div className="animate-about opacity-0 translate-y-20 transition-all duration-1000 ease-out delay-200">
                <h2 className="text-4xl sm:text-5xl font-['Playfair_Display'] mb-8 leading-tight">
                    "Luxury is the absence <br/> of <span className="text-luxury-gold italic">worry</span>."
                </h2>
                <div className="space-y-6 text-gray-400 font-light leading-relaxed font-['Poppins']">
                    <p>
                        Founded by the visionary architect Pham Dat Valoir, our brand was born from a singular obsession: to create spaces where the chaos of the world dissolves, leaving only peace and profound comfort.
                    </p>
                    <p>
                        We believe in 'Invisible Service'—the kind that anticipates your desire before you even articulate it. From the temperature of your tea to the firmness of your pillow, nothing is left to chance.
                    </p>
                </div>
                
                <div className="mt-12 pt-8 border-t border-white/10 flex items-center gap-6">
                    <div className="font-['Playfair_Display'] text-2xl italic text-white">Pham Dat Valoir</div>
                    <div className="h-[1px] w-12 bg-gray-600"></div>
                    <div className="text-xs uppercase tracking-widest text-gray-500">Founder & CEO</div>
                </div>
            </div>
        </div>
      </section>

      {/* --- HISTORY TIMELINE --- */}
      <section className="py-24 bg-zinc-950/50 border-y border-white/5 relative">
        <div className="max-w-5xl mx-auto px-6 relative">
            <div className="absolute left-[20px] sm:left-1/2 top-0 bottom-0 w-[1px] bg-white/10 transform sm:-translate-x-1/2"></div>
            
            <div className="space-y-24">
                {MILESTONES.map((item, index) => (
                    <div key={index} className={`relative flex flex-col sm:flex-row items-center gap-12 ${index % 2 !== 0 ? 'sm:flex-row-reverse' : ''} animate-about opacity-0 translate-y-20 transition-all duration-1000 ease-out`}>
                        
                        {/* Timeline Node */}
                        <div className="absolute left-[20px] sm:left-1/2 w-3 h-3 bg-luxury-gold rounded-full transform -translate-x-1/2 z-10 shadow-[0_0_15px_rgba(234,179,8,0.8)]"></div>
                        
                        {/* Content */}
                        <div className="w-full sm:w-1/2 pl-12 sm:pl-0 sm:text-right sm:pr-12 group">
                             {index % 2 !== 0 && ( /* Layout trick for alternating text alignment on desktop */
                                <div className="hidden sm:block text-left pl-12">
                                     <span className="text-6xl font-['Playfair_Display'] font-bold text-white/5 absolute -top-10 left-1/2">{item.year}</span>
                                     <h3 className="text-2xl font-['Playfair_Display'] text-white mb-4 relative z-10">{item.title}</h3>
                                     <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                                </div>
                             )}
                             {index % 2 === 0 && (
                                 <div className={`sm:text-right sm:pr-12`}>
                                     <span className={`text-6xl font-['Playfair_Display'] font-bold text-white/5 absolute -top-10 left-12 sm:left-auto sm:right-1/2 transform sm:translate-x-1/2`}>{item.year}</span>
                                     <h3 className="text-2xl font-['Playfair_Display'] text-white mb-4 relative z-10">{item.title}</h3>
                                     <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                                 </div>
                             )}
                             {/* Mobile Only Content for odd items to fix alignment */}
                             {index % 2 !== 0 && (
                                <div className="block sm:hidden">
                                     <h3 className="text-2xl font-['Playfair_Display'] text-white mb-4 relative z-10">{item.title}</h3>
                                     <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                                </div>
                             )}
                        </div>

                        {/* Image */}
                        <div className="w-full sm:w-1/2 pl-12 sm:pl-0 sm:pr-0">
                            {index % 2 !== 0 ? (
                                <div className="overflow-hidden rounded-sm border border-white/10 aspect-[16/9] sm:mr-12">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700" />
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-sm border border-white/10 aspect-[16/9] sm:ml-12">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700" />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* --- STATS & RECOGNITION --- */}
      <section className="py-24 px-6 sm:px-12">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center animate-about opacity-0 translate-y-20 transition-all duration-1000 ease-out">
              {STATS.map((stat, i) => (
                  <div key={i} className="flex flex-col items-center gap-4 group cursor-default">
                      <span className="text-4xl sm:text-6xl font-['Playfair_Display'] font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 group-hover:text-luxury-gold transition-all duration-500">
                          {stat.value}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors">
                          {stat.label}
                      </span>
                  </div>
              ))}
          </div>
      </section>

      {/* --- VALUES GRID --- */}
      <section className="grid grid-cols-1 md:grid-cols-3 min-h-[400px]">
           <div className="bg-[#0a0a0a] p-12 flex flex-col justify-center items-center text-center border-r border-b border-white/5 hover:bg-[#0f0f0f] transition-colors group">
                <Globe size={40} strokeWidth={1} className="text-gray-600 mb-6 group-hover:text-yellow-500 transition-colors" />
                <h3 className="text-xl font-['Playfair_Display'] mb-3">Sustainability</h3>
                <p className="text-gray-500 text-xs leading-relaxed max-w-xs">Committed to zero-plastic and preserving the local heritage of every destination we touch.</p>
           </div>
           <div className="bg-[#0a0a0a] p-12 flex flex-col justify-center items-center text-center border-r border-b border-white/5 hover:bg-[#0f0f0f] transition-colors group">
                <Users size={40} strokeWidth={1} className="text-gray-600 mb-6 group-hover:text-yellow-500 transition-colors" />
                <h3 className="text-xl font-['Playfair_Display'] mb-3">The Artisans</h3>
                <p className="text-gray-500 text-xs leading-relaxed max-w-xs">Our staff are not employees; they are artisans of hospitality, trained in the art of anticipation.</p>
           </div>
           <div className="bg-[#0a0a0a] p-12 flex flex-col justify-center items-center text-center border-b border-white/5 hover:bg-[#0f0f0f] transition-colors group">
                <Clock size={40} strokeWidth={1} className="text-gray-600 mb-6 group-hover:text-yellow-500 transition-colors" />
                <h3 className="text-xl font-['Playfair_Display'] mb-3">Timelessness</h3>
                <p className="text-gray-500 text-xs leading-relaxed max-w-xs">We build not for today, but for a hundred years from now. A legacy etched in stone and soul.</p>
           </div>
      </section>

    </div>
  );
};

export default About;