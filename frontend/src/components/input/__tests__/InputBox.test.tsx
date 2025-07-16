import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InputBox } from '../InputBox';

describe('InputBox', () => {
  const mockSubmit = jest.fn();

  beforeEach(() => {
    mockSubmit.mockClear();
  });

  it('renders with default props', () => {
    render(<InputBox onSubmit={mockSubmit} />);
    
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
    expect(screen.getByText('0/1000')).toBeInTheDocument();
  });

  it('updates input value when typing', () => {
    render(<InputBox onSubmit={mockSubmit} />);
    
    const textarea = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(textarea, { target: { value: 'Hello World' } });
    
    expect(textarea).toHaveValue('Hello World');
    expect(screen.getByText('11/1000')).toBeInTheDocument();
  });

  it('submits value when clicking send button', () => {
    render(<InputBox onSubmit={mockSubmit} />);
    
    const textarea = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(textarea, { target: { value: 'Hello World' } });
    
    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);
    
    expect(mockSubmit).toHaveBeenCalledWith('Hello World');
    expect(textarea).toHaveValue('');
  });

  it('submits value when pressing Enter', () => {
    render(<InputBox onSubmit={mockSubmit} />);
    
    const textarea = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(textarea, { target: { value: 'Hello World' } });
    fireEvent.keyDown(textarea, { key: 'Enter' });
    
    expect(mockSubmit).toHaveBeenCalledWith('Hello World');
    expect(textarea).toHaveValue('');
  });

  it('does not submit when pressing Enter with Shift', () => {
    render(<InputBox onSubmit={mockSubmit} />);
    
    const textarea = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(textarea, { target: { value: 'Hello World' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    
    expect(mockSubmit).not.toHaveBeenCalled();
    expect(textarea).toHaveValue('Hello World');
  });

  it('respects maxLength prop', () => {
    render(<InputBox onSubmit={mockSubmit} maxLength={5} />);
    
    const textarea = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(textarea, { target: { value: 'Hello World' } });
    
    expect(textarea).toHaveValue('Hello');
    expect(screen.getByText('5/5')).toBeInTheDocument();
  });

  it('does not submit empty or whitespace-only input', () => {
    render(<InputBox onSubmit={mockSubmit} />);
    
    const textarea = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByText('Send');

    // Empty input
    fireEvent.change(textarea, { target: { value: '' } });
    fireEvent.click(sendButton);
    expect(mockSubmit).not.toHaveBeenCalled();

    // Whitespace-only input
    fireEvent.change(textarea, { target: { value: '   ' } });
    fireEvent.click(sendButton);
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<InputBox onSubmit={mockSubmit} className="custom-class" />);
    
    expect(screen.getByTestId('input-box')).toHaveClass('input-box custom-class');
  });
});
