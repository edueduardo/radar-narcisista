/**
 * ACCESSIBLE FORM COMPONENTS
 * 
 * Componentes de formulário com ARIA completo
 * Foco total em acessibilidade
 */

'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react'

// Input com ARIA completo
export function AccessibleInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  autoComplete,
  ariaLabel,
  ariaDescribedBy,
  className = '',
  ...props
}: {
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  disabled?: boolean
  autoComplete?: string
  ariaLabel?: string
  ariaDescribedBy?: string
  className?: string
  [key: string]: any
}) {
  const [focused, setFocused] = useState(false)
  const inputId = `input-${label.replace(/\s+/g, '-').toLowerCase()}`
  const errorId = `${inputId}-error`
  const helpId = `${inputId}-help`

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={inputId}
        className="block text-sm font-medium text-slate-300"
      >
        {label}
        {required && <span className="text-red-400 ml-1" aria-label="obrigatório">*</span>}
      </label>
      
      <div className="relative">
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-label={ariaLabel || label}
          aria-describedby={
            error ? errorId : 
            ariaDescribedBy ? `${ariaDescribedBy} ${helpId}` : 
            helpId
          }
          aria-invalid={!!error}
          aria-required={required}
          className={`
            w-full px-4 py-3 bg-slate-800 border rounded-lg text-white
            focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error 
              ? 'border-red-500 focus:ring-red-400' 
              : focused 
                ? 'border-purple-500' 
                : 'border-slate-700'
            }
            ${className}
          `}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        
        {/* Indicador visual de erro */}
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AlertCircle className="w-5 h-5 text-red-400" aria-hidden="true" />
          </div>
        )}
      </div>
      
      {/* Mensagem de erro */}
      {error && (
        <div 
          id={errorId}
          className="flex items-center gap-2 text-sm text-red-400"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Texto de ajuda */}
      {!error && placeholder && (
        <div 
          id={helpId}
          className="text-sm text-slate-500"
        >
          {placeholder}
        </div>
      )}
    </div>
  )
}

// Input de senha com toggle
export function AccessiblePasswordInput({
  label,
  value,
  onChange,
  error,
  required = false,
  showStrength = false,
  className = '',
  ...props
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  showStrength?: boolean
  className?: string
  [key: string]: any
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [strength, setStrength] = useState<'fraca' | 'media' | 'forte' | null>(null)
  
  const inputId = `password-${label.replace(/\s+/g, '-').toLowerCase()}`
  const strengthId = `${inputId}-strength`

  // Calcular força da senha
  useEffect(() => {
    if (!showStrength || !value) {
      setStrength(null)
      return
    }
    
    if (value.length < 6) {
      setStrength('fraca')
    } else if (value.length < 10 || !/[A-Z]/.test(value) || !/[0-9]/.test(value)) {
      setStrength('media')
    } else {
      setStrength('forte')
    }
  }, [value, showStrength])

  const strengthColors = {
    fraca: 'bg-red-500',
    media: 'bg-yellow-500',
    forte: 'bg-green-500'
  }

  const strengthText = {
    fraca: 'Senha fraca',
    media: 'Senha média',
    forte: 'Senha forte'
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={inputId}
        className="block text-sm font-medium text-slate-300"
      >
        {label}
        {required && <span className="text-red-400 ml-1" aria-label="obrigatório">*</span>}
      </label>
      
      <div className="relative">
        <input
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          aria-describedby={showStrength ? strengthId : undefined}
          className={`
            w-full px-4 py-3 pr-12 bg-slate-800 border rounded-lg text-white
            focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900
            ${error 
              ? 'border-red-500 focus:ring-red-400' 
              : 'border-slate-700'
            }
          `}
          {...props}
        />
        
        {/* Botão toggle senha */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" aria-hidden="true" />
          ) : (
            <Eye className="w-5 h-5" aria-hidden="true" />
          )}
        </button>
      </div>
      
      {/* Indicador de força */}
      {showStrength && strength && (
        <div 
          id={strengthId}
          className="space-y-1"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  strength === 'fraca' ? 'w-1/3' : 
                  strength === 'media' ? 'w-2/3' : 
                  'w-full'
                } ${strengthColors[strength]}`}
              />
            </div>
            <span className="text-xs text-slate-400">
              {strengthText[strength]}
            </span>
          </div>
        </div>
      )}
      
      {/* Mensagem de erro */}
      {error && (
        <div 
          className="flex items-center gap-2 text-sm text-red-400"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

// Checkbox acessível
export function AccessibleCheckbox({
  label,
  checked,
  onChange,
  required = false,
  disabled = false,
  description,
  className = '',
  ...props
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  required?: boolean
  disabled?: boolean
  description?: string
  className?: string
  [key: string]: any
}) {
  const checkboxId = `checkbox-${label.replace(/\s+/g, '-').toLowerCase()}`
  const descriptionId = `${checkboxId}-desc`

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="relative mt-1">
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          required={required}
          disabled={disabled}
          aria-describedby={description ? descriptionId : undefined}
          className={`
            w-5 h-5 bg-slate-800 border-2 border-slate-600 rounded
            focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900
            disabled:opacity-50 disabled:cursor-not-allowed
            checked:bg-purple-600 checked:border-purple-600
            ${className}
          `}
          {...props}
        />
        
        {/* Checkmark custom */}
        {checked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Check className="w-3 h-3 text-white" aria-hidden="true" />
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <label 
          htmlFor={checkboxId}
          className="text-sm font-medium text-slate-300 cursor-pointer"
        >
          {label}
          {required && <span className="text-red-400 ml-1" aria-label="obrigatório">*</span>}
        </label>
        
        {description && (
          <p 
            id={descriptionId}
            className="text-sm text-slate-500 mt-1"
          >
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

// Select acessível
export function AccessibleSelect({
  label,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  placeholder,
  error,
  className = '',
  ...props
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string; disabled?: boolean }>
  required?: boolean
  disabled?: boolean
  placeholder?: string
  error?: string
  className?: string
  [key: string]: any
}) {
  const selectId = `select-${label.replace(/\s+/g, '-').toLowerCase()}`
  const errorId = `${selectId}-error`

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={selectId}
        className="block text-sm font-medium text-slate-300"
      >
        {label}
        {required && <span className="text-red-400 ml-1" aria-label="obrigatório">*</span>}
      </label>
      
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`
          w-full px-4 py-3 bg-slate-800 border rounded-lg text-white
          focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error 
            ? 'border-red-500 focus:ring-red-400' 
            : 'border-slate-700'
          }
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Mensagem de erro */}
      {error && (
        <div 
          id={errorId}
          className="flex items-center gap-2 text-sm text-red-400"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

// Botão com loading state
export function AccessibleButton({
  children,
  onClick,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  ariaLabel,
  className = '',
  ...props
}: {
  children: React.ReactNode
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  ariaLabel?: string
  className?: string
  [key: string]: any
}) {
  const baseClasses = 'font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900'
  
  const variants = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-400',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white focus:ring-slate-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-400'
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Carregando...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}
