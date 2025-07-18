import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Settings, Users, Music, Search } from 'lucide-react';

const ShellLayout = ({ 
  children, 
  userType = 'artist',
  leftPaneContent = null,
  rightPaneContent = null,
  chatComponent = null 
}) => {
  const [leftPaneOpen, setLeftPaneOpen] = useState(true);
  const [rightPaneOpen, setRightPaneOpen] = useState(false);
  const [leftPaneWidth, setLeftPaneWidth] = useState(280);
  const [rightPaneWidth, setRightPaneWidth] = useState(320);
  const [isLeftPaneMinimized, setIsLeftPaneMinimized] = useState(false);
  const [isRightPaneMinimized, setIsRightPaneMinimized] = useState(false);

  // Persist pane states in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('shell-layout-state');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setLeftPaneOpen(state.leftPaneOpen ?? true);
        setRightPaneOpen(state.rightPaneOpen ?? false);
        setLeftPaneWidth(state.leftPaneWidth ?? 280);
        setRightPaneWidth(state.rightPaneWidth ?? 320);
        setIsLeftPaneMinimized(state.isLeftPaneMinimized ?? false);
        setIsRightPaneMinimized(state.isRightPaneMinimized ?? false);
      } catch (e) {
        console.error('Error loading layout state:', e);
      }
    }
  }, []);

  useEffect(() => {
    const state = {
      leftPaneOpen,
      rightPaneOpen,
      leftPaneWidth,
      rightPaneWidth,
      isLeftPaneMinimized,
      isRightPaneMinimized
    };
    localStorage.setItem('shell-layout-state', JSON.stringify(state));
  }, [leftPaneOpen, rightPaneOpen, leftPaneWidth, rightPaneWidth, isLeftPaneMinimized, isRightPaneMinimized]);

  // User type specific pane content
  const getLeftPaneContent = () => {
    if (leftPaneContent) return leftPaneContent;
    
    switch (userType) {
      case 'artist':
        return <ArtistLeftPane />;
      case 'listener':
        return <ListenerLeftPane />;
      case 'manager':
        return <ManagerLeftPane />;
      default:
        return <DefaultLeftPane />;
    }
  };

  const getRightPaneContent = () => {
    if (rightPaneContent) return rightPaneContent;
    
    switch (userType) {
      case 'artist':
        return <ArtistRightPane />;
      case 'listener':
        return <ListenerRightPane />;
      case 'manager':
        return <ManagerRightPane />;
      default:
        return <DefaultRightPane />;
    }
  };

  const handleLeftPaneResize = (e) => {
    const startX = e.clientX;
    const startWidth = leftPaneWidth;

    const handleMouseMove = (e) => {
      const newWidth = Math.max(200, Math.min(500, startWidth + (e.clientX - startX)));
      setLeftPaneWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleRightPaneResize = (e) => {
    const startX = e.clientX;
    const startWidth = rightPaneWidth;

    const handleMouseMove = (e) => {
      const newWidth = Math.max(200, Math.min(500, startWidth - (e.clientX - startX)));
      setRightPaneWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      {/* Left Pane */}
      <div 
        className={`relative flex-shrink-0 transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700 ${
          leftPaneOpen ? 'opacity-100' : 'opacity-0 -translate-x-full'
        } ${isLeftPaneMinimized ? 'w-16' : ''}`}
        style={{ 
          width: leftPaneOpen ? (isLeftPaneMinimized ? 64 : leftPaneWidth) : 0,
          minWidth: leftPaneOpen ? (isLeftPaneMinimized ? 64 : 200) : 0 
        }}
      >
        {/* Left Pane Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          {!isLeftPaneMinimized && (
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {userType === 'artist' ? 'Creative Tools' : 
               userType === 'listener' ? 'Discovery' : 
               userType === 'manager' ? 'Project Hub' : 'Navigation'}
            </h2>
          )}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsLeftPaneMinimized(!isLeftPaneMinimized)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {isLeftPaneMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setLeftPaneOpen(false)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Left Pane Content */}
        <div className="flex-1 overflow-auto scrollbar-custom">
          {!isLeftPaneMinimized && getLeftPaneContent()}
          {isLeftPaneMinimized && <MinimizedLeftPane userType={userType} />}
        </div>

        {/* Left Pane Resize Handle */}
        {leftPaneOpen && !isLeftPaneMinimized && (
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-e-resize hover:bg-blue-500/20 transition-colors"
            onMouseDown={handleLeftPaneResize}
          />
        )}
      </div>

      {/* Left Pane Toggle (when closed) */}
      {!leftPaneOpen && (
        <button
          onClick={() => setLeftPaneOpen(true)}
          className="fixed top-4 left-4 z-10 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>

        {/* Chat Interface (Bottom) */}
        {chatComponent && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
            {chatComponent}
          </div>
        )}
      </div>

      {/* Right Pane */}
      <div 
        className={`relative flex-shrink-0 transition-all duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700 ${
          rightPaneOpen ? 'opacity-100' : 'opacity-0 translate-x-full'
        } ${isRightPaneMinimized ? 'w-16' : ''}`}
        style={{ 
          width: rightPaneOpen ? (isRightPaneMinimized ? 64 : rightPaneWidth) : 0,
          minWidth: rightPaneOpen ? (isRightPaneMinimized ? 64 : 200) : 0 
        }}
      >
        {/* Right Pane Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setRightPaneOpen(false)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsRightPaneMinimized(!isRightPaneMinimized)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {isRightPaneMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
          </div>
          {!isRightPaneMinimized && (
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {userType === 'artist' ? 'Track Details' : 
               userType === 'listener' ? 'Now Playing' : 
               userType === 'manager' ? 'Metadata' : 'Details'}
            </h2>
          )}
        </div>

        {/* Right Pane Content */}
        <div className="flex-1 overflow-auto scrollbar-custom">
          {!isRightPaneMinimized && getRightPaneContent()}
          {isRightPaneMinimized && <MinimizedRightPane userType={userType} />}
        </div>

        {/* Right Pane Resize Handle */}
        {rightPaneOpen && !isRightPaneMinimized && (
          <div
            className="absolute top-0 left-0 w-1 h-full cursor-w-resize hover:bg-blue-500/20 transition-colors"
            onMouseDown={handleRightPaneResize}
          />
        )}
      </div>

      {/* Right Pane Toggle (when closed) */}
      {!rightPaneOpen && (
        <button
          onClick={() => setRightPaneOpen(true)}
          className="fixed top-4 right-4 z-10 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      )}
    </div>
  );
};

// Placeholder components for different user types
const ArtistLeftPane = () => (
  <div className="p-4 space-y-4">
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Creative Tools</h3>
      <div className="space-y-1">
        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">New Track</button>
        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">Song Ideas</button>
        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">Reference Board</button>
      </div>
    </div>
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">My Tracks</h3>
      <div className="space-y-1">
        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">In Progress</button>
        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">Released</button>
        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">Drafts</button>
      </div>
    </div>
  </div>
);

const ListenerLeftPane = () => (
  <div className="p-4 space-y-4">
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Discovery</h3>
      <div className="space-y-1">
        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">Mood Explorer</button>
        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">New Releases</button>
        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">Recommendations</button>
      </div>
    </div>
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">My Music</h3>
      <div className="space-y-1">
        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">Playlists</button>
        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">Favorites</button>
        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">Recently Played</button>
      </div>
    </div>
  </div>
);

const ManagerLeftPane = () => (
  <div className="p-4 space-y-4">
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Search & License</h3>
      <div className="space-y-1">
        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">Quick Search</button>
        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">Advanced Filter</button>
        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">License History</button>
      </div>
    </div>
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Projects</h3>
      <div className="space-y-1">
        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">Active Projects</button>
        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">Playlists</button>
        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">Saved Tracks</button>
      </div>
    </div>
  </div>
);

const DefaultLeftPane = () => (
  <div className="p-4 space-y-4">
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Navigation</h3>
      <div className="space-y-1">
        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">Dashboard</button>
        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">Explore</button>
        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">Settings</button>
      </div>
    </div>
  </div>
);

const ArtistRightPane = () => (
  <div className="p-4 space-y-4">
    <div className="text-center text-gray-500 dark:text-gray-400">
      <Music className="w-8 h-8 mx-auto mb-2" />
      <p className="text-sm">Select a track to view details</p>
    </div>
  </div>
);

const ListenerRightPane = () => (
  <div className="p-4 space-y-4">
    <div className="text-center text-gray-500 dark:text-gray-400">
      <Music className="w-8 h-8 mx-auto mb-2" />
      <p className="text-sm">Nothing playing</p>
    </div>
  </div>
);

const ManagerRightPane = () => (
  <div className="p-4 space-y-4">
    <div className="text-center text-gray-500 dark:text-gray-400">
      <Search className="w-8 h-8 mx-auto mb-2" />
      <p className="text-sm">Select a track to view metadata</p>
    </div>
  </div>
);

const DefaultRightPane = () => (
  <div className="p-4 space-y-4">
    <div className="text-center text-gray-500 dark:text-gray-400">
      <Settings className="w-8 h-8 mx-auto mb-2" />
      <p className="text-sm">Details will appear here</p>
    </div>
  </div>
);

const MinimizedLeftPane = ({ userType }) => (
  <div className="p-2 space-y-2">
    <button className="w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
      {userType === 'artist' ? <Music className="w-4 h-4 mx-auto" /> : 
       userType === 'listener' ? <Search className="w-4 h-4 mx-auto" /> : 
       userType === 'manager' ? <Users className="w-4 h-4 mx-auto" /> : 
       <Settings className="w-4 h-4 mx-auto" />}
    </button>
  </div>
);

const MinimizedRightPane = ({ userType }) => (
  <div className="p-2 space-y-2">
    <button className="w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
      <Settings className="w-4 h-4 mx-auto" />
    </button>
  </div>
);

export default ShellLayout;
