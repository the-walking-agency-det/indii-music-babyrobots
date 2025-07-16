"use client";

import React from 'react';
import ArtCreationWorkspace from '../src/components/ArtCreation/ArtCreationWorkspace';

export default function ArtStudioPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4 md:p-8">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white">Art Studio</h1>
        <p className="text-gray-400">Create stunning artwork with AI</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Workspace */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/50 h-[600px]">
            <ArtCreationWorkspace
              projectId="demo-project"
              trackMetadata={{
                title: "Summer Vibes",
                genre: "Electronic",
                mood: "Uplifting"
              }}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* Style Presets */}
          <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-4">Style Presets</h2>
            <div className="space-y-3">
              {[
                'Modern Minimal',
                'Retro Wave',
                'Abstract Dream',
                'Urban Style'
              ].map((style, i) => (
                <button
                  key={i}
                  className="w-full text-left p-3 bg-gray-700/50 rounded hover:bg-gray-600/70 transition-all cursor-pointer"
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Generations */}
          <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-4">Recent Artwork</h2>
            <div className="grid grid-cols-2 gap-3">
              {[1,2,3,4].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-700/50 rounded-lg hover:bg-gray-600/70 transition-all cursor-pointer"
                />
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-4">Export</h2>
            <div className="space-y-3">
              <button className="w-full p-3 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors">
                Download Artwork
              </button>
              <button className="w-full p-3 bg-gray-700/50 hover:bg-gray-600/70 rounded-lg transition-colors">
                Share to Socials
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
