import {
  useEffect,
  useState
} from 'react';

import {
  motion,
  AnimatePresence
} from 'motion/react';

import {
  X,
  Clock,
  User,
  FileText,
  Pin,
  Loader
} from 'lucide-react';

import type {
  Story,
  StoryEditHistory
} from '../../../types';

import {
  getStoryHistory
} from '../../../services/storyService';

interface StoryPreviewPanelProps {
  story: Story | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export default function StoryPreviewPanel({
  story,
  isOpen,
  onClose,
  onEdit
}: StoryPreviewPanelProps) {

  const [
    activeTab,
    setActiveTab
  ] = useState<'preview' | 'history'>(
    'preview'
  );

  const [
    history,
    setHistory
  ] = useState<StoryEditHistory[]>([]);

  const [
    isLoadingHistory,
    setIsLoadingHistory
  ] = useState(false);

  useEffect(() => {

    if (
      !isOpen ||
      !story ||
      activeTab !== 'history'
    ) {
      return;
    }

    const fetchHistory = async () => {

      setIsLoadingHistory(true);

      try {

        const data =
          await getStoryHistory(
            story.post_id
          );

        setHistory(data);

      } catch (error) {

        console.error(
          'Failed to fetch history:',
          error
        );

      } finally {

        setIsLoadingHistory(false);
      }
    };

    fetchHistory();

  }, [
    isOpen,
    story,
    activeTab
  ]);

  return (
    <AnimatePresence>

      {isOpen && story && (
        <>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30
            }}
            className="fixed top-0 right-0 h-full w-full max-w-2xl bg-[#f7f5f2] z-50 shadow-2xl flex flex-col"
          >

            <header className="p-6 border-b border-stone-200 flex justify-between items-center shrink-0 bg-white">

              <div>

                <div className="flex items-center gap-3 mb-2">

                  <span className="bg-stone-100 text-stone-600 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                    {story.category_name ||
                      'Uncategorized'}
                  </span>

                  {story.is_pinned === 1 && (
                    <span className="bg-amber-100 text-amber-700 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest flex items-center">

                      <Pin className="w-3 h-3 mr-1" />

                      Pinned

                    </span>
                  )}

                </div>

                <h3 className="text-2xl font-serif italic text-stone-800">
                  {story.title}
                </h3>

                <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mt-1">

                  By {story.author} on{' '}

                  {new Date(
                    story.published_date
                  ).toLocaleDateString()}

                </p>

              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

            </header>

            <div className="p-6 border-b border-stone-200 shrink-0 bg-white">

              <div className="flex gap-3">

                <button
                  onClick={() =>
                    setActiveTab('preview')
                  }
                  className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    activeTab === 'preview'
                      ? 'bg-[#4b5e52] text-white shadow-md'
                      : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                  }`}
                >
                  <FileText className="w-3 h-3 mr-2 inline" />
                  Preview
                </button>

                <button
                  onClick={() =>
                    setActiveTab('history')
                  }
                  className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    activeTab === 'history'
                      ? 'bg-[#4b5e52] text-white shadow-md'
                      : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                  }`}
                >
                  <Clock className="w-3 h-3 mr-2 inline" />
                  History
                </button>

              </div>

            </div>

            <div className="p-8 overflow-y-auto flex-1">

              <AnimatePresence mode="wait">

                {activeTab === 'preview' && (

                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="prose prose-stone max-w-none"
                  >

                    {story.image && (
                      <div className="w-full h-64 rounded-2xl overflow-hidden mb-8">

                        <img
                          src={story.image}
                          alt={story.title}
                          className="w-full h-full object-cover"
                        />

                      </div>
                    )}

                    <p className="text-xl text-stone-600 font-serif italic mb-8">
                      {story.excerpt}
                    </p>

                    <div className="bg-stone-100 p-4 rounded-xl text-xs font-mono text-stone-500 overflow-hidden">
                      {story.content}
                    </div>

                  </motion.div>
                )}

                {activeTab === 'history' && (

                  <motion.div
                    key="history"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >

                    {isLoadingHistory && (
                      <div className="flex justify-center p-10">

                        <Loader className="animate-spin text-[#4b5e52]" />

                      </div>
                    )}

                    {!isLoadingHistory &&
                      history.length === 0 && (

                        <div className="text-center p-10 border-2 border-dashed border-stone-200 rounded-3xl">

                          <p className="text-stone-500 text-sm font-bold uppercase tracking-widest">
                            No edit history found
                          </p>

                        </div>
                      )}

                    {!isLoadingHistory &&
                      history.length > 0 && (

                        <ul className="space-y-4">

                          {history.map(
                            (entry, index) => (

                              <li
                                key={index}
                                className="flex items-start gap-4 p-5 bg-white rounded-[24px] border border-stone-100 shadow-sm"
                              >

                                <div className="w-10 h-10 bg-[#f7f5f2] rounded-full flex items-center justify-center shrink-0">

                                  <User className="w-4 h-4 text-stone-500" />

                                </div>

                                <div>

                                  <p className="font-bold text-stone-700 text-sm">

                                    {entry.username}{' '}

                                    <span className="font-normal text-stone-500">
                                      made an edit
                                    </span>

                                  </p>

                                  <p className="text-[10px] text-stone-400 font-mono uppercase tracking-widest mt-1 mb-2">

                                    {new Date(
                                      entry.edit_timestamp
                                    ).toLocaleString(
                                      'en-US',
                                      {
                                        dateStyle:
                                          'medium',
                                        timeStyle:
                                          'short'
                                      }
                                    )}

                                  </p>

                                  <p className="text-sm text-stone-600 bg-stone-50 p-3 rounded-xl">
                                    {entry.changes_made}
                                  </p>

                                </div>

                              </li>
                            )
                          )}

                        </ul>
                      )}

                  </motion.div>
                )}

              </AnimatePresence>

            </div>

            <footer className="p-6 border-t border-stone-200 shrink-0 bg-white">

              <button
                onClick={onEdit}
                className="w-full bg-stone-800 text-white py-4 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-lg hover:bg-stone-900 transition-all hover:scale-[1.02] active:scale-100"
              >
                Edit Story
              </button>

            </footer>

          </motion.div>

        </>
      )}

    </AnimatePresence>
  );
}