/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Loader, ChevronLeft, ChevronRight, Clock, User, FileText, Upload, Trash2, Image as ImageIcon } from 'lucide-react';

interface Story {
  post_id: number;
  title: string;
  author: string;
  published_date: string;
  content: string;
  excerpt: string;
  image?: string;
}

interface EditHistory {
  edit_timestamp: string;
  username: string;
  changes_made: string;
}

const STORIES_PER_PAGE = 5;

export default function CMSModule() {
  const [stories, setStories] = React.useState<Story[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  const [selectedStory, setSelectedStory] = React.useState<Story | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  
  const [storyToEdit, setStoryToEdit] = React.useState<Story | null>(null);
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  
  const [currentPage, setCurrentPage] = React.useState(1);

  const fetchStories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost/GuidingLight_Project/guiding_light_backend/get_stories.php');
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setStories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stories.');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStories();
  }, []);

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
    setIsPreviewOpen(true);
  };

  const handleCreateNew = () => {
    setStoryToEdit(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (story: Story) => {
    setStoryToEdit(story);
    setIsPreviewOpen(false);
    setIsEditorOpen(true);
  };

  const handleEditorClose = (didUpdate: boolean) => {
    setIsEditorOpen(false);
    setStoryToEdit(null);
    if (didUpdate) {
      fetchStories();
    }
  };

  // NEW: Delete Functionality with Confirmation
  const handleDelete = async (story: Story) => {
    const isConfirmed = window.confirm(`Are you sure you want to permanently delete "${story.title}"? This action cannot be undone.`);
    
    if (!isConfirmed) return;

    try {
      const response = await fetch('http://localhost/GuidingLight_Project/guiding_light_backend/delete_story.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post_id: story.post_id })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      // Refresh the table after successful deletion
      fetchStories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete story.');
    }
  };

  const totalPages = Math.ceil(stories.length / STORIES_PER_PAGE);
  const paginatedStories = stories.slice((currentPage - 1) * STORIES_PER_PAGE, currentPage * STORIES_PER_PAGE);

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-serif italic text-stone-700">Story Management</h2>
        <button 
          onClick={handleCreateNew}
          className="flex items-center bg-[#4b5e52] text-white px-5 py-3 rounded-full transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg hover:bg-[#3a4740] hover:scale-105 active:scale-100"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Story
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-stone-100 overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-stone-100">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">Title</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">Author</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">Published Date</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="text-center p-10"><Loader className="mx-auto animate-spin text-stone-300" /></td></tr>}
            {error && <tr><td colSpan={4} className="text-center p-10 text-red-500">{error}</td></tr>}
            {!isLoading && !error && stories.length === 0 && (
              <tr><td colSpan={4} className="text-center p-10 text-stone-500">No stories found in the database.</td></tr>
            )}
            {!isLoading && !error && paginatedStories.map(story => (
              <tr key={story.post_id} className="border-b border-stone-100 last:border-b-0 hover:bg-stone-50/50 transition-colors">
                <td className="px-6 py-5 font-bold text-stone-700">{story.title}</td>
                <td className="px-6 py-5 text-stone-500">{story.author}</td>
                <td className="px-6 py-5 text-stone-500 font-mono text-sm">
                  {new Date(story.published_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-5 flex items-center space-x-4">
                  <button onClick={() => handleStoryClick(story)} className="text-[#4b5e52] font-bold text-[10px] uppercase tracking-widest hover:underline">View</button>
                  <button onClick={() => handleEdit(story)} className="text-stone-400 font-bold text-[10px] uppercase tracking-widest hover:text-stone-800 transition-colors">Edit</button>
                  {/* NEW: Delete Button */}
                  <button onClick={() => handleDelete(story)} className="text-red-400 font-bold text-[10px] uppercase tracking-widest hover:text-red-600 transition-colors">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {!isLoading && !error && stories.length > 0 && (
          <div className="p-4 flex justify-between items-center bg-stone-50/50">
            <span className="text-xs text-stone-500 font-bold uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-md bg-white border border-stone-200 hover:bg-stone-100 disabled:opacity-50 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-md bg-white border border-stone-200 hover:bg-stone-100 disabled:opacity-50 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      <StoryPreviewPanel
        story={selectedStory}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onEdit={() => selectedStory && handleEdit(selectedStory)}
      />

      <StoryEditorPanel 
        story={storyToEdit}
        isOpen={isEditorOpen}
        onClose={handleEditorClose}
      />
    </div>
  );
}

// ==========================================
// PREVIEW PANEL
// ==========================================
function StoryPreviewPanel({ story, isOpen, onClose, onEdit }: { story: Story | null, isOpen: boolean, onClose: () => void, onEdit: () => void }) {
  const [activeTab, setActiveTab] = React.useState<'preview' | 'history'>('preview');
  const [history, setHistory] = React.useState<EditHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && story && activeTab === 'history') {
      const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
          const response = await fetch(`http://localhost/GuidingLight_Project/guiding_light_backend/get_story_history.php?post_id=${story.post_id}`);
          const data = await response.json();
          if (data.error) throw new Error(data.error);
          setHistory(data);
        } catch (error) {
          console.error("Failed to fetch history:", error);
        } finally {
          setIsLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [isOpen, story, activeTab]);

  return (
    <AnimatePresence>
      {isOpen && story && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed top-0 right-0 h-full w-full max-w-2xl bg-[#f7f5f2] z-50 shadow-2xl flex flex-col">
            <header className="p-6 border-b border-stone-200 flex justify-between items-center shrink-0 bg-white">
              <div>
                <h3 className="text-2xl font-serif italic text-stone-800">{story.title}</h3>
                <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mt-1">
                  By {story.author} on {new Date(story.published_date).toLocaleDateString()}
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-100 transition-colors"><X className="w-5 h-5" /></button>
            </header>

            <div className="p-6 border-b border-stone-200 shrink-0 bg-white">
                <div className="flex gap-3">
                    <button onClick={() => setActiveTab('preview')} className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'preview' ? 'bg-[#4b5e52] text-white shadow-md' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>
                        <FileText className="w-3 h-3 mr-2 inline"/>Preview
                    </button>
                    <button onClick={() => setActiveTab('history')} className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'history' ? 'bg-[#4b5e52] text-white shadow-md' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>
                        <Clock className="w-3 h-3 mr-2 inline"/>History
                    </button>
                </div>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              <AnimatePresence mode="wait">
                {activeTab === 'preview' && (
                  <motion.div key="preview" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="prose prose-stone prose-lg max-w-none">
                    {story.image && (
                      <div className="w-full h-64 rounded-2xl overflow-hidden mb-8">
                        <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <p className="text-xl text-stone-600 font-serif italic mb-8">{story.excerpt}</p>
                    {story.content.split('\n').map((p, i) => <p key={i} className="text-stone-700 leading-relaxed">{p}</p>)}
                  </motion.div>
                )}
                {activeTab === 'history' && (
                  <motion.div key="history" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                    {isLoadingHistory && <div className="flex justify-center p-10"><Loader className="animate-spin text-[#4b5e52]" /></div>}
                    {!isLoadingHistory && history.length === 0 && (
                      <div className="text-center p-10 border-2 border-dashed border-stone-200 rounded-3xl">
                        <p className="text-stone-500 text-sm font-bold uppercase tracking-widest">No edit history found</p>
                      </div>
                    )}
                    {!isLoadingHistory && history.length > 0 && (
                      <ul className="space-y-4">
                        {history.map((entry, index) => (
                          <li key={index} className="flex items-start gap-4 p-5 bg-white rounded-[24px] border border-stone-100 shadow-sm">
                            <div className="w-10 h-10 bg-[#f7f5f2] rounded-full flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-stone-500"/>
                            </div>
                            <div>
                                <p className="font-bold text-stone-700 text-sm">{entry.username} <span className="font-normal text-stone-500">made an edit</span></p>
                                <p className="text-[10px] text-stone-400 font-mono uppercase tracking-widest mt-1 mb-2">
                                    {new Date(entry.edit_timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                </p>
                                <p className="text-sm text-stone-600 bg-stone-50 p-3 rounded-xl">{entry.changes_made}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <footer className="p-6 border-t border-stone-200 shrink-0 bg-white">
                <button onClick={onEdit} className="w-full bg-stone-800 text-white py-4 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-lg hover:bg-stone-900 transition-all hover:scale-[1.02] active:scale-100">
                    Edit Story
                </button>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ==========================================
// EDITOR PANEL
// ==========================================
function StoryEditorPanel({ story, isOpen, onClose }: { story: Story | null, isOpen: boolean, onClose: (didUpdate: boolean) => void }) {
  const [title, setTitle] = React.useState('');
  const [excerpt, setExcerpt] = React.useState('');
  const [content, setContent] = React.useState('');
  
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [isRemovingImage, setIsRemovingImage] = React.useState(false);
  
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setTitle(story?.title || '');
      setExcerpt(story?.excerpt || '');
      setContent(story?.content || '');
      setImagePreview(story?.image || null);
      setImageFile(null);
      setIsRemovingImage(false);
      setSaveError(null);
    }
  }, [isOpen, story]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setIsRemovingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setIsRemovingImage(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setSaveError("Title and Content are required.");
      return;
    }

    // NEW: Save/Publish Confirmations
    const actionText = story ? "save changes to this story" : "publish this new story";
    const isConfirmed = window.confirm(`Are you sure you want to ${actionText}?`);
    
    if (!isConfirmed) return; // Stop the save if they click Cancel

    setIsSaving(true);
    setSaveError(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('excerpt', excerpt);
    formData.append('content', content);
    formData.append('author_id', '1'); 
    
    if (story?.post_id) formData.append('post_id', story.post_id.toString());
    if (imageFile) formData.append('image', imageFile);
    if (isRemovingImage) formData.append('remove_image', 'true');

    const endpoint = story ? 'update_story.php' : 'create_story.php';

    try {
      const response = await fetch(`http://localhost/GuidingLight_Project/guiding_light_backend/${endpoint}`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      onClose(true); // Close and refresh table
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save story.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => onClose(false)} className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed top-0 right-0 h-full w-full max-w-3xl bg-white z-[60] shadow-2xl flex flex-col">
            
            <header className="p-6 border-b border-stone-200 flex justify-between items-center bg-[#f7f5f2] shrink-0">
              <h3 className="text-2xl font-serif italic text-stone-800">
                {story ? 'Edit Story' : 'Create New Story'}
              </h3>
              <button onClick={() => onClose(false)} className="p-2 rounded-full hover:bg-stone-200 transition-colors"><X className="w-5 h-5" /></button>
            </header>

            <div className="p-8 overflow-y-auto flex-1 bg-white space-y-6">
              {saveError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
                  {saveError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Cover Image</label>
                {imagePreview ? (
                  <div className="relative w-full h-64 rounded-3xl overflow-hidden group border-2 border-stone-100">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={handleRemoveImage} className="bg-red-500 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center shadow-lg hover:bg-red-600 hover:scale-105 transition-all">
                        <Trash2 className="w-4 h-4 mr-2" /> Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-stone-300 rounded-3xl bg-stone-50 cursor-pointer hover:bg-stone-100 hover:border-stone-400 transition-colors">
                    <ImageIcon className="w-8 h-8 text-stone-400 mb-3" />
                    <span className="text-xs font-bold text-stone-600 uppercase tracking-widest">Click to upload image</span>
                    <span className="text-[10px] text-stone-400 mt-1">JPEG, PNG, or WEBP (Max 5MB)</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Story Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4b5e52]/20 focus:border-[#4b5e52] text-stone-800 font-serif italic text-xl"
                  placeholder="Enter a compelling title..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Short Excerpt</label>
                <textarea 
                  value={excerpt} 
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4b5e52]/20 focus:border-[#4b5e52] text-stone-600 resize-none"
                  placeholder="A brief summary that appears on the feed cards..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Full Story Content</label>
                <textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4b5e52]/20 focus:border-[#4b5e52] text-stone-700 leading-relaxed resize-none"
                  placeholder="Write the full story here..."
                />
              </div>
            </div>

            <footer className="p-6 border-t border-stone-200 bg-[#f7f5f2] shrink-0 flex gap-4">
              <button 
                onClick={() => onClose(false)} 
                className="flex-1 bg-white text-stone-600 border border-stone-200 py-4 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-sm hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex-[2] flex items-center justify-center bg-[#4b5e52] text-white py-4 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-lg hover:bg-[#3a4740] hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-70 disabled:hover:scale-100"
              >
                {isSaving ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                {isSaving ? 'Saving to Database...' : (story ? 'Update Story' : 'Publish Story')}
              </button>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}