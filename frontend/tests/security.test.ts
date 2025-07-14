import { describe, it, expect, beforeEach } from 'vitest'
import { securityManager } from '../lib/security'

describe('SecurityManager', () => {
  beforeEach(() => {
    // Reset security manager config to defaults
    securityManager.updateConfig({
      enableCSP: true,
      enableHSTS: true,
      enableXSSProtection: true,
      enableCSRFProtection: true,
      allowedOrigins: ['https://ytsbyai.vercel.app', 'http://localhost:3000'],
      maxRequestSize: 10 * 1024 * 1024,
    })
  })

  describe('validateInput', () => {
    describe('string validation', () => {
      it('validates valid strings', () => {
        const result = securityManager.validateInput('test string', 'string')
        expect(result.isValid).toBe(true)
        expect(result.sanitizedValue).toBe('test string')
      })

      it('rejects non-string values', () => {
        const result = securityManager.validateInput(123, 'string')
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Value must be a string')
      })

      it('rejects empty strings', () => {
        const result = securityManager.validateInput('   ', 'string')
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('String cannot be empty')
      })

      it('rejects strings that are too long', () => {
        const longString = 'a'.repeat(1001)
        const result = securityManager.validateInput(longString, 'string')
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('String too long (max 1000 characters)')
      })

      it('sanitizes strings with XSS attempts', () => {
        const maliciousString = '<script>alert("xss")</script>'
        const result = securityManager.validateInput(maliciousString, 'string')
        expect(result.isValid).toBe(true)
        expect(result.sanitizedValue).toBe('scriptalert("xss")/script')
      })
    })

    describe('email validation', () => {
      it('validates valid email addresses', () => {
        const result = securityManager.validateInput('test@example.com', 'email')
        expect(result.isValid).toBe(true)
        expect(result.sanitizedValue).toBe('test@example.com')
      })

      it('rejects invalid email formats', () => {
        const invalidEmails = ['test', '@example.com', 'test@', 'test@.com']
        
        invalidEmails.forEach(email => {
          const result = securityManager.validateInput(email, 'email')
          expect(result.isValid).toBe(false)
          expect(result.errors).toContain('Invalid email format')
        })
      })

      it('normalizes email addresses', () => {
        const result = securityManager.validateInput('  TEST@EXAMPLE.COM  ', 'email')
        expect(result.isValid).toBe(true)
        expect(result.sanitizedValue).toBe('test@example.com')
      })
    })

    describe('URL validation', () => {
      it('validates valid URLs', () => {
        const validUrls = [
          'https://example.com',
          'http://example.com',
          'https://example.com/path',
          'https://example.com/path?param=value'
        ]

        validUrls.forEach(url => {
          const result = securityManager.validateInput(url, 'url')
          expect(result.isValid).toBe(true)
        })
      })

      it('rejects invalid URLs', () => {
        const invalidUrls = ['not-a-url', 'ftp://example.com', 'javascript:alert(1)']
        
        invalidUrls.forEach(url => {
          const result = securityManager.validateInput(url, 'url')
          expect(result.isValid).toBe(false)
        })
      })
    })

    describe('number validation', () => {
      it('validates valid numbers', () => {
        const result = securityManager.validateInput('123', 'number')
        expect(result.isValid).toBe(true)
        expect(result.sanitizedValue).toBe(123)
      })

      it('rejects invalid numbers', () => {
        const result = securityManager.validateInput('not-a-number', 'number')
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Value must be a valid number')
      })
    })

    describe('JSON validation', () => {
      it('validates valid JSON strings', () => {
        const result = securityManager.validateInput('{"key": "value"}', 'json')
        expect(result.isValid).toBe(true)
        expect(result.sanitizedValue).toEqual({ key: 'value' })
      })

      it('validates JSON objects', () => {
        const obj = { key: 'value' }
        const result = securityManager.validateInput(obj, 'json')
        expect(result.isValid).toBe(true)
        expect(result.sanitizedValue).toEqual(obj)
      })

      it('rejects invalid JSON', () => {
        const result = securityManager.validateInput('{invalid json}', 'json')
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Invalid JSON format')
      })
    })
  })

  describe('sanitizeString', () => {
    it('removes script tags', () => {
      const input = '<script>alert("xss")</script>'
      const result = securityManager.sanitizeString(input)
      expect(result).toBe('scriptalert("xss")/script')
    })

    it('removes javascript protocol', () => {
      const input = 'javascript:alert("xss")'
      const result = securityManager.sanitizeString(input)
      expect(result).toBe('alert("xss")')
    })

    it('removes event handlers', () => {
      const input = 'onclick="alert(1)" onload="alert(2)"'
      const result = securityManager.sanitizeString(input)
      expect(result).toBe('')
    })

    it('trims whitespace', () => {
      const input = '  test string  '
      const result = securityManager.sanitizeString(input)
      expect(result).toBe('test string')
    })
  })

  describe('validateYouTubeURL', () => {
    it('validates valid YouTube URLs', () => {
      const validUrls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
        'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtube.com/watch?v=dQw4w9WgXcQ'
      ]

      validUrls.forEach(url => {
        const result = securityManager.validateYouTubeURL(url)
        expect(result.isValid).toBe(true)
      })
    })

    it('rejects non-YouTube URLs', () => {
      const invalidUrls = [
        'https://example.com',
        'https://vimeo.com/123',
        'https://youtube.com',
        'https://youtu.be/'
      ]

      invalidUrls.forEach(url => {
        const result = securityManager.validateYouTubeURL(url)
        expect(result.isValid).toBe(false)
      })
    })

    it('rejects invalid URL formats', () => {
      const result = securityManager.validateYouTubeURL('not-a-url')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid URL format')
    })

    it('requires URL parameter', () => {
      const result = securityManager.validateYouTubeURL('')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('URL is required')
    })
  })

  describe('validatePassword', () => {
    it('validates strong passwords', () => {
      const strongPassword = 'StrongPass123!'
      const result = securityManager.validatePassword(strongPassword)
      expect(result.isValid).toBe(true)
    })

    it('rejects weak passwords', () => {
      const weakPasswords = [
        'short', // too short
        'nouppercase123!', // no uppercase
        'NOLOWERCASE123!', // no lowercase
        'NoNumbers!', // no numbers
        'NoSpecial123', // no special characters
      ]

      weakPasswords.forEach(password => {
        const result = securityManager.validatePassword(password)
        expect(result.isValid).toBe(false)
      })
    })
  })

  describe('validateAPIKey', () => {
    it('validates valid API keys', () => {
      const validKeys = [
        'sk-1234567890abcdefghijklmnopqrstuvwxyz',
        'pk_test_1234567890abcdefghijklmnopqrstuvwxyz',
        'AIzaSyB1234567890abcdefghijklmnopqrstuvwxyz'
      ]

      validKeys.forEach(key => {
        expect(securityManager.validateAPIKey(key)).toBe(true)
      })
    })

    it('rejects invalid API keys', () => {
      const invalidKeys = [
        '', // empty
        'short', // too short
        'invalid@key', // invalid characters
        null,
        undefined
      ]

      invalidKeys.forEach(key => {
        expect(securityManager.validateAPIKey(key as string)).toBe(false)
      })
    })
  })

  describe('CSRF protection', () => {
    it('generates unique CSRF tokens', () => {
      const token1 = securityManager.generateCSRFToken()
      const token2 = securityManager.generateCSRFToken()
      
      expect(token1).toBeDefined()
      expect(token2).toBeDefined()
      expect(token1).not.toBe(token2)
    })

    it('validates CSRF tokens correctly', () => {
      const token = securityManager.generateCSRFToken()
      expect(securityManager.validateCSRFToken(token, token)).toBe(true)
      expect(securityManager.validateCSRFToken(token, 'different-token')).toBe(false)
    })
  })

  describe('origin validation', () => {
    it('validates allowed origins', () => {
      expect(securityManager.validateOrigin('https://ytsbyai.vercel.app')).toBe(true)
      expect(securityManager.validateOrigin('http://localhost:3000')).toBe(true)
    })

    it('rejects disallowed origins', () => {
      expect(securityManager.validateOrigin('https://malicious.com')).toBe(false)
      expect(securityManager.validateOrigin('http://localhost:3001')).toBe(false)
    })
  })

  describe('request size validation', () => {
    it('validates acceptable request sizes', () => {
      expect(securityManager.validateRequestSize(1024)).toBe(true)
      expect(securityManager.validateRequestSize(10 * 1024 * 1024)).toBe(true) // max size
    })

    it('rejects oversized requests', () => {
      expect(securityManager.validateRequestSize(11 * 1024 * 1024)).toBe(false)
    })
  })

  describe('security headers', () => {
    it('generates security headers', () => {
      const headers = securityManager.getSecurityHeaders()
      
      expect(headers['X-Content-Type-Options']).toBe('nosniff')
      expect(headers['X-Frame-Options']).toBe('DENY')
      expect(headers['Referrer-Policy']).toBe('origin-when-cross-origin')
      expect(headers['Permissions-Policy']).toBe('camera=(), microphone=(), geolocation=()')
    })

    it('includes CSP when enabled', () => {
      const headers = securityManager.getSecurityHeaders()
      expect(headers['Content-Security-Policy']).toBeDefined()
      expect(headers['Content-Security-Policy']).toContain("default-src 'self'")
    })

    it('excludes CSP when disabled', () => {
      securityManager.updateConfig({ enableCSP: false })
      const headers = securityManager.getSecurityHeaders()
      expect(headers['Content-Security-Policy']).toBeUndefined()
    })

    it('includes HSTS when enabled', () => {
      const headers = securityManager.getSecurityHeaders()
      expect(headers['Strict-Transport-Security']).toBe('max-age=31536000; includeSubDomains')
    })

    it('excludes HSTS when disabled', () => {
      securityManager.updateConfig({ enableHSTS: false })
      const headers = securityManager.getSecurityHeaders()
      expect(headers['Strict-Transport-Security']).toBeUndefined()
    })
  })

  describe('rate limiting', () => {
    it('creates rate limiter function', () => {
      const rateLimiter = securityManager.createRateLimiter(5, 60000) // 5 requests per minute
      expect(typeof rateLimiter).toBe('function')
    })

    it('allows requests within limit', () => {
      const rateLimiter = securityManager.createRateLimiter(3, 60000)
      
      expect(rateLimiter('user1')).toBe(true)
      expect(rateLimiter('user1')).toBe(true)
      expect(rateLimiter('user1')).toBe(true)
    })

    it('blocks requests over limit', () => {
      const rateLimiter = securityManager.createRateLimiter(2, 60000)
      
      expect(rateLimiter('user1')).toBe(true)
      expect(rateLimiter('user1')).toBe(true)
      expect(rateLimiter('user1')).toBe(false) // blocked
    })

    it('tracks different users separately', () => {
      const rateLimiter = securityManager.createRateLimiter(1, 60000)
      
      expect(rateLimiter('user1')).toBe(true)
      expect(rateLimiter('user2')).toBe(true) // different user
      expect(rateLimiter('user1')).toBe(false) // user1 blocked
    })
  })

  describe('configuration', () => {
    it('updates configuration', () => {
      const newConfig = { maxRequestSize: 5 * 1024 * 1024 }
      securityManager.updateConfig(newConfig)
      
      const config = securityManager.getConfig()
      expect(config.maxRequestSize).toBe(5 * 1024 * 1024)
    })

    it('returns current configuration', () => {
      const config = securityManager.getConfig()
      expect(config).toHaveProperty('enableCSP')
      expect(config).toHaveProperty('enableHSTS')
      expect(config).toHaveProperty('allowedOrigins')
      expect(config).toHaveProperty('maxRequestSize')
    })
  })
}) 