import { describe, it, expect } from 'vitest'

// Validation utility functions
const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

const validatePassword = (password: string): boolean => {
  return password.length >= 6
}

const validateName = (name: string): boolean => {
  return name.trim().length > 0 && name.trim().length <= 100
}

const validateRole = (role: string): boolean => {
  return ['VOLUNTEER', 'MINISTRY_LEADER'].includes(role)
}

describe('Data Validation', () => {
  describe('Email validation', () => {
    it('accepts valid emails', () => {
      const validEmails = [
        'volunteer@demo.com',
        'leader@demo.com',
        'test.user@example.com',
        'user+tag@domain.co.uk',
      ]

      validEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(true)
      })
    })

    it('rejects invalid emails', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'test@',
        'test @example.com',
        'test@example',
      ]

      invalidEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(false)
      })
    })
  })

  describe('Password validation', () => {
    it('accepts passwords of 6+ characters', () => {
      expect(validatePassword('password123')).toBe(true)
      expect(validatePassword('123456')).toBe(true)
    })

    it('rejects passwords shorter than 6 characters', () => {
      expect(validatePassword('12345')).toBe(false)
      expect(validatePassword('')).toBe(false)
    })
  })

  describe('Name validation', () => {
    it('accepts valid names', () => {
      expect(validateName('John Doe')).toBe(true)
      expect(validateName('Sarah Leader')).toBe(true)
    })

    it('rejects empty names', () => {
      expect(validateName('')).toBe(false)
      expect(validateName('   ')).toBe(false)
    })

    it('rejects names exceeding 100 characters', () => {
      const longName = 'a'.repeat(101)
      expect(validateName(longName)).toBe(false)
    })

    it('accepts names at maximum length', () => {
      const maxName = 'a'.repeat(100)
      expect(validateName(maxName)).toBe(true)
    })
  })

  describe('Role validation', () => {
    it('accepts valid roles', () => {
      expect(validateRole('VOLUNTEER')).toBe(true)
      expect(validateRole('MINISTRY_LEADER')).toBe(true)
    })

    it('rejects invalid roles', () => {
      expect(validateRole('ADMIN')).toBe(false)
      expect(validateRole('USER')).toBe(false)
      expect(validateRole('')).toBe(false)
    })
  })

  describe('Combined validation', () => {
    it('validates a complete user signup form', () => {
      const validForm = {
        email: 'newuser@demo.com',
        password: 'securepassword123',
        name: 'New User',
        role: 'VOLUNTEER',
      }

      const isValid =
        validateEmail(validForm.email) &&
        validatePassword(validForm.password) &&
        validateName(validForm.name) &&
        validateRole(validForm.role)

      expect(isValid).toBe(true)
    })

    it('catches validation errors in form', () => {
      const invalidForm = {
        email: 'notanemail',
        password: '123',
        name: '',
        role: 'INVALID',
      }

      const isValid =
        validateEmail(invalidForm.email) &&
        validatePassword(invalidForm.password) &&
        validateName(invalidForm.name) &&
        validateRole(invalidForm.role)

      expect(isValid).toBe(false)
    })
  })
})
