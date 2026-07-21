import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, User, Loader, AlertTriangle, Edit } from 'lucide-react';

interface Story {
  post_id: number;
  title: string;
  content: string;
  image: string;
  published_date: string;
  author: string;
}

interface StoryArticleProps {
  storyId: number;
  onBack: () => void;
  isAdmin: boolean;
  onEdit: (id: number) => void;
}

export default function StoryArticle({ storyId, onBack, isAdmin, onEdit }: StoryArticleProps) {
  const [story, setStory] = React.useState<Story | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchStory = async () => {
      if (!storyId) return;
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost/GuidingLight_Project/guiding_light_backend/get_stories.php?id=${storyId}`);
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setStory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStory();
  }, [storyId]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center"><Loader className="w-10 h-10 animate-spin text-stone-400" /></div>;
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-[#f7f5f2] min-h-screen pt-32 pb-20"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-10">
          {/* Back Button */}
          <button 
            onClick={onBack}
            className="flex items-center bg-[#4b5e52] text-white px-8 py-4 rounded-full transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg hover:bg-[#3a4740] hover:scale-105 active:scale-100"
          >
            <ArrowLeft className="w-4 h-4 mr-3" /> Back to Feed
          </button>

          {/* Admin Edit Button */}
          {isAdmin && story && (
            <button onClick={() => onEdit(story.post_id)} className="flex items-center bg-white text-stone-600 hover:bg-stone-800 hover:text-white transition-colors py-2 px-4 rounded-full shadow-sm border border-stone-200 text-[10px] font-bold uppercase tracking-widest">
              <Edit className="w-3 h-3 mr-2" /> Edit Story
            </button>
          )}
        </div>

        {/* Article Header */}
        {error && (
          <div className="flex flex-col items-center justify-center gap-4 text-amber-500 h-64 bg-amber-50 p-8 rounded-[32px] my-10">
            <AlertTriangle className="w-8 h-8" />
            <span className="text-xs font-bold uppercase tracking-widest">Could Not Load Story</span>
            <p className="text-stone-500 text-xs max-w-xs text-center">{error}</p>
          </div>
        )}

        {story && !error && (
          <>
            <div className="mb-12">
              <div className="flex items-center text-stone-500 text-[10px] uppercase tracking-widest mb-6 space-x-6">
                <span className="flex items-center font-bold"><Calendar className="w-4 h-4 mr-2" /> {new Date(story.published_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span className="flex items-center font-bold"><User className="w-4 h-4 mr-2" /> {story.author}</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-serif italic text-stone-800 mb-8 leading-tight">{story.title}</h1>
            </div>

            {/* Featured Image */}
            <div className="w-full h-[60vh] rounded-[32px] overflow-hidden mb-12 shadow-lg">
              <img 
                src={story.image} 
                alt={story.title} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Article Content */}
            <div className="prose prose-stone prose-lg max-w-none">
              {/* Since it's mock data, we are just splitting the mock content by line breaks */}
              {story.content.split('\n').map((paragraph, index) => (
                <p key={index} className="text-stone-700 leading-relaxed mb-6">
                  {paragraph.trim()}
                </p>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.article>
  );
}