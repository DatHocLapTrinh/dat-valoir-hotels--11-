import React from 'react';
import { X, Code, Layers, MoveRight, MapPin, Monitor } from 'lucide-react';

interface TechnicalBreakdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const TechnicalBreakdown: React.FC<TechnicalBreakdownProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white dark:bg-zinc-900 w-full max-w-3xl max-h-[85vh] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-[showContent_0.3s_ease-out]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900 z-10">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold dark:text-white flex items-center gap-2 text-yellow-600">
                <Code size={24} />
                UI/UX Analysis & Solution
            </h2>
            <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">For Dat Valoir Hotels</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full dark:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar text-gray-800 dark:text-gray-300">
          <div className="space-y-10">
            
            {/* Section 1: Desktop Upgrade */}
            <section className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-900/30">
              <h3 className="text-lg font-bold mb-3 dark:text-white flex items-center gap-2 text-blue-700 dark:text-blue-500">
                <Monitor size={20} />
                1. Desktop Interface Upgrade
              </h3>
              <p className="text-sm leading-relaxed mb-0">
                As per the latest requirements, we have implemented a <strong>"Split-Screen" Strategy</strong> for the PC version:
                <br/><br/>
                Instead of small cards (200x300px), the Upcoming Cards have been enlarged to <strong>300x500px</strong>.
                This creates a bold asymmetrical layout:
              </p>
              <ul className="list-disc list-inside mt-3 text-xs font-mono bg-white dark:bg-black/20 p-3 rounded text-gray-600 dark:text-gray-400">
                <li>Left Side (50%): Dedicated to Content & Typography.</li>
                <li>Right Side (50%): For the Next Image (Large Preview).</li>
              </ul>
              <p className="text-sm mt-3 italic text-gray-500">
                &rarr; Helps PC users feel the grandeur of the hotel even before clicking details.
              </p>
            </section>

            {/* Section 2: Technical Logic */}
            <section>
              <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                <Layers size={20} className="text-yellow-600"/>
                2. Responsive Logic Mechanism
              </h3>
              
              <div className="pl-4 border-l-2 border-gray-200 dark:border-zinc-700 space-y-6">
                <div>
                    <h4 className="font-bold text-sm dark:text-white mb-2">A. Breakpoint "lg" (Large Screens)</h4>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                        We utilize Tailwind Breakpoints to alter the mathematics of card positioning based on screen size.
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                         <div className="bg-gray-100 dark:bg-zinc-800 p-3 rounded">
                            <strong className="text-xs uppercase text-gray-500">Mobile / Tablet</strong>
                            <div className="font-mono text-xs mt-1">w-[200px]</div>
                            <div className="font-mono text-xs">h-[300px]</div>
                            <div className="text-xs mt-1 text-gray-500">Compact, does not obscure content.</div>
                         </div>
                         <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                            <strong className="text-xs uppercase text-yellow-600">Desktop (New)</strong>
                            <div className="font-mono text-xs mt-1 text-yellow-700 dark:text-yellow-400">lg:w-[300px]</div>
                            <div className="font-mono text-xs text-yellow-700 dark:text-yellow-400">lg:h-[500px]</div>
                            <div className="text-xs mt-1 text-gray-500">Large format, displaying interior details.</div>
                         </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-sm dark:text-white mb-2">B. Rotation Algorithm</h4>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 mb-3">
                        Maintaining the core logic: When clicking Next, the first element of the array moves to the end. CSS transition automatically handles the transformation from 
                        <span className="font-mono mx-1 text-yellow-600">300x500px</span> (Card) &rarr; <span className="font-mono mx-1 text-yellow-600">Full Screen</span> (Hero).
                    </p>
                </div>
              </div>
            </section>

             {/* Section 3: Value */}
             <section>
              <h3 className="text-lg font-semibold mb-3 dark:text-white flex items-center gap-2">
                <MoveRight size={20} className="text-purple-500"/>
                3. Brand Experience Optimization
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex gap-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>Visual Weight:</strong> Having a large waiting image on the right creates visual weight, balancing the large headline on the left.</span>
                </li>
                <li className="flex gap-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>Immersion:</strong> The Zoom Out effect from the large image (300x500) to Full Screen feels smoother and less "jumpy" than from a small image.</span>
                </li>
              </ul>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 text-center text-xs text-gray-500">
          Dat Valoir Hotels System - Frontend Architecture v2.0
        </div>

      </div>
    </div>
  );
};

export default TechnicalBreakdown;