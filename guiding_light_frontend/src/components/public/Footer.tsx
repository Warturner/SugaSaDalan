/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Send, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#3a4740] text-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="lg:col-span-1">
            <div className="flex items-center mb-8">
              <h1 className="text-white font-serif italic text-2xl">Streetlight</h1>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed mb-8">
              Guiding children and families from trauma to resilience through holistic advocacy and community support in the Philippines.
            </p>
          </div>

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4c5b3] mb-8">Connect</h3>
            <ul className="space-y-5">
              <li>
                <a href="mailto:info@streetlight.org" className="flex items-center text-stone-300 hover:text-white transition-colors group">
                  <Mail className="w-4 h-4 mr-4 text-[#d4c5b3] group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold uppercase tracking-widest">info@streetlight.org</span>
                </a>
              </li>
              <li>
                <div className="flex items-center text-stone-300">
                  <Phone className="w-4 h-4 mr-4 text-[#d4c5b3]" />
                  <span className="text-xs font-bold uppercase tracking-widest">+63 912 345 6789</span>
                </div>
              </li>
              <li>
                <div className="flex items-start text-stone-300">
                  <MapPin className="w-4 h-4 mr-4 text-[#d4c5b3] mt-0.5 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-widest">Cebu City, Philippines</span>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4c5b3] mb-8">Quick Links</h3>
            <ul className="space-y-4">
              <li><button className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-white transition-colors">Success Stories</button></li>
              <li><button className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-white transition-colors">Transparency Tracker</button></li>
              <li><button className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-white transition-colors">Privacy Policy</button></li>
              <li><button className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-white transition-colors">Donor Portal</button></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4c5b3] mb-8">Participatory Comm.</h3>
            <p className="text-xs text-stone-400 mb-6 leading-relaxed">Have questions or want to volunteer? Send us a quick inquiry.</p>
            <div className="relative">
              <input 
                type="text" 
                placeholder="How can we help?"
                className="w-full bg-white/5 border-none rounded-[16px] py-4 pl-6 pr-14 text-xs focus:ring-2 focus:ring-[#d4c5b3] placeholder:text-stone-500"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#4b5e52] rounded-[12px] flex items-center justify-center hover:bg-[#3a4740] transition-colors shadow-lg">
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-stone-500 text-[9px] uppercase tracking-[0.25em]">
            © 2024 Streetlight: Suga sa Dalan Organization Inc. All Rights Reserved.
          </p>
          <div className="flex space-x-10 text-stone-500 uppercase tracking-[0.25em] text-[9px] font-bold">
            <button className="hover:text-white transition-colors">Facebook</button>
            <button className="hover:text-white transition-colors">Instagram</button>
            <button className="hover:text-white transition-colors">Twitter</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
