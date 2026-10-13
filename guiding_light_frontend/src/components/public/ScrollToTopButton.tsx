import React from 'react';

import {
  ArrowUp
} from 'lucide-react';

import {
  AnimatePresence,
  motion
} from 'motion/react';

import {
  useTheme
} from '../../context/ThemeContext';


export default function ScrollToTopButton() {

  const { isDarkMode } = useTheme();

  const [
    isVisible,
    setIsVisible
  ] = React.useState(false);


  React.useEffect(() => {

    const handleScroll = () => {

      setIsVisible(
        window.scrollY > 400
      );

    };

    handleScroll();

    window.addEventListener(
      'scroll',
      handleScroll,
      {
        passive: true
      }
    );

    return () => {

      window.removeEventListener(
        'scroll',
        handleScroll
      );

    };

  }, []);


  const scrollToTop = () => {

    const prefersReducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

    window.scrollTo({
      top: 0,
      behavior:
        prefersReducedMotion
          ? 'auto'
          : 'smooth'
    });

  };


  return (
    <AnimatePresence>

      {isVisible && (

        <motion.button
          type="button"
          initial={{
            opacity: 0,
            scale: 0.85,
            y: 10
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            scale: 0.85,
            y: 10
          }}
          whileHover={{
            y: -2
          }}
          whileTap={{
            scale: 0.92
          }}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          title="Back to top"
          className={`fixed right-4 sm:right-6 lg:right-8 bottom-5 sm:bottom-8 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#d4c5b3]/50 transition-colors ${
            isDarkMode
              ? 'bg-[#d4c5b3] text-[#242c28] border-white/10 shadow-black/30 hover:bg-[#e4d8ca]'
              : 'bg-[#4b5e52] text-white border-white/20 shadow-black/20 hover:bg-[#3a4740]'
          }`}
        >

          <ArrowUp className="w-5 h-5" />

        </motion.button>

      )}

    </AnimatePresence>
  );
}