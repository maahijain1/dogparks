'use client'

import { useState, useEffect, useRef } from 'react'
import { Code, Eye, EyeOff, Copy, Check } from 'lucide-react'

interface HTMLEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
}

export default function HTMLEditor({ content = '', onChange, placeholder = 'Enter your HTML content...' }: HTMLEditorProps) {
  const [htmlContent, setHtmlContent] = useState(content)
  const [previewMode, setPreviewMode] = useState(false)
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Update content when prop changes
  useEffect(() => {
    setHtmlContent(content)
  }, [content])

  // Handle content change
  const handleContentChange = (newContent: string) => {
    setHtmlContent(newContent)
    if (onChange) {
      onChange(newContent)
    }
  }

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(htmlContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [htmlContent])

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            HTML Editor
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
          >
            {previewMode ? (
              <>
                <Code className="w-4 h-4" />
                Edit
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Preview
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-gray-800">
        {previewMode ? (
          <div className="p-4 min-h-[300px]">
            <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto max-w-none">
              <div 
                dangerouslySetInnerHTML={{ __html: htmlContent || '<p class="text-gray-500 italic">No content to preview</p>' }}
                className="html-preview"
              />
            </div>
          </div>
        ) : (
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={htmlContent}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={placeholder}
              className="w-full p-4 border-0 resize-none focus:outline-none dark:bg-gray-800 dark:text-white min-h-[300px] font-mono text-sm leading-relaxed"
              style={{ minHeight: '300px' }}
            />
            
            {/* Line numbers (optional) */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 text-xs text-gray-400 select-none pointer-events-none">
              {htmlContent.split('\n').map((_, index) => (
                <div key={index} className="h-6 leading-6 text-center">
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
        {previewMode ? (
          <span>Preview mode - Click &quot;Edit&quot; to modify HTML</span>
        ) : (
          <span>HTML Editor - Click &quot;Preview&quot; to see rendered content</span>
        )}
      </div>
    </div>
  )
}
