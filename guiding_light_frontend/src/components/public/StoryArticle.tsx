/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Edit, Languages, Loader, Moon, Sun, FileText } from 'lucide-react';
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

interface StoryArticleProps {
  storyId: number;
  isAdmin: boolean;
  onEdit: (id: number) => void;
  onBack: () => void;
}

interface Attachment {
  id: number;
  file_name: string;
  file_url: string;
  file_type: string;
}

// Ensure these exactly match the extensions used in CMSModule
const tiptapExtensions = [
  StarterKit,
  Underline,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Image,
  Link,
];

export default function StoryArticle({ storyId, isAdmin, onEdit, onBack }: StoryArticleProps) {
  const [isLoading, setIsLoading] = useState(true);
  interface StoryData {
    title: string;
    content_type: 'article' | 'publication';
    content: string;
    image: string;
    author: string;
    date: string;
  }
  const [originalStory, setOriginalStory] = useState<StoryData | null>(null);
  const [activePublicationId, setActivePublicationId] = useState<number | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const [targetLang, setTargetLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [displayContent, setDisplayContent] = useState('');

  // Theme toggle state (defaulting to false / light mode)
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch both the story content and its attachments simultaneously
        const [storyRes, attRes] = await Promise.all([
          fetch(`/guiding_light_backend/get_story.php?id=${storyId}`),
          fetch(`/guiding_light_backend/get_story_attachments.php?post_id=${storyId}`)
        ]);

        const storyData = await storyRes.json();
        const attData = await attRes.json();

        if (storyData.success) {
          setOriginalStory(storyData.story);
        } else {
          console.error(storyData.error);
        }

        if (!attData.error) {
          setAttachments(attData);
        }

      } catch (error) {
        console.error("Failed to fetch the story data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    setActivePublicationId(null);
    setAttachments([]);
  }, [storyId]);

  const translateText = async (text: string, lang: string) => {
    if (lang === 'en' || !text.trim()) return text;
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
      const response = await fetch(url);
      const data = await response.json();
      return data[0].map((item: any) => item[0]).join('');
    } catch (error) {
      console.error("Translation failed:", error);
      return text;
    }
  };

  useEffect(() => {
    const handleTranslation = async () => {
      if (!originalStory) return;
      if (originalStory.content_type === 'publication') {
        setDisplayContent('');
        setIsTranslating(false);
        return;
      }

      let isJson = false;
      let parsedJson: any = null;
      try {
        parsedJson = JSON.parse(originalStory.content);
        isJson = typeof parsedJson === 'object' && parsedJson !== null;
      } catch (e) {
        isJson = false;
      }

      if (targetLang === 'en') {
        if (isJson) {
          setDisplayContent(generateHTML(parsedJson, tiptapExtensions));
        } else {
          setDisplayContent(`<p>${originalStory.content}</p>`);
        }
        return;
      }

      setIsTranslating(true);

      if (isJson) {
        const translatedJson = JSON.parse(JSON.stringify(parsedJson));

        const translateNodes = async (nodes: any[]) => {
          for (const node of nodes) {
            if (node.type === 'text' && node.text) {
              node.text = await translateText(node.text, targetLang);
            }
            if (node.content) {
              await translateNodes(node.content);
            }
          }
        };

        await translateNodes(translatedJson.content || []);
        setDisplayContent(generateHTML(translatedJson, tiptapExtensions));
      } else {
        const translatedText = await translateText(originalStory.content, targetLang);
        setDisplayContent(`<p>${translatedText}</p>`);
      }

      setIsTranslating(false);
    };

    handleTranslation();
  }, [targetLang, originalStory]);

  if (isLoading || !originalStory) {
    return (
      <div className={`min-h-screen pt-32 pb-20 flex justify-center transition-colors duration-300 ${isDarkMode ? 'bg-[#242c28] text-[#d4c5b3]' : 'bg-[#f7f5f2] text-[#4b5e52]'}`}>
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 selection:bg-[#4b5e52] selection:text-white ${isDarkMode ? 'bg-[#242c28]' : 'bg-[#f7f5f2]'}`}>
      <motion.article
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-32 pb-20 max-w-4xl mx-auto px-4"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <button
            onClick={onBack}
            className={`flex items-center transition-colors text-[10px] font-bold uppercase tracking-widest group ${isDarkMode ? 'text-stone-400 hover:text-[#f7f5f2]' : 'text-stone-500 hover:text-stone-800'}`}
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Stories
          </button>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full border shadow-sm backdrop-blur-sm transition-colors ${isDarkMode
                ? 'bg-white/5 border-white/10 text-stone-400 hover:text-white'
                : 'bg-white border-stone-200 text-stone-500 hover:text-stone-800'
                }`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Language Selector */}
            {originalStory.content_type === 'article' && (<div className={`relative flex items-center border rounded-full px-4 py-2 shadow-sm backdrop-blur-sm transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-stone-200'}`}>
              <Languages className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`} />
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                disabled={isTranslating}
                className={`appearance-none bg-transparent text-xs font-bold uppercase tracking-widest focus:outline-none cursor-pointer pr-4 transition-colors ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}
              >
                <option className={isDarkMode ? "bg-stone-800 text-white" : "bg-white text-stone-800"} value="en">English</option>
                <option className={isDarkMode ? "bg-stone-800 text-white" : "bg-white text-stone-800"} value="tl">Tagalog</option>
                <option className={isDarkMode ? "bg-stone-800 text-white" : "bg-white text-stone-800"} value="ceb">Cebuano</option>
                <option className={isDarkMode ? "bg-stone-800 text-white" : "bg-white text-stone-800"} value="es">Spanish</option>
                <option className={isDarkMode ? "bg-stone-800 text-white" : "bg-white text-stone-800"} value="fr">French</option>
                <option className={isDarkMode ? "bg-stone-800 text-white" : "bg-white text-stone-800"} value="de">German</option>
                <option className={isDarkMode ? "bg-stone-800 text-white" : "bg-white text-stone-800"} value="ja">Japanese</option>
                <option className={isDarkMode ? "bg-stone-800 text-white" : "bg-white text-stone-800"} value="ko">Korean</option>
                <option className={isDarkMode ? "bg-stone-800 text-white" : "bg-white text-stone-800"} value="zh-CN">Chinese (Simp)</option>
                <option className={isDarkMode ? "bg-stone-800 text-white" : "bg-white text-stone-800"} value="ar">Arabic</option>
                <option className={isDarkMode ? "bg-stone-800 text-white" : "bg-white text-stone-800"} value="hi">Hindi</option>
              </select>
              {isTranslating && <Loader className={`w-3 h-3 animate-spin absolute right-4 ${isDarkMode ? 'text-[#d4c5b3]' : 'text-[#4b5e52]'}`} />}
            </div>
            )}

            {isAdmin && (
              <button
                onClick={() => onEdit(storyId)}
                className="flex items-center px-4 py-2 bg-[#4b5e52] text-[#f7f5f2] rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#3a4740] transition-colors shadow-lg"
              >
                <Edit className="w-3 h-3 mr-2" />
                Edit Story
              </button>
            )}
          </div>
        </div>

        <header className="mb-12">
          <h1 className={`text-4xl md:text-5xl font-serif italic mb-6 leading-tight drop-shadow-sm transition-colors ${isDarkMode ? 'text-[#f7f5f2]' : 'text-stone-800'}`}>
            {originalStory.title}
          </h1>

          <div className={`flex items-center text-xs font-bold uppercase tracking-widest transition-colors ${isDarkMode ? 'text-[#d4c5b3]' : 'text-stone-500'}`}>
            <span>By {originalStory.author}</span>
            <span className={`mx-3 border-l h-3 transition-colors ${isDarkMode ? 'border-[#4b5e52]' : 'border-stone-300'}`}></span>
            <span>{originalStory.date}</span>
          </div>
        </header>

        {originalStory.image && (
          <div className={`aspect-[21/9] rounded-[32px] overflow-hidden mb-12 shadow-2xl ring-1 transition-colors ${isDarkMode ? 'ring-white/10' : 'ring-black/5'}`}>
            <img
              src={originalStory.image}
              alt={originalStory.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* CONDITIONALLY RENDER: EITHER the Attachments OR the Tiptap Content */}
        {originalStory.content_type === 'publication' ? (

          <div className="space-y-6">

            {attachments.filter(
              att => att.file_type === 'pdf'
            ).length === 0 ? (

              <div
                className={`w-full p-10 rounded-3xl border border-dashed text-center ${isDarkMode
                    ? 'border-white/10 bg-white/5'
                    : 'border-stone-300 bg-white'
                  }`}
              >
                <FileText
                  className={`w-12 h-12 mx-auto mb-4 ${isDarkMode
                      ? 'text-stone-500'
                      : 'text-stone-300'
                    }`}
                />

                <p
                  className={`font-bold ${isDarkMode
                      ? 'text-stone-300'
                      : 'text-stone-600'
                    }`}
                >
                  Publication PDF unavailable
                </p>

                <p
                  className={`text-sm mt-2 ${isDarkMode
                      ? 'text-stone-500'
                      : 'text-stone-400'
                    }`}
                >
                  No PDF is currently attached to this publication.
                </p>
              </div>

            ) : (

              attachments
                .filter(att => att.file_type === 'pdf')
                .map(att => {

                  const isOpen =
                    activePublicationId === att.id;

                  return (
                    <div
                      key={att.id}
                      className={`rounded-[32px] border overflow-hidden ${isDarkMode
                          ? 'border-white/10 bg-white/5'
                          : 'border-stone-200 bg-white'
                        }`}
                    >

                      <div className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">

                        <div className="flex items-center gap-4 min-w-0">

                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isDarkMode
                                ? 'bg-white/10'
                                : 'bg-[#f7f5f2]'
                              }`}
                          >
                            <FileText
                              className={`w-5 h-5 ${isDarkMode
                                  ? 'text-[#d4c5b3]'
                                  : 'text-[#4b5e52]'
                                }`}
                            />
                          </div>

                          <div className="min-w-0">
                            <p
                              className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDarkMode
                                  ? 'text-stone-500'
                                  : 'text-stone-400'
                                }`}
                            >
                              Publication PDF
                            </p>

                            <p
                              className={`font-bold truncate ${isDarkMode
                                  ? 'text-stone-200'
                                  : 'text-stone-700'
                                }`}
                            >
                              {att.file_name}
                            </p>
                          </div>

                        </div>

                        <button
                          onClick={() =>
                            setActivePublicationId(
                              isOpen ? null : att.id
                            )
                          }
                          className="shrink-0 px-6 py-3 bg-[#4b5e52] text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#3a4740] transition-colors shadow-md"
                        >
                          {isOpen
                            ? 'Close Publication'
                            : 'View Publication'}
                        </button>

                      </div>

                      {isOpen && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            height: 0
                          }}
                          animate={{
                            opacity: 1,
                            height: 'auto'
                          }}
                          className={`border-t ${isDarkMode
                              ? 'border-white/10'
                              : 'border-stone-200'
                            }`}
                        >

                          <div className="w-full h-[500px] md:h-[800px]">

                            <iframe
                              src={`${att.file_url}#view=FitH`}
                              className="w-full h-full"
                              title={att.file_name}
                              loading="lazy"
                            />

                          </div>

                        </motion.div>
                      )}

                    </div>
                  );
                })

            )}

          </div>

        ) : (

          <motion.div
            key={displayContent}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`prose prose-stone prose-lg max-w-none leading-relaxed tiptap-content transition-colors duration-300 ${isDarkMode
                ? 'prose-invert text-stone-300'
                : 'text-stone-600'
              }`}
            dangerouslySetInnerHTML={{
              __html: displayContent
            }}
          />

        )}

      </motion.article>
    </div>
  );
}