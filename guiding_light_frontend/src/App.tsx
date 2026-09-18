/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PublicPage, AdminTab } from './types';
import { AlertTriangle } from 'lucide-react';

// Components
import Navbar from './components/layout/Navbar';
import Hero from './components/public/Hero';
import SuccessStories from './components/public/SuccessStories';
import StoryArticle from './components/public/StoryArticle';
import DonationForm from './components/public/DonationForm';
import Mission from './components/public/Mission';
import Services from './components/public/Services';
import ContactUs from './components/public/ContactUs';
import HomeAbout from './components/public/HomeAbout';
import Footer from './components/public/Footer';
import Team from './components/public/Team';

// Admin Components
import UserAccounts from './components/admin/UserAccounts';
import Login from './components/admin/Login';
import SettingsModule from './components/admin/SettingsModule';
import Sidebar from './components/layout/Sidebar';
import CMSModule from './components/admin/CMSModule';
import TeamManagement from './components/admin/TeamManagement';
import DonationVerification from './components/admin/DonationVerification';

interface User {
  id: number;
  username: string;
  role?: string;
}

export default function App() {
  const [isAdmin, setIsAdmin] = React.useState(false);

  // --- 1. MEMORY-AWARE ACTIVE PAGE STATE ---
  const [activePage, setActivePage] = React.useState<PublicPage>(() => {
    // If returning from PayMongo, force the Donate page
    if (window.location.search.includes('payment=')) {
      return 'Donate';
    }
    // Otherwise check memory, fallback to Home
    const savedPage = sessionStorage.getItem('guidingLightLastPage');
    return (savedPage as PublicPage) || 'Home';
  });

  // --- 2. MEMORY-AWARE STORY STATE ---
  const [selectedStoryId, setSelectedStoryId] = React.useState<number | null>(() => {
    const savedStory = sessionStorage.getItem('guidingLightLastStory');
    return savedStory ? parseInt(savedStory, 10) : null;
  });

  // --- 3. SAVE TO MEMORY EFFECTS ---
  React.useEffect(() => {
    sessionStorage.setItem('guidingLightLastPage', activePage);
  }, [activePage]);

  React.useEffect(() => {
    if (selectedStoryId !== null) {
      sessionStorage.setItem('guidingLightLastStory', selectedStoryId.toString());
    } else {
      sessionStorage.removeItem('guidingLightLastStory');
    }
  }, [selectedStoryId]);


  const [activeAdminTab, setActiveAdminTab] = React.useState<AdminTab>('Stories');
  const [storyToEdit, setStoryToEdit] = React.useState<number | null>(null);

  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = React.useState(true);
  React.useEffect(() => {

    const restoreSession = async () => {

      try {

        const response = await fetch(
          '/guiding_light_backend/check_session.php',
          {
            credentials: 'include'
          }
        );

        if (!response.ok) {
          setIsAdmin(false);
          setCurrentUser(null);
          return;
        }

        const data = await response.json();

        if (
          data.success &&
          data.authenticated &&
          data.user
        ) {

          setCurrentUser(data.user);
          setIsAdmin(true);

        } else {

          setCurrentUser(null);
          setIsAdmin(false);
        }

      } catch (error) {

        console.error(
          'Unable to restore session:',
          error
        );

        setCurrentUser(null);
        setIsAdmin(false);

      } finally {

        setCheckingAuth(false);
      }
    };


    restoreSession();

  }, []);

  const [logoutTimer, setLogoutTimer] = React.useState<number>(3);

  const [showWarning, setShowWarning] = React.useState(false);
  const [countdown, setCountdown] = React.useState(30);

  const handleLogout = async () => {

    try {

      await fetch(
        '/guiding_light_backend/logout.php',
        {
          method: 'POST',
          credentials: 'include'
        }
      );

    } catch (error) {

      console.error(
        'Logout request failed:',
        error
      );

    } finally {

      setIsAdmin(false);
      setCurrentUser(null);
      setActivePage('Login');
      setActiveAdminTab('Stories');

    }
  };

  React.useEffect(() => {
    if (activePage !== 'Stories') {
      setSelectedStoryId(null);
    }
  }, [activePage]);

  React.useEffect(() => {
    let warningTimeout: ReturnType<typeof setTimeout>;
    let logoutTimeout: ReturnType<typeof setTimeout>;
    let countdownInterval: ReturnType<typeof setInterval>;

    const resetTimer = () => {
      clearTimeout(warningTimeout);
      clearTimeout(logoutTimeout);
      clearInterval(countdownInterval);

      setShowWarning(false);
      setCountdown(30);

      if (isAdmin) {
        const warningDelay = (logoutTimer * 60 * 1000) - 30000;

        warningTimeout = setTimeout(() => {
          setShowWarning(true);

          let timeLeft = 30;
          countdownInterval = setInterval(() => {
            timeLeft -= 1;
            setCountdown(timeLeft);
          }, 1000);

          logoutTimeout = setTimeout(() => {

            clearInterval(countdownInterval);

            setShowWarning(false);

            handleLogout();

          }, 30000);

        }, warningDelay);
      }
    };

    if (isAdmin) {
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keydown', resetTimer);
      window.addEventListener('mousedown', resetTimer);
      window.addEventListener('touchstart', resetTimer);
      resetTimer();
    }

    return () => {
      clearTimeout(warningTimeout);
      clearTimeout(logoutTimeout);
      clearInterval(countdownInterval);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [isAdmin, logoutTimer]);

  if (checkingAuth) {

    return (
      <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center">

        <div className="text-center">

          <div className="w-10 h-10 border-4 border-stone-200 border-t-[#3a4740] rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm text-stone-500">
            Checking session...
          </p>

        </div>

      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex relative">
        <AnimatePresence>
          {showWarning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl text-center border-4 border-amber-500/20"
              >
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-serif italic text-stone-800 mb-2">Inactivity Warning</h3>
                <p className="text-stone-600 mb-8 leading-relaxed">
                  You will be automatically logged out in <br />
                  <span className="font-bold text-amber-600 text-3xl">{countdown}</span> <br />
                  seconds due to inactivity.
                </p>
                <button
                  onClick={() => setShowWarning(false)}
                  className="w-full py-4 bg-amber-500 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  Keep Me Logged In
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Sidebar
          activeTab={activeAdminTab}
          setActiveTab={setActiveAdminTab}
          onLogout={handleLogout}
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
                <p className="text-xs text-stone-400">
                  {currentUser?.role === 'admin' ? 'System Administrator' : 'Media Manager'}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#d4c5b3] rounded-full flex items-center justify-center text-[#3a4740] font-bold border-2 border-white shadow-sm uppercase">
                {currentUser?.username ? currentUser.username.substring(0, 2) : 'AD'}
              </div>
            </div>
          </header>

          <div className="mt-4">
            {activeAdminTab === 'Stories' && <CMSModule />}

            {/* ADDED: Team Management Module */}
            {activeAdminTab === 'Team' && <TeamManagement />}

            {activeAdminTab === 'Donations' && <DonationVerification currentUser={currentUser} />}

            {activeAdminTab === 'Accounts' && <UserAccounts currentUser={currentUser} />}
            {activeAdminTab === 'Settings' && <SettingsModule user={currentUser} onUpdateUser={setCurrentUser} />}
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

                    if (!currentUser) {
                      setActivePage('Login');
                      return;
                    }

                    setStoryToEdit(id);
                    setActiveAdminTab('Stories');
                  }}
                  onBack={() => {
                    setSelectedStoryId(null);
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
                  <SuccessStories onStoryClick={(id) => {
                    setSelectedStoryId(id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} />
                </>
              )}
            </motion.div>
          )}

          {/* ADDED: Public Team Page Route */}
          {activePage === 'Team' && (
            <motion.div
              key="team"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Team />
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