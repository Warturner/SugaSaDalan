/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Menu,
  X,
  Heart,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { PublicPage } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  activePage: PublicPage;
  setActivePage: (page: PublicPage) => void;
}

export default function Navbar({ activePage, setActivePage }: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const {
    isDarkMode,
    toggleTheme
  } = useTheme();

  const navItems = [
    { id: 'Home' as PublicPage, label: 'Home' },
    { id: 'Mission' as PublicPage, label: 'Our Mission' },
    { id: 'Team' as PublicPage, label: 'Our Team' },
    { id: 'Services' as PublicPage, label: 'Services' },
    { id: 'Stories' as PublicPage, label: 'Stories' },
    { id: 'Contact' as PublicPage, label: 'Contact Us' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-20 flex items-center border-b transition-colors duration-300 ${isDarkMode
        ? 'bg-[#242c28] border-white/10'
        : 'bg-white border-stone-200'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between h-full items-center">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActivePage('Home')}
          >
            <img
              src="/media/logo/logo.png"
              alt="Streetlight: Suga sa Dalan Organization logo"
              className="w-11 h-11 object-contain"
            />

            <div className="flex flex-col">
              <h1
                className={`font-serif italic text-2xl leading-none transition-colors ${isDarkMode
                  ? 'text-[#f7f5f2]'
                  : 'text-stone-800'
                  }`}
              >
                Streetlight
              </h1>

              <p className={`text-[10px] uppercase tracking-widest font-semibold mt-1 transition-colors ${isDarkMode
                ? 'text-stone-400'
                : 'text-stone-500'
                }`}>
                Suga sa Dalan Org.
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 h-full">

            {navItems.map((item) => (

              <button
                key={item.id}
                onClick={() =>
                  setActivePage(item.id)
                }
                className={`relative h-full text-xs font-bold uppercase tracking-widest transition-colors flex items-center ${activePage === item.id
                  ? (
                    isDarkMode
                      ? 'text-[#d4c5b3]'
                      : 'text-[#4b5e52]'
                  )
                  : (
                    isDarkMode
                      ? 'text-stone-400 hover:text-white'
                      : 'text-stone-500 hover:text-stone-800'
                  )
                  }`}
              >

                {item.label}

                {activePage === item.id && (

                  <motion.div
                    layoutId="navbar-active-line"
                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDarkMode
                      ? 'bg-[#d4c5b3]'
                      : 'bg-[#4b5e52]'
                      }`}
                  />

                )}

              </button>

            ))}


            {/* DARK MODE */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                isDarkMode
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
              title={
                isDarkMode
                  ? 'Light Mode'
                  : 'Dark Mode'
              }
              className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center border transition-all ${isDarkMode
                ? 'bg-white/5 border-white/10 text-[#d4c5b3] hover:bg-white/10'
                : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
                }`}
            >

              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}

            </button>


            {/* DONATE */}
            <button
              onClick={() => {
                setActivePage('Donate');

                window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
              }}
              className="bg-[#4b5e52] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#3a4740] transition-all shadow-md active:scale-95 flex items-center shrink-0"
            >
              Donate Now
            </button>

          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 rounded-xl transition-colors ${isDarkMode
              ? 'text-stone-300 hover:bg-white/10'
              : 'text-stone-600 hover:bg-stone-50'
              }`}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav - Admin Button Removed */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`md:hidden absolute top-20 left-0 right-0 border-b overflow-y-auto max-h-[calc(100dvh-80px)] shadow-2xl z-[60] transition-colors ${isDarkMode
              ? 'bg-[#242c28] border-white/10'
              : 'bg-white border-stone-100'
              }`}
          >
            <div className="px-4 pt-4 pb-12 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setIsOpen(false);
                  }}
                  className={`block w-full text-left px-6 py-5 text-xs font-bold uppercase tracking-widest rounded-2xl transition-all ${activePage === item.id
                      ? (
                        isDarkMode
                          ? 'text-[#d4c5b3] bg-white/10'
                          : 'text-[#4b5e52] bg-stone-50 shadow-sm'
                      )
                      : (
                        isDarkMode
                          ? 'text-stone-400 hover:text-white hover:bg-white/5'
                          : 'text-stone-500 hover:bg-stone-50/50'
                      )
                    }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-6 px-2 space-y-4">

                {/* MOBILE THEME TOGGLE */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`w-full px-6 py-4 rounded-2xl flex items-center justify-center text-xs font-bold uppercase tracking-widest transition-colors ${isDarkMode
                    ? 'bg-white/5 text-[#d4c5b3] border border-white/10'
                    : 'bg-stone-100 text-stone-600'
                    }`}
                >

                  {isDarkMode ? (
                    <>
                      <Sun className="w-4 h-4 mr-2" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 mr-2" />
                      Dark Mode
                    </>
                  )}

                </button>


                {/* MOBILE DONATE */}
                <button
                  onClick={() => {
                    setActivePage('Donate');
                    setIsOpen(false);

                    window.scrollTo({
                      top: 0,
                      behavior: 'smooth'
                    });
                  }}
                  className="w-full bg-[#4b5e52] text-white px-8 py-5 rounded-full text-center text-xs font-bold uppercase tracking-widest flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                >

                  <Heart className="w-4 h-4 mr-2" />

                  Donate Now

                </button>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}