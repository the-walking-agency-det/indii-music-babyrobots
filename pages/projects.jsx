"use client";

import React from 'react';
import ProjectWorkspaceUI from '../src/components/ProjectWorkspaceUI';

export default function ProjectsPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4 md:p-8">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white">Projects</h1>
        <p className="text-gray-400">Manage your music projects</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Project List */}
        <div className="lg:col-span-1 space-y-8">
          {/* Create New Project */}
          <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700/50">
            <button className="w-full p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors">
              Create New Project
            </button>
          </div>

          {/* Project List */}
          <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-4">Your Projects</h2>
            <div className="space-y-3">
              {[
                { name: 'Summer Album', tracks: 12, status: 'In Progress' },
                { name: 'Remix EP', tracks: 4, status: 'Planning' },
                { name: 'Collab Project', tracks: 3, status: 'Review' }
              ].map((project, i) => (
                <div
                  key={i}
                  className="p-3 bg-gray-700/50 rounded hover:bg-gray-600/70 transition-all cursor-pointer"
                >
                  <div className="font-medium">{project.name}</div>
                  <div className="text-sm text-gray-400 flex justify-between mt-1">
                    <span>{project.tracks} tracks</span>
                    <span>{project.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Workspace */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/50 min-h-[600px]">
            <ProjectWorkspaceUI 
              workspaceId="demo-workspace"
              userId="user123"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
