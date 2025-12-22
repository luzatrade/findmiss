'use client'
import { useState } from 'react'
import PropTypes from 'prop-types'

export function useErrorHandler() {
  const [error, setError] = useState(null)

  const resetError = () => setError(null)

  const handleError = (error) => {
    console.error('Application error:', error)
    setError(error)
  }

  return { error, handleError, resetError }
}

/**
 * ErrorDisplay component
 * Displays error messages in a modal overlay
 * @param {Object} props - Component props
 * @param {Error|null} props.error - Error object to display
 * @param {Function} [props.onRetry] - Callback function when retry button is clicked
 * @param {Function} [props.onDismiss] - Callback function when dismiss button is clicked
 */
export function ErrorDisplay({ error, onRetry, onDismiss }) {
  if (!error) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Errore
            </h3>
          </div>
        </div>
        
        <div className="mt-2 text-sm text-red-700">
          <p>{error.message || 'Si è verificato un errore imprevisto'}</p>
        </div>
        
        <div className="mt-4 flex space-x-3">
          {onRetry && (
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={onRetry}
            >
              Riprova
            </button>
          )}
          {onDismiss && (
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={onDismiss}
            >
              Chiudi
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

ErrorDisplay.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string
  }),
  onRetry: PropTypes.func,
  onDismiss: PropTypes.func
}
