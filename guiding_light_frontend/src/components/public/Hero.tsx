/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { PublicPage } from '../../types';

interface HeroProps {
  setActivePage: (page: PublicPage) => void;
}

export default function Hero({ setActivePage }: HeroProps) {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Fallback image in case the folder is empty
  const fallbackImage = "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200";

  // 1. Fetch the images from the backend when the component loads
  useEffect(() => {
    fetch('http://localhost/GuidingLight_Project/guiding_light_backend/get_home_pictures.php')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.images && data.images.length > 0) {
          // Map the raw filenames into actual URLs pointing to the public folder
          const imagePaths = data.images.map((fileName: string) => `/media/Home_Pictures/${fileName}`);
          setImages(imagePaths);
        }
      })
      .catch(err => console.error("Failed to fetch slider images:", err));
  }, []);

  // 2. Set up the 2-second timer to cycle through the images
  useEffect(() => {
    // Only run the timer if we have more than 1 image
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000); // 2000 milliseconds = 2 seconds

    // Cleanup the timer when the component unmounts
    return () => clearInterval(timer);
  }, [images.length]);

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
            For those who have fallen through the cracks, Streetlight is here. We don't judge the shadows; we simply offer the light, building trust step-by-step and walking alongside toward a safer, brighter future.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => setActivePage('Contact')}
              className="w-full sm:w-auto bg-[#3a4740] text-[#d4c5b3] px-12 py-5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#4b5e52] transition-all shadow-xl shadow-stone-200 flex items-center justify-center group"
            >
              Need help?
              <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('about-section');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-10 py-5 rounded-full font-bold text-stone-500 hover:text-stone-800 transition-all flex items-center justify-center text-xs uppercase tracking-widest bg-stone-100 hover:bg-stone-200"
            >
              About us
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-20 relative"
        >
          {/* Slider Container */}
          <div className="relative rounded-[32px] md:rounded-[48px] overflow-hidden shadow-2xl border-[6px] md:border-[12px] border-white w-full h-[300px] sm:h-[450px] md:h-[600px] bg-stone-100">
            <AnimatePresence mode="popLayout">
              <motion.img 
                key={currentIndex}
                src={images.length > 0 ? images[currentIndex] : fallbackImage}
                alt="Community Impact"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }} // 1 second crossfade animation
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent z-10 pointer-events-none"></div>
          </div>
          
          {/* Stats overlap */}
          <div className="md:absolute -bottom-10 left-1/2 md:-translate-x-1/2 w-full max-w-4xl px-4 mt-8 md:mt-0 z-20">
            <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-sm p-8 md:p-10 grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10 border border-stone-100">
              <div className="text-center sm:border-r border-stone-100 last:border-0">
                <p className="text-3xl md:text-4xl font-serif italic text-stone-800 mb-2">500+</p>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Victims Helped</p>
              </div>
              <div className="text-center sm:border-r border-stone-100 last:border-0">
                <p className="text-3xl md:text-4xl font-serif italic text-stone-800 mb-2">100%</p>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Transparency</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-serif italic text-stone-800 mb-2">₱2M+</p>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Funds Allocated</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}