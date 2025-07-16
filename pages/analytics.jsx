"use client";

import React from 'react';
import { RoyaltyWidget, RecentActivityWidget } from '../src/components/Dashboard/DashboardWidgets';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4 md:p-8">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white">Analytics</h1>
        <p className="text-gray-400">Gain insights into your music's performance</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700/50">
          <h2 className="text-2xl font-bold mb-4">Revenue Analysis</h2>
          <RoyaltyWidget userId="user123" />
        </div>

        <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700/50">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <RecentActivityWidget userId="user123" />
        </div>
      </div>
    </div>
  );
}
