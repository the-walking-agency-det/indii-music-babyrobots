"use client";

import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4 md:p-8 animate-gradient-slow">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0.7),rgba(0,0,0,0.9))] pointer-events-none" />
      
      <header className="mb-12 text-center relative">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white animate-text">
          Indii Music
        </h1>
        <div className="mt-2">
          <p className="text-gray-400">AI-Powered Music Industry Platform</p>
        </div>
      </header>
      
      <main>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/tracks" className="block">
            <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all hover:bg-gray-800/70">
              <h3 className="text-xl font-bold mb-2">12</h3>
              <p className="text-gray-400">Total Tracks</p>
            </div>
          </Link>
          
          <Link href="/mastering" className="block">
            <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all hover:bg-gray-800/70">
              <h3 className="text-xl font-bold mb-2">8</h3>
              <p className="text-gray-400">Mastered</p>
            </div>
          </Link>
          
          <Link href="/projects" className="block">
            <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all hover:bg-gray-800/70">
              <h3 className="text-xl font-bold mb-2">3</h3>
              <p className="text-gray-400">In Queue</p>
            </div>
          </Link>
          
          <Link href="/distribution" className="block">
            <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all hover:bg-gray-800/70">
              <h3 className="text-xl font-bold mb-2">5</h3>
              <p className="text-gray-400">Released</p>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Recent Tracks */}
          <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all hover:bg-gray-800/70">
            <h2 className="text-2xl font-bold mb-4">Recent Tracks</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded hover:bg-gray-700/70 transition-all cursor-pointer">
                <span>Summer Vibes</span>
                <span className="text-gray-400">Demo Artist</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded hover:bg-gray-700/70 transition-all cursor-pointer">
                <span>Midnight Drive</span>
                <span className="text-gray-400">Demo Artist</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded hover:bg-gray-700/70 transition-all cursor-pointer">
                <span>Electric Dreams</span>
                <span className="text-gray-400">Demo Artist</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all hover:bg-gray-800/70">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <Link href="/tracks">
                <button className="w-full text-left p-3 bg-gray-700/50 rounded hover:bg-gray-600/70 transition-all cursor-pointer flex items-center space-x-2">
                  Upload New Track
                </button>
              </Link>
              <Link href="/mastering">
                <button className="w-full text-left p-3 bg-gray-700/50 rounded hover:bg-gray-600/70 transition-all cursor-pointer flex items-center space-x-2">
                  Start Mastering
                </button>
              </Link>
              <Link href="/art-studio">
                <button className="w-full text-left p-3 bg-gray-700/50 rounded hover:bg-gray-600/70 transition-all cursor-pointer flex items-center space-x-2">
                  Generate Artwork
                </button>
              </Link>
              <Link href="/analytics">
                <button className="w-full text-left p-3 bg-gray-700/50 rounded hover:bg-gray-600/70 transition-all cursor-pointer flex items-center space-x-2">
                  View Analytics
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
