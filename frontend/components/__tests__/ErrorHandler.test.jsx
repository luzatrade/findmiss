import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useErrorHandler, ErrorDisplay } from '../ErrorHandler'

describe('ErrorHandler', () => {
  test('useErrorHandler should initialize without error', () => {
    function TestComponent() {
      const { error, handleError, resetError } = useErrorHandler()
      
      return (
        <div>
          <span data-testid="error-status">{error ? 'has-error' : 'no-error'}</span>
          <button onClick={() => handleError(new Error('Test error'))}>
            Trigger Error
          </button>
          <button onClick={resetError}>Reset Error</button>
        </div>
      )
    }

    render(<TestComponent />)
    
    expect(screen.getByTestId('error-status')).toHaveTextContent('no-error')
  })

  test('ErrorDisplay should render when error is provided', () => {
    const error = new Error('Test error message')
    const onRetry = jest.fn()
    const onDismiss = jest.fn()

    render(<ErrorDisplay error={error} onRetry={onRetry} onDismiss={onDismiss} />)
    
    expect(screen.getByText('Errore')).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
    expect(screen.getByText('Riprova')).toBeInTheDocument()
    expect(screen.getByText('Chiudi')).toBeInTheDocument()
  })

  test('ErrorDisplay should not render when no error', () => {
    const { container } = render(
      <ErrorDisplay error={null} onRetry={() => {}} onDismiss={() => {}} />
    )
    
    expect(container.firstChild).toBeNull()
  })
})
