import React, { useState, useRef, KeyboardEvent } from 'react';
import styles from './InputBox.module.css';

interface InputBoxProps {
  onSubmit: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export const InputBox: React.FC<InputBoxProps> = ({
  onSubmit,
  placeholder = 'Type a message...',
  maxLength = 1000,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as content grows
  const adjustTextAreaHeight = () => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const truncatedValue = value.slice(0, maxLength);
    setInputValue(truncatedValue);
    adjustTextAreaHeight();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue) {
      onSubmit(trimmedValue);
      setInputValue('');
      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };

  return (
    <div data-testid="input-box" className={`${styles['input-box']} ${className}`}>
      <textarea
        ref={inputRef}
        value={inputValue}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        className={styles['input-box__textarea']}
      />
      <div className={styles['input-box__controls']}>
        <span className={styles['input-box__counter']}>
          {inputValue.length}/{maxLength}
        </span>
        <button
          onClick={handleSubmit}
          disabled={!inputValue.trim()}
          className={styles['input-box__submit']}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default InputBox;
