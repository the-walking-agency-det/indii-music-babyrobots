import React, { useState } from 'react';
import { UserTypeProvider, useUserType, UserTypeOnboarding } from '../ui/UserTypeDetector';
import ShellLayout from '../layout/ShellLayout';
import ChatInput from '../ui/ChatInput';
import { Sparkles, Zap, Music, Users, Search, Settings } from 'lucide-react';

// Main demo component wrapped in UserTypeProvider
const CoreRingDemo = () => {
  return (
    <UserTypeProvider>
      <CoreRingDemoContent />
    </UserTypeProvider>
  );
};

// Demo content component that uses user type context
const CoreRingDemoContent = () => {
  const { userType, isOnboarded, setUserType } = useUserType();
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Show onboarding if user type is not set
  if (!isOnboarded || !userType) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <UserTypeOnboarding onComplete={setUserType} />
      </div>
    );
  }

  // Handle chat input
  const handleChatInput = async (input) => {
    setIsProcessing(true);
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: getContextualResponse(input, userType),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsProcessing(false);
    }, 1500);
  };

  // Get contextual response based on user type
  const getContextualResponse = (input, userType) => {
    const responses = {
      artist: [
        "I can help you create amazing music! Let me suggest some chord progressions that might inspire you.",
        "That sounds like a great creative direction! Would you like me to help you organize your ideas into a structured track?",
        "I love your artistic vision! Let me show you some production techniques that could enhance your sound.",
        "Perfect! I can help you develop that concept further. What genre are you leaning towards?"
      ],
      listener: [
        "I understand your mood! Let me find some tracks that match what you're feeling right now.",
        "Great taste! I can create a personalized playlist based on your preferences.",
        "I can help you discover new music that fits your vibe. What's your current energy level?",
        "That's an interesting musical preference! Let me explore some similar artists you might enjoy."
      ],
      manager: [
        "I can help you find the perfect tracks for your project! What type of licensing are you looking for?",
        "Great project description! Let me search our database for tracks that match your criteria.",
        "I can analyze the metadata and suggest tracks that fit your budget and timeline.",
        "Perfect! I'll help you organize these tracks into a project playlist with all the licensing details."
      ]
    };
    
    const userResponses = responses[userType] || responses.artist;
    return userResponses[Math.floor(Math.random() * userResponses.length)];
  };

  // Create chat component
  const chatComponent = (
    <div className="max-w-4xl mx-auto">
      {/* Chat History */}
      {messages.length > 0 && (
        <div className="mb-4 max-h-60 overflow-y-auto space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Chat Input */}
      <ChatInput
        onSend={handleChatInput}
        isProcessing={isProcessing}
        userType={userType}
        enableVoice={true}
        autoFocus={false}
      />
    </div>
  );

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      <ShellLayout
        userType={userType}
        chatComponent={chatComponent}
        leftPaneContent={<DemoLeftPane userType={userType} />}
        rightPaneContent={<DemoRightPane userType={userType} />}
      >
        <DemoMainContent userType={userType} messages={messages} />
      </ShellLayout>
    </div>
  );
};

// Demo main content based on user type
const DemoMainContent = ({ userType, messages }) => {
  const getContentForUserType = () => {
    switch (userType) {
      case 'artist':
        return <ArtistDashboard messages={messages} />;
      case 'listener':
        return <ListenerDashboard messages={messages} />;
      case 'manager':
        return <ManagerDashboard messages={messages} />;
      default:
        return <DefaultDashboard messages={messages} />;
    }
  };

  return (
    <div className="p-6 h-full">
      {getContentForUserType()}
    </div>
  );
};

// Artist dashboard
const ArtistDashboard = ({ messages }) => (
  <div className="space-y-6">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Creative Studio
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Your musical ideas come to life here
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Music className="w-6 h-6 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Track Ideas
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Capture your creative sparks
        </p>
        <div className="space-y-2">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              "Summer vibes with jazz undertones"
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              "Electronic meets acoustic guitar"
            </p>
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Zap className="w-6 h-6 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Production Tools
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          AI-powered music creation
        </p>
        <div className="space-y-2">
          <button className="w-full text-left p-2 rounded bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
            Chord Progressions
          </button>
          <button className="w-full text-left p-2 rounded bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
            Melody Generator
          </button>
          <button className="w-full text-left p-2 rounded bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
            Beat Maker
          </button>
        </div>
      </div>
      
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Sparkles className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            AI Insights
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Get creative suggestions
        </p>
        {messages.length > 0 ? (
          <div className="space-y-2">
            {messages.slice(-2).map((message) => (
              <div key={message.id} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                <p className="text-blue-700 dark:text-blue-300">
                  {message.content.substring(0, 50)}...
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Start a conversation to get personalized suggestions
          </p>
        )}
      </div>
    </div>
  </div>
);

// Listener dashboard
const ListenerDashboard = ({ messages }) => (
  <div className="space-y-6">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Music Discovery
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Find your perfect soundtrack
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Search className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Mood Explorer
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Discover music that matches your vibe
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            Energetic
          </button>
          <button className="p-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-sm hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            Relaxed
          </button>
          <button className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
            Focused
          </button>
          <button className="p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded text-sm hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
            Happy
          </button>
        </div>
      </div>
      
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Music className="w-6 h-6 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Your Playlists
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Your curated music collections
        </p>
        <div className="space-y-2">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Workout Hits
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              24 tracks • 1h 32m
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Chill Vibes
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              18 tracks • 54m
            </p>
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Sparkles className="w-6 h-6 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            AI Recommendations
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Personalized music suggestions
        </p>
        {messages.length > 0 ? (
          <div className="space-y-2">
            {messages.slice(-2).map((message) => (
              <div key={message.id} className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-sm">
                <p className="text-purple-700 dark:text-purple-300">
                  {message.content.substring(0, 50)}...
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Tell me your mood to get recommendations
          </p>
        )}
      </div>
    </div>
  </div>
);

// Manager dashboard
const ManagerDashboard = ({ messages }) => (
  <div className="space-y-6">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Project Manager
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Find and license music for your projects
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Search className="w-6 h-6 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Track Search
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Find the perfect music for your project
        </p>
        <div className="space-y-2">
          <input 
            type="text" 
            placeholder="Search by genre, mood, or style..."
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-sm hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              Commercial
            </button>
            <button className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              Sync
            </button>
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Active Projects
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Your current licensing projects
        </p>
        <div className="space-y-2">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Summer Ad Campaign
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              12 tracks selected • Due: July 30
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Podcast Intro Music
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              3 tracks shortlisted • Due: Aug 5
            </p>
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Sparkles className="w-6 h-6 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Smart Suggestions
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          AI-powered licensing recommendations
        </p>
        {messages.length > 0 ? (
          <div className="space-y-2">
            {messages.slice(-2).map((message) => (
              <div key={message.id} className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
                <p className="text-yellow-700 dark:text-yellow-300">
                  {message.content.substring(0, 50)}...
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Describe your project to get track suggestions
          </p>
        )}
      </div>
    </div>
  </div>
);

// Default dashboard
const DefaultDashboard = ({ messages }) => (
  <div className="space-y-6">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        INDII Music Dashboard
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Your musical journey starts here
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Music className="w-6 h-6 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Music Hub
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Your central music workspace
        </p>
        <button className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition-colors">
          Get Started
        </button>
      </div>
      
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Sparkles className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            AI Assistant
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Get help with anything music-related
        </p>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {messages.length === 0 
              ? "Start a conversation below!" 
              : `${messages.length} message${messages.length > 1 ? 's' : ''} exchanged`
            }
          </p>
        </div>
      </div>
      
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="w-6 h-6 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Settings
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Customize your experience
        </p>
        <button className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors">
          Configure
        </button>
      </div>
    </div>
  </div>
);

// Demo left pane
const DemoLeftPane = ({ userType }) => (
  <div className="p-4 space-y-4">
    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
        🌱 Core Ring Demo
      </h4>
      <p className="text-xs text-blue-700 dark:text-blue-400">
        This is the foundational layer with chat input, basic shell, and user type detection.
      </p>
    </div>
    
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
        User Type: {userType}
      </h3>
      <div className="text-xs text-gray-600 dark:text-gray-400">
        Interface adapted for {userType} workflow
      </div>
    </div>
    
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
        Features Active
      </h3>
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Chat Interface</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Pane System</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">User Detection</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Theme System</span>
        </div>
      </div>
    </div>
  </div>
);

// Demo right pane
const DemoRightPane = ({ userType }) => (
  <div className="p-4 space-y-4">
    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
      <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">
        🎯 Next Steps
      </h4>
      <p className="text-xs text-purple-700 dark:text-purple-400">
        Ready to build the First Growth Ring with resizable panes and agent summoning!
      </p>
    </div>
    
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
        Coming Soon
      </h3>
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Modular Panes</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Agent Summoning</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Context Switching</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Memory Store</span>
        </div>
      </div>
    </div>
    
    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
        💡 Try It Out
      </h4>
      <p className="text-xs text-gray-600 dark:text-gray-400">
        Use the chat interface below to interact with the AI assistant. Notice how responses are contextual to your user type!
      </p>
    </div>
  </div>
);

export default CoreRingDemo;
