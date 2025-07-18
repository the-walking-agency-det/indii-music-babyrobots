import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatInput from './ChatInput';

// Mock Web Speech API
const mockSpeechRecognition = {
  start: jest.fn(),
  stop: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  continuous: true,
  interimResults: true,
  lang: 'en-US',
  onresult: null,
  onend: null,
  onerror: null
};

// Mock window.SpeechRecognition
Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: jest.fn().mockImplementation(() => mockSpeechRecognition)
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: jest.fn().mockImplementation(() => mockSpeechRecognition)
});

describe('ChatInput - BREAK IT Phase', () => {
  let mockOnSend;

  beforeEach(() => {
    mockOnSend = jest.fn();
    jest.clearAllMocks();
  });

  describe('🔧 STRESS TEST: Long Messages', () => {
    test('should handle very long messages (>1000 chars)', async () => {
      const longMessage = 'a'.repeat(1500);
      
      render(<ChatInput onSend={mockOnSend} />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: longMessage } });
      
      // Should show character count warning
      expect(screen.getByText('1500/1000')).toBeInTheDocument();
      expect(screen.getByText('1500/1000')).toHaveClass('text-yellow-600');
      
      // Should still allow sending
      fireEvent.keyDown(textarea, { key: 'Enter' });
      expect(mockOnSend).toHaveBeenCalledWith(longMessage);
    });

    test('should handle textarea auto-resize with long content', () => {
      const multilineMessage = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8';
      
      render(<ChatInput onSend={mockOnSend} />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: multilineMessage } });
      
      // Should auto-resize but not exceed max height
      expect(textarea.style.height).toBeTruthy();
      expect(textarea).toHaveStyle('max-height: 120px');
    });
  });

  describe('🔧 STRESS TEST: Rapid Fire Input', () => {
    test('should handle rapid message sending', async () => {
      render(<ChatInput onSend={mockOnSend} />);
      
      const textarea = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      // Send 10 messages rapidly
      for (let i = 0; i < 10; i++) {
        fireEvent.change(textarea, { target: { value: `Message ${i}` } });
        fireEvent.click(sendButton);
      }
      
      expect(mockOnSend).toHaveBeenCalledTimes(10);
    });

    test('should handle rapid typing without performance issues', () => {
      render(<ChatInput onSend={mockOnSend} />);
      
      const textarea = screen.getByRole('textbox');
      const startTime = performance.now();
      
      // Simulate rapid typing
      for (let i = 0; i < 100; i++) {
        fireEvent.change(textarea, { target: { value: `Character ${i}` } });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
    });
  });

  describe('🔧 STRESS TEST: Voice Input Edge Cases', () => {
    test('should handle speech recognition errors gracefully', () => {
      render(<ChatInput onSend={mockOnSend} enableVoice={true} />);
      
      const voiceButton = screen.getByRole('button', { name: /mic/i });
      fireEvent.click(voiceButton);
      
      // Simulate recognition error
      const errorEvent = new Event('error');
      errorEvent.error = 'network';
      mockSpeechRecognition.onerror(errorEvent);
      
      // Should stop listening and show appropriate state
      expect(mockSpeechRecognition.stop).toHaveBeenCalled();
    });

    test('should handle speech recognition unavailable', () => {
      // Mock unavailable speech recognition
      delete window.SpeechRecognition;
      delete window.webkitSpeechRecognition;
      
      render(<ChatInput onSend={mockOnSend} enableVoice={true} />);
      
      // Voice button should not be rendered
      expect(screen.queryByRole('button', { name: /mic/i })).not.toBeInTheDocument();
    });

    test('should handle speech recognition results with interim and final', () => {
      render(<ChatInput onSend={mockOnSend} enableVoice={true} />);
      
      const voiceButton = screen.getByRole('button', { name: /mic/i });
      fireEvent.click(voiceButton);
      
      // Mock speech recognition results
      const resultEvent = {
        results: [
          [{ transcript: 'Hello ', isFinal: false }],
          [{ transcript: 'world', isFinal: true }]
        ],
        resultIndex: 0
      };
      
      mockSpeechRecognition.onresult(resultEvent);
      
      // Should handle both interim and final results
      const textarea = screen.getByRole('textbox');
      expect(textarea.value).toBe('world');
    });
  });

  describe('🔧 STRESS TEST: Processing States', () => {
    test('should handle processing state correctly', () => {
      render(<ChatInput onSend={mockOnSend} isProcessing={true} />);
      
      const textarea = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      // Textarea should be disabled
      expect(textarea).toBeDisabled();
      
      // Send button should show loading state
      expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
      expect(screen.getByText('Processing')).toBeInTheDocument();
    });

    test('should prevent multiple submissions during processing', () => {
      const { rerender } = render(<ChatInput onSend={mockOnSend} isProcessing={false} />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Test message' } });
      
      // Start processing
      rerender(<ChatInput onSend={mockOnSend} isProcessing={true} />);
      
      // Try to send while processing
      fireEvent.keyDown(textarea, { key: 'Enter' });
      
      // Should not call onSend
      expect(mockOnSend).not.toHaveBeenCalled();
    });
  });

  describe('🔧 STRESS TEST: User Type Variations', () => {
    test('should handle all user types correctly', () => {
      const userTypes = ['artist', 'listener', 'manager'];
      
      userTypes.forEach(userType => {
        render(<ChatInput onSend={mockOnSend} userType={userType} />);
        
        const textarea = screen.getByRole('textbox');
        expect(textarea).toBeInTheDocument();
        expect(textarea.placeholder).toBeTruthy();
        expect(textarea.placeholder.length).toBeGreaterThan(0);
      });
    });

    test('should handle invalid user type gracefully', () => {
      render(<ChatInput onSend={mockOnSend} userType="invalid" />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea.placeholder).toBe('Ask me anything or describe what you want to create...');
    });
  });

  describe('🔧 STRESS TEST: Keyboard Navigation', () => {
    test('should handle Enter key correctly', () => {
      render(<ChatInput onSend={mockOnSend} />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Test message' } });
      
      // Enter should send
      fireEvent.keyDown(textarea, { key: 'Enter' });
      expect(mockOnSend).toHaveBeenCalledWith('Test message');
      
      // Shift+Enter should not send
      fireEvent.change(textarea, { target: { value: 'Another message' } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
      expect(mockOnSend).toHaveBeenCalledTimes(1);
    });

    test('should handle focus management', () => {
      render(<ChatInput onSend={mockOnSend} autoFocus={true} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveFocus();
    });
  });

  describe('🔧 STRESS TEST: Memory Leaks', () => {
    test('should cleanup speech recognition on unmount', () => {
      const { unmount } = render(<ChatInput onSend={mockOnSend} enableVoice={true} />);
      
      unmount();
      
      // Should stop recognition if active
      expect(mockSpeechRecognition.stop).toHaveBeenCalled();
    });

    test('should handle multiple mounts/unmounts', () => {
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(<ChatInput onSend={mockOnSend} enableVoice={true} />);
        unmount();
      }
      
      // Should not cause memory leaks or errors
      expect(mockSpeechRecognition.stop).toHaveBeenCalledTimes(5);
    });
  });

  describe('🔧 STRESS TEST: Error Boundaries', () => {
    test('should handle onSend callback errors gracefully', () => {
      const errorOnSend = jest.fn().mockImplementation(() => {
        throw new Error('Callback error');
      });
      
      render(<ChatInput onSend={errorOnSend} />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Test message' } });
      
      // Should not crash the component
      expect(() => {
        fireEvent.keyDown(textarea, { key: 'Enter' });
      }).not.toThrow();
    });

    test('should handle missing props gracefully', () => {
      // Test with minimal props
      expect(() => {
        render(<ChatInput />);
      }).not.toThrow();
    });
  });
});

// Performance testing utilities
export const performanceTests = {
  measureRenderTime: (component, iterations = 100) => {
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      render(component);
      const end = performance.now();
      times.push(end - start);
    }
    
    return {
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      median: times.sort()[Math.floor(times.length / 2)]
    };
  },

  measureMemoryUsage: (component, iterations = 50) => {
    const initialMemory = performance.memory?.usedJSHeapSize || 0;
    const components = [];
    
    for (let i = 0; i < iterations; i++) {
      components.push(render(component));
    }
    
    const midMemory = performance.memory?.usedJSHeapSize || 0;
    
    // Cleanup
    components.forEach(c => c.unmount());
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = performance.memory?.usedJSHeapSize || 0;
    
    return {
      initialMemory,
      midMemory,
      finalMemory,
      memoryLeak: finalMemory - initialMemory
    };
  }
};
