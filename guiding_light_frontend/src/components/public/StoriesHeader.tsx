import React from 'react';
import { useTheme } from '../../context/ThemeContext';


export default function StoriesHeader() {

  const { isDarkMode } = useTheme();

  return (
    <div
      className={`pt-20 pb-10 transition-colors duration-300 ${
        isDarkMode
          ? 'bg-[#1f2623]'
          : 'bg-[#ede9e3]'
      }`}
    >

      <div className="max-w-7xl mx-auto px-4 text-center">

        <div
          className={`inline-block px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 ${
            isDarkMode
              ? 'bg-white/10 text-[#d4c5b3]'
              : 'bg-stone-200 text-stone-600'
          }`}
        >
          The Feed
        </div>

        <h1
          className={`text-5xl font-serif italic mb-4 tracking-tight ${
            isDarkMode
              ? 'text-[#f7f5f2]'
              : 'text-stone-800'
          }`}
        >
          Stories of Hope
        </h1>

        <p
          className={`text-lg ${
            isDarkMode
              ? 'text-stone-300'
              : 'text-stone-600'
          }`}
        >
          Voices of resilience and hope from our community.
        </p>

      </div>

    </div>
  );
}