import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  const mockClick = jest.fn();

  beforeEach(() => {
    mockClick.mockClear();
  });

  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByTestId('button');
    expect(button).toHaveClass('btn btn--primary btn--md');
    expect(button).toHaveTextContent('Click me');
  });

  it('handles click events', () => {
    render(<Button onClick={mockClick}>Click me</Button>);
    
    const button = screen.getByTestId('button');
    fireEvent.click(button);
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('supports different variants', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByTestId('button')).toHaveClass('btn--secondary');

    rerender(<Button variant="text">Text</Button>);
    expect(screen.getByTestId('button')).toHaveClass('btn--text');
  });

  it('supports different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByTestId('button')).toHaveClass('btn--sm');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByTestId('button')).toHaveClass('btn--lg');
  });

  it('handles disabled state', () => {
    render(<Button disabled onClick={mockClick}>Disabled</Button>);
    
    const button = screen.getByTestId('button');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(mockClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByTestId('button')).toHaveClass('btn custom-class');
  });

  it('supports different button types', () => {
    const { rerender } = render(<Button type="submit">Submit</Button>);
    expect(screen.getByTestId('button')).toHaveAttribute('type', 'submit');

    rerender(<Button type="reset">Reset</Button>);
    expect(screen.getByTestId('button')).toHaveAttribute('type', 'reset');
  });
});
