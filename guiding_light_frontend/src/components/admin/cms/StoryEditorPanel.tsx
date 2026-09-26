import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Loader,
  FileText,
  Upload,
  Trash2,
  Image as ImageIcon,
  Tag,
  Pin,
  Calendar,
  Paperclip
} from 'lucide-react';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import type { Story, StoryCategory, StoryAttachment } from '../../../types';
import { getStoryAttachments, deleteAttachment, createCategory, saveStory } from '../../../services/storyService';
import StoryEditorToolbar from './StoryEditorToolbar';

const editorExtensions = [
  StarterKit,
  Underline,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Image,
  Link.configure({ openOnClick: false }),
];

interface StoryEditorPanelProps {
  story: Story | null;
  importedContent: string | null;
  initialPdf: File | null;
  isOpen: boolean;
  categories: StoryCategory[];
  onCategoryCreated: (
    category: StoryCategory
  ) => void;
  onClose: (
    didUpdate: boolean
  ) => void;
}

export default function StoryEditorPanel({
  story,
  importedContent,
  initialPdf,
  isOpen,
  categories,
  onCategoryCreated,
  onClose
}: StoryEditorPanelProps) {
  const [contentType, setContentType] = useState<'article' | 'publication'>('article');
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');

  const [categoryId, setCategoryId] = useState<string>('');
  const [isPinned, setIsPinned] = useState(false);
  const [pinUntil, setPinUntil] = useState<string>('');

  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const [jsonContent, setJsonContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRemovingImage, setIsRemovingImage] = useState(false);

  // PDF Attachment States
  const [existingAttachments, setExistingAttachments] = useState<StoryAttachment[]>([]);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // NEW: Dirty State Tracker to prevent accidental data loss
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const editor = useEditor({
    extensions: editorExtensions,
    editorProps: {
      attributes: {
        class: 'prose prose-stone max-w-none p-6 min-h-[300px] focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      setJsonContent(JSON.stringify(editor.getJSON()));
      setHasUnsavedChanges(true); // Flag changes if text is edited
    },
  });

  useEffect(() => {
    if (isOpen && editor) {
      setTitle(story?.title || '');
      setExcerpt(story?.excerpt || '');

      setContentType(
        initialPdf
          ? 'publication'
          : story?.content_type ?? 'article'
      );

      setCategoryId(story?.category_id ? story.category_id.toString() : '');
      setIsPinned(story?.is_pinned === 1);

      if (story?.pin_until) {
        const date = new Date(story.pin_until);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        setPinUntil(date.toISOString().slice(0, 16));
      } else {
        setPinUntil('');
      }

      setIsCreatingCategory(false);
      setNewCategoryName('');

      setImagePreview(story?.image || null);
      setImageFile(null);
      setIsRemovingImage(false);
      setSaveError(null);

      setNewAttachments(initialPdf ? [initialPdf] : []);
      setExistingAttachments([]);

      // Reset dirty state tracker
      setHasUnsavedChanges(false);

      if (story) {
        getStoryAttachments(
          story.post_id
        )
          .then(data => {
            setExistingAttachments(data);
          })
          .catch(err => {
            console.error(
              'Failed to load attachments:',
              err
            );
          });

        let parsed = '';
        try { parsed = story.content ? JSON.parse(story.content) : ''; }
        catch (e) { parsed = story.content || ''; }
        editor.commands.setContent(parsed);
        setJsonContent(story.content || '');
      } else if (importedContent) {
        editor.commands.setContent(importedContent);
        setJsonContent(JSON.stringify(editor.getJSON()));
        setHasUnsavedChanges(true); // Flag changes for imported documents
      } else {
        editor.commands.setContent('');
        setJsonContent('');

        if (initialPdf) {
          setHasUnsavedChanges(true);
        }
      }
    }
  }, [isOpen, story, importedContent, initialPdf, editor]);

  const handleCloseRequest = () => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm("You have unsaved changes. Are you sure you want to discard them? All unsaved work will be lost.");
      if (!confirmClose) return; // Stop closing if user hits Cancel on the prompt
    }
    onClose(false); // Proceed with closing if no changes, or if user confirms discard
  };

  const hasAttachments = newAttachments.length > 0 || existingAttachments.length > 0;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setIsRemovingImage(false);
      setHasUnsavedChanges(true); // Flag changes
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setIsRemovingImage(true);
    setHasUnsavedChanges(true); // Flag changes
  };

  const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewAttachments(prev => [...prev, ...filesArray]);
      setHasUnsavedChanges(true); // Flag changes
    }
  };

  const handleRemoveNewAttachment = (index: number) => {
    setNewAttachments(prev => prev.filter((_, i) => i !== index));
    setHasUnsavedChanges(true); // Flag changes
  };

  const handleDeleteExistingAttachment =
    async (id: number) => {

      if (
        !window.confirm(
          'Are you sure you want to delete this attachment permanently?'
        )
      ) {
        return;
      }

      try {
        await deleteAttachment(id);

        setExistingAttachments(
          prev =>
            prev.filter(
              att => att.id !== id
            )
        );

        setHasUnsavedChanges(true);

      } catch (err) {
        alert(
          err instanceof Error
            ? err.message
            : 'Failed to delete attachment.'
        );
      }
    };

  const handleCreateNewCategory =
    async () => {

      const trimmedName =
        newCategoryName.trim();

      if (!trimmedName) return;

      setIsSavingCategory(true);

      try {
        const data =
          await createCategory(
            trimmedName
          );

        onCategoryCreated({
          id: data.id,
          name: data.name
        });

        setCategoryId(
          data.id.toString()
        );

        setIsCreatingCategory(false);
        setNewCategoryName('');
        setHasUnsavedChanges(true);

      } catch (err) {
        alert(
          err instanceof Error
            ? err.message
            : 'Failed to create category.'
        );

      } finally {
        setIsSavingCategory(false);
      }
    };

  const handleSave = async () => {
    const hasTextContent = editor?.getText().trim().length !== 0;

    if (!title.trim()) {
      setSaveError("Title is required.");
      return;
    }

    if (contentType === 'article' && !hasTextContent) {
      setSaveError('Article content is required.');
      return;
    }

    if (
      contentType === 'publication' && !hasAttachments
    ) {
      setSaveError('A publication must have a PDF attachment.');
      return;
    }

    const actionText = story ? "save changes to this story" : "publish this new story";
    const isConfirmed = window.confirm(`Are you sure you want to ${actionText}?`);

    if (!isConfirmed) return;

    setIsSaving(true);
    setSaveError(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content_type', contentType);
    formData.append('excerpt', excerpt);

    const finalContent = jsonContent || '{"type":"doc","content":[{"type":"paragraph"}]}';
    formData.append('content', finalContent);

    formData.append('category_id', categoryId);
    formData.append('is_pinned', isPinned ? 'true' : 'false');
    if (isPinned && pinUntil) {
      const mysqlDate = pinUntil.replace('T', ' ') + ':00';
      formData.append('pin_until', mysqlDate);
    }

    if (story?.post_id) formData.append('post_id', story.post_id.toString());
    if (imageFile) formData.append('image', imageFile);
    if (isRemovingImage) formData.append('remove_image', 'true');

    if (newAttachments.length > 0) {
      newAttachments.forEach(file => {
        formData.append('attachments[]', file);
      });
    }

    try {
      await saveStory(
        formData,
        Boolean(story)
      );

      onClose(true);

    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : 'Failed to save story.'
      );

    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* UPDATED: Intercepting background clicks! */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseRequest} className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed top-0 right-0 h-full w-full max-w-4xl bg-white z-[60] shadow-2xl flex flex-col">

            <header className="p-6 border-b border-stone-200 flex justify-between items-center bg-[#f7f5f2] shrink-0">
              <h3 className="text-2xl font-serif italic text-stone-800">
                {story ? 'Edit Story' : importedContent ? 'Review Imported Article' : 'Create New Story'}
              </h3>
              {/* UPDATED: Intercepting the 'X' button! */}
              <button onClick={handleCloseRequest} className="p-2 rounded-full hover:bg-stone-200 transition-colors"><X className="w-5 h-5" /></button>
            </header>

            <div className="p-8 overflow-y-auto flex-1 bg-white space-y-6">
              {saveError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
                  {saveError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-50 p-6 rounded-3xl border border-stone-200">
                <div>
                  <label className="flex items-center text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">
                    <Tag className="w-3 h-3 mr-2" /> Article Category
                  </label>
                  {!isCreatingCategory ? (
                    <select
                      value={categoryId}
                      onChange={(e) => {
                        if (e.target.value === 'new') setIsCreatingCategory(true);
                        else {
                          setCategoryId(e.target.value);
                          setHasUnsavedChanges(true); // Flag changes
                        }
                      }}
                      className="w-full px-5 py-4 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4b5e52]/20 focus:border-[#4b5e52] text-stone-700 font-bold"
                    >
                      <option value="">Select a category...</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                      <option value="new" className="font-bold text-[#4b5e52]">+ Create New Category</option>
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="New category name..."
                        className="w-full px-4 py-4 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4b5e52]/20 focus:border-[#4b5e52] text-stone-700 font-bold"
                        autoFocus
                      />
                      <button onClick={handleCreateNewCategory} disabled={isSavingCategory || !newCategoryName.trim()} className="bg-[#4b5e52] text-white px-4 rounded-2xl font-bold text-xs uppercase tracking-widest disabled:opacity-50 hover:bg-[#3a4740] transition-colors">
                        {isSavingCategory ? <Loader className="w-4 h-4 animate-spin" /> : 'Save'}
                      </button>
                      <button onClick={() => setIsCreatingCategory(false)} className="bg-stone-200 text-stone-600 px-4 rounded-2xl hover:bg-stone-300 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">
                    <Pin className="w-3 h-3 mr-2" /> Featured Story
                  </label>
                  <div className="flex items-center gap-4 bg-white px-5 py-4 border border-stone-200 rounded-2xl">
                    <button
                      onClick={() => {
                        setIsPinned(!isPinned);
                        setHasUnsavedChanges(true); // Flag changes
                      }}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isPinned ? 'bg-amber-500' : 'bg-stone-200'}`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isPinned ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                    <span className="text-sm font-bold text-stone-700">Pin to Top</span>
                  </div>

                  <AnimatePresence>
                    {isPinned && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3">
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <input
                            type="datetime-local"
                            value={pinUntil}
                            onChange={(e) => {
                              setPinUntil(e.target.value);
                              setHasUnsavedChanges(true); // Flag changes
                            }}
                            title="Leave blank to pin forever"
                            className="w-full pl-10 pr-5 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-600 text-sm"
                          />
                        </div>
                        <p className="text-[10px] text-stone-400 mt-1 uppercase tracking-widest font-bold">Leave blank to pin forever</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Feed Cover Image</label>
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
                    <span className="text-xs font-bold text-stone-600 uppercase tracking-widest">Click to upload feed image</span>
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
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setHasUnsavedChanges(true); // Flag changes
                  }}
                  className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4b5e52]/20 focus:border-[#4b5e52] text-stone-800 font-serif italic text-xl"
                  placeholder="Enter a compelling title..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Short Excerpt</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => {
                    setExcerpt(e.target.value);
                    setHasUnsavedChanges(true); // Flag changes
                  }}
                  rows={2}
                  className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4b5e52]/20 focus:border-[#4b5e52] text-stone-600 resize-none"
                  placeholder="A brief summary that appears on the feed cards..."
                />
              </div>

              <div className={`p-6 rounded-3xl border transition-colors ${hasAttachments ? 'bg-[#4b5e52]/5 border-[#4b5e52]/20' : 'bg-stone-50 border-stone-200'}`}>
                <div className="flex justify-between items-center mb-4">
                  <label className="flex items-center text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                    <Paperclip className="w-3 h-3 mr-2" /> Publication PDF
                  </label>
                  <button
                    onClick={() => attachmentInputRef.current?.click()}
                    className="text-[#4b5e52] font-bold text-[10px] uppercase tracking-widest hover:underline"
                  >
                    + Add File
                  </button>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    className="hidden"
                    ref={attachmentInputRef}
                    onChange={handleAttachmentSelect}
                  />
                </div>

                <div className="space-y-2">
                  {existingAttachments.map(att => (
                    <div key={att.id} className="flex justify-between items-center bg-white border border-stone-200 px-4 py-3 rounded-xl shadow-sm">
                      <div className="flex items-center overflow-hidden">
                        <FileText className="w-4 h-4 text-stone-400 mr-3 shrink-0" />
                        <span className="text-sm text-stone-600 font-bold truncate">{att.file_name}</span>
                      </div>
                      <button onClick={() => handleDeleteExistingAttachment(att.id)} className="text-red-400 hover:text-red-600 ml-4 shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {newAttachments.map((file, index) => (
                    <div key={index} className="flex justify-between items-center bg-white border border-[#4b5e52]/30 px-4 py-3 rounded-xl shadow-sm">
                      <div className="flex items-center overflow-hidden">
                        <FileText className="w-4 h-4 text-[#4b5e52] mr-3 shrink-0" />
                        <span className="text-sm text-[#4b5e52] font-bold truncate">{file.name}</span>
                        <span className="text-[10px] text-stone-400 uppercase tracking-widest ml-2">(Pending Save)</span>
                      </div>
                      <button onClick={() => handleRemoveNewAttachment(index)} className="text-stone-400 hover:text-stone-600 ml-4 shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {!hasAttachments && (
                    <p className="text-xs text-stone-400 text-center py-4 border-2 border-dashed border-stone-200 rounded-xl">
                      No documents attached.
                    </p>
                  )}
                </div>
              </div>

              <div className="pb-12">
                <div className="mb-2 flex items-center gap-2">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Rich Story Content</label>
                  {hasAttachments && (
                    <span className="bg-amber-100 text-amber-700 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                      Optional: PDF attached
                    </span>
                  )}
                </div>

                <div className={`bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col transition-all ${hasAttachments ? 'border-stone-200 opacity-60' : 'border-stone-200'}`}>
                  <StoryEditorToolbar editor={editor}/>
                  <div className="flex-1 bg-white cursor-text" onClick={() => editor?.commands.focus()}>
                    <EditorContent editor={editor} />
                  </div>
                </div>
              </div>
            </div>

            <footer className="p-6 border-t border-stone-200 bg-[#f7f5f2] shrink-0 flex gap-4">
              {/* UPDATED: Intercepting the 'Cancel' button! */}
              <button
                onClick={handleCloseRequest}
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