/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {
  useState,
  useEffect
} from 'react';

import {
  motion,
  AnimatePresence
} from 'motion/react';

import {
  Search,
  Pin,
  Calendar,
  User,
  ChevronRight,
  ChevronLeft,
  Tag,
  Loader,
  Image as ImageIcon
} from 'lucide-react';

import type {
  Story,
  StoryCategory
} from '../../types';

import {
  getStories,
  getCategories
} from '../../services/storyService';

import {
  useTheme
} from '../../context/ThemeContext';


interface StoriesProps {
  onStoryClick: (id: number) => void;
}

const STORIES_PER_PAGE = 9;


export default function Stories({
  onStoryClick
}: StoriesProps) {

  const { isDarkMode } = useTheme();

  const [
    stories,
    setStories
  ] = useState<Story[]>([]);

  const [
    categories,
    setCategories
  ] = useState<StoryCategory[]>([]);

  const [
    isLoading,
    setIsLoading
  ] = useState(true);

  const [
    searchQuery,
    setSearchQuery
  ] = useState('');

  const [
    selectedCategory,
    setSelectedCategory
  ] = useState<string>('All');

  const [
    currentPage,
    setCurrentPage
  ] = useState(1);


  useEffect(() => {

    const fetchData = async () => {

      setIsLoading(true);

      try {

        const [
          storiesData,
          categoriesData
        ] = await Promise.all([
          getStories(),
          getCategories()
        ]);

        setStories(storiesData);
        setCategories(categoriesData);

      } catch (error) {

        console.error(
          'Failed to fetch data:',
          error
        );

      } finally {

        setIsLoading(false);

      }

    };

    fetchData();

  }, []);


  useEffect(() => {

    setCurrentPage(1);

  }, [
    searchQuery,
    selectedCategory
  ]);


  const filteredStories =
    stories.filter(story => {

      const matchesSearch =
        story.title
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        (story.excerpt ?? '')
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          );

      const matchesCategory =
        selectedCategory === 'All' ||
        story.category_name ===
          selectedCategory;

      return (
        matchesSearch &&
        matchesCategory
      );

    });


  const hasPinnedStory =
    filteredStories.length > 0 &&
    filteredStories[0].active_pin === 1 &&
    searchQuery === '' &&
    selectedCategory === 'All';


  const pinnedStory =
    hasPinnedStory
      ? filteredStories[0]
      : null;


  const gridStories =
    hasPinnedStory
      ? filteredStories.slice(1)
      : filteredStories;


  const totalPages =
    Math.ceil(
      gridStories.length /
      STORIES_PER_PAGE
    );


  const currentGridStories =
    gridStories.slice(
      (currentPage - 1) *
        STORIES_PER_PAGE,

      currentPage *
        STORIES_PER_PAGE
    );


  if (isLoading) {

    return (
      <div
        className={`min-h-screen pt-32 pb-20 flex justify-center transition-colors duration-300 ${
          isDarkMode
            ? 'bg-[#242c28] text-[#d4c5b3]'
            : 'bg-[#f7f5f2] text-[#4b5e52]'
        }`}
      >
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );

  }


  return (
    <div
      className={`min-h-screen pt-32 pb-20 px-4 transition-colors duration-300 ${
        isDarkMode
          ? 'bg-[#242c28]'
          : 'bg-[#f7f5f2]'
      }`}
    >

      <div className="max-w-7xl mx-auto">

        {/* HEADER + CONTROLS */}
        <div className="mb-12">

          <h1
            className={`text-4xl md:text-5xl font-serif italic mb-8 transition-colors ${
              isDarkMode
                ? 'text-[#f7f5f2]'
                : 'text-stone-800'
            }`}
          >
            NGO Stories & Updates
          </h1>


          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

            {/* CATEGORY FILTERS */}
            <div className="flex flex-wrap gap-2">

              <button
                onClick={() =>
                  setSelectedCategory('All')
                }
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-sm ${
                  selectedCategory === 'All'
                    ? 'bg-[#4b5e52] text-white'
                    : (
                        isDarkMode
                          ? 'bg-white/5 text-stone-300 hover:bg-white/10 border border-white/10'
                          : 'bg-white text-stone-500 hover:bg-stone-100 border border-stone-200'
                      )
                }`}
              >
                All Stories
              </button>


              {categories.map(cat => (

                <button
                  key={cat.id}
                  onClick={() =>
                    setSelectedCategory(
                      cat.name
                    )
                  }
                  className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-sm ${
                    selectedCategory ===
                    cat.name
                      ? 'bg-[#4b5e52] text-white'
                      : (
                          isDarkMode
                            ? 'bg-white/5 text-stone-300 hover:bg-white/10 border border-white/10'
                            : 'bg-white text-stone-500 hover:bg-stone-100 border border-stone-200'
                        )
                  }`}
                >
                  {cat.name}
                </button>

              ))}

            </div>


            {/* SEARCH */}
            <div className="relative w-full md:w-80">

              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isDarkMode
                    ? 'text-stone-500'
                    : 'text-stone-400'
                }`}
              />

              <input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                className={`w-full pl-11 pr-5 py-3 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4b5e52]/20 focus:border-[#4b5e52] text-sm transition-colors ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10 text-stone-200 placeholder:text-stone-500'
                    : 'bg-white border-stone-200 text-stone-700 placeholder:text-stone-400'
                }`}
              />

            </div>

          </div>

        </div>


        {/* FEATURED STORY */}
        <AnimatePresence mode="wait">

          {pinnedStory &&
            currentPage === 1 && (

            <motion.div
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0
              }}
              onClick={() =>
                onStoryClick(
                  pinnedStory.post_id
                )
              }
              className={`mb-12 rounded-[32px] overflow-hidden shadow-xl border cursor-pointer group flex flex-col md:flex-row relative transition-colors ${
                isDarkMode
                  ? 'bg-[#303a35] border-white/10'
                  : 'bg-white border-stone-100'
              }`}
            >

              <div className="absolute top-6 left-6 z-10 bg-amber-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center shadow-lg">

                <Pin className="w-3 h-3 mr-1.5" />

                Featured

              </div>


              <div
                className={`md:w-1/2 aspect-[4/3] md:aspect-auto overflow-hidden relative ${
                  isDarkMode
                    ? 'bg-white/5'
                    : 'bg-stone-100'
                }`}
              >

                {pinnedStory.image ? (

                  <img
                    src={
                      pinnedStory.image
                    }
                    alt={
                      pinnedStory.title
                    }
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                ) : (

                  <div className="w-full h-full flex items-center justify-center text-stone-400">

                    <ImageIcon className="w-12 h-12 opacity-50" />

                  </div>

                )}

              </div>


              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">

                <div className="flex items-center gap-3 mb-4 flex-wrap">

                  <span
                    className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border flex items-center ${
                      isDarkMode
                        ? 'bg-white/5 text-[#d4c5b3] border-white/10'
                        : 'bg-[#f7f5f2] text-[#4b5e52] border-stone-200'
                    }`}
                  >

                    <Tag className="w-3 h-3 mr-1" />

                    {
                      pinnedStory.category_name ||
                      'Uncategorized'
                    }

                  </span>


                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest flex items-center">

                    <Calendar className="w-3 h-3 mr-1" />

                    {new Date(
                      pinnedStory.published_date
                    ).toLocaleDateString()}

                  </span>

                </div>


                <h2
                  className={`text-3xl md:text-4xl font-serif italic mb-4 transition-colors line-clamp-2 ${
                    isDarkMode
                      ? 'text-[#f7f5f2] group-hover:text-[#d4c5b3]'
                      : 'text-stone-800 group-hover:text-[#4b5e52]'
                  }`}
                >
                  {pinnedStory.title}
                </h2>


                <p
                  className={`leading-relaxed mb-6 line-clamp-3 ${
                    isDarkMode
                      ? 'text-stone-300'
                      : 'text-stone-500'
                  }`}
                >
                  {pinnedStory.excerpt}
                </p>


                <div
                  className={`flex items-center justify-between mt-auto pt-6 border-t ${
                    isDarkMode
                      ? 'border-white/10'
                      : 'border-stone-100'
                  }`}
                >

                  <div className="flex items-center text-xs font-bold text-stone-400 uppercase tracking-widest">

                    <User className="w-3 h-3 mr-2" />

                    {pinnedStory.author}

                  </div>


                  <span
                    className={`font-bold text-[10px] uppercase tracking-widest flex items-center group-hover:translate-x-1 transition-all ${
                      isDarkMode
                        ? 'text-[#d4c5b3]'
                        : 'text-[#4b5e52]'
                    }`}
                  >
                    Read Story

                    <ChevronRight className="w-4 h-4 ml-1" />
                  </span>

                </div>

              </div>

            </motion.div>

          )}

        </AnimatePresence>


        {/* STORIES GRID */}
        {currentGridStories.length >
        0 ? (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {currentGridStories.map(
              story => (

              <motion.div
                key={story.post_id}
                initial={{
                  opacity: 0,
                  y: 20
                }}
                whileInView={{
                  opacity: 1,
                  y: 0
                }}
                viewport={{
                  once: true
                }}
                onClick={() =>
                  onStoryClick(
                    story.post_id
                  )
                }
                className={`rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border cursor-pointer group flex flex-col ${
                  isDarkMode
                    ? 'bg-[#303a35] border-white/10'
                    : 'bg-white border-stone-100'
                }`}
              >

                <div
                  className={`aspect-video overflow-hidden relative shrink-0 ${
                    isDarkMode
                      ? 'bg-white/5'
                      : 'bg-stone-100'
                  }`}
                >

                  {story.active_pin === 1 && (

                    <div className="absolute top-4 left-4 z-10 bg-amber-500 text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center shadow-lg">

                      <Pin className="w-3 h-3 mr-1" />

                      Featured

                    </div>

                  )}


                  {story.image ? (

                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                  ) : (

                    <div className="w-full h-full flex items-center justify-center text-stone-400">

                      <ImageIcon className="w-8 h-8 opacity-50" />

                    </div>

                  )}

                </div>


                <div className="p-6 flex flex-col flex-1">

                  <div className="flex items-center gap-2 mb-3 flex-wrap">

                    <span
                      className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest border ${
                        isDarkMode
                          ? 'bg-white/5 text-[#d4c5b3] border-white/10'
                          : 'bg-[#f7f5f2] text-[#4b5e52] border-stone-200'
                      }`}
                    >
                      {
                        story.category_name ||
                        'Uncategorized'
                      }
                    </span>


                    <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">

                      {new Date(
                        story.published_date
                      ).toLocaleDateString()}

                    </span>

                  </div>


                  <h3
                    className={`text-xl font-serif italic mb-3 transition-colors line-clamp-2 ${
                      isDarkMode
                        ? 'text-[#f7f5f2] group-hover:text-[#d4c5b3]'
                        : 'text-stone-800 group-hover:text-[#4b5e52]'
                    }`}
                  >
                    {story.title}
                  </h3>


                  <p
                    className={`text-sm leading-relaxed mb-6 line-clamp-3 flex-1 ${
                      isDarkMode
                        ? 'text-stone-300'
                        : 'text-stone-500'
                    }`}
                  >
                    {story.excerpt}
                  </p>


                  <div
                    className={`flex items-center justify-between mt-auto pt-4 border-t ${
                      isDarkMode
                        ? 'border-white/10'
                        : 'border-stone-100'
                    }`}
                  >

                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest truncate max-w-[120px]">

                      By {story.author}

                    </div>


                    <span
                      className={`font-bold text-[10px] uppercase tracking-widest flex items-center group-hover:translate-x-1 transition-transform shrink-0 ${
                        isDarkMode
                          ? 'text-[#d4c5b3]'
                          : 'text-[#4b5e52]'
                      }`}
                    >

                      Read

                      <ChevronRight className="w-3 h-3 ml-1" />

                    </span>

                  </div>

                </div>

              </motion.div>

            ))}

          </div>

        ) : (

          <div className="py-32 flex flex-col items-center justify-center text-stone-400">

            <Search className="w-12 h-12 mb-4 opacity-20" />

            <h3
              className={`text-xl font-serif italic mb-2 ${
                isDarkMode
                  ? 'text-stone-300'
                  : 'text-stone-600'
              }`}
            >
              No stories found
            </h3>

            <p className="text-sm text-stone-400 text-center max-w-md">
              We couldn't find any stories matching your search or category filter.
            </p>

          </div>

        )}


        {/* PAGINATION */}
        {totalPages > 1 && (

          <div className="mt-16 flex justify-center items-center gap-4">

            <button
              onClick={() =>
                setCurrentPage(
                  p =>
                    Math.max(
                      1,
                      p - 1
                    )
                )
              }
              disabled={
                currentPage === 1
              }
              aria-label="Previous page"
              className={`p-3 rounded-full border disabled:opacity-50 transition-colors shadow-sm ${
                isDarkMode
                  ? 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10 disabled:hover:bg-white/5'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 disabled:hover:bg-white'
              }`}
            >

              <ChevronLeft className="w-5 h-5" />

            </button>


            <span
              className={`text-xs font-bold uppercase tracking-widest ${
                isDarkMode
                  ? 'text-stone-400'
                  : 'text-stone-500'
              }`}
            >
              Page {currentPage} of {totalPages}
            </span>


            <button
              onClick={() =>
                setCurrentPage(
                  p =>
                    Math.min(
                      totalPages,
                      p + 1
                    )
                )
              }
              disabled={
                currentPage ===
                totalPages
              }
              aria-label="Next page"
              className={`p-3 rounded-full border disabled:opacity-50 transition-colors shadow-sm ${
                isDarkMode
                  ? 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10 disabled:hover:bg-white/5'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 disabled:hover:bg-white'
              }`}
            >

              <ChevronRight className="w-5 h-5" />

            </button>

          </div>

        )}

      </div>

    </div>
  );
}