/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { PublicPage } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface HeroProps {
  setActivePage: (page: PublicPage) => void;
}

export default function Hero({ setActivePage }: HeroProps) {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isDarkMode } = useTheme();

  // Fallback image if no images are found
  const fallbackImage =
    "https://ibb.co/V0SVXVYz";

  // ==========================================
  // FETCH HOME PAGE IMAGES
  // ==========================================
  useEffect(() => {
    fetch(
      '/guiding_light_backend/get_home_pictures.php'
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.images && data.images.length > 0) {
          const imagePaths = data.images.map(
            (fileName: string) => `/media/Home_Pictures/${fileName}`
          );

          setImages(imagePaths);
          setCurrentIndex(0);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch slider images:', err);
      });
  }, []);

  // ==========================================
  // SLIDESHOW TIMER
  // ==========================================
  useEffect(() => {
    // Don't start a timer if there are 0 or 1 images
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        return (prevIndex + 1) % images.length;
      });
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(timer);
  }, [images.length]);

  // ==========================================
  // CURRENT IMAGE
  // ==========================================
  const currentImage =
    images.length > 0 ? images[currentIndex] : fallbackImage;

  return (
    <section
      className={`relative pt-32 pb-20 overflow-hidden transition-colors duration-300 ${isDarkMode
        ? 'bg-[#242c28]'
        : 'bg-[#f7f5f2]'
        }`}
    >

      {/* Background decoration */}
      <div
        className={`absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full blur-3xl opacity-60 ${isDarkMode
          ? 'bg-white/5'
          : 'bg-[#ede9e3]'
          }`}
      />

      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-[#d4c5b3]/20 rounded-full blur-3xl opacity-60"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ==========================================
            TITLE / HERO CONTENT
        ========================================== */}
        <div className="text-center max-w-3xl mx-auto">

          {/* Small banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center bg-[#3a4740] text-[#d4c5b3] px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-8"
          >
            Empowering the Unheard
          </motion.div>

          {/* Main title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-5xl md:text-7xl font-serif italic mb-8 leading-[1.1] tracking-tight transition-colors ${isDarkMode
              ? 'text-[#f7f5f2]'
              : 'text-stone-800'
              }`}
          >
            Be the{' '}
            <span
              className={
                isDarkMode
                  ? 'text-[#d4c5b3]'
                  : 'text-[#4b5e52]'
              }
            >
              Guiding Light
            </span>{' '}
            for Every Child.
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-lg mb-10 leading-relaxed max-w-2xl mx-auto transition-colors ${isDarkMode
              ? 'text-stone-300'
              : 'text-stone-600'
              }`}
          >
            For those who have fallen through the cracks, Streetlight is here.
            We don't judge the shadows; we simply offer the light, building
            trust step-by-step and walking alongside toward a safer, brighter
            future.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >

            {/* Need Help */}
            <button
              onClick={() => setActivePage('Contact')}
              className={`w-full sm:w-auto bg-[#3a4740] text-[#d4c5b3] px-12 py-5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#4b5e52] transition-all shadow-xl flex items-center justify-center group ${isDarkMode
                ? 'shadow-black/20'
                : 'shadow-stone-200'
                }`}
            >
              Need help?

              <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* About Us */}
            <button
              onClick={() => {
                const element = document.getElementById('about-section');

                element?.scrollIntoView({
                  behavior: 'smooth',
                });
              }}
              className={`w-full sm:w-auto px-10 py-5 rounded-full font-bold transition-all flex items-center justify-center text-xs uppercase tracking-widest ${isDarkMode
                ? 'bg-white/10 text-stone-300 hover:bg-white/15 hover:text-white'
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-800'
                }`}
            >
              About us
            </button>

          </motion.div>
        </div>

        {/* ==========================================
            IMAGE SLIDESHOW
        ========================================== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.4,
            duration: 0.8,
          }}
          className="mt-20 relative"
        >

          {/* Slider container */}
          <div className={`relative rounded-[32px] md:rounded-[48px] overflow-hidden shadow-2xl border-[6px] md:border-[12px] w-full h-[300px] sm:h-[450px] md:h-[600px] transition-colors ${isDarkMode
            ? 'border-[#303a35] bg-[#303a35]'
            : 'border-white bg-stone-100'
            }`}>

            {/* ==========================================
                CROSSFADE SLIDESHOW
            ========================================== */}
            <AnimatePresence mode="sync">
              <motion.img
                key={currentImage}
                src={currentImage}
                alt="Community Impact"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{
                  duration: 1.2,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>

            {/* Dark gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent z-10 pointer-events-none"></div>

          </div>

          {/* ==========================================
              OPTIONAL SLIDE INDICATORS
          ========================================== */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/80'
                    }`}
                />
              ))}
            </div>
          )}

          {/* ==========================================
              STATS
          ========================================== */}
          <div className="md:absolute -bottom-10 left-1/2 md:-translate-x-1/2 w-full max-w-4xl px-4 mt-8 md:mt-0 z-20">

            <div
              className={`rounded-[24px] md:rounded-[32px] shadow-sm p-8 md:p-10 grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10 border transition-colors ${isDarkMode
                ? 'bg-[#303a35] border-white/10'
                : 'bg-white border-stone-100'
                }`}
            >

              {/* Victims */}
              <div className="text-center sm:border-r border-stone-100 last:border-0">
                <p
                  className={`text-3xl md:text-4xl font-serif italic mb-2 ${isDarkMode
                      ? 'text-[#f7f5f2]'
                      : 'text-stone-800'
                    }`}
                >
                  500+
                </p>

                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">
                  Victims Helped
                </p>
              </div>

              {/* Transparency */}
              <div className={`text-center sm:border-r last:border-0 ${isDarkMode
                ? 'border-white/10'
                : 'border-stone-100'
                }`}>
                <p
                  className={`text-3xl md:text-4xl font-serif italic mb-2 ${isDarkMode
                      ? 'text-[#f7f5f2]'
                      : 'text-stone-800'
                    }`}
                >
                  100%
                </p>

                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">
                  Transparency
                </p>
              </div>

              {/* Funds */}
              <div className="text-center">
                <p className={`text-3xl md:text-4xl font-serif italic mb-2 ${isDarkMode
                  ? 'text-[#f7f5f2]'
                  : 'text-stone-800'
                  }`}>
                  ₱2M+
                </p>

                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDarkMode
                  ? 'text-stone-400'
                  : 'text-stone-400'
                  }`}>
                  Funds Allocated
                </p>
              </div>

            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}