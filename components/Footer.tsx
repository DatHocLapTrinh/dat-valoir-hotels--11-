
import React from 'react';
import { ViewState } from '../types';
import { useSystemConfig } from '../context/SystemConfigContext';

interface FooterProps {
  onNavigate: (view: ViewState) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { config } = useSystemConfig();

  return (
    <footer className="bg-[#020202] border-t border-white/5 pt-20 pb-10 px-6 sm:px-12 relative z-50">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* --- BRAND INFO --- */}
          <div className="col-span-1">
              <h1 className="text-luxury-gold font-['Playfair_Display'] text-2xl font-bold tracking-widest mb-6 uppercase">{config.hotelName}</h1>
              <p className="text-gray-500 text-xs leading-loose">
                  Defining the art of luxury hospitality across Vietnam. <br/>
                  Award-winning service since 1998.
              </p>
          </div>
          
          {/* --- NAVIGATION --- */}
          <div>
              <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Explore</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                  <li onClick={() => onNavigate('ABOUT')} className="hover:text-yellow-500 cursor-pointer transition-colors w-fit">
                    About {config.hotelName}
                  </li>
                  <li onClick={() => onNavigate('ROOMS')} className="hover:text-yellow-500 cursor-pointer transition-colors w-fit">
                    Rooms
                  </li>
                  <li onClick={() => onNavigate('EXPERIENCES')} className="hover:text-yellow-500 cursor-pointer transition-colors w-fit">
                    Experiences
                  </li>
              </ul>
          </div>

          {/* --- CONTACT LINKS --- */}
          <div>
              <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Contact</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                  <li>
                    <a href={`tel:${config.hotline}`} className="hover:text-yellow-500 transition-colors flex items-center gap-2">
                      {config.hotline}
                    </a>
                  </li>
                  <li>
                    <a href={`mailto:${config.email}`} className="hover:text-yellow-500 transition-colors flex items-center gap-2">
                      {config.email}
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#"
                      className="hover:text-yellow-500 transition-colors leading-relaxed block"
                    >
                      {config.address}
                    </a>
                  </li>
              </ul>
          </div>
      </div>
      
      {/* --- COPYRIGHT --- */}
      <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-600 uppercase tracking-wider">
          <span>© {new Date().getFullYear()} {config.hotelName}. All Rights Reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;
