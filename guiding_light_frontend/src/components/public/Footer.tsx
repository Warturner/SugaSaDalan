/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Send, Mail, MapPin, Phone } from 'lucide-react';
import { PublicPage } from '../../types'; 

interface FooterProps {
  setActivePage: (page: PublicPage) => void;
}

export default function Footer({ setActivePage }: FooterProps) {
  return (
    <footer className="bg-[#3a4740] text-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="lg:col-span-1">
            <div className="flex items-center mb-8">
              <h1 className="text-white font-serif italic text-2xl">Streetlight</h1>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed mb-8">
              Guiding children from trauma to resilience through holistic advocacy and community support in the Philippines.
            </p>
          </div>

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4c5b3] mb-8">Connect</h3>
            <ul className="space-y-5">
              <li>
                <div className="flex items-center text-stone-300">
                  <Mail className="w-4 h-4 mr-4 text-[#d4c5b3] shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-widest break-all">streetlight.sugasadalan.ngo@gmail.com</span>
                </div>
              </li>
              <li>
                <div className="flex items-center text-stone-300 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 mr-4 text-[#d4c5b3]" />
                  <span className="text-xs font-bold uppercase tracking-widest">+63 912 345 6789</span>
                </div>
              </li>
              <li>
                <a href="https://maps.app.goo.gl/dxjgKe2dajQUqayo8" target="_blank" rel="noopener noreferrer" className="flex items-start text-stone-300 hover:text-white transition-colors">
                  <MapPin className="w-4 h-4 mr-4 text-[#d4c5b3] mt-0.5 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-widest">208 Tiano Brothers St. Cagayan De Oro City, Northern Mindanao, Philippines</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4c5b3] mb-8">Quick Links</h3>
<ul className="space-y-4">              
              <li>
                <button 
                  onClick={() => { setActivePage('Stories'); window.scrollTo(0, 0); }}
                  className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-white transition-colors"
                >
                  Stories
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActivePage('Donate'); window.scrollTo(0, 0); }}
                  className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-white transition-colors"
                >
                  Donor Portal
                </button>
              </li>
              {/* NEW: Discreet Staff Portal Link */}
              <li>
                <button 
                  onClick={() => { setActivePage('Login'); window.scrollTo(0, 0); }}
                  className="text-xs font-bold uppercase tracking-widest text-stone-500/50 hover:text-stone-400 transition-colors"
                >
                  Staff Portal
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-stone-500 text-[9px] uppercase tracking-[0.25em]">
            © 2026 Streetlight: Suga sa Dalan Organization Inc. All Rights Reserved.
          </p>
          <div className="flex text-stone-500 uppercase tracking-[0.25em] text-[9px] font-bold">
            <a 
              href="https://www.facebook.com/share/16QTUtyzEC/?mibextid=wwXIfr" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors">
              Facebook
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
