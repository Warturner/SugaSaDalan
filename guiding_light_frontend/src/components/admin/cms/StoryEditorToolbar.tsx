import React, {
  useRef,
  useState
} from 'react';

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Loader
} from 'lucide-react';

import {
  uploadInlineImage
} from '../../../services/storyService';

interface StoryEditorToolbarProps {
  editor: any;
}

export default function StoryEditorToolbar({
  editor
}: StoryEditorToolbarProps) {

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [
    isUploading,
    setIsUploading
  ] = useState(false);

  if (!editor) return null;

  const btnClass =
    'p-2 rounded hover:bg-stone-200 text-stone-600 transition-colors';

  const activeBtnClass =
    'p-2 rounded bg-stone-300 text-stone-900 font-bold transition-colors';

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file =
      e.target.files?.[0];

    if (!file) return;

    setIsUploading(true);

    try {

      const data =
        await uploadInlineImage(file);

      editor
        .chain()
        .focus()
        .setImage({
          src: data.url
        })
        .run();

    } catch (error) {

      console.error(
        'Image upload failed:',
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : 'Network error while uploading image.'
      );

    } finally {

      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-stone-50 border-b border-stone-200 rounded-t-2xl items-center">

      <button
        onClick={() =>
          editor.chain().focus().toggleBold().run()
        }
        className={
          editor.isActive('bold')
            ? activeBtnClass
            : btnClass
        }
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>

      <button
        onClick={() =>
          editor.chain().focus().toggleItalic().run()
        }
        className={
          editor.isActive('italic')
            ? activeBtnClass
            : btnClass
        }
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>

      <button
        onClick={() =>
          editor.chain().focus().toggleUnderline().run()
        }
        className={
          editor.isActive('underline')
            ? activeBtnClass
            : btnClass
        }
        title="Underline"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>

      <button
        onClick={() =>
          editor.chain().focus().toggleStrike().run()
        }
        className={
          editor.isActive('strike')
            ? activeBtnClass
            : btnClass
        }
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-stone-300 mx-1 self-center" />

      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleHeading({ level: 1 })
            .run()
        }
        className={
          editor.isActive(
            'heading',
            { level: 1 }
          )
            ? activeBtnClass
            : btnClass
        }
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>

      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleHeading({ level: 2 })
            .run()
        }
        className={
          editor.isActive(
            'heading',
            { level: 2 }
          )
            ? activeBtnClass
            : btnClass
        }
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-stone-300 mx-1 self-center" />

      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .setTextAlign('left')
            .run()
        }
        className={
          editor.isActive({
            textAlign: 'left'
          })
            ? activeBtnClass
            : btnClass
        }
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </button>

      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .setTextAlign('center')
            .run()
        }
        className={
          editor.isActive({
            textAlign: 'center'
          })
            ? activeBtnClass
            : btnClass
        }
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </button>

      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .setTextAlign('right')
            .run()
        }
        className={
          editor.isActive({
            textAlign: 'right'
          })
            ? activeBtnClass
            : btnClass
        }
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-stone-300 mx-1 self-center" />

      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleBulletList()
            .run()
        }
        className={
          editor.isActive('bulletList')
            ? activeBtnClass
            : btnClass
        }
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>

      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleOrderedList()
            .run()
        }
        className={
          editor.isActive('orderedList')
            ? activeBtnClass
            : btnClass
        }
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleBlockquote()
            .run()
        }
        className={
          editor.isActive('blockquote')
            ? activeBtnClass
            : btnClass
        }
        title="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-stone-300 mx-1 self-center" />

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImageUpload}
      />

      <button
        onClick={() =>
          fileInputRef.current?.click()
        }
        className={btnClass}
        title="Insert Image"
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader className="w-4 h-4 animate-spin text-[#4b5e52]" />
        ) : (
          <ImageIcon className="w-4 h-4" />
        )}
      </button>

    </div>
  );
}