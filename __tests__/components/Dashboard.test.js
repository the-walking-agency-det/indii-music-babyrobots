import { render, screen, fireEvent } from '@testing-library/react'
import Dashboard from '../../components/Dashboard'

const mockWidgets = [
  { id: 1, type: 'stats', title: 'Usage Stats' },
  { id: 2, type: 'chart', title: 'Activity Chart' }
]

jest.mock('../../hooks/useRealTimeData', () => ({
  useRealTimeData: () => ({
    data: mockWidgets,
    loading: false,
    error: null
  })
}))

describe('Dashboard Component', () => {
  test('renders critical widgets and handles interaction', () => {
    const mockHandleClick = jest.fn()
    render(<Dashboard onWidgetClick={mockHandleClick} />)
    
    // Check essential widgets render
    mockWidgets.forEach(widget => {
      const widgetElement = screen.getByText(widget.title)
      expect(widgetElement).toBeInTheDocument()
      
      // Test interaction
      fireEvent.click(widgetElement)
      expect(mockHandleClick).toHaveBeenCalledWith(widget.id)
    })
  })

  test('handles loading and error states', () => {
    // Override mock for loading state
    jest.spyOn(require('../../hooks/useRealTimeData'), 'useRealTimeData')
      .mockImplementationOnce(() => ({
        data: null,
        loading: true,
        error: null
      }))

    const { rerender } = render(<Dashboard />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    // Test error state
    jest.spyOn(require('../../hooks/useRealTimeData'), 'useRealTimeData')
      .mockImplementationOnce(() => ({
        data: null,
        loading: false,
        error: new Error('Failed to load')
      }))

    rerender(<Dashboard />)
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
  })
})
