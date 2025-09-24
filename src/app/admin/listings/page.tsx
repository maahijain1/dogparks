'use client'

import Link from "next/link";
import { ArrowLeft, MapPin, Building2, Upload } from "lucide-react";

export default function AdminListingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link 
            href="/admin" 
            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Listings Management
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Manage your directory structure and business listings
          </p>
        </div>

        {/* Management Options */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Manage States */}
          <Link href="/admin/listings/states" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 border border-gray-200 dark:border-gray-700 h-full">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-6 mx-auto group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                Manage States
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Create and manage states for your directory. States are the top-level geographical divisions.
              </p>
              <div className="text-center">
                <span className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Manage States
                </span>
              </div>
            </div>
          </Link>

          {/* Manage Cities */}
          <Link href="/admin/listings/cities" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 border border-gray-200 dark:border-gray-700 h-full">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full mb-6 mx-auto group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                <Building2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                Manage Cities
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Create and manage cities under existing states. Cities are organized by their parent state.
              </p>
              <div className="text-center">
                <span className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
                  Manage Cities
                </span>
              </div>
            </div>
          </Link>

          {/* Manage Listings */}
          <Link href="/admin/listings/businesses" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 border border-gray-200 dark:border-gray-700 h-full">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-6 mx-auto group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                <Upload className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                Manage Listings
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Import CSV files and manage business listings. Upload your directory data in bulk or add individual entries.
              </p>
              <div className="text-center">
                <span className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
                  Manage Listings
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Info Section */}
        <div className="mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-4xl mx-auto border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
              How it Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-300">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">1</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Create States</h4>
                <p>Start by creating the states where your businesses are located.</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">2</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Add Cities</h4>
                <p>Create cities under each state to organize your directory geographically.</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">3</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Import Listings</h4>
                <p>Upload your CSV file with business listings to populate your directory.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}







