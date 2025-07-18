import React, { useState } from 'react';
import ArtistWorkspace from '../workspaces/ArtistWorkspace';
import ListenerWorkspace from '../workspaces/ListenerWorkspace';
import ManagerWorkspace from '../workspaces/ManagerWorkspace';

const Shell: React.FC = () => {
  const [navigationStack, setNavigationStack] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const savedStack = localStorage.getItem('navigationStack');
      return savedStack ? JSON.parse(savedStack) : ['home'];
    }
    return ['home'];
  });
  const [currentView, setCurrentView] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedView = localStorage.getItem('currentView');
      return savedView ? savedView : 'home';
    }
    return 'home';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('navigationStack', JSON.stringify(navigationStack));
    }
  }, [navigationStack]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentView', currentView);
    }
  }, [currentView]);
  const [userType, setUserType] = useState<'artist' | 'listener' | 'manager'>('artist');

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <p>Welcome to your personalized music workspace. Select a user type or explore options.</p>;
      case 'artist-dashboard':
        return <ArtistWorkspace />;
      case 'listener-dashboard':
        return <ListenerWorkspace />;
      case 'manager-dashboard':
        return <ManagerWorkspace />;
      default:
        return <p>Content not found.</p>;
    }
  };

  const navigateTo = (view: string) => {
    setNavigationStack(prev => [...prev, view]);
    setCurrentView(view);
  };

  const goBack = () => {
    if (navigationStack.length > 1) {
      const newStack = navigationStack.slice(0, -1);
      setNavigationStack(newStack);
      setCurrentView(newStack[newStack.length - 1]);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left Pane */}
      <div
        className={`w-1/4 bg-gray-800 p-4 transition-all duration-300 ease-in-out border-r border-gray-700 ${
          showLeftPane ? 'block' : 'hidden'
        }`}
      >
      >
        <h2 className="text-xl font-bold mb-4">Contextual Side Pane</h2>
        {/* Placeholder for content */}
        <p>Artist bio, music player, visual identity...</p>
      </div>

      {/* Main Workspace Pane */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Primary Workspace Pane</h1>
          
          {/* Breadcrumbs */}
          <div className="mb-4 text-sm text-gray-400">
            {navigationStack.map((view, index) => (
              <span key={view}>
                {index > 0 && " > "}
                <button 
                  onClick={() => setCurrentView(view)}
                  className="text-blue-400 hover:underline"
                >
                  {view.charAt(0).toUpperCase() + view.slice(1).replace(/-/g, ' ')}
                </button>
              </span>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="mb-4 flex space-x-2">
            <button 
              onClick={goBack}
              disabled={navigationStack.length <= 1}
              className="p-2 rounded-md bg-blue-500 hover:bg-blue-600 focus:outline-none disabled:opacity-50"
            >
              Back
            </button>
            <button 
              onClick={() => navigateTo('artist-dashboard')}
              className="p-2 rounded-md bg-blue-500 hover:bg-blue-600 focus:outline-none"
            >
              Artist Dashboard
            </button>
            <button 
              onClick={() => navigateTo('listener-dashboard')}
              className="p-2 rounded-md bg-blue-500 hover:bg-blue-600 focus:outline-none"
            >
              Listener Dashboard
            </button>
            <button 
              onClick={() => navigateTo('manager-dashboard')}
              className="p-2 rounded-md bg-blue-500 hover:bg-blue-600 focus:outline-none"
            >
              Manager Dashboard
            </button>
          </div>

          {renderContent()}

          {/* Agent Interaction Zone */}
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-bold mb-2">Agent Interaction Zone</h3>
            <p>Agents appear when needed: suggest artists, generate playlists, explain lyrics...</p>
            <p>Maybe: “Curator,” “Archivist,” “Explorer,” etc.</p>
            <p>These are modular & summonable via chat/voice/button</p>
          </div>
        </div>

        {/* Chat-style interface input */}
        <div className="p-4 border-t border-gray-700">
          <input
            type="text"
            placeholder="Start exploring or type a command..."
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Right Pane */}
      <div
        className={`w-1/4 bg-gray-800 p-4 transition-all duration-300 ease-in-out border-l border-gray-700 ${
          showRightPane ? 'block' : 'hidden'
        }`}
      >
      >
        <h2 className="text-xl font-bold mb-4">Threaded Exploration Pane</h2>
        {/* Placeholder for content */}
        <p>Every “deep dive” opens a pane — lyrics, collaborators, influence map, discography...</p>
      </div>

      {/* Toggle Buttons */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <button
          onClick={() => setShowLeftPane(!showLeftPane)}
          className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 focus:outline-none"
        >
          {showLeftPane ? 'Hide Left' : 'Show Left'}
        </button>
        <button
          onClick={() => setShowRightPane(!showRightPane)}
          className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 focus:outline-none"
        >
          {showRightPane ? 'Hide Right' : 'Show Right'}
        </button>
      </div>
    </div>
  );
};

export default Shell;