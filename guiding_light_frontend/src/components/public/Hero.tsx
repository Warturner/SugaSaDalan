/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Heart, Shield, Users, ArrowRight } from 'lucide-react';
import { PublicPage } from '../../types';

interface HeroProps {
  onDonate: () => void;
}

export default function Hero({ onDonate }: HeroProps) {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-[#f7f5f2]">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#ede9e3] rounded-full blur-3xl opacity-60"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-[#d4c5b3]/20 rounded-full blur-3xl opacity-60"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center bg-[#3a4740] text-[#d4c5b3] px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-8"
          >
            Empowering the Unheard
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif italic text-stone-800 mb-8 leading-[1.1] tracking-tight"
          >
            Be the <span className="text-[#4b5e52]">Guiding Light</span> for Every Child.
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-stone-600 mb-10 leading-relaxed max-w-2xl mx-auto"
          >
            Streetlight provides trauma counseling, education, and legal assistance to children and families in Cebu. Join us in bridging the trust gap through radical transparency.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={onDonate}
              className="w-full sm:w-auto bg-[#4b5e52] text-white px-12 py-5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#3a4740] transition-all shadow-xl shadow-stone-200 flex items-center justify-center group"
            >
              Donate Now
              <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-10 py-5 rounded-full font-bold text-stone-500 hover:text-stone-800 transition-all flex items-center justify-center text-xs uppercase tracking-widest">
              Our Mission
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-20 relative"
        >
          <div className="relative rounded-[48px] overflow-hidden shadow-2xl border-[12px] border-white">
            <img 
              src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200" 
              alt="Community" 
              className="w-full h-[600px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent"></div>
          </div>
          
          {/* Stats overlap */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4">
            <div className="bg-white rounded-[32px] shadow-sm p-10 grid grid-cols-1 md:grid-cols-3 gap-10 border border-stone-100">
              <div className="text-center md:border-r border-stone-100 last:border-0">
                <p className="text-4xl font-serif italic text-stone-800 mb-2">500+</p>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Children Helped</p>
              </div>
              <div className="text-center md:border-r border-stone-100 last:border-0">
                <p className="text-4xl font-serif italic text-stone-800 mb-2">100%</p>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Transparency</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-serif italic text-stone-800 mb-2">₱2M+</p>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Funds Allocated</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
