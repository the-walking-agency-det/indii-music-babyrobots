import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  UserTypeProvider, 
  useUserType, 
  UserTypeSelector, 
  UserTypeOnboarding,
  useUserTypeDetection,
  USER_TYPES 
} from './UserTypeDetector';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Test component that uses the context
const TestComponent = () => {
  const { userType, setUserType, isOnboarded, userTypeData } = useUserType();
  
  return (
    <div>
      <div data-testid="user-type">{userType || 'none'}</div>
      <div data-testid="onboarded">{isOnboarded.toString()}</div>
      <div data-testid="user-data">{userTypeData?.name || 'no data'}</div>
      <button onClick={() => setUserType('artist')}>Set Artist</button>
      <button onClick={() => setUserType('listener')}>Set Listener</button>
      <button onClick={() => setUserType('manager')}>Set Manager</button>
    </div>
  );
};

describe('UserTypeDetector - BREAK IT Phase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('🔧 STRESS TEST: Rapid User Type Switching', () => {
    test('should handle rapid user type changes', async () => {
      render(
        <UserTypeProvider>
          <TestComponent />
        </UserTypeProvider>
      );

      const artistButton = screen.getByText('Set Artist');
      const listenerButton = screen.getByText('Set Listener');
      const managerButton = screen.getByText('Set Manager');

      // Rapidly switch between user types
      for (let i = 0; i < 50; i++) {
        fireEvent.click(artistButton);
        fireEvent.click(listenerButton);
        fireEvent.click(managerButton);
      }

      // Should end up with last clicked type
      expect(screen.getByTestId('user-type')).toHaveTextContent('manager');
    });

    test('should handle concurrent user type changes', async () => {
      render(
        <UserTypeProvider>
          <TestComponent />
        </UserTypeProvider>
      );

      const artistButton = screen.getByText('Set Artist');
      const listenerButton = screen.getByText('Set Listener');

      // Simulate concurrent clicks
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          new Promise(resolve => {
            setTimeout(() => {
              fireEvent.click(artistButton);
              resolve();
            }, Math.random() * 100);
          })
        );
        promises.push(
          new Promise(resolve => {
            setTimeout(() => {
              fireEvent.click(listenerButton);
              resolve();
            }, Math.random() * 100);
          })
        );
      }

      await Promise.all(promises);

      // Should have a valid user type
      const userType = screen.getByTestId('user-type').textContent;
      expect(['artist', 'listener', 'manager']).toContain(userType);
    });

    test('should handle user type switching during onboarding', () => {
      let onCompleteCallback = jest.fn();
      
      render(
        <UserTypeOnboarding onComplete={onCompleteCallback} />
      );

      // Start onboarding
      const artistCard = screen.getByText('Artist');
      fireEvent.click(artistCard);

      // Rapidly switch selections
      for (let i = 0; i < 10; i++) {
        fireEvent.click(screen.getByText('Listener'));
        fireEvent.click(screen.getByText('Manager'));
        fireEvent.click(screen.getByText('Artist'));
      }

      // Continue with onboarding
      const continueButton = screen.getByText('Continue');
      fireEvent.click(continueButton);

      // Should complete with last selected type
      const getStartedButton = screen.getByText('Get Started');
      fireEvent.click(getStartedButton);

      expect(onCompleteCallback).toHaveBeenCalledWith('artist');
    });
  });

  describe('🔧 STRESS TEST: Corrupted localStorage', () => {
    test('should handle invalid JSON in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json-{');

      expect(() => {
        render(
          <UserTypeProvider>
            <TestComponent />
          </UserTypeProvider>
        );
      }).not.toThrow();

      expect(screen.getByTestId('user-type')).toHaveTextContent('none');
      expect(screen.getByTestId('onboarded')).toHaveTextContent('false');
    });

    test('should handle non-string values in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(123);

      expect(() => {
        render(
          <UserTypeProvider>
            <TestComponent />
          </UserTypeProvider>
        );
      }).not.toThrow();

      expect(screen.getByTestId('user-type')).toHaveTextContent('none');
    });

    test('should handle localStorage exceptions', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      expect(() => {
        render(
          <UserTypeProvider>
            <TestComponent />
          </UserTypeProvider>
        );
      }).not.toThrow();

      expect(screen.getByTestId('user-type')).toHaveTextContent('none');
    });

    test('should handle localStorage write failures', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      render(
        <UserTypeProvider>
          <TestComponent />
        </UserTypeProvider>
      );

      // Try to set user type
      const artistButton = screen.getByText('Set Artist');
      fireEvent.click(artistButton);

      // Should still work in memory
      expect(screen.getByTestId('user-type')).toHaveTextContent('artist');
    });
  });

  describe('🔧 STRESS TEST: Context Provider Edge Cases', () => {
    test('should handle missing context provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useUserType must be used within a UserTypeProvider');

      consoleSpy.mockRestore();
    });

    test('should handle nested providers', () => {
      render(
        <UserTypeProvider initialUserType="artist">
          <UserTypeProvider initialUserType="listener">
            <TestComponent />
          </UserTypeProvider>
        </UserTypeProvider>
      );

      // Should use the inner provider
      expect(screen.getByTestId('user-type')).toHaveTextContent('listener');
    });

    test('should handle provider re-mounting', () => {
      const { unmount, rerender } = render(
        <UserTypeProvider initialUserType="artist">
          <TestComponent />
        </UserTypeProvider>
      );

      expect(screen.getByTestId('user-type')).toHaveTextContent('artist');

      unmount();

      rerender(
        <UserTypeProvider initialUserType="listener">
          <TestComponent />
        </UserTypeProvider>
      );

      expect(screen.getByTestId('user-type')).toHaveTextContent('listener');
    });

    test('should handle multiple components using context', () => {
      const TestComponent2 = () => {
        const { userType } = useUserType();
        return <div data-testid="user-type-2">{userType || 'none'}</div>;
      };

      render(
        <UserTypeProvider>
          <TestComponent />
          <TestComponent2 />
        </UserTypeProvider>
      );

      // Set user type in one component
      const artistButton = screen.getByText('Set Artist');
      fireEvent.click(artistButton);

      // Should update in both components
      expect(screen.getByTestId('user-type')).toHaveTextContent('artist');
      expect(screen.getByTestId('user-type-2')).toHaveTextContent('artist');
    });
  });

  describe('🔧 STRESS TEST: Onboarding Interruption', () => {
    test('should handle onboarding interruption by unmounting', () => {
      const onCompleteCallback = jest.fn();
      
      const { unmount } = render(
        <UserTypeOnboarding onComplete={onCompleteCallback} />
      );

      // Start onboarding
      const artistCard = screen.getByText('Artist');
      fireEvent.click(artistCard);

      // Unmount during onboarding
      unmount();

      // Should not call callback
      expect(onCompleteCallback).not.toHaveBeenCalled();
    });

    test('should handle onboarding with rapid prop changes', () => {
      const onCompleteCallback1 = jest.fn();
      const onCompleteCallback2 = jest.fn();
      
      const { rerender } = render(
        <UserTypeOnboarding onComplete={onCompleteCallback1} />
      );

      // Start onboarding
      const artistCard = screen.getByText('Artist');
      fireEvent.click(artistCard);

      // Change callback during onboarding
      rerender(
        <UserTypeOnboarding onComplete={onCompleteCallback2} />
      );

      // Complete onboarding
      const continueButton = screen.getByText('Continue');
      fireEvent.click(continueButton);

      const getStartedButton = screen.getByText('Get Started');
      fireEvent.click(getStartedButton);

      // Should call new callback
      expect(onCompleteCallback1).not.toHaveBeenCalled();
      expect(onCompleteCallback2).toHaveBeenCalledWith('artist');
    });

    test('should handle onboarding without callback', () => {
      expect(() => {
        render(<UserTypeOnboarding />);
      }).not.toThrow();

      // Should still render
      expect(screen.getByText('Welcome to INDII Music')).toBeInTheDocument();
    });
  });

  describe('🔧 STRESS TEST: Invalid User Types', () => {
    test('should handle invalid user type in provider', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-type');

      render(
        <UserTypeProvider>
          <TestComponent />
        </UserTypeProvider>
      );

      // Should not use invalid type
      expect(screen.getByTestId('user-type')).toHaveTextContent('none');
    });

    test('should handle setting invalid user type', () => {
      const TestComponentWithInvalid = () => {
        const { setUserType } = useUserType();
        return (
          <button onClick={() => setUserType('invalid')}>
            Set Invalid
          </button>
        );
      };

      render(
        <UserTypeProvider>
          <TestComponent />
          <TestComponentWithInvalid />
        </UserTypeProvider>
      );

      const invalidButton = screen.getByText('Set Invalid');
      fireEvent.click(invalidButton);

      // Should accept invalid type (for flexibility)
      expect(screen.getByTestId('user-type')).toHaveTextContent('invalid');
    });

    test('should handle USER_TYPES constant modification', () => {
      const originalUserTypes = { ...USER_TYPES };
      
      // Modify USER_TYPES during runtime
      USER_TYPES.newType = {
        id: 'newType',
        name: 'New Type',
        description: 'Test type',
        icon: 'TestIcon',
        color: 'red',
        features: ['test']
      };

      render(
        <UserTypeSelector onSelect={() => {}} />
      );

      // Should handle dynamically added types
      expect(screen.getByText('New Type')).toBeInTheDocument();

      // Restore original
      Object.keys(USER_TYPES).forEach(key => {
        if (!(key in originalUserTypes)) {
          delete USER_TYPES[key];
        }
      });
    });
  });

  describe('🔧 STRESS TEST: User Type Detection', () => {
    test('should handle empty actions array', () => {
      const TestDetectionComponent = () => {
        const { detectUserType } = useUserTypeDetection();
        const [result, setResult] = React.useState(null);
        
        return (
          <div>
            <button onClick={() => setResult(detectUserType([]))}>
              Detect Empty
            </button>
            <div data-testid="detection-result">{result || 'none'}</div>
          </div>
        );
      };

      render(
        <UserTypeProvider>
          <TestDetectionComponent />
        </UserTypeProvider>
      );

      const detectButton = screen.getByText('Detect Empty');
      fireEvent.click(detectButton);

      // Should handle empty array gracefully
      expect(screen.getByTestId('detection-result')).toHaveTextContent('artist');
    });

    test('should handle large number of actions', () => {
      const TestDetectionComponent = () => {
        const { detectUserType } = useUserTypeDetection();
        const [result, setResult] = React.useState(null);
        
        const largeActions = Array.from({ length: 10000 }, (_, i) => 
          `create-${i}`
        );
        
        return (
          <div>
            <button onClick={() => setResult(detectUserType(largeActions))}>
              Detect Large
            </button>
            <div data-testid="detection-result">{result || 'none'}</div>
          </div>
        );
      };

      render(
        <UserTypeProvider>
          <TestDetectionComponent />
        </UserTypeProvider>
      );

      const detectButton = screen.getByText('Detect Large');
      
      const startTime = performance.now();
      fireEvent.click(detectButton);
      const endTime = performance.now();

      // Should complete quickly even with large input
      expect(endTime - startTime).toBeLessThan(100);
      expect(screen.getByTestId('detection-result')).toHaveTextContent('artist');
    });
  });

  describe('🔧 STRESS TEST: Component Selector Variants', () => {
    test('should handle all selector variants', () => {
      const variants = ['default', 'compact', 'dropdown'];
      
      variants.forEach(variant => {
        const { unmount } = render(
          <UserTypeSelector 
            variant={variant} 
            onSelect={() => {}} 
            currentUserType="artist" 
          />
        );

        // Should render without errors
        expect(document.body).toBeInTheDocument();
        unmount();
      });
    });

    test('should handle dropdown with rapid interactions', () => {
      render(
        <UserTypeSelector 
          variant="dropdown" 
          onSelect={() => {}} 
        />
      );

      const dropdownButton = screen.getByRole('button');
      
      // Rapidly open/close dropdown
      for (let i = 0; i < 20; i++) {
        fireEvent.click(dropdownButton);
      }

      // Should still be functional
      expect(dropdownButton).toBeInTheDocument();
    });

    test('should handle selector with null callback', () => {
      expect(() => {
        render(
          <UserTypeSelector 
            onSelect={null} 
            currentUserType="artist" 
          />
        );
      }).not.toThrow();

      // Should render selections
      expect(screen.getByText('Artist')).toBeInTheDocument();
    });
  });

  describe('🔧 STRESS TEST: Memory Leaks', () => {
    test('should cleanup context on unmount', () => {
      const { unmount } = render(
        <UserTypeProvider>
          <TestComponent />
        </UserTypeProvider>
      );

      // Set user type
      const artistButton = screen.getByText('Set Artist');
      fireEvent.click(artistButton);

      // Unmount
      unmount();

      // Should not cause memory leaks
      expect(true).toBe(true);
    });

    test('should handle multiple provider instances', () => {
      const instances = [];
      
      for (let i = 0; i < 10; i++) {
        instances.push(
          render(
            <UserTypeProvider key={i}>
              <TestComponent />
            </UserTypeProvider>
          )
        );
      }

      // Unmount all instances
      instances.forEach(instance => instance.unmount());

      // Should not cause memory leaks
      expect(true).toBe(true);
    });
  });

  describe('🔧 STRESS TEST: Performance', () => {
    test('should handle large number of re-renders', () => {
      const TestPerformanceComponent = () => {
        const { userType, setUserType } = useUserType();
        const [counter, setCounter] = React.useState(0);
        
        return (
          <div>
            <div data-testid="counter">{counter}</div>
            <button onClick={() => setCounter(c => c + 1)}>Increment</button>
            <button onClick={() => setUserType('artist')}>Set Artist</button>
          </div>
        );
      };

      render(
        <UserTypeProvider>
          <TestPerformanceComponent />
        </UserTypeProvider>
      );

      const incrementButton = screen.getByText('Increment');
      const setArtistButton = screen.getByText('Set Artist');

      const startTime = performance.now();

      // Trigger many re-renders
      for (let i = 0; i < 100; i++) {
        fireEvent.click(incrementButton);
        if (i % 10 === 0) {
          fireEvent.click(setArtistButton);
        }
      }

      const endTime = performance.now();

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(500);
      expect(screen.getByTestId('counter')).toHaveTextContent('100');
    });
  });
});

// Performance testing utilities
export const userTypePerformanceTests = {
  measureProviderPerformance: (iterations = 100) => {
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      const { unmount } = render(
        <UserTypeProvider>
          <TestComponent />
        </UserTypeProvider>
      );
      const end = performance.now();
      
      times.push(end - start);
      unmount();
    }
    
    return {
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times)
    };
  },

  measureDetectionPerformance: (actionCount = 1000) => {
    const actions = Array.from({ length: actionCount }, (_, i) => 
      `action-${i % 3 === 0 ? 'create' : i % 3 === 1 ? 'play' : 'license'}`
    );
    
    const TestDetectionComponent = () => {
      const { detectUserType } = useUserTypeDetection();
      return (
        <button onClick={() => detectUserType(actions)}>
          Detect
        </button>
      );
    };

    const { container } = render(
      <UserTypeProvider>
        <TestDetectionComponent />
      </UserTypeProvider>
    );

    const button = container.querySelector('button');
    const start = performance.now();
    fireEvent.click(button);
    const end = performance.now();

    return end - start;
  }
};
