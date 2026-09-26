/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Loader, ChevronLeft, ChevronRight, FileText, Upload, Trash2, Image as ImageIcon, Edit3, FileUp, Tag, Pin, Calendar, Search, ArrowUp, ArrowDown, ArrowUpDown, Paperclip, FileCheck } from 'lucide-react';
import * as mammoth from 'mammoth';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import type { Story, StoryCategory, StoryAttachment } from '../../types';
import { getStories, getCategories, getStoryAttachments, deleteStory, deleteAttachment, createCategory, saveStory, uploadInlineImage } from '../../services/storyService';
import StoryEditorToolbar from './cms/StoryEditorToolbar';
import StoryPreviewPanel from './cms/StoryPreviewPanel';
import StoryEditorPanel from './cms/StoryEditorPanel';

const STORIES_PER_PAGE = 9;


// TIPTAP MENU BAR COMPONENT

export default function CMSModule() {
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<StoryCategory[]>([]);
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
    setError(null);

    try {
      const data = await getStories();
      setStories(data);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch stories.'
      );

    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);

    } catch (err) {
      console.error(
        'Failed to fetch categories:',
        err
      );
    }
  };
  const handleCategoryCreated = (
    category: StoryCategory
  ) => {
    setCategories(prev => [
      ...prev,
      category
    ]);
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

  const handleDelete = async (
    story: Story
  ) => {
    const isConfirmed =
      window.confirm(
        `Are you sure you want to permanently delete "${story.title}"? This action cannot be undone.`
      );

    if (!isConfirmed) return;

    try {
      await deleteStory(
        story.post_id
      );

      await fetchStories();

    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to delete story.'
      );
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
            convertImage: mammoth.images.imgElement(function (image) {
              return image.read("base64").then(async function (imageBuffer) {
                const byteString = atob(imageBuffer);
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                  ia[i] = byteString.charCodeAt(i);
                }
                const blob = new Blob(
                  [ab],
                  { type: image.contentType }
                );

                const ext =
                  image.contentType.split('/')[1] ||
                  'png';

                try {
                  const data =
                    await uploadInlineImage(
                      blob,
                      `imported-docx-img-${Date.now()}.${ext}`
                    );

                  return {
                    src: data.url
                  };

                } catch (error) {
                  console.error(
                    'Word document image upload failed:',
                    error
                  );
                }

                return {
                  src:
                    `data:${image.contentType};base64,${imageBuffer}`
                };
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
                      <p className="text-xs text-stone-500 text-center leading-relaxed">Upload a PDF Newsletter. <br /><span className="font-bold">Bypasses body text requirements.</span></p>
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
        onCategoryCreated={handleCategoryCreated}
        onClose={handleEditorClose}
      />
    </div>
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