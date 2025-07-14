// Security utilities and validation
export interface SecurityConfig {
  enableCSP: boolean
  enableHSTS: boolean
  enableXSSProtection: boolean
  enableCSRFProtection: boolean
  allowedOrigins: string[]
  maxRequestSize: number
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  sanitizedValue?: any
}

class SecurityManager {
  private config: SecurityConfig = {
    enableCSP: true,
    enableHSTS: true,
    enableXSSProtection: true,
    enableCSRFProtection: true,
    allowedOrigins: ['https://ytsbyai.vercel.app', 'http://localhost:3000'],
    maxRequestSize: 10 * 1024 * 1024, // 10MB
  }

  // Input validation and sanitization
  public validateInput(value: any, type: 'string' | 'email' | 'url' | 'number' | 'json'): ValidationResult {
    const errors: string[] = []
    let sanitizedValue: any = value

    if (value === null || value === undefined) {
      return { isValid: false, errors: ['Value is required'] }
    }

    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push('Value must be a string')
        } else {
          sanitizedValue = this.sanitizeString(value)
          if (sanitizedValue.length === 0) {
            errors.push('String cannot be empty')
          }
          if (sanitizedValue.length > 1000) {
            errors.push('String too long (max 1000 characters)')
          }
        }
        break

      case 'email':
        if (typeof value !== 'string') {
          errors.push('Email must be a string')
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          const trimmedEmail = value.trim()
          if (!emailRegex.test(trimmedEmail)) {
            errors.push('Invalid email format')
          } else {
            sanitizedValue = trimmedEmail.toLowerCase()
          }
        }
        break

      case 'url':
        if (typeof value !== 'string') {
          errors.push('URL must be a string')
        } else {
          try {
            const url = new URL(value)
            if (!['http:', 'https:'].includes(url.protocol)) {
              errors.push('URL must use HTTP or HTTPS protocol')
            }
            sanitizedValue = url.toString()
          } catch {
            errors.push('Invalid URL format')
          }
        }
        break

      case 'number':
        const num = Number(value)
        if (isNaN(num)) {
          errors.push('Value must be a valid number')
        } else {
          sanitizedValue = num
        }
        break

      case 'json':
        if (typeof value === 'string') {
          try {
            sanitizedValue = JSON.parse(value)
          } catch {
            errors.push('Invalid JSON format')
          }
        } else if (typeof value === 'object') {
          sanitizedValue = value
        } else {
          errors.push('Value must be valid JSON')
        }
        break
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue,
    }
  }

  // XSS Protection
  public sanitizeString(str: string): string {
    return str
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      // Remove event handler attributes like onclick="..." or onload='...'
      .replace(/on\w+\s*=\s*(['"]).*?\1/gi, '')
      .replace(/on\w+=/gi, '') // Remove event handlers without quotes (fallback)
      .replace(/on\w+\s*=/gi, '') // Remove event handlers with spaces (fallback)
      .trim()
  }

  public sanitizeHTML(html: string): string {
    const div = document.createElement('div')
    div.textContent = html
    return div.innerHTML
  }

  // CSRF Protection
  public generateCSRFToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  public validateCSRFToken(token: string, storedToken: string): boolean {
    return token === storedToken
  }

  // Origin validation
  public validateOrigin(origin: string): boolean {
    return this.config.allowedOrigins.includes(origin)
  }

  // Request size validation
  public validateRequestSize(size: number): boolean {
    return size <= this.config.maxRequestSize
  }

  // Security headers
  public getSecurityHeaders(): Record<string, string> {
    const headers: Record<string, string> = {}

    if (this.config.enableCSP) {
      headers['Content-Security-Policy'] = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://app.posthog.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://api.openai.com https://app.posthog.com https://js.stripe.com",
        "frame-src 'self' https://js.stripe.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ')
    }

    if (this.config.enableHSTS) {
      headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    }

    if (this.config.enableXSSProtection) {
      headers['X-XSS-Protection'] = '1; mode=block'
    }

    headers['X-Content-Type-Options'] = 'nosniff'
    headers['X-Frame-Options'] = 'DENY'
    headers['Referrer-Policy'] = 'origin-when-cross-origin'
    headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()'

    return headers
  }

  // Rate limiting helper
  public createRateLimiter(maxRequests: number, windowMs: number) {
    const requests = new Map<string, number[]>()

    return (identifier: string): boolean => {
      const now = Date.now()
      const userRequests = requests.get(identifier) || []
      
      // Remove old requests outside the window
      const validRequests = userRequests.filter(time => now - time < windowMs)
      
      if (validRequests.length >= maxRequests) {
        return false // Rate limited
      }
      
      validRequests.push(now)
      requests.set(identifier, validRequests)
      return true // Allowed
    }
  }

  // Password strength validation
  public validatePassword(password: string): ValidationResult {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: password,
    }
  }

  // API key validation
  public validateAPIKey(key: string): boolean {
    if (!key || typeof key !== 'string') return false
    
    // Basic format validation (adjust based on your API key format)
    const keyRegex = /^[a-zA-Z0-9_-]{20,}$/
    return keyRegex.test(key)
  }

  // URL validation for YouTube links
  public validateYouTubeURL(url: string): ValidationResult {
    const errors: string[] = []
    
    if (!url) {
      errors.push('URL is required')
      return { isValid: false, errors }
    }

    try {
      const urlObj = new URL(url)
      
      if (!['www.youtube.com', 'youtube.com', 'youtu.be', 'm.youtube.com'].includes(urlObj.hostname)) {
        errors.push('URL must be from YouTube')
      }
      
      if (urlObj.hostname === 'youtu.be') {
        if (!urlObj.pathname || urlObj.pathname.length < 2) {
          errors.push('Invalid YouTube short URL')
        }
      } else {
        if (!urlObj.searchParams.get('v')) {
          errors.push('YouTube URL must contain video ID')
        }
      }
      
    } catch {
      errors.push('Invalid URL format')
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: url,
    }
  }

  // Configuration
  public updateConfig(newConfig: Partial<SecurityConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  public getConfig(): SecurityConfig {
    return { ...this.config }
  }
}

// Singleton instance
export const securityManager = new SecurityManager()

// React hook for security validation
export const useSecurityValidation = () => {
  return {
    validateInput: securityManager.validateInput.bind(securityManager),
    validatePassword: securityManager.validatePassword.bind(securityManager),
    validateYouTubeURL: securityManager.validateYouTubeURL.bind(securityManager),
    validateAPIKey: securityManager.validateAPIKey.bind(securityManager),
    sanitizeString: securityManager.sanitizeString.bind(securityManager),
    sanitizeHTML: securityManager.sanitizeHTML.bind(securityManager),
    generateCSRFToken: securityManager.generateCSRFToken.bind(securityManager),
    validateCSRFToken: securityManager.validateCSRFToken.bind(securityManager),
  }
}

// Utility functions
export const sanitizeUserInput = (input: string): string => {
  return securityManager.sanitizeString(input)
}

export const validateEmail = (email: string): boolean => {
  const result = securityManager.validateInput(email, 'email')
  return result.isValid
}

export const validateYouTubeLink = (url: string): boolean => {
  const result = securityManager.validateYouTubeURL(url)
  return result.isValid
}

export const getSecurityHeaders = (): Record<string, string> => {
  return securityManager.getSecurityHeaders()
} 