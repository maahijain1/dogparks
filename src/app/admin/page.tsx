'use client'

import Link from "next/link";
import { FileText, MapPin, Settings, Copy, Database } from "lucide-react";
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

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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

          {/* Fix All Issues Section */}
          <Link href="/admin/fix-all-issues-v2" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full mb-6 mx-auto group-hover:bg-red-200 dark:group-hover:bg-red-800 transition-colors">
                <Settings className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                Fix All Issues (V2)
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Comprehensive solution to fix articles, featured listings, and database issues. Generate articles for all cities and auto-select featured listings.
              </p>
              <div className="text-center">
                <span className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors">
                  Fix All Issues
                </span>
              </div>
            </div>
          </Link>

          {/* Nuclear Fix Section - MOST PROMINENT */}
          <Link href="/admin/nuclear-fix" className="group">
            <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-red-100 dark:from-purple-900 dark:via-pink-900 dark:to-red-900 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-3 p-8 border-4 border-purple-400 dark:border-purple-600 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-1 text-xs font-bold transform rotate-12 translate-x-8 translate-y-2">
                DIRECT FIX
              </div>
              <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6 mx-auto group-hover:scale-110 transition-transform shadow-lg">
                <Database className="w-10 h-10 text-white animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-4 text-center">
                ⚡ NUCLEAR FIX
              </h2>
              <p className="text-purple-800 dark:text-purple-200 text-center mb-6 font-bold text-lg">
                DIRECT DATABASE FIX - Generate ALL articles + Fix ALL featured listings in ONE CLICK!
              </p>
              <div className="text-center">
                <span className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors shadow-xl">
                  FIX EVERYTHING NOW
                </span>
              </div>
            </div>
          </Link>

          {/* Fix Everything Section */}
          <Link href="/admin/fix-everything" className="group">
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 border-2 border-green-300 dark:border-green-700">
              <div className="flex items-center justify-center w-16 h-16 bg-green-200 dark:bg-green-800 rounded-full mb-6 mx-auto group-hover:bg-green-300 dark:group-hover:bg-green-700 transition-colors">
                <Database className="w-8 h-8 text-green-700 dark:text-green-300" />
              </div>
              <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-4 text-center">
                🔧 Fix Everything
              </h2>
              <p className="text-green-800 dark:text-green-200 text-center mb-6 font-medium">
                Run comprehensive fix to publish all articles, ensure featured listings, and fix display issues.
              </p>
              <div className="text-center">
                <span className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-lg">
                  Fix All Issues
                </span>
              </div>
            </div>
          </Link>

          {/* Debug All States Section */}
          <Link href="/admin/debug-all-states" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full mb-6 mx-auto group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                <Database className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                Debug All States
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Check articles and featured listings across all states to identify which states are missing content.
              </p>
              <div className="text-center">
                <span className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
                  Debug States
                </span>
              </div>
            </div>
          </Link>

          {/* Fix Articles Section */}
          <Link href="/admin/fix-articles" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-6 mx-auto group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                Fix Articles
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Debug and fix articles display issues. Check database status and generate articles for all cities.
              </p>
              <div className="text-center">
                <span className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Fix Articles
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




