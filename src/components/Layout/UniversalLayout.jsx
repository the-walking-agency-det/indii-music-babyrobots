import React from 'react';
import { UserTypeProvider, useUserType } from '../ui/UserTypeDetector';
import ShellLayout from './ShellLayout';
import ChatInput from '../ui/ChatInput';

/**
 * UNIVERSAL LAYOUT SYSTEM - YOLO CONSOLIDATION
 * 
 * This replaces:
 * - MainLayout.jsx
 * - RootLayout.jsx  
 * - ShellLayout.jsx (uses it as foundation)
 * 
 * One layout to rule them all!
 */

const UniversalLayout = ({ 
  children, 
  chatEnabled = true,
  leftPaneContent = null,
  rightPaneContent = null,
  userType = null,
  className = "",
  ...props 
}) => {
  // Auto-detect if we're in a UserTypeProvider or create one
  const LayoutContent = () => {
    try {
      const { userType: contextUserType } = useUserType();
      const effectiveUserType = userType || contextUserType;
      
      return (
        <UniversalLayoutContent 
          userType={effectiveUserType}
          chatEnabled={chatEnabled}
          leftPaneContent={leftPaneContent}
          rightPaneContent={rightPaneContent}
          className={className}
          {...props}
        >
          {children}
        </UniversalLayoutContent>
      );
    } catch (error) {
      // Not in a UserTypeProvider, create one
      return (
        <UserTypeProvider initialUserType={userType}>
          <UniversalLayoutContent 
            userType={userType}
            chatEnabled={chatEnabled}
            leftPaneContent={leftPaneContent}
            rightPaneContent={rightPaneContent}
            className={className}
            {...props}
          >
            {children}
          </UniversalLayoutContent>
        </UserTypeProvider>
      );
    }
  };

  return <LayoutContent />;
};

const UniversalLayoutContent = ({ 
  children, 
  userType,
  chatEnabled,
  leftPaneContent,
  rightPaneContent,
  className,
  ...props 
}) => {
  const { userType: contextUserType } = useUserType();
  const effectiveUserType = userType || contextUserType || 'artist';

  // Create chat component if enabled
  const chatComponent = chatEnabled ? (
    <ChatInput 
      onSend={(message) => {
        // TODO: Connect to unified chat system
        console.log('Chat message:', message);
      }}
      userType={effectiveUserType}
      enableVoice={true}
      autoFocus={false}
    />
  ) : null;

  return (
    <div className={`universal-layout ${className}`} {...props}>
      <ShellLayout
        userType={effectiveUserType}
        leftPaneContent={leftPaneContent}
        rightPaneContent={rightPaneContent}
        chatComponent={chatComponent}
      >
        {children}
      </ShellLayout>
    </div>
  );
};

// Layout variants for different use cases
export const DashboardLayout = ({ children, ...props }) => (
  <UniversalLayout 
    chatEnabled={true}
    leftPaneContent={<DashboardLeftPane />}
    rightPaneContent={<DashboardRightPane />}
    {...props}
  >
    {children}
  </UniversalLayout>
);

export const ProfileLayout = ({ children, ...props }) => (
  <UniversalLayout 
    chatEnabled={false}
    leftPaneContent={<ProfileLeftPane />}
    rightPaneContent={<ProfileRightPane />}
    {...props}
  >
    {children}
  </UniversalLayout>
);

export const AuthLayout = ({ children, ...props }) => (
  <UniversalLayout 
    chatEnabled={false}
    leftPaneContent={null}
    rightPaneContent={null}
    {...props}
  >
    {children}
  </UniversalLayout>
);

export const MinimalLayout = ({ children, ...props }) => (
  <UniversalLayout 
    chatEnabled={false}
    leftPaneContent={null}
    rightPaneContent={null}
    {...props}
  >
    {children}
  </UniversalLayout>
);

// Specialized pane content
const DashboardLeftPane = () => (
  <div className="p-4 space-y-4">
    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
      Dashboard Navigation
    </h3>
    <div className="space-y-1">
      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
        Overview
      </button>
      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
        Analytics
      </button>
      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
        Projects
      </button>
      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
        Settings
      </button>
    </div>
  </div>
);

const DashboardRightPane = () => (
  <div className="p-4 space-y-4">
    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
      Quick Actions
    </h3>
    <div className="space-y-2">
      <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors text-sm">
        New Project
      </button>
      <button className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors text-sm">
        Upload Track
      </button>
      <button className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition-colors text-sm">
        Create Playlist
      </button>
    </div>
  </div>
);

const ProfileLeftPane = () => (
  <div className="p-4 space-y-4">
    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
      Profile Sections
    </h3>
    <div className="space-y-1">
      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
        Basic Info
      </button>
      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
        Portfolio
      </button>
      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
        Preferences
      </button>
      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
        Privacy
      </button>
    </div>
  </div>
);

const ProfileRightPane = () => (
  <div className="p-4 space-y-4">
    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
      Profile Help
    </h3>
    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
      <p>Complete your profile to get better recommendations and connect with the right people.</p>
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
        <p className="text-blue-700 dark:text-blue-300 text-xs">
          💡 Tip: Add your genre preferences to get more relevant opportunities
        </p>
      </div>
    </div>
  </div>
);

export default UniversalLayout;
