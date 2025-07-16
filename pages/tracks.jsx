"use client";

import React from 'react';
import { AudioPlayer } from '../src/components/ui/AudioComponents';

export default function TracksPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4 md:p-8">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white">Your Tracks</h1>
        <p className="text-gray-400">Manage and master your music</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-4">Upload New Track</h2>
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
              <p className="text-gray-400 mb-4">Drag and drop your audio files here</p>
              <button className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg transition-colors">
                Select Files
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700/50">
            <h3 className="text-xl font-bold mb-4">Track Stats</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 mb-1">Storage Used</p>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <p className="text-sm text-gray-400 mt-1">45% of 1GB</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Processing Credits</p>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
                <p className="text-sm text-gray-400 mt-1">80 credits remaining</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tracks List */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-6">Your Tracks</h2>
            <div className="space-y-4">
              <AudioPlayer track={{ title: "Summer Vibes", artist: "Demo Artist" }} />
              <AudioPlayer track={{ title: "Midnight Drive", artist: "Demo Artist" }} />
              <AudioPlayer track={{ title: "Electric Dreams", artist: "Demo Artist" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
