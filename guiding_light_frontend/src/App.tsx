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
import StoryArticle from './components/public/StoryArticle';
import TransparencyTracker from './components/public/TransparencyTracker';
import DonationForm from './components/public/DonationForm';
import Mission from './components/public/Mission';
import Services from './components/public/Services.tsx';
import ContactUs from './components/public/ContactUs';
import HomeAbout from './components/public/HomeAbout';
import Footer from './components/public/Footer';

// Admin Components
import Login from './components/admin/Login';
import Sidebar from './components/layout/Sidebar';
import CMSModule from './components/admin/CMSModule';
import DonationVerification from './components/admin/DonationVerification';
import BankReconciliation from './components/admin/BankReconciliation';

export default function App() {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [activePage, setActivePage] = React.useState<PublicPage>('Home');
  const [selectedStoryId, setSelectedStoryId] = React.useState<number | null>(null);
  const [activeAdminTab, setActiveAdminTab] = React.useState<AdminTab>('CMS');
  const [storyToEdit, setStoryToEdit] = React.useState<number | null>(null);
  const [currentUser, setCurrentUser] = React.useState<{id: number, username: string} | null>(null);

const toggleAdmin = () => {
    setIsAdmin(!isAdmin);
    if (!isAdmin) {
      setActiveAdminTab('Stories');
    } else {
      setCurrentUser(null); // Clear the user when logging out
      setActivePage('Home');
    }
  };

  // Effect to reset story view when navigating away
  React.useEffect(() => {
    if (activePage !== 'Stories') {
      setSelectedStoryId(null);
    }
  }, [activePage]);

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex">
<Sidebar 
          activeTab={activeAdminTab} 
          setActiveTab={setActiveAdminTab} 
          onLogout={toggleAdmin}
          user={currentUser} 
        />
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-10">
<header className="mb-8 lg:mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] border border-stone-100 shadow-sm gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif italic text-stone-800">System Management Overview</h1>
              <p className="text-stone-400 text-xs sm:text-sm">Bridging the Trust Gap through Radical Transparency</p>
            </div>
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-start">
              <div className="text-left sm:text-right">
                <p className="text-sm font-bold text-stone-800 capitalize">{currentUser?.username || 'System User'}</p>
                <p className="text-xs text-stone-400">System Administrator</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#d4c5b3] rounded-full flex items-center justify-center text-[#3a4740] font-bold border-2 border-white shadow-sm uppercase">
                {currentUser?.username ? currentUser.username.substring(0, 2) : 'AD'}
              </div>
            </div>
          </header>

<div className="mt-4">
            {activeAdminTab === 'Stories' && <CMSModule />}
            {activeAdminTab === 'Donations' && <DonationVerification />}
            {activeAdminTab === 'Reconciliation' && <BankReconciliation />}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2] text-stone-800 selection:bg-[#d4c5b3] selection:text-[#3a4740]">
<Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
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
              <Hero setActivePage={setActivePage} />
              <HomeAbout setActivePage={setActivePage} />
            </motion.div>
          )}

          {activePage === 'Mission' && (
            <motion.div
              key="mission"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Mission />
            </motion.div>
          )}

          {activePage === 'Stories' && (
            <motion.div
              key="stories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {selectedStoryId ? (
                <StoryArticle 
                  storyId={selectedStoryId}
                  isAdmin={isAdmin}
                  onEdit={(id) => {
                    setStoryToEdit(id);
                    setActiveAdminTab('Stories');
                    setIsAdmin(true);
                  }}
                  onBack={() => {
                    setSelectedStoryId(null); // Clears the selection to go back to the feed
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                />
              ) : (
                <>
                  <div className="bg-[#ede9e3] pt-20 pb-10">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                      <div className="inline-block px-4 py-1 bg-stone-200 text-stone-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">The Feed</div>
                      <h1 className="text-5xl font-serif italic text-stone-800 mb-4 tracking-tight">Stories of Hope</h1>
                      <p className="text-stone-600 text-lg">Voices of resilience and hope from our community.</p>
                    </div>
                  </div>
                  <SuccessStories onReadStory={(id) => {
                    setSelectedStoryId(id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} />
                </>
              )}
            </motion.div>
          )}


          {activePage === 'Donate' && (
            <motion.div
              key="donate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DonationForm />
              <div className="pb-20">
                <TransparencyTracker />
              </div>
            </motion.div>
          )}

          {activePage === 'Services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Services />
            </motion.div>
          )}

          {activePage === 'Contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ContactUs />
            </motion.div>
          )}
          {activePage === 'Login' && (
            <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
<Login 
                onLoginSuccess={(user) => {
                  setIsAdmin(true);
                  setActiveAdminTab('Stories');
                  setCurrentUser(user);
                }} 
                onBack={() => setActivePage('Home')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer setActivePage={setActivePage} />
    </div>
  );
}
