"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  MusicalNoteIcon,
  PaintBrushIcon,
  ChartBarIcon,
  GlobeAltIcon,
  FolderIcon,
  SpeakerWaveIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export default function RootLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const navigation = [
    { name: 'Tracks', href: '/tracks', icon: MusicalNoteIcon },
    { name: 'Mastering', href: '/mastering', icon: SpeakerWaveIcon },
    { name: 'Art Studio', href: '/art-studio', icon: PaintBrushIcon },
    { name: 'Projects', href: '/projects', icon: FolderIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Distribution', href: '/distribution', icon: GlobeAltIcon },
    { name: 'AI Agents', href: '/agents', icon: SparklesIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900/95 border-r border-gray-800 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-800">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">i</span>
              </div>
              <span className="text-white font-bold text-lg">Indii Music</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-800">
            <button className="flex items-center space-x-2 text-gray-400 hover:text-white w-full">
              <UserCircleIcon className="w-5 h-5" />
              <span>Profile</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-400 hover:text-white w-full mt-2">
              <Cog6ToothIcon className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-gray-900/90 text-gray-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-200 ${sidebarOpen ? 'md:ml-64' : ''}`}>
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
