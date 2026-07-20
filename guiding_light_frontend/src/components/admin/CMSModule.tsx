/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Save, Eye, CheckCircle2, History } from 'lucide-react';
import { motion } from 'motion/react';

export default function CMSModule() {
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [isPublishing, setIsPublishing] = React.useState(false);

  const handlePublish = () => {
    if (!title || !content) return;
    setIsPublishing(true);
    setTimeout(() => setIsPublishing(false), 1500);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif italic text-stone-800">Content Management</h2>
          <p className="text-stone-400 text-sm">Draft and publish impact stories to the public interface.</p>
        </div>
        <div className="flex space-x-4">
          <button className="flex items-center px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-stone-500 bg-white border border-stone-100 rounded-full hover:bg-stone-50 transition-colors shadow-sm">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </button>
          <button className="flex items-center px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-stone-500 bg-white border border-stone-100 rounded-full hover:bg-stone-50 transition-colors shadow-sm">
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </button>
          <button 
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center px-8 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white bg-[#4b5e52] rounded-full hover:bg-[#3a4740] transition-all shadow-lg"
          >
            {isPublishing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Publish Story
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[32px] border border-stone-100 shadow-sm">
            <input
              type="text"
              placeholder="Enter story title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl font-serif italic border-none focus:ring-0 placeholder:text-stone-100 p-0 mb-10 text-stone-800"
            />
            
            <div className="border-t border-stone-100 pt-10">
              <div className="mb-6 flex items-center space-x-4 text-stone-400 bg-stone-50 p-2.5 rounded-2xl inline-flex border border-stone-100">
                <button className="p-1.5 hover:text-stone-900 font-bold text-sm">B</button>
                <button className="p-1.5 hover:text-stone-900 italic text-sm">I</button>
                <button className="p-1.5 hover:text-stone-900 underline text-sm">U</button>
                <div className="w-px h-5 bg-stone-200 mx-1"></div>
                <button className="p-1.5 hover:text-stone-900 text-xs font-bold uppercase tracking-widest">List</button>
                <button className="p-1.5 hover:text-stone-900 text-xs font-bold uppercase tracking-widest">Link</button>
              </div>
              <textarea
                placeholder="Start writing the impact story here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-[500px] border-none focus:ring-0 resize-none placeholder:text-stone-100 p-0 leading-relaxed text-stone-600 text-lg"
              />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[32px] border border-stone-100 shadow-sm">
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-8">Metadata</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Author</label>
                <input type="text" defaultValue="Maria Clara Santos" className="w-full bg-stone-50 border-none rounded-xl text-xs font-bold uppercase tracking-widest px-4 py-3" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Category</label>
                <select className="w-full bg-stone-50 border-none rounded-xl text-xs font-bold uppercase tracking-widest px-4 py-3 cursor-pointer">
                  <option>Impact Story</option>
                  <option>Advocacy News</option>
                  <option>Community Update</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Cover Image</label>
                <div className="w-full h-40 bg-stone-50 border-2 border-dashed border-stone-200 rounded-[24px] flex flex-col items-center justify-center text-stone-400 text-[10px] font-bold uppercase tracking-widest hover:border-[#d4c5b3] transition-colors cursor-pointer group">
                  <Save className="w-6 h-6 mb-3 group-hover:scale-110 transition-transform" />
                  Upload image
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#4b5e52] text-white p-8 rounded-[32px] shadow-lg flex flex-col min-h-[300px]">
            <h3 className="text-lg font-serif italic mb-6 text-[#d4c5b3] flex items-center">
              <History className="w-5 h-5 mr-3 text-[#d4c5b3]/60" />
              Revision History
            </h3>
            <div className="space-y-6 flex-1">
              {[1, 2].map((v) => (
                <div key={v} className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                    <span className="text-[10px] font-bold text-[#d4c5b3]">MS</span>
                  </div>
                  <div className="pt-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/90 leading-tight mb-1">Draft saved successfully</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#d4c5b3]/60">{v * 2} hours ago</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-widest opacity-50">Last edited by MS</span>
              <button className="text-[9px] uppercase tracking-widest font-bold text-[#d4c5b3] hover:text-white transition-colors underline">View Full Log</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
