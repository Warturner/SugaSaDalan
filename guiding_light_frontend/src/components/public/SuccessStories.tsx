/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Pin, Calendar, User, ChevronRight, ChevronLeft, Tag, Loader, Image as ImageIcon } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface Story {
  post_id: number;
  title: string;
  author: string;
  published_date: string;
  excerpt: string;
  image?: string;
  category_id?: number;
  category_name?: string;
  active_pin?: number;
}

interface StoriesProps {
  onStoryClick: (id: number) => void;
}

const STORIES_PER_PAGE = 9;

export default function Stories({ onStoryClick }: StoriesProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtering & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [storiesRes, categoriesRes] = await Promise.all([
          fetch('http://localhost/GuidingLight_Project/guiding_light_backend/get_stories.php'),
          fetch('http://localhost/GuidingLight_Project/guiding_light_backend/get_categories.php')
        ]);
        
        const storiesData = await storiesRes.json();
        const categoriesData = await categoriesRes.json();
        
        if (!storiesData.error) setStories(storiesData);
        if (!categoriesData.error) setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Apply Search and Category Filters
  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          story.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || story.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Extract the top pinned story (if one exists and we are not heavily filtering)
  // The PHP backend already sorted active_pin = 1 to the very top!
  const hasPinnedStory = filteredStories.length > 0 && filteredStories[0].active_pin === 1 && searchQuery === '' && selectedCategory === 'All';
  const pinnedStory = hasPinnedStory ? filteredStories[0] : null;
  
  // The grid stories are everything else (excluding the pinned story if it's featured at the top)
  const gridStories = hasPinnedStory ? filteredStories.slice(1) : filteredStories;

  // Pagination Logic
  const totalPages = Math.ceil(gridStories.length / STORIES_PER_PAGE);
  const currentGridStories = gridStories.slice((currentPage - 1) * STORIES_PER_PAGE, currentPage * STORIES_PER_PAGE);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex justify-center text-[#4b5e52]">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2] pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Controls */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif italic text-stone-800 mb-8">NGO Stories & Updates</h1>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setSelectedCategory('All')}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-sm ${selectedCategory === 'All' ? 'bg-[#4b5e52] text-white' : 'bg-white text-stone-500 hover:bg-stone-100 border border-stone-200'}`}
              >
                All Stories
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-sm ${selectedCategory === cat.name ? 'bg-[#4b5e52] text-white' : 'bg-white text-stone-500 hover:bg-stone-100 border border-stone-200'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input 
                type="text" 
                placeholder="Search stories..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-5 py-3 bg-white border border-stone-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4b5e52]/20 focus:border-[#4b5e52] text-stone-700 text-sm placeholder:text-stone-400"
              />
            </div>

          </div>
        </div>

        {/* Featured Pinned Story */}
        <AnimatePresence mode="wait">
          {pinnedStory && currentPage === 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => onStoryClick(pinnedStory.post_id)}
              className="mb-12 bg-white rounded-[32px] overflow-hidden shadow-xl border border-stone-100 cursor-pointer group flex flex-col md:flex-row relative"
            >
              <div className="absolute top-6 left-6 z-10 bg-amber-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center shadow-lg">
                <Pin className="w-3 h-3 mr-1.5" /> Featured
              </div>
              
              <div className="md:w-1/2 aspect-[4/3] md:aspect-auto overflow-hidden relative bg-stone-100">
                {pinnedStory.image ? (
                  <img src={pinnedStory.image} alt={pinnedStory.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300"><ImageIcon className="w-12 h-12 opacity-50" /></div>
                )}
              </div>
              
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-[#f7f5f2] text-[#4b5e52] text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-stone-200 flex items-center">
                    <Tag className="w-3 h-3 mr-1" /> {pinnedStory.category_name || 'Uncategorized'}
                  </span>
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest flex items-center">
                    <Calendar className="w-3 h-3 mr-1" /> {new Date(pinnedStory.published_date).toLocaleDateString()}
                  </span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-serif italic text-stone-800 mb-4 group-hover:text-[#4b5e52] transition-colors line-clamp-2">
                  {pinnedStory.title}
                </h2>
                
                <p className="text-stone-500 leading-relaxed mb-6 line-clamp-3">
                  {pinnedStory.excerpt}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-stone-100">
                  <div className="flex items-center text-xs font-bold text-stone-400 uppercase tracking-widest">
                    <User className="w-3 h-3 mr-2" /> {pinnedStory.author}
                  </div>
                  <span className="text-[#4b5e52] font-bold text-[10px] uppercase tracking-widest flex items-center group-hover:translate-x-1 transition-transform">
                    Read Story <ChevronRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stories Grid (9 per page) */}
        {currentGridStories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentGridStories.map(story => (
              <motion.div 
                key={story.post_id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onClick={() => onStoryClick(story.post_id)}
                className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-stone-100 cursor-pointer group flex flex-col"
              >
                <div className="aspect-video overflow-hidden relative bg-stone-100 shrink-0">
                  {story.active_pin === 1 && (
                    <div className="absolute top-4 left-4 z-10 bg-amber-500 text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center shadow-lg">
                      <Pin className="w-3 h-3 mr-1" /> Featured
                    </div>
                  )}
                  {story.image ? (
                    <img src={story.image} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300"><ImageIcon className="w-8 h-8 opacity-50" /></div>
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="bg-[#f7f5f2] text-[#4b5e52] text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest border border-stone-200">
                      {story.category_name || 'Uncategorized'}
                    </span>
                    <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">
                      {new Date(story.published_date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-serif italic text-stone-800 mb-3 group-hover:text-[#4b5e52] transition-colors line-clamp-2">
                    {story.title}
                  </h3>
                  
                  <p className="text-stone-500 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                    {story.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-100">
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest truncate max-w-[120px]">
                      By {story.author}
                    </div>
                    <span className="text-[#4b5e52] font-bold text-[10px] uppercase tracking-widest flex items-center group-hover:translate-x-1 transition-transform shrink-0">
                      Read <ChevronRight className="w-3 h-3 ml-1" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-stone-400">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <h3 className="text-xl font-serif italic text-stone-600 mb-2">No stories found</h3>
            <p className="text-sm text-stone-400 text-center max-w-md">We couldn't find any stories matching your search or category filter.</p>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center gap-4">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1} 
              className="p-3 rounded-full bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:hover:bg-white transition-colors shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages} 
              className="p-3 rounded-full bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:hover:bg-white transition-colors shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}