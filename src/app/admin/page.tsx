'use client'

import Link from "next/link";
import { FileText, MapPin, Settings, Copy } from "lucide-react";
import AdminHeader from "@/components/AdminHeader";

export default function AdminHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <AdminHeader title="Admin Panel" />

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Directory Management System
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Manage your business listings and create engaging articles with our comprehensive backend system.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Articles Section */}
          <Link href="/admin/articles" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-6 mx-auto group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                Articles
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Create and manage engaging articles with our rich text editor. Add images, format content, and publish your stories.
              </p>
              <div className="text-center">
                <span className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Manage Articles
                </span>
              </div>
            </div>
          </Link>

          {/* Generate City Articles */}
          <button
            className="group"
            onClick={async () => {
              try {
                const confirmed = window.confirm('Generate/refresh city-specific articles and show them below listings?')
                if (!confirmed) return
                const res = await fetch('/api/admin/generate-city-articles', { method: 'POST' })
                if (res.ok) {
                  const data = await res.json()
                  alert(`Done: ${data.count} articles processed. Check a city page to see articles below listings.`)
                } else {
                  const err = await res.json().catch(() => ({}))
                  alert(`Failed: ${err.error || 'Unknown error'}`)
                }
              } catch (e) {
                alert(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`)
              }
            }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center w-16 h-16 bg-teal-100 dark:bg-teal-900 rounded-full mb-6 mx-auto group-hover:bg-teal-200 dark:group-hover:bg-teal-800 transition-colors">
                <span className="text-teal-700 dark:text-teal-300 font-bold">AI</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                Generate City Articles
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Create/update unique articles for every city; they appear below listings automatically.
              </p>
              <div className="text-center">
                <span className="inline-flex items-center px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors">
                  Run Generator
                </span>
              </div>
            </div>
          </button>

          {/* Listings Section */}
          <Link href="/admin/listings" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-6 mx-auto group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                <MapPin className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                Listings
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Manage states, cities, and business listings. Import CSV files and organize your directory data efficiently.
              </p>
              <div className="text-center">
                <span className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
                  Manage Listings
                </span>
              </div>
            </div>
          </Link>

          {/* Templates Section */}
          <Link href="/admin/templates" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full mb-6 mx-auto group-hover:bg-orange-200 dark:group-hover:bg-orange-800 transition-colors">
                <Copy className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                Templates
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Create article templates and generate city-specific content automatically. Perfect for SEO and avoiding duplicate content.
              </p>
              <div className="text-center">
                <span className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors">
                  Manage Templates
                </span>
              </div>
            </div>
          </Link>

          {/* Database Fix Section */}
          <Link href="/admin/fix-database" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full mb-6 mx-auto group-hover:bg-red-200 dark:group-hover:bg-red-800 transition-colors">
                <Settings className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                Fix Database
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Fix database schema issues. Add missing columns for city articles and templates.
              </p>
              <div className="text-center">
                <span className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors">
                  Fix Database
                </span>
              </div>
            </div>
          </Link>

          {/* Settings Section */}
          <Link href="/admin/settings" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full mb-6 mx-auto group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                <Settings className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                Settings
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Configure your site name, niche, and country. Customize the main title and branding.
              </p>
              <div className="text-center">
                <span className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
                  Site Settings
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-2xl mx-auto border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center justify-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Rich Text Editor
              </div>
              <div className="flex items-center justify-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                CSV Import
              </div>
              <div className="flex items-center justify-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                State/City Management
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            View Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}




