'use client'

import { useState, useEffect } from 'react'
import Link from "next/link";
import { ArrowLeft, Plus, Edit, Trash2, Copy, FileText } from "lucide-react";
import ArticleEditor from '@/components/ArticleEditor'
import { getAvailableVariables } from '@/lib/template-variables'

interface ArticleTemplate {
  id: string
  title: string
  content: string
  slug: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<ArticleTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ArticleTemplate | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    slug: '',
    description: '',
    is_active: true
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showVariables, setShowVariables] = useState(false)

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.error || 'Failed to fetch templates')
      }
    } catch (error) {
      setError('Error fetching templates')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required')
      return
    }
    
    setSubmitting(true)
    setError(null)
    
    try {
      const url = editingTemplate ? `/api/admin/templates/${editingTemplate.id}` : '/api/admin/templates'
      const method = editingTemplate ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSuccess(editingTemplate ? 'Template updated successfully!' : 'Template created successfully!')
        await fetchTemplates()
        resetForm()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to save template')
      }
    } catch (error) {
      setError('Error saving template')
      console.error('Error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      slug: '',
      description: '',
      is_active: true
    })
    setEditingTemplate(null)
    setShowForm(false)
  }

  const handleEdit = (template: ArticleTemplate) => {
    setFormData({
      title: template.title,
      content: template.content,
      slug: template.slug,
      description: template.description,
      is_active: template.is_active
    })
    setEditingTemplate(template)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return
    
    try {
      const response = await fetch(`/api/admin/templates/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setSuccess('Template deleted successfully!')
        await fetchTemplates()
      } else {
        setError('Failed to delete template')
      }
    } catch (error) {
      setError('Error deleting template')
      console.error('Error:', error)
    }
  }

  const handleGenerateForAllCities = async (templateId: string) => {
    if (!confirm('This will generate articles for ALL cities using this template. This may take a while. Continue?')) return
    
    try {
      const response = await fetch(`/api/admin/templates/${templateId}/generate-all-cities`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const result = await response.json()
        setSuccess(`Generated ${result.count} city-specific articles successfully!`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to generate articles')
      }
    } catch (error) {
      setError('Error generating articles')
      console.error('Error:', error)
    }
  }

  const handleSlugChange = (newSlug: string) => {
    const cleanSlug = newSlug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    setFormData({
      ...formData,
      slug: cleanSlug
    })
  }

  const availableVariables = getAvailableVariables()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link 
                href="/admin" 
                className="mr-4 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Article Templates</h1>
                <p className="text-gray-600 mt-1">
                  Create templates for city-specific content generation
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowVariables(!showVariables)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-4 h-4 mr-2" />
                {showVariables ? 'Hide' : 'Show'} Variables
              </button>
              <button
                onClick={() => {
                  setEditingTemplate(null)
                  setFormData({
                    title: '',
                    content: '',
                    slug: '',
                    description: '',
                    is_active: true
                  })
                  setShowForm(true)
                }}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </button>
            </div>
          </div>
        </div>

        {/* Variables Panel */}
        {showVariables && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Available Template Variables</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {availableVariables.map((variable, index) => (
                <code key={index} className="bg-white px-2 py-1 rounded text-sm border">
                  {variable}
                </code>
              ))}
            </div>
            <p className="text-sm text-blue-700 mt-3">
              Use these variables in your template content. They will be automatically replaced with city-specific data when generating articles.
            </p>
          </div>
        )}

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Templates List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Templates Found</h3>
            <p className="text-gray-600 mb-6">
              {error ? (
                <>
                  Database setup may be required. Try running the database fix first.
                  <br />
                  <Link href="/admin/fix-database" className="text-blue-600 hover:text-blue-800 underline">
                    Go to Fix Database
                  </Link>
                </>
              ) : (
                'Create your first template to get started with automated article generation.'
              )}
            </p>
            <button
              onClick={() => {
                setEditingTemplate(null)
                setFormData({
                  title: '',
                  content: '',
                  slug: '',
                  description: '',
                  is_active: true
                })
                setShowForm(true)
              }}
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Template
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-white rounded-lg shadow border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{template.title}</h3>
                      {template.is_active ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Inactive</span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{template.description}</p>
                    <p className="text-sm text-gray-500">
                      Slug: <code className="bg-gray-100 px-1 rounded">{template.slug}</code>
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(template)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit template"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleGenerateForAllCities(template.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Generate for all cities"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Best Dog Boarding in {{CITY_NAME}}"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Slug *
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="best-dog-boarding-in-city"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Brief description of this template..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Content *
                  </label>
                  <div className="border border-gray-300 rounded-lg">
                    <ArticleEditor
                      content={formData.content}
                      onChange={(content) => setFormData({ ...formData, content })}
                      placeholder="Write your template content here. Use variables like {{CITY_NAME}}, {{STATE_NAME}}, etc."
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                    Active (can be used for generation)
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : (editingTemplate ? 'Update Template' : 'Create Template')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
