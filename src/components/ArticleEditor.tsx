'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo, 
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'

interface ArticleEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
}

export default function ArticleEditor({ content = '', onChange, placeholder = 'Start writing your article...' }: ArticleEditorProps) {
  const [imageUrl, setImageUrl] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const contentRef = useRef(content)
  const onChangeRef = useRef(onChange)

  // Update refs when props change
  useEffect(() => {
    contentRef.current = content
    onChangeRef.current = onChange
  }, [content, onChange])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: contentRef.current,
    onUpdate: useCallback(({ editor }: { editor: Editor }) => {
      const html = editor.getHTML()
      if (onChangeRef.current && html !== contentRef.current) {
        onChangeRef.current(html)
      }
    }, []),
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Update editor content when prop changes, but preserve focus
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      const { from, to } = editor.state.selection
      editor.commands.setContent(content, false)
      // Restore cursor position if possible
      if (from !== to) {
        editor.commands.setTextSelection({ from, to })
      }
    }
  }, [content, editor])

  const addImage = useCallback(() => {
    if (imageUrl && editor) {
      setIsLoading(true)
      try {
        editor.chain().focus().setImage({ src: imageUrl }).run()
        setImageUrl('')
      } catch (error) {
        console.error('Error adding image:', error)
        alert('Failed to add image. Please check the URL.')
      } finally {
        setIsLoading(false)
      }
    }
  }, [imageUrl, editor])

  const addLink = useCallback(() => {
    if (editor) {
      const url = window.prompt('Enter URL:')
      if (url) {
        try {
          editor.chain().focus().setLink({ href: url }).run()
        } catch (error) {
          console.error('Error adding link:', error)
          alert('Failed to add link. Please try again.')
        }
      }
    }
  }, [editor])

  if (!isMounted || !editor) {
    return (
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-700 p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 flex flex-wrap gap-2">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
              editor?.isActive('bold') ? 'bg-gray-200 dark:bg-gray-600' : ''
            }`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
              editor?.isActive('italic') ? 'bg-gray-200 dark:bg-gray-600' : ''
            }`}
          >
            <Italic className="w-4 h-4" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
              editor?.isActive('heading', { level: 1 }) ? 'bg-gray-200 dark:bg-gray-600' : ''
            }`}
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
              editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-600' : ''
            }`}
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
              editor?.isActive('heading', { level: 3 }) ? 'bg-gray-200 dark:bg-gray-600' : ''
            }`}
          >
            <Heading3 className="w-4 h-4" />
          </button>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
              editor?.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-600' : ''
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
              editor?.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-600' : ''
            }`}
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        {/* Quote */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
              editor?.isActive('blockquote') ? 'bg-gray-200 dark:bg-gray-600' : ''
            }`}
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>

        {/* Link and Image */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={addLink}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1">
            <input
              type="url"
              placeholder="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white"
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={addImage}
              disabled={!imageUrl || isLoading}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="bg-white dark:bg-gray-800">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
