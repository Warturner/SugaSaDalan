/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Loader, ChevronLeft, ChevronRight, Clock, User, FileText, Upload, Trash2, Image as ImageIcon, Bold, Italic, Underline as UnderlineIcon, Strikethrough, Heading1, Heading2, List, ListOrdered, Quote, AlignLeft, AlignCenter, AlignRight, Edit3, FileUp, Tag, Pin, Calendar, Search, ArrowUp, ArrowDown, ArrowUpDown, Paperclip, FileCheck } from 'lucide-react';
import * as mammoth from 'mammoth';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

interface Category {
  id: number;
  name: string;
}

interface Story {
  post_id: number;
  title: string;
  author: string;
  published_date: string;
  content: string;
  excerpt: string;
  image?: string;
  category_id?: number;
  category_name?: string;
  is_pinned?: number;
  pin_until?: string | null;
}

interface EditHistory {
  edit_timestamp: string;
  username: string;
  changes_made: string;
}

interface Attachment {
  id: number;
  file_name: string;
  file_url: string;
}

const STORIES_PER_PAGE = 9;

// ==========================================
// TIPTAP MENU BAR COMPONENT
// ==========================================
const MenuBar = ({ editor }: { editor: any }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!editor) return null;

  const btnClass = "p-2 rounded hover:bg-stone-200 text-stone-600 transition-colors";
  const activeBtnClass = "p-2 rounded bg-stone-300 text-stone-900 font-bold transition-colors";

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost/GuidingLight_Project/guiding_light_backend/upload_inline_image.php', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        editor.chain().focus().setImage({ src: data.url }).run();
      } else {
        alert(data.error || 'Failed to upload image.');
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      alert('Network error while uploading image.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-stone-50 border-b border-stone-200 rounded-t-2xl items-center">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? activeBtnClass : btnClass} title="Bold"><Bold className="w-4 h-4" /></button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? activeBtnClass : btnClass} title="Italic"><Italic className="w-4 h-4" /></button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? activeBtnClass : btnClass} title="Underline"><UnderlineIcon className="w-4 h-4" /></button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? activeBtnClass : btnClass} title="Strikethrough"><Strikethrough className="w-4 h-4" /></button>
      <div className="w-px h-6 bg-stone-300 mx-1 self-center"></div>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? activeBtnClass : btnClass} title="Heading 1"><Heading1 className="w-4 h-4" /></button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? activeBtnClass : btnClass} title="Heading 2"><Heading2 className="w-4 h-4" /></button>
      <div className="w-px h-6 bg-stone-300 mx-1 self-center"></div>
      <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? activeBtnClass : btnClass} title="Align Left"><AlignLeft className="w-4 h-4" /></button>
      <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? activeBtnClass : btnClass} title="Align Center"><AlignCenter className="w-4 h-4" /></button>
      <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? activeBtnClass : btnClass} title="Align Right"><AlignRight className="w-4 h-4" /></button>
      <div className="w-px h-6 bg-stone-300 mx-1 self-center"></div>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? activeBtnClass : btnClass} title="Bullet List"><List className="w-4 h-4" /></button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? activeBtnClass : btnClass} title="Numbered List"><ListOrdered className="w-4 h-4" /></button>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? activeBtnClass : btnClass} title="Blockquote"><Quote className="w-4 h-4" /></button>
      <div className="w-px h-6 bg-stone-300 mx-1 self-center"></div>
      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
      <button onClick={() => fileInputRef.current?.click()} className={btnClass} title="Insert Image" disabled={isUploading}>
        {isUploading ? <Loader className="w-4 h-4 animate-spin text-[#4b5e52]" /> : <ImageIcon className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default function CMSModule() {
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const [storyToEdit, setStoryToEdit] = useState<Story | null>(null);
  const [importedHtmlContent, setImportedHtmlContent] = useState<string | null>(null);
  const [initialPdfFile, setInitialPdfFile] = useState<File | null>(null);
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCreationMenuOpen, setIsCreationMenuOpen] = useState(false);
  const [isExtractingDocx, setIsExtractingDocx] = useState(false);
  
  const docxInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Story | 'category_name', direction: 'asc' | 'desc' } | null>(null);

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

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost/GuidingLight_Project/guiding_light_backend/get_categories.php');
      const data = await response.json();
      if (!data.error) setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  useEffect(() => {
    fetchStories();
    fetchCategories();
  }, []);

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
    setIsPreviewOpen(true);
  };

  const handleEdit = (story: Story) => {
    setStoryToEdit(story);
    setImportedHtmlContent(null);
    setInitialPdfFile(null);
    setIsPreviewOpen(false);
    setIsEditorOpen(true);
  };

  const handleEditorClose = (didUpdate: boolean) => {
    setIsEditorOpen(false);
    setStoryToEdit(null);
    setImportedHtmlContent(null);
    setInitialPdfFile(null);
    if (didUpdate) {
      fetchStories();
      fetchCategories();
    }
  };

  const handleDelete = async (story: Story) => {
    const isConfirmed = window.confirm(`Are you sure you want to permanently delete "${story.title}"? This action cannot be undone.`);
    if (!isConfirmed) return;
    try {
      const response = await fetch('http://localhost/GuidingLight_Project/guiding_light_backend/delete_story.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: story.post_id })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      fetchStories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete story.');
    }
  };

  const handleOpenCreationMenu = () => setIsCreationMenuOpen(true);

  const handleCreateFromScratch = () => {
    setIsCreationMenuOpen(false);
    setStoryToEdit(null);
    setImportedHtmlContent('');
    setInitialPdfFile(null);
    setIsEditorOpen(true);
  };

  const handlePdfImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInitialPdfFile(file);
    setStoryToEdit(null);
    setImportedHtmlContent('');
    setIsCreationMenuOpen(false);
    setIsEditorOpen(true);
    
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  };

  const handleDocxImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.docx')) {
      alert('Only .docx files are supported for article conversion.');
      if (docxInputRef.current) docxInputRef.current.value = '';
      return;
    }

    setIsExtractingDocx(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          
          const options = {
            styleMap: [
              "p[style-name='Title'] => h1",
              "p[style-name='Subtitle'] => h2",
              "p[style-name='Heading 1'] => h1",
              "p[style-name='Heading 2'] => h2",
              "p[style-name='Heading 3'] => h3",
              "p[style-name='Quote'] => blockquote",
              "p[style-name='List Paragraph'] => ul > li:fresh"
            ],
            convertImage: mammoth.images.imgElement(function(image) {
              return image.read("base64").then(async function(imageBuffer) {
                const byteString = atob(imageBuffer);
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                const blob = new Blob([ab], { type: image.contentType });
                const formData = new FormData();
                const ext = image.contentType.split('/')[1] || 'png';
                formData.append('image', blob, `imported-docx-img-${Date.now()}.${ext}`);

                try {
                  const response = await fetch('http://localhost/GuidingLight_Project/guiding_light_backend/upload_inline_image.php', {
                    method: 'POST',
                    body: formData,
                  });
                  const data = await response.json();
                  if (data.success) return { src: data.url };
                } catch (error) {
                  console.error("Word document image upload failed:", error);
                }
                return { src: `data:${image.contentType};base64,${imageBuffer}` };
              });
            })
          };

          const result = await mammoth.convertToHtml({ arrayBuffer }, options);
          setImportedHtmlContent(result.value);
          setStoryToEdit(null);
          setInitialPdfFile(null);
          setIsCreationMenuOpen(false);
          setIsEditorOpen(true);

        } catch (err) {
          console.error(err);
          alert("Failed to parse Word document.");
        } finally {
          setIsExtractingDocx(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Failed to read the file.");
      setIsExtractingDocx(false);
    }
    
    if (docxInputRef.current) docxInputRef.current.value = '';
  };

  const handleSort = (key: keyof Story | 'category_name') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-[#4b5e52]" /> : <ArrowDown className="w-3 h-3 text-[#4b5e52]" />;
  };

  let processedStories = [...stories];

  if (searchQuery) {
    const lowerQuery = searchQuery.toLowerCase();
    processedStories = processedStories.filter(story => 
      story.title.toLowerCase().includes(lowerQuery) ||
      (story.category_name && story.category_name.toLowerCase().includes(lowerQuery)) ||
      (story.author && story.author.toLowerCase().includes(lowerQuery))
    );
  }

  if (sortConfig) {
    processedStories.sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof Story];
      let bValue: any = b[sortConfig.key as keyof Story];

      if (sortConfig.key === 'published_date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else {
        aValue = aValue ? aValue.toString().toLowerCase() : '';
        bValue = bValue ? bValue.toString().toLowerCase() : '';
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const totalPages = Math.max(1, Math.ceil(processedStories.length / STORIES_PER_PAGE));
  const paginatedStories = processedStories.slice((currentPage - 1) * STORIES_PER_PAGE, currentPage * STORIES_PER_PAGE);

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-2xl font-serif italic text-stone-700">Story Management</h2>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search by title, author, or category..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); 
              }}
              className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4b5e52]/20 focus:border-[#4b5e52] text-sm text-stone-700 shadow-sm"
            />
          </div>

          <button 
            onClick={handleOpenCreationMenu}
            className="flex items-center bg-[#4b5e52] text-white px-5 py-3 rounded-full transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg hover:bg-[#3a4740] shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-stone-100 overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-stone-100 bg-stone-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                <div className="flex items-center gap-2 cursor-pointer hover:text-stone-700 transition-colors" onClick={() => handleSort('title')}>
                  Title <SortIcon columnKey="title" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                <div className="flex items-center gap-2 cursor-pointer hover:text-stone-700 transition-colors" onClick={() => handleSort('category_name')}>
                  Category <SortIcon columnKey="category_name" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                <div className="flex items-center gap-2 cursor-pointer hover:text-stone-700 transition-colors" onClick={() => handleSort('author')}>
                  Author <SortIcon columnKey="author" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                <div className="flex items-center gap-2 cursor-pointer hover:text-stone-700 transition-colors" onClick={() => handleSort('published_date')}>
                  Published Date <SortIcon columnKey="published_date" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="text-center p-10"><Loader className="mx-auto animate-spin text-stone-300" /></td></tr>}
            {error && <tr><td colSpan={5} className="text-center p-10 text-red-500">{error}</td></tr>}
            {!isLoading && !error && processedStories.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-16">
                  <div className="flex flex-col items-center text-stone-400">
                    <Search className="w-8 h-8 mb-3 opacity-20" />
                    <p className="text-sm font-bold uppercase tracking-widest">No stories found</p>
                  </div>
                </td>
              </tr>
            )}
            {!isLoading && !error && paginatedStories.map(story => (
              <tr key={story.post_id} className="border-b border-stone-100 last:border-b-0 hover:bg-stone-50/50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-700">{story.title}</span>
                    {story.is_pinned === 1 && (
                      <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest flex items-center shrink-0">
                        <Pin className="w-3 h-3 mr-1" /> Pinned
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="bg-white border border-stone-200 text-stone-600 text-xs px-3 py-1 rounded-full font-bold shadow-sm">
                    {story.category_name || 'Uncategorized'}
                  </span>
                </td>
                <td className="px-6 py-5 text-stone-500">{story.author}</td>
                <td className="px-6 py-5 text-stone-500 font-mono text-sm">
                  {new Date(story.published_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-5 flex items-center space-x-4">
                  <button onClick={() => handleStoryClick(story)} className="text-[#4b5e52] font-bold text-[10px] uppercase tracking-widest hover:underline">View</button>
                  <button onClick={() => handleEdit(story)} className="text-stone-400 font-bold text-[10px] uppercase tracking-widest hover:text-stone-800 transition-colors">Edit</button>
                  <button onClick={() => handleDelete(story)} className="text-red-400 font-bold text-[10px] uppercase tracking-widest hover:text-red-600 transition-colors">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {!isLoading && !error && processedStories.length > 0 && (
          <div className="p-4 flex justify-between items-center bg-stone-50/50">
            <span className="text-xs text-stone-500 font-bold uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-md bg-white border border-stone-200 hover:bg-stone-100 disabled:opacity-50 transition-colors shadow-sm"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-md bg-white border border-stone-200 hover:bg-stone-100 disabled:opacity-50 transition-colors shadow-sm"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isCreationMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isExtractingDocx && setIsCreationMenuOpen(false)} className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-[32px] shadow-2xl p-8 max-w-4xl w-full">
                
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-3xl font-serif italic text-stone-800">New Story</h3>
                  <button onClick={() => setIsCreationMenuOpen(false)} disabled={isExtractingDocx} className="p-2 rounded-full hover:bg-stone-100 transition-colors disabled:opacity-50"><X className="w-6 h-6 text-stone-400" /></button>
                </div>

                {isExtractingDocx ? (
                  <div className="py-20 flex flex-col items-center justify-center">
                    <Loader className="w-12 h-12 text-[#4b5e52] animate-spin mb-4" />
                    <p className="text-stone-600 font-bold text-sm uppercase tracking-widest">Extracting Document & Images...</p>
                    <p className="text-stone-400 text-xs mt-2">This may take a moment depending on the file size.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button onClick={handleCreateFromScratch} className="flex flex-col items-center justify-center p-8 border-2 border-stone-200 rounded-3xl hover:border-[#4b5e52] hover:bg-stone-50 transition-all group text-left w-full">
                      <div className="w-14 h-14 bg-[#f7f5f2] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#4b5e52] transition-colors">
                        <Edit3 className="w-6 h-6 text-stone-600 group-hover:text-white transition-colors" />
                      </div>
                      <h4 className="text-lg font-bold text-stone-800 mb-2">Write Article</h4>
                      <p className="text-xs text-stone-500 text-center leading-relaxed">Open the rich-text editor to write your story directly.</p>
                    </button>

                    <button onClick={() => pdfInputRef.current?.click()} className="flex flex-col items-center justify-center p-8 border-2 border-stone-200 rounded-3xl hover:border-[#4b5e52] hover:bg-stone-50 transition-all group text-left w-full relative overflow-hidden">
                      <input type="file" accept=".pdf" className="hidden" ref={pdfInputRef} onChange={handlePdfImport} />
                      <div className="w-14 h-14 bg-[#f7f5f2] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#4b5e52] transition-colors">
                        <FileCheck className="w-6 h-6 text-stone-600 group-hover:text-white transition-colors" />
                      </div>
                      <h4 className="text-lg font-bold text-stone-800 mb-2">Upload PDF</h4>
                      <p className="text-xs text-stone-500 text-center leading-relaxed">Upload a PDF Newsletter. <br/><span className="font-bold">Bypasses body text requirements.</span></p>
                    </button>

                    <button onClick={() => docxInputRef.current?.click()} className="flex flex-col items-center justify-center p-8 border-2 border-stone-200 rounded-3xl hover:border-[#4b5e52] hover:bg-stone-50 transition-all group text-left w-full relative overflow-hidden">
                      <input type="file" accept=".docx" className="hidden" ref={docxInputRef} onChange={handleDocxImport} />
                      <div className="w-14 h-14 bg-[#f7f5f2] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#4b5e52] transition-colors">
                        <FileUp className="w-6 h-6 text-stone-600 group-hover:text-white transition-colors" />
                      </div>
                      <h4 className="text-lg font-bold text-stone-800 mb-2">Convert .docx</h4>
                      <p className="text-xs text-stone-500 text-center leading-relaxed">Extract text and images from a Microsoft Word Document.</p>
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <StoryPreviewPanel
        story={selectedStory}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onEdit={() => selectedStory && handleEdit(selectedStory)}
      />

      <StoryEditorPanel 
        story={storyToEdit}
        importedContent={importedHtmlContent}
        initialPdf={initialPdfFile}
        isOpen={isEditorOpen}
        categories={categories}
        onClose={handleEditorClose}
      />
    </div>
  );
}

// ==========================================
// PREVIEW PANEL
// ==========================================
function StoryPreviewPanel({ story, isOpen, onClose, onEdit }: { story: Story | null, isOpen: boolean, onClose: () => void, onEdit: () => void }) {
  const [activeTab, setActiveTab] = useState<'preview' | 'history'>('preview');
  const [history, setHistory] = useState<EditHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
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
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-stone-100 text-stone-600 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                    {story.category_name || 'Uncategorized'}
                  </span>
                  {story.is_pinned === 1 && (
                    <span className="bg-amber-100 text-amber-700 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest flex items-center">
                      <Pin className="w-3 h-3 mr-1" /> Pinned
                    </span>
                  )}
                </div>
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
                  <motion.div key="preview" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="prose prose-stone max-w-none">
                    {story.image && (
                      <div className="w-full h-64 rounded-2xl overflow-hidden mb-8">
                        <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <p className="text-xl text-stone-600 font-serif italic mb-8">{story.excerpt}</p>
                    <div className="bg-stone-100 p-4 rounded-xl text-xs font-mono text-stone-500 overflow-hidden">
                      {story.content}
                    </div>
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
const editorExtensions = [
  StarterKit,
  Underline,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Image,
  Link.configure({ openOnClick: false }),
];

function StoryEditorPanel({ story, importedContent, initialPdf, isOpen, categories, onClose }: { story: Story | null, importedContent: string | null, initialPdf: File | null, isOpen: boolean, categories: Category[], onClose: (didUpdate: boolean) => void }) {
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
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);
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
        fetch(`http://localhost/GuidingLight_Project/guiding_light_backend/get_story_attachments.php?post_id=${story.post_id}`)
          .then(res => res.json())
          .then(data => { if (!data.error) setExistingAttachments(data); })
          .catch(err => console.error("Failed to load attachments:", err));

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
        if (initialPdf) setHasUnsavedChanges(true); // Flag changes if PDF was attached via creation menu
      }
    }
  }, [isOpen, story, importedContent, initialPdf, editor]);

  // NEW: Intercept closing to warn about unsaved changes
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

  const handleDeleteExistingAttachment = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this attachment permanently?")) return;
    
    try {
      const response = await fetch('http://localhost/GuidingLight_Project/guiding_light_backend/delete_attachment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      if (data.success) {
        setExistingAttachments(prev => prev.filter(att => att.id !== id));
        setHasUnsavedChanges(true); // Flag changes
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Failed to delete attachment.");
    }
  };

  const handleCreateNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsSavingCategory(true);
    try {
      const response = await fetch('http://localhost/GuidingLight_Project/guiding_light_backend/create_category.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName })
      });
      const data = await response.json();
      if (data.success) {
        categories.push({ id: data.id, name: data.name });
        setCategoryId(data.id.toString());
        setIsCreatingCategory(false);
        setNewCategoryName('');
        setHasUnsavedChanges(true); // Flag changes
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Failed to create category");
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
    
    if (!hasTextContent && !hasAttachments) {
      setSaveError("You must provide either Story Content OR attach a PDF Document.");
      return;
    }

    const actionText = story ? "save changes to this story" : "publish this new story";
    const isConfirmed = window.confirm(`Are you sure you want to ${actionText}?`);
    
    if (!isConfirmed) return;

    setIsSaving(true);
    setSaveError(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('excerpt', excerpt);
    
    const finalContent = jsonContent || '{"type":"doc","content":[{"type":"paragraph"}]}';
    formData.append('content', finalContent);
    
    formData.append('author_id', '1'); 
    
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

    const endpoint = story ? 'update_story.php' : 'create_story.php';

    try {
      const response = await fetch(`http://localhost/GuidingLight_Project/guiding_light_backend/${endpoint}`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      onClose(true); // Close automatically bypasses warning on successful save
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
                    <Paperclip className="w-3 h-3 mr-2" /> PDF Document (Read-Only Embed)
                  </label>
                  <button 
                    onClick={() => attachmentInputRef.current?.click()}
                    className="text-[#4b5e52] font-bold text-[10px] uppercase tracking-widest hover:underline"
                  >
                    + Add File
                  </button>
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx" 
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
                  <MenuBar editor={editor} />
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