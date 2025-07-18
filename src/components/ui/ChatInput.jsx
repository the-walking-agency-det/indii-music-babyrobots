import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2, Sparkles } from 'lucide-react';

const ChatInput = ({ 
  onSend, 
  placeholder = "Ask me anything or describe what you want to create...", 
  isProcessing = false,
  userType = 'artist',
  enableVoice = true,
  autoFocus = false 
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Initialize speech recognition
  useEffect(() => {
    if (!enableVoice || typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setInput(prev => prev + finalTranscript);
        setHasRecorded(true);
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [enableVoice]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    onSend(input.trim());
    setInput('');
    setHasRecorded(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // User type specific placeholders
  const getUserTypePlaceholder = () => {
    switch (userType) {
      case 'artist':
        return "Describe your creative vision, ask about production techniques, or get help with your music...";
      case 'listener':
        return "Tell me your mood, ask for recommendations, or describe what you want to hear...";
      case 'manager':
        return "Search for tracks, ask about licensing, or get help with project management...";
      default:
        return placeholder;
    }
  };

  const canSend = input.trim() && !isProcessing;

  return (
    <div className="relative">
      {/* Agent Status Indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {isProcessing ? 'Thinking...' : 'AI Assistant Ready'}
          </span>
        </div>
        <div className={`agent-status ${isProcessing ? 'agent-status--busy' : 'agent-status--active'}`}>
          {isProcessing ? 'Processing' : 'Ready'}
        </div>
      </div>

      {/* Input Container */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-end space-x-2 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500 transition-all duration-200">
          
          {/* Voice Input Button */}
          {enableVoice && (
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`flex-shrink-0 p-2 rounded-full transition-all duration-200 ${
                isListening 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : hasRecorded
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              disabled={isProcessing}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getUserTypePlaceholder()}
            className="flex-1 resize-none border-0 bg-transparent focus:outline-none focus:ring-0 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 min-h-[20px] max-h-[120px] py-1"
            rows={1}
            disabled={isProcessing}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!canSend}
            className={`flex-shrink-0 p-2 rounded-full transition-all duration-200 ${
              canSend
                ? 'bg-purple-500 text-white hover:bg-purple-600 hover:scale-105 active:scale-95'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Character Count & Hints */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            {isListening && (
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>Listening...</span>
              </span>
            )}
            {hasRecorded && !isListening && (
              <span className="text-green-600 dark:text-green-400">Voice input recorded</span>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {input.length > 0 && (
              <span className={input.length > 500 ? 'text-yellow-600' : ''}>
                {input.length}/1000
              </span>
            )}
          </div>
        </div>
      </form>

      {/* Quick Actions */}
      <div className="flex items-center space-x-2 mt-2">
        <button
          type="button"
          onClick={() => setInput("Help me get started")}
          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          Get Started
        </button>
        <button
          type="button"
          onClick={() => setInput("Show me examples")}
          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          Examples
        </button>
        {userType === 'artist' && (
          <button
            type="button"
            onClick={() => setInput("Help me create a new track")}
            className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-md transition-colors"
          >
            New Track
          </button>
        )}
        {userType === 'listener' && (
          <button
            type="button"
            onClick={() => setInput("Find music for my current mood")}
            className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-md transition-colors"
          >
            Find Music
          </button>
        )}
        {userType === 'manager' && (
          <button
            type="button"
            onClick={() => setInput("Search for licensable tracks")}
            className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-md transition-colors"
          >
            Search Tracks
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
