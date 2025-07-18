import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, Music, Headphones, Briefcase, ChevronDown } from 'lucide-react';

// Context for user type across the app
const UserTypeContext = createContext();

export const useUserType = () => {
  const context = useContext(UserTypeContext);
  if (!context) {
    throw new Error('useUserType must be used within a UserTypeProvider');
  }
  return context;
};

// User type definitions
export const USER_TYPES = {
  artist: {
    id: 'artist',
    name: 'Artist',
    description: 'Create, produce, and manage your music',
    icon: Music,
    color: 'purple',
    features: ['track creation', 'production tools', 'release planning', 'collaboration']
  },
  listener: {
    id: 'listener',
    name: 'Listener',
    description: 'Discover and enjoy music experiences',
    icon: Headphones,
    color: 'blue',
    features: ['music discovery', 'mood matching', 'playlists', 'recommendations']
  },
  manager: {
    id: 'manager',
    name: 'Manager',
    description: 'Find and license music for projects',
    icon: Briefcase,
    color: 'green',
    features: ['music search', 'licensing', 'project management', 'metadata analysis']
  }
};

// Provider component
export const UserTypeProvider = ({ children, initialUserType = null }) => {
  const [userType, setUserType] = useState(initialUserType);
  const [isOnboarded, setIsOnboarded] = useState(false);

  // Load user type from localStorage on mount
  useEffect(() => {
    const savedUserType = localStorage.getItem('indii-user-type');
    const savedOnboarded = localStorage.getItem('indii-user-onboarded');
    
    if (savedUserType && USER_TYPES[savedUserType]) {
      setUserType(savedUserType);
      setIsOnboarded(savedOnboarded === 'true');
    }
  }, []);

  // Save user type to localStorage when it changes
  useEffect(() => {
    if (userType) {
      localStorage.setItem('indii-user-type', userType);
      localStorage.setItem('indii-user-onboarded', 'true');
      setIsOnboarded(true);
    }
  }, [userType]);

  const value = {
    userType,
    setUserType,
    isOnboarded,
    setIsOnboarded,
    userTypeData: userType ? USER_TYPES[userType] : null
  };

  return (
    <UserTypeContext.Provider value={value}>
      {children}
    </UserTypeContext.Provider>
  );
};

// User type selector component
export const UserTypeSelector = ({ 
  onSelect, 
  currentUserType = null, 
  showDescription = true,
  variant = 'default' // 'default', 'compact', 'dropdown'
}) => {
  const [selectedType, setSelectedType] = useState(currentUserType);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSelect = (type) => {
    setSelectedType(type);
    if (onSelect) {
      onSelect(type);
    }
    setIsDropdownOpen(false);
  };

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-between w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <div className="flex items-center space-x-2">
            {selectedType ? (
              <>
                {React.createElement(USER_TYPES[selectedType].icon, { className: "w-4 h-4" })}
                <span>{USER_TYPES[selectedType].name}</span>
              </>
            ) : (
              <>
                <User className="w-4 h-4" />
                <span>Select user type</span>
              </>
            )}
          </div>
          <ChevronDown className="w-4 h-4" />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
            {Object.values(USER_TYPES).map((type) => (
              <button
                key={type.id}
                onClick={() => handleSelect(type.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 first:rounded-t-md last:rounded-b-md ${
                  selectedType === type.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                {React.createElement(type.icon, { 
                  className: `w-4 h-4 text-${type.color}-500` 
                })}
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {type.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {type.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex space-x-2">
        {Object.values(USER_TYPES).map((type) => (
          <button
            key={type.id}
            onClick={() => handleSelect(type.id)}
            className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-md border transition-all duration-200 ${
              selectedType === type.id
                ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20 text-${type.color}-700 dark:text-${type.color}-300`
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
            }`}
          >
            {React.createElement(type.icon, { 
              className: `w-4 h-4 ${selectedType === type.id ? `text-${type.color}-500` : 'text-gray-500'}` 
            })}
            <span>{type.name}</span>
          </button>
        ))}
      </div>
    );
  }

  // Default variant - cards
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.values(USER_TYPES).map((type) => (
        <button
          key={type.id}
          onClick={() => handleSelect(type.id)}
          className={`p-6 text-left rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
            selectedType === type.id
              ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20 ring-2 ring-${type.color}-500/20`
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <div className="flex items-center space-x-3 mb-3">
            {React.createElement(type.icon, { 
              className: `w-6 h-6 text-${type.color}-500` 
            })}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {type.name}
            </h3>
          </div>
          
          {showDescription && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {type.description}
            </p>
          )}
          
          <div className="space-y-1">
            {type.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className={`w-1.5 h-1.5 rounded-full bg-${type.color}-500`} />
                <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
};

// Onboarding component
export const UserTypeOnboarding = ({ onComplete }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (step === 1 && selectedType) {
      setStep(2);
    } else if (step === 2) {
      onComplete(selectedType);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Welcome to INDII Music
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Let's personalize your experience based on how you use music
        </p>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              What describes you best?
            </h2>
          </div>
          
          <UserTypeSelector
            onSelect={setSelectedType}
            currentUserType={selectedType}
            showDescription={true}
            variant="default"
          />
          
          <div className="flex justify-center">
            <button
              onClick={handleNext}
              disabled={!selectedType}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                selectedType
                  ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 2 && selectedType && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Perfect! You're all set as an {USER_TYPES[selectedType].name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your interface will be optimized for {USER_TYPES[selectedType].description.toLowerCase()}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Features you'll have access to:
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {USER_TYPES[selectedType].features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full bg-${USER_TYPES[selectedType].color}-500`} />
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleBack}
              className="px-6 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 transition-all duration-200"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for automatic user type detection based on usage patterns
export const useUserTypeDetection = () => {
  const { userType, setUserType } = useUserType();
  
  const detectUserType = (actions) => {
    // Simple heuristic-based detection
    const artistActions = actions.filter(action => 
      action.includes('create') || action.includes('produce') || action.includes('track')
    ).length;
    
    const listenerActions = actions.filter(action => 
      action.includes('play') || action.includes('discover') || action.includes('mood')
    ).length;
    
    const managerActions = actions.filter(action => 
      action.includes('license') || action.includes('search') || action.includes('metadata')
    ).length;
    
    const scores = {
      artist: artistActions,
      listener: listenerActions,
      manager: managerActions
    };
    
    const detectedType = Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    )[0];
    
    return detectedType;
  };
  
  return { detectUserType };
};

export default UserTypeSelector;
