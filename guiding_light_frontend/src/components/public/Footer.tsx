/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { PublicPage } from '../../types';

interface FooterProps {
  setActivePage: (page: PublicPage) => void;
}

export default function Footer({ setActivePage }: FooterProps) {
  return (
    <footer className="bg-[#3a4740] text-white py-12 sm:py-14">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* MAIN FOOTER CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.1fr_1.6fr_0.7fr] gap-10 lg:gap-14 mb-10">

          {/* ORGANIZATION */}
          <div>

            <h1 className="text-white font-serif italic text-2xl mb-4">
              Streetlight
            </h1>

            <p className="text-stone-400 text-sm leading-relaxed max-w-sm">
              Guiding children from trauma to resilience through holistic advocacy and community support in the Philippines.
            </p>

          </div>


          {/* CONNECT */}
          <div>

            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4c5b3] mb-5">
              Connect
            </h3>

            <ul className="space-y-4">

              <li>

                <div className="flex items-start text-stone-300">

                  <Mail className="w-4 h-4 mr-3 text-[#d4c5b3] shrink-0 mt-0.5" />

                  <span className="text-xs font-bold uppercase tracking-widest break-all">
                    streetlight.sugasadalan.ngo@gmail.com
                  </span>

                </div>

              </li>


              <li>

                <div className="flex items-center text-stone-300">

                  <Phone className="w-4 h-4 mr-3 text-[#d4c5b3] shrink-0" />

                  <span className="text-xs font-bold uppercase tracking-widest">
                    +63 912 345 6789
                  </span>

                </div>

              </li>


              <li>

                <a
                  href="https://maps.app.goo.gl/dxjgKe2dajQUqayo8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start text-stone-300 hover:text-white transition-colors"
                >

                  <MapPin className="w-4 h-4 mr-3 text-[#d4c5b3] mt-0.5 shrink-0" />

                  <span className="text-xs font-bold uppercase tracking-widest leading-relaxed">
                    208 Tiano Brothers St. Cagayan De Oro City,
                    Northern Mindanao, Philippines
                  </span>

                </a>

              </li>

            </ul>

          </div>


          {/* QUICK LINKS */}
          <div className="lg:justify-self-end lg:text-right">

            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4c5b3] mb-5">
              Quick Links
            </h3>

            <ul className="space-y-3">

              <li>

                <button
                  onClick={() => {
                    setActivePage('Stories');
                    window.scrollTo(0, 0);
                  }}
                  className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-white transition-colors"
                >
                  Stories
                </button>

              </li>


              <li>

                <button
                  onClick={() => {
                    setActivePage('Donate');
                    window.scrollTo(0, 0);
                  }}
                  className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-white transition-colors"
                >
                  Donor Portal
                </button>

              </li>


              <li>

                <button
                  onClick={() => {
                    setActivePage('Login');
                    window.scrollTo(0, 0);
                  }}
                  className="text-xs font-bold uppercase tracking-widest text-stone-500/60 hover:text-stone-300 transition-colors"
                >
                  Staff Portal
                </button>

              </li>

            </ul>

          </div>

        </div>


        {/* BOTTOM BAR */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

          <p className="text-stone-500 text-[9px] uppercase tracking-[0.2em] leading-relaxed">
            © 2026 Streetlight: Suga sa Dalan Organization Inc. All Rights Reserved.
          </p>

          <a
            href="https://www.facebook.com/share/16QTUtyzEC/?mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-500 hover:text-white uppercase tracking-[0.2em] text-[9px] font-bold transition-colors"
          >
            Facebook
          </a>

        </div>

      </div>

    </footer>
  );
}
