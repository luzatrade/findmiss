"use client"

import { createContext, useContext, useState, useCallback, useEffect } from "react"

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)

  const showToast = useCallback(({ message, type = "info", duration = 2500 }) => {
    setToast({ message, type })
    if (duration > 0) {
      setTimeout(() => {
        setToast(null)
      }, duration)
    }
  }, [])

  const value = { showToast }

  useEffect(() => {
    return () => {
      setToast(null)
    }
  }, [])

  const typeClasses =
    toast?.type === "success"
      ? "bg-green-600 text-white"
      : toast?.type === "error"
      ? "bg-red-600 text-white"
      : "bg-gray-900 text-white"

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
          <div
            className={`max-w-sm w-full px-4 py-3 rounded-full shadow-lg text-sm flex items-center justify-center ${typeClasses}`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error("useToast deve essere usato dentro ToastProvider")
  }
  return ctx
}
