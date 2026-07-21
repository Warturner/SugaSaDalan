/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Calendar, User, Loader2 } from 'lucide-react';

interface SuccessStoriesProps {
  onReadStory?: (storyId: string) => void;
}

export default function SuccessStories({ onReadStory }: SuccessStoriesProps) {
  const [stories, setStories] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch live stories from the PHP backend when the component loads
  React.useEffect(() => {
    fetch('http://localhost/GuidingLight_Project/guiding_light_backend/get_stories.php')
      .then(response => response.json())
      .then(data => {
        setStories(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching stories:", error);
        setIsLoading(false);
      });
  }, []);

  return (
    <section className="py-32 bg-[#f7f5f2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-1 bg-stone-200 text-stone-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">The Feed</div>
          <h2 className="text-4xl font-serif italic text-stone-800 mb-6">Impact Stories</h2>
          <p className="text-stone-600 max-w-xl mx-auto text-sm leading-relaxed">
            Witness the transformation in our community through our various advocacy programs and success stories.
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-sm uppercase tracking-widest font-bold">Loading Live Stories...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {stories.map((story, index) => (
              <motion.div
                key={story.post_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-stone-100 flex flex-col group cursor-pointer"
                onClick={() => onReadStory?.(story.post_id)} 
              >
                <div className="h-64 overflow-hidden relative">
                  <img 
                    src={story.image} 
                    alt={story.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-6 left-6 bg-[#4b5e52] text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                    Impact
                  </div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center text-stone-400 text-[10px] uppercase tracking-widest mb-4 space-x-6">
                    <span className="flex items-center font-bold"><Calendar className="w-3 h-3 mr-2" /> {story.published_date}</span>
                    <span className="flex items-center font-bold"><User className="w-3 h-3 mr-2" /> {story.author}</span>
                  </div>
                  <h3 className="text-2xl font-serif italic text-stone-800 mb-4 leading-tight">{story.title}</h3>
                  <p className="text-stone-600 text-sm mb-8 flex-1 line-clamp-3 leading-relaxed">{story.excerpt}</p>
                  <button 
                    className="flex items-center text-[#4b5e52] font-bold text-xs uppercase tracking-widest hover:text-stone-900 transition-colors group/btn"
                  >
                    Read Full Story <ArrowRight className="ml-3 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}