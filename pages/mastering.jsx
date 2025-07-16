"use client";

import React from 'react';
import { AudioPlayer, MasteringPanel, AudioStatsWidget } from '../src/components/ui/AudioComponents';

export default function MasteringPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4 md:p-8">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white">AI Mastering</h1>
        <p className="text-gray-400">Professional-grade mastering powered by AI</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Track and Controls */}
        <div className="space-y-8">
          <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-4">Current Track</h2>
            <AudioPlayer 
              track={{ title: "Summer Vibes", artist: "Demo Artist" }}
              showWaveform
            />
          </div>

          <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-4">Mastering Settings</h2>
            <MasteringPanel />
          </div>
        </div>

        {/* Right Column - Stats and Queue */}
        <div className="space-y-8">
          <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-4">Audio Analysis</h2>
            <AudioStatsWidget />
          </div>

          <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-4">Mastering Queue</h2>
            <div className="space-y-4">
              {['Track 1.wav', 'Track 2.wav', 'Track 3.wav'].map((track, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-700/50 rounded hover:bg-gray-700/70 transition-all">
                  <span>{track}</span>
                  <span className="text-sm px-2 py-1 rounded bg-yellow-500/20 text-yellow-300">Pending</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-4">Reference Tracks</h2>
            <div className="space-y-4">
              <AudioPlayer compact track={{ title: "Reference 1", artist: "Artist A" }} />
              <AudioPlayer compact track={{ title: "Reference 2", artist: "Artist B" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
