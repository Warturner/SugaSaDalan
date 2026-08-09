/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Edit, Languages, Loader } from 'lucide-react';

interface StoryArticleProps {
  storyId: number;
  isAdmin: boolean;
  onEdit: (id: number) => void;
  onBack: () => void;
}

export default function StoryArticle({ storyId, isAdmin, onEdit, onBack }: StoryArticleProps) {
  // 1. Core States
  const [isLoading, setIsLoading] = useState(true);
  const [originalStory, setOriginalStory] = useState<{title: string, content: string, image: string, author: string, date: string} | null>(null);
  
  // 2. Translation States
  const [targetLang, setTargetLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [displayContent, setDisplayContent] = useState('');

  // Fetch the story when the component loads
  useEffect(() => {
    const fetchStory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost/GuidingLight_Project/guiding_light_backend/get_story.php?id=${storyId}`);
        const data = await response.json();
        
        if (data.success) {
          setOriginalStory(data.story);
          setDisplayContent(data.story.content);
        } else {
          console.error(data.error);
          // Optional: Add a state to show a "Story Not Found" message to the user
        }
      } catch (error) {
        console.error("Failed to fetch the story:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStory();
  }, [storyId]);

  // 3. The Auto-Translate Magic Function
  const translateText = async (text: string, lang: string) => {
    if (lang === 'en') return text; // Don't translate if English is selected
    
    try {
      // Using Google's free frontend API endpoint
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
      const response = await fetch(url);
      const data = await response.json();
      
      // The API returns an array of translated sentences, we join them back together
      return data[0].map((item: any) => item[0]).join('');
    } catch (error) {
      console.error("Translation failed:", error);
      return text; // Fallback to original text if it fails
    }
  };

  // 4. Trigger translation ONLY for content when the language dropdown changes
  useEffect(() => {
    const handleTranslation = async () => {
      if (!originalStory) return;
      
      if (targetLang === 'en') {
        setDisplayContent(originalStory.content);
        return;
      }

      setIsTranslating(true);
      
      // Translate ONLY the content body
      const translatedContent = await translateText(originalStory.content, targetLang);

      setDisplayContent(translatedContent);
      setIsTranslating(false);
    };

    handleTranslation();
  }, [targetLang, originalStory]);

  if (isLoading || !originalStory) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex justify-center text-stone-400">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <motion.article 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-32 pb-20 max-w-4xl mx-auto px-4"
    >
      {/* Top Navigation & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <button 
          onClick={onBack}
          className="flex items-center text-stone-400 hover:text-stone-800 transition-colors text-[10px] font-bold uppercase tracking-widest group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Stories
        </button>

        <div className="flex items-center gap-4">
          {/* Global Language Selector */}
          <div className="relative flex items-center bg-white border border-stone-200 rounded-full px-4 py-2 shadow-sm">
            <Languages className="w-4 h-4 text-stone-400 mr-2" />
            <select 
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              disabled={isTranslating}
              className="appearance-none bg-transparent text-xs font-bold uppercase tracking-widest text-stone-600 focus:outline-none cursor-pointer pr-4"
            >
              <option value="en">English</option>
              <option value="tl">Tagalog</option>
              <option value="ceb">Cebuano</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
              <option value="zh-CN">Chinese (Simp)</option>
              <option value="ar">Arabic</option>
              <option value="hi">Hindi</option>
            </select>
            {isTranslating && <Loader className="w-3 h-3 animate-spin text-[#d4c5b3] absolute right-4" />}
          </div>

          {isAdmin && (
            <button 
              onClick={() => onEdit(storyId)}
              className="flex items-center px-4 py-2 bg-[#d4c5b3] text-[#3a4740] rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#c4b5a3] transition-colors"
            >
              <Edit className="w-3 h-3 mr-2" />
              Edit Story
            </button>
          )}
        </div>
      </div>

      {/* Story Header (No longer translated) */}
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-serif italic text-stone-800 mb-6 leading-tight">
          {originalStory.title}
        </h1>
        
        <div className="flex items-center text-xs font-bold uppercase tracking-widest text-stone-400">
          <span>By {originalStory.author}</span>
          <span className="mx-3 border-l border-stone-300 h-3"></span>
          <span>{originalStory.date}</span>
        </div>
      </header>

      {/* Story Image */}
      <div className="aspect-[21/9] rounded-[32px] overflow-hidden mb-12 shadow-lg">
        <img 
          src={originalStory.image} 
          alt={originalStory.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Story Content (Translated) */}
      <motion.div 
        key={displayContent} // Animates text changes
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="prose prose-stone prose-lg max-w-none text-stone-600 leading-relaxed"
      >
        <p>{displayContent}</p>
      </motion.div>
    </motion.article>
  );
}