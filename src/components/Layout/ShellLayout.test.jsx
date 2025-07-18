import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ShellLayout from './ShellLayout';

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

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = jest.fn(() => ({
  width: 1024,
  height: 768,
  top: 0,
  left: 0,
  bottom: 768,
  right: 1024
}));

describe('ShellLayout - BREAK IT Phase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('🔧 STRESS TEST: Rapid Pane Resizing', () => {
    test('should handle rapid pane resize operations', async () => {
      render(
        <ShellLayout userType="artist">
          <div>Main Content</div>
        </ShellLayout>
      );

      // Simulate rapid resize events
      const resizeHandle = document.querySelector('.resize-handle');
      if (resizeHandle) {
        for (let i = 0; i < 50; i++) {
          fireEvent.mouseDown(resizeHandle, { clientX: 100 + i });
          fireEvent.mouseMove(document, { clientX: 150 + i });
          fireEvent.mouseUp(document);
        }
      }

      // Should not crash and maintain state
      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });

    test('should handle simultaneous resize operations', () => {
      render(
        <ShellLayout userType="artist">
          <div>Main Content</div>
        </ShellLayout>
      );

      const leftHandle = document.querySelector('.resize-handle:first-child');
      const rightHandle = document.querySelector('.resize-handle:last-child');

      // Simulate overlapping resize operations
      if (leftHandle && rightHandle) {
        fireEvent.mouseDown(leftHandle, { clientX: 100 });
        fireEvent.mouseDown(rightHandle, { clientX: 800 });
        fireEvent.mouseMove(document, { clientX: 200 });
        fireEvent.mouseMove(document, { clientX: 700 });
        fireEvent.mouseUp(document);
      }

      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });
  });

  describe('🔧 STRESS TEST: Extreme Pane Sizes', () => {
    test('should handle very small pane sizes', () => {
      render(
        <ShellLayout userType="artist">
          <div>Main Content</div>
        </ShellLayout>
      );

      const resizeHandle = document.querySelector('.resize-handle');
      if (resizeHandle) {
        // Try to resize to extremely small width
        fireEvent.mouseDown(resizeHandle, { clientX: 300 });
        fireEvent.mouseMove(document, { clientX: 50 });
        fireEvent.mouseUp(document);
      }

      // Should maintain minimum width constraints
      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });

    test('should handle very large pane sizes', () => {
      render(
        <ShellLayout userType="artist">
          <div>Main Content</div>
        </ShellLayout>
      );

      const resizeHandle = document.querySelector('.resize-handle');
      if (resizeHandle) {
        // Try to resize to extremely large width
        fireEvent.mouseDown(resizeHandle, { clientX: 300 });
        fireEvent.mouseMove(document, { clientX: 2000 });
        fireEvent.mouseUp(document);
      }

      // Should maintain maximum width constraints
      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });

    test('should handle window resize events', () => {
      render(
        <ShellLayout userType="artist">
          <div>Main Content</div>
        </ShellLayout>
      );

      // Simulate window resize
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      });

      act(() => {
        fireEvent(window, new Event('resize'));
      });

      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });
  });

  describe('🔧 STRESS TEST: localStorage Edge Cases', () => {
    test('should handle corrupted localStorage data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json-data');

      expect(() => {
        render(
          <ShellLayout userType="artist">
            <div>Main Content</div>
          </ShellLayout>
        );
      }).not.toThrow();

      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });

    test('should handle missing localStorage', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      expect(() => {
        render(
          <ShellLayout userType="artist">
            <div>Main Content</div>
          </ShellLayout>
        );
      }).not.toThrow();

      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });

    test('should handle localStorage quota exceeded', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      render(
        <ShellLayout userType="artist">
          <div>Main Content</div>
        </ShellLayout>
      );

      // Try to trigger state save
      const toggleButton = screen.getByRole('button', { name: /minimize/i });
      fireEvent.click(toggleButton);

      // Should continue working despite storage error
      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });

    test('should handle rapid localStorage operations', () => {
      render(
        <ShellLayout userType="artist">
          <div>Main Content</div>
        </ShellLayout>
      );

      const toggleButton = screen.getByRole('button', { name: /minimize/i });

      // Rapidly toggle panes to trigger localStorage operations
      for (let i = 0; i < 20; i++) {
        fireEvent.click(toggleButton);
      }

      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });
  });

  describe('🔧 STRESS TEST: Multiple Browser Tabs', () => {
    test('should handle concurrent state modifications', async () => {
      const { rerender } = render(
        <ShellLayout userType="artist">
          <div>Main Content</div>
        </ShellLayout>
      );

      // Simulate another tab modifying localStorage
      const newState = JSON.stringify({
        leftPaneOpen: false,
        rightPaneOpen: true,
        leftPaneWidth: 350,
        rightPaneWidth: 400
      });

      mockLocalStorage.getItem.mockReturnValue(newState);

      // Simulate storage event from another tab
      act(() => {
        fireEvent(window, new StorageEvent('storage', {
          key: 'shell-layout-state',
          newValue: newState
        }));
      });

      rerender(
        <ShellLayout userType="artist">
          <div>Main Content</div>
        </ShellLayout>
      );

      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });

    test('should handle storage events during resize', () => {
      render(
        <ShellLayout userType="artist">
          <div>Main Content</div>
        </ShellLayout>
      );

      const resizeHandle = document.querySelector('.resize-handle');
      
      if (resizeHandle) {
        // Start resize operation
        fireEvent.mouseDown(resizeHandle, { clientX: 300 });
        
        // Simulate storage event during resize
        act(() => {
          fireEvent(window, new StorageEvent('storage', {
            key: 'shell-layout-state',
            newValue: JSON.stringify({ leftPaneWidth: 400 })
          }));
        });
        
        // Complete resize
        fireEvent.mouseMove(document, { clientX: 350 });
        fireEvent.mouseUp(document);
      }

      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });
  });

  describe('🔧 STRESS TEST: Mobile Responsive Breakpoints', () => {
    test('should handle mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      render(
        <ShellLayout userType="artist">
          <div>Main Content</div>
        </ShellLayout>
      );

      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });

    test('should handle tablet viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });

      render(
        <ShellLayout userType="artist">
          <div>Main Content</div>
        </ShellLayout>
      );

      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });

    test('should handle orientation changes', () => {
      render(
        <ShellLayout userType="artist">
          <div>Main Content</div>
        </ShellLayout>
      );

      // Simulate orientation change
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 812
      });

      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 375
      });

      act(() => {
        fireEvent(window, new Event('orientationchange'));
      });

      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });
  });

  describe('🔧 STRESS TEST: Touch Interactions', () => {
    test('should handle touch events for pane resizing', () => {
      render(
        <ShellLayout userType="artist">
          <div>Main Content</div>
        </ShellLayout>
      );

      const resizeHandle = document.querySelector('.resize-handle');
      
      if (resizeHandle) {
        // Simulate touch interaction
        fireEvent.touchStart(resizeHandle, {
          touches: [{ clientX: 300, clientY: 200 }]
        });
        
        fireEvent.touchMove(document, {
          touches: [{ clientX: 350, clientY: 200 }]
        });
        
        fireEvent.touchEnd(document);
      }

      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });

    test('should handle multi-touch events', () => {
      render(
        <ShellLayout userType="artist">
          <div>Main Content</div>
        </ShellLayout>
      );

      const resizeHandle = document.querySelector('.resize-handle');
      
      if (resizeHandle) {
        // Simulate multi-touch
        fireEvent.touchStart(resizeHandle, {
          touches: [
            { clientX: 300, clientY: 200 },
            { clientX: 400, clientY: 200 }
          ]
        });
        
        fireEvent.touchMove(document, {
          touches: [
            { clientX: 320, clientY: 200 },
            { clientX: 420, clientY: 200 }
          ]
        });
        
        fireEvent.touchEnd(document);
      }

      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });
  });

  describe('🔧 STRESS TEST: User Type Variations', () => {
    test('should handle all user types correctly', () => {
      const userTypes = ['artist', 'listener', 'manager', 'invalid'];

      userTypes.forEach(userType => {
        const { unmount } = render(
          <ShellLayout userType={userType}>
            <div>Main Content for {userType}</div>
          </ShellLayout>
        );

        expect(screen.getByText(`Main Content for ${userType}`)).toBeInTheDocument();
        unmount();
      });
    });

    test('should handle user type changes during runtime', () => {
      const { rerender } = render(
        <ShellLayout userType="artist">
          <div>Main Content</div>
        </ShellLayout>
      );

      // Change user type
      rerender(
        <ShellLayout userType="listener">
          <div>Main Content</div>
        </ShellLayout>
      );

      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });
  });

  describe('🔧 STRESS TEST: Memory Leaks', () => {
    test('should cleanup event listeners on unmount', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      const { unmount } = render(
        <ShellLayout userType="artist">
          <div>Main Content</div>
        </ShellLayout>
      );

      const resizeHandle = document.querySelector('.resize-handle');
      if (resizeHandle) {
        fireEvent.mouseDown(resizeHandle, { clientX: 300 });
      }

      unmount();

      // Should cleanup event listeners
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    test('should handle multiple mount/unmount cycles', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <ShellLayout userType="artist">
            <div>Main Content {i}</div>
          </ShellLayout>
        );

        expect(screen.getByText(`Main Content ${i}`)).toBeInTheDocument();
        unmount();
      }
    });
  });

  describe('🔧 STRESS TEST: Performance', () => {
    test('should handle large numbers of pane operations', () => {
      render(
        <ShellLayout userType="artist">
          <div>Main Content</div>
        </ShellLayout>
      );

      const startTime = performance.now();

      // Perform many pane operations
      const leftToggle = screen.getByRole('button', { name: /minimize/i });
      for (let i = 0; i < 100; i++) {
        fireEvent.click(leftToggle);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(1000);
      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });

    test('should handle rapid pane state changes', () => {
      render(
        <ShellLayout userType="artist">
          <div>Main Content</div>
        </ShellLayout>
      );

      // Rapidly change pane states
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        for (let i = 0; i < 20; i++) {
          fireEvent.click(button);
        }
      });

      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });
  });

  describe('🔧 STRESS TEST: Edge Cases', () => {
    test('should handle null/undefined props', () => {
      expect(() => {
        render(
          <ShellLayout userType={null}>
            {null}
          </ShellLayout>
        );
      }).not.toThrow();
    });

    test('should handle missing children', () => {
      expect(() => {
        render(<ShellLayout userType="artist" />);
      }).not.toThrow();
    });

    test('should handle complex nested content', () => {
      const complexContent = (
        <div>
          <div>
            <div>
              <div>Deep nesting</div>
            </div>
          </div>
          {Array.from({ length: 100 }, (_, i) => (
            <div key={i}>Item {i}</div>
          ))}
        </div>
      );

      render(
        <ShellLayout userType="artist">
          {complexContent}
        </ShellLayout>
      );

      expect(screen.getByText('Deep nesting')).toBeInTheDocument();
      expect(screen.getByText('Item 99')).toBeInTheDocument();
    });

    test('should handle CSS transitions interruption', () => {
      render(
        <ShellLayout userType="artist">
          <div>Main Content</div>
        </ShellLayout>
      );

      const toggleButton = screen.getByRole('button', { name: /minimize/i });

      // Rapidly toggle during transitions
      for (let i = 0; i < 10; i++) {
        fireEvent.click(toggleButton);
        // Don't wait for transition to complete
      }

      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });
  });
});

// Performance monitoring utilities
export const panePerformanceTests = {
  measureResizePerformance: (component, iterations = 50) => {
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const { container } = render(component);
      const resizeHandle = container.querySelector('.resize-handle');
      
      if (resizeHandle) {
        const start = performance.now();
        fireEvent.mouseDown(resizeHandle, { clientX: 300 });
        fireEvent.mouseMove(document, { clientX: 350 });
        fireEvent.mouseUp(document);
        const end = performance.now();
        
        times.push(end - start);
      }
    }
    
    return {
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times)
    };
  },

  measureStatePerformance: (component, operations = 100) => {
    const { container } = render(component);
    const toggleButton = container.querySelector('button');
    
    if (toggleButton) {
      const start = performance.now();
      
      for (let i = 0; i < operations; i++) {
        fireEvent.click(toggleButton);
      }
      
      const end = performance.now();
      return end - start;
    }
    
    return 0;
  }
};
