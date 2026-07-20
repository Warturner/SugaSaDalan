/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Menu, X, Heart } from 'lucide-react';
import { PublicPage } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  activePage: PublicPage;
  setActivePage: (page: PublicPage) => void;
  isAdmin: boolean;
  onAdminToggle: () => void;
}

export default function Navbar({ activePage, setActivePage, isAdmin, onAdminToggle }: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { id: 'Home' as PublicPage, label: 'Home' },
    { id: 'Mission' as PublicPage, label: 'Our Mission' },
    { id: 'Services' as PublicPage, label: 'Services' },
    { id: 'Stories' as PublicPage, label: 'Stories' },
    { id: 'Contact' as PublicPage, label: 'Contact Us' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-stone-200 z-50 h-20 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between h-full items-center">
          <div className="flex items-center cursor-pointer" onClick={() => setActivePage('Home')}>
            <div className="flex flex-col">
              <h1 className="text-stone-800 font-serif italic text-2xl leading-none">Streetlight</h1>
              <p className="text-stone-400 text-[10px] uppercase tracking-widest font-semibold mt-1">Suga sa Dalan Org.</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8 h-full">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`relative h-full text-xs font-bold uppercase tracking-widest transition-colors flex items-center ${
                  activePage === item.id ? 'text-[#4b5e52]' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {item.label}
                {activePage === item.id && (
                  <motion.div
                    layoutId="navbar-active-line"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4b5e52]"
                  />
                )}
              </button>
            ))}
            <button
              onClick={() => {
                setActivePage('Donate');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-[#4b5e52] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#3a4740] transition-all shadow-md active:scale-95 flex items-center"
            >
              Donate Now
            </button>
            <button 
              onClick={onAdminToggle}
              className="text-[10px] text-stone-400 hover:text-stone-600 transition-colors uppercase tracking-widest font-bold"
            >
              {isAdmin ? 'Exit Admin' : 'Admin'}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-stone-600 hover:bg-stone-50 rounded-xl transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-stone-100 overflow-y-auto max-h-[calc(100vh-80px)] shadow-2xl z-[60]"
          >
            <div className="px-4 pt-4 pb-12 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setIsOpen(false);
                  }}
                  className={`block w-full text-left px-6 py-5 text-xs font-bold uppercase tracking-widest rounded-2xl transition-all ${
                    activePage === item.id ? 'text-[#4b5e52] bg-stone-50 shadow-sm' : 'text-stone-500 hover:bg-stone-50/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-6 px-2 space-y-4">
                <button
                  onClick={() => {
                    setActivePage('Donate');
                    setIsOpen(false);
                  }}
                  className="w-full bg-[#4b5e52] text-white px-8 py-5 rounded-full text-center text-xs font-bold uppercase tracking-widest flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Donate Now
                </button>
                <button 
                  onClick={() => {
                    onAdminToggle();
                    setIsOpen(false);
                  }}
                  className="w-full text-[10px] text-stone-400 py-2 uppercase tracking-widest font-bold"
                >
                  {isAdmin ? 'Exit Admin' : 'Admin Portal'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
