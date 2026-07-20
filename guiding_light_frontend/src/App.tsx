/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PublicPage, AdminTab } from './types';

// Components
import Navbar from './components/layout/Navbar';
import Hero from './components/public/Hero';
import SuccessStories from './components/public/SuccessStories';
import TransparencyTracker from './components/public/TransparencyTracker';
import DonationForm from './components/public/DonationForm';
import Footer from './components/public/Footer';

// Admin Components
import Sidebar from './components/layout/Sidebar';
import CMSModule from './components/admin/CMSModule';
import DonationVerification from './components/admin/DonationVerification';
import BankReconciliation from './components/admin/BankReconciliation';

export default function App() {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [activePage, setActivePage] = React.useState<PublicPage>('Home');
  const [activeAdminTab, setActiveAdminTab] = React.useState<AdminTab>('CMS');

  // Handle donation button click from hero
  const handleDonateClick = () => {
    setActivePage('Donate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleAdmin = () => {
    setIsAdmin(!isAdmin);
    if (!isAdmin) {
      setActiveAdminTab('CMS');
    } else {
      setActivePage('Home');
    }
  };

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex">
        <Sidebar 
          activeTab={activeAdminTab} 
          setActiveTab={setActiveAdminTab} 
          onLogout={toggleAdmin} 
        />
        <main className="flex-1 ml-64 p-10">
          <header className="mb-12 flex justify-between items-center bg-white p-8 rounded-[32px] border border-stone-100 shadow-sm">
            <div>
              <h1 className="text-3xl font-serif italic text-stone-800">System Management Overview</h1>
              <p className="text-stone-400 text-sm">Bridging the Trust Gap through Radical Transparency</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right mr-4">
                <p className="text-sm font-bold text-stone-800">Maria Clara Santos</p>
                <p className="text-xs text-stone-400">System Administrator</p>
              </div>
              <div className="w-12 h-12 bg-[#d4c5b3] rounded-full flex items-center justify-center text-[#3a4740] font-bold border-2 border-white shadow-sm">
                MS
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeAdminTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeAdminTab === 'CMS' && <CMSModule />}
              {activeAdminTab === 'Donations' && <DonationVerification />}
              {activeAdminTab === 'Reconciliation' && <BankReconciliation />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2] text-stone-800 selection:bg-[#d4c5b3] selection:text-[#3a4740]">
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isAdmin={isAdmin}
        onAdminToggle={toggleAdmin}
      />

      <main className="pt-20">
        <AnimatePresence mode="wait">
          {activePage === 'Home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Hero onDonate={handleDonateClick} />
              <SuccessStories />
              <TransparencyTracker />
              <DonationForm />
            </motion.div>
          )}

          {activePage === 'Stories' && (
            <motion.div
              key="stories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-[#ede9e3] pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-4 text-center">
                  <h1 className="text-5xl font-serif italic text-stone-800 mb-4 tracking-tight">Our Stories</h1>
                  <p className="text-stone-600 text-lg">Voices of resilience and hope from our community.</p>
                </div>
              </div>
              <SuccessStories />
            </motion.div>
          )}

          {activePage === 'Transparency' && (
            <motion.div
              key="transparency"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-[#3a4740] pt-32 pb-10">
                <div className="max-w-7xl mx-auto px-4 text-center">
                  <h1 className="text-5xl font-serif italic text-[#d4c5b3] mb-4 tracking-tight">Transparency Tracker</h1>
                  <p className="text-white/60 text-lg">Real-time verification of your contributions.</p>
                </div>
              </div>
              <TransparencyTracker />
            </motion.div>
          )}

          {activePage === 'Donate' && (
            <motion.div
              key="donate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-[#ede9e3] pt-32 pb-10">
                <div className="max-w-7xl mx-auto px-4 text-center">
                  <h1 className="text-5xl font-serif italic text-stone-800 mb-4 tracking-tight">Make a Donation</h1>
                  <p className="text-stone-600 text-lg">Choose a category and help us light the way.</p>
                </div>
              </div>
              <DonationForm />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
