'use client'

import { useEffect } from 'react'

// ============================================
// SKIP LINKS - Acessibilidade WCAG
// ============================================

export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="fixed top-0 left-0 z-[10000] bg-purple-600 text-white px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-purple-400 transform -translate-y-full focus:translate-y-0 transition-transform"
      >
        Pular para conteúdo principal
      </a>
      <a
        href="#navigation"
        className="fixed top-0 left-32 z-[10000] bg-purple-600 text-white px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-purple-400 transform -translate-y-full focus:translate-y-0 transition-transform"
      >
        Pular para navegação
      </a>
    </div>
  )
}

// ============================================
// ANÚNCIO PARA LEITORES DE TELA
// ============================================

export function ScreenReaderAnnouncement({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}

// ============================================
// FOCUS TRAP - Para modais
// ============================================

export function useFocusTrap(isActive: boolean, containerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    firstElement?.focus()

    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [isActive, containerRef])
}

// ============================================
// BOTÃO ACESSÍVEL
// ============================================

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  description?: string
  loading?: boolean
  children: React.ReactNode
}

export function AccessibleButton({
  label,
  description,
  loading,
  children,
  disabled,
  ...props
}: AccessibleButtonProps) {
  return (
    <button
      aria-label={label}
      aria-describedby={description ? `${label}-desc` : undefined}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      disabled={disabled || loading}
      {...props}
    >
      {children}
      {description && (
        <span id={`${label}-desc`} className="sr-only">
          {description}
        </span>
      )}
    </button>
  )
}

// ============================================
// INPUT ACESSÍVEL COM FLOATING LABEL
// ============================================

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helpText?: string
}

export function FloatingLabelInput({
  label,
  error,
  helpText,
  id,
  className = '',
  ...props
}: FloatingLabelInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s/g, '-')
  const errorId = `${inputId}-error`
  const helpId = `${inputId}-help`

  return (
    <div className="relative">
      <input
        id={inputId}
        placeholder=" "
        aria-invalid={!!error}
        aria-describedby={error ? errorId : helpText ? helpId : undefined}
        className={`
          peer w-full px-4 pt-6 pb-2 border rounded-xl
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
          ${error ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'}
          bg-white dark:bg-slate-800
          text-gray-900 dark:text-white
          ${className}
        `}
        {...props}
      />
      <label
        htmlFor={inputId}
        className={`
          absolute left-4 transition-all duration-200 pointer-events-none
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
          peer-focus:top-2 peer-focus:text-xs
          top-2 text-xs
          ${error ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}
        `}
      >
        {label}
      </label>
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p id={helpId} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}
    </div>
  )
}

// ============================================
// TEXTAREA ACESSÍVEL COM FLOATING LABEL
// ============================================

interface FloatingLabelTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  helpText?: string
}

export function FloatingLabelTextarea({
  label,
  error,
  helpText,
  id,
  className = '',
  ...props
}: FloatingLabelTextareaProps) {
  const inputId = id || label.toLowerCase().replace(/\s/g, '-')
  const errorId = `${inputId}-error`
  const helpId = `${inputId}-help`

  return (
    <div className="relative">
      <textarea
        id={inputId}
        placeholder=" "
        aria-invalid={!!error}
        aria-describedby={error ? errorId : helpText ? helpId : undefined}
        className={`
          peer w-full px-4 pt-6 pb-2 border rounded-xl min-h-[120px]
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
          ${error ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'}
          bg-white dark:bg-slate-800
          text-gray-900 dark:text-white
          ${className}
        `}
        {...props}
      />
      <label
        htmlFor={inputId}
        className={`
          absolute left-4 transition-all duration-200 pointer-events-none
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
          peer-focus:top-2 peer-focus:text-xs
          top-2 text-xs
          ${error ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}
        `}
      >
        {label}
      </label>
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p id={helpId} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}
    </div>
  )
}

// ============================================
// PROGRESS BAR ACESSÍVEL
// ============================================

interface AccessibleProgressProps {
  value: number
  max?: number
  label: string
  showValue?: boolean
}

export function AccessibleProgress({
  value,
  max = 100,
  label,
  showValue = true
}: AccessibleProgressProps) {
  const percentage = Math.round((value / max) * 100)

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        {showValue && (
          <span className="text-sm text-gray-500 dark:text-gray-400">{percentage}%</span>
        )}
      </div>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label}: ${percentage}%`}
        className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5"
      >
        <div
          className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// ============================================
// LOADING SPINNER ACESSÍVEL
// ============================================

export function AccessibleSpinner({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div role="status" aria-label={label}>
      <svg
        className="animate-spin h-5 w-5 text-purple-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  )
}

export default SkipLinks
