"use client";

import React, { useState } from 'react';
import { AIAgentCard, AIChatInterface, AIStatusPanel } from '../src/components/ui/AIAgentComponents';

export default function AgentsPage() {
  const [activeAgent, setActiveAgent] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  // Your specialized AI agents
  const agents = [
    {
      id: 'mastering',
      name: 'Mastering Agent',
      type: 'mastering',
      icon: 'mastering',
      status: 'active',
      description: 'AI-powered audio mastering and analysis',
      specialty: 'Audio Engineering',
      lastMessage: 'Ready to master',
      abilities: [
        'Professional audio mastering',
        'EQ and compression optimization',
        'Loudness normalization',
        'Stereo enhancement'
      ]
    },
    {
      id: 'artwork',
      name: 'Art Agent',
      type: 'artwork',
      icon: 'artwork',
      status: 'active',
      description: 'Visual content creation and branding',
      specialty: 'Creative Design',
      lastMessage: 'Generated 3 concepts',
      abilities: [
        'Album cover generation',
        'Artist branding',
        'Visual style matching',
        'Multi-format exports'
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing Agent',
      type: 'marketing',
      icon: 'marketing',
      status: 'busy',
      description: 'Campaign strategy and promotion',
      specialty: 'Digital Marketing',
      lastMessage: 'Planning campaign',
      abilities: [
        'Social media strategy',
        'Release planning',
        'Audience targeting',
        'Performance analytics'
      ]
    },
    {
      id: 'royalty',
      name: 'Royalty Agent',
      type: 'royalty',
      icon: 'royalty',
      status: 'active',
      description: 'Revenue tracking and distribution',
      specialty: 'Financial Management',
      lastMessage: 'Updated earnings',
      abilities: [
        'Royalty calculations',
        'Payment distribution',
        'Revenue forecasting',
        'Streaming analytics'
      ]
    },
    {
      id: 'distribution',
      name: 'Distribution Agent',
      type: 'distribution',
      icon: 'distribution',
      status: 'idle',
      description: 'Multi-platform release management',
      specialty: 'Platform Distribution',
      abilities: [
        'Multi-platform uploads',
        'Release scheduling',
        'Metadata optimization',
        'Platform compliance'
      ]
    },
    {
      id: 'legal',
      name: 'Legal Assistant',
      type: 'legal',
      icon: 'legal',
      status: 'idle',
      description: 'Contract review and industry guidance',
      specialty: 'Music Law',
      abilities: [
        'Contract analysis',
        'Rights management',
        'Legal compliance',
        'Industry standards'
      ]
    }
  ];

  const handleAgentSelect = (agent) => {
    setActiveAgent(agent);
    setChatOpen(true);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white">
            AI Agents
          </h1>
          <p className="text-gray-400">Your team of specialized AI assistants</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agents Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent) => (
              <div key={agent.id} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg opacity-0 group-hover:opacity-100 transition duration-200 blur"></div>
                <AIAgentCard
                  agent={agent}
                  isActive={activeAgent?.id === agent.id}
                  onClick={handleAgentSelect}
                  showStatus
                />
                <div className="mt-2 space-y-1 px-2">
                  {agent.abilities.map((ability, index) => (
                    <div key={index} className="text-sm text-gray-400 flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                      <span>{ability}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Sidebar - Chat or Status */}
          <div className="space-y-8">
            {chatOpen && activeAgent ? (
              <AIChatInterface
                agent={activeAgent}
                onClose={() => setChatOpen(false)}
                className="sticky top-4"
              />
            ) : (
              <>
                <AIStatusPanel />
                <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700/50">
                  <h2 className="text-xl font-bold mb-4">Getting Started</h2>
                  <p className="text-gray-400 mb-4">
                    Click on any agent to start a conversation and unlock their specialized capabilities.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span>Active - Ready to assist</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      <span>Busy - Processing tasks</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                      <span>Idle - Available on demand</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
