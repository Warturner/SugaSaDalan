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
    { id: 'Stories' as PublicPage, label: 'Stories' },
    { id: 'Transparency' as PublicPage, label: 'Transparency Tracker' },
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
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`text-xs font-bold uppercase tracking-widest transition-colors ${
                  activePage === item.id ? 'text-[#4b5e52]' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => setActivePage('Donate')}
              className="bg-[#4b5e52] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#3a4740] transition-all shadow-sm"
            >
              Donate Now
            </button>
            <button 
              onClick={onAdminToggle}
              className="text-[10px] text-stone-400 hover:text-stone-600 underline uppercase tracking-tighter"
            >
              {isAdmin ? 'Exit Admin' : 'Admin Portal'}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-slate-900 p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setIsOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-4 text-base font-medium ${
                    activePage === item.id ? 'text-blue-600 bg-blue-50' : 'text-slate-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-4 px-3">
                <button
                  onClick={() => {
                    setActivePage('Donate');
                    setIsOpen(false);
                  }}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl text-center font-semibold flex items-center justify-center"
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
