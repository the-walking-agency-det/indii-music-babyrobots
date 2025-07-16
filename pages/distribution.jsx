"use client";

import React from 'react';
import { AudioPlayer } from '../src/components/ui/AudioComponents';

export default function DistributionPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4 md:p-8">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white">Distribution</h1>
        <p className="text-gray-400">Release your music to all major platforms</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* New Release Form */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-6">New Release</h2>
            
            <div className="space-y-6">
              {/* Track Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Select Track</label>
                <AudioPlayer track={{ title: "Summer Vibes", artist: "Demo Artist" }} />
              </div>

              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Platforms</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'Spotify',
                    'Apple Music',
                    'Amazon Music',
                    'YouTube Music',
                    'Tidal',
                    'SoundCloud'
                  ].map((platform, i) => (
                    <label
                      key={i}
                      className="flex items-center p-3 bg-gray-700/50 rounded hover:bg-gray-600/70 transition-all cursor-pointer"
                    >
                      <input type="checkbox" className="mr-2" />
                      {platform}
                    </label>
                  ))}
                </div>
              </div>

              {/* Release Date */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Release Date</label>
                <input
                  type="date"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white"
                />
              </div>

              {/* Submit Button */}
              <button className="w-full bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-lg transition-colors">
                Schedule Release
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* Release Status */}
          <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-4">Release Status</h2>
            <div className="space-y-4">
              {[
                { title: 'Track 1', status: 'Live', date: '2025-07-01' },
                { title: 'Track 2', status: 'Pending', date: '2025-07-15' },
                { title: 'Track 3', status: 'Processing', date: '2025-07-20' }
              ].map((release, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-700/50 rounded">
                  <div>
                    <div className="font-medium">{release.title}</div>
                    <div className="text-sm text-gray-400">{release.date}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm ${
                    release.status === 'Live' ? 'bg-green-500/20 text-green-300' :
                    release.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-purple-500/20 text-purple-300'
                  }`}>
                    {release.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Stats */}
          <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-4">Platform Stats</h2>
            <div className="space-y-4">
              {[
                { platform: 'Spotify', listeners: '12.5K' },
                { platform: 'Apple Music', listeners: '8.2K' },
                { platform: 'YouTube Music', listeners: '15.3K' }
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-700/50 rounded">
                  <span>{stat.platform}</span>
                  <span className="font-mono">{stat.listeners}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
