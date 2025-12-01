import { describe, it, expect } from 'vitest';

describe('Input Validation & XSS Prevention', () => {
  it('should sanitize email input', () => {
    const sanitizeEmail = (email: string) => {
      return email.trim().toLowerCase();
    };

    const maliciousInput = '  TEST@EXAMPLE.COM  ';
    const sanitized = sanitizeEmail(maliciousInput);
    expect(sanitized).toBe('test@example.com');
  });

  it('should reject emails with script tags', () => {
    const isValidEmail = (email: string) => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return (
        regex.test(email) && !email.includes('<') && !email.includes('>')
      );
    };

    const maliciousEmails = [
      'test<script>alert("xss")</script>@example.com',
      '<img src=x onerror=alert("xss")>@example.com',
    ];

    maliciousEmails.forEach((email) => {
      expect(isValidEmail(email)).toBe(false);
    });
  });

  it('should validate name input', () => {
    const isValidName = (name: string) => {
      // Should not contain script tags or dangerous characters
      if (/<|>|script|javascript|onerror|onclick/i.test(name)) {
        return false;
      }
      // Should be non-empty and reasonable length
      return name.trim().length > 0 && name.length <= 100;
    };

    expect(isValidName('John Doe')).toBe(true);
    expect(isValidName('<script>alert("xss")</script>')).toBe(false);
    expect(isValidName('<img src=x onerror=alert()>')).toBe(false);
    expect(isValidName('')).toBe(false);
  });

  it('should escape HTML special characters', () => {
    const escapeHtml = (text: string) => {
      const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      };
      return text.replace(/[&<>"']/g, (char) => map[char]);
    };

    const dangerous = '<script>alert("xss")</script>';
    const escaped = escapeHtml(dangerous);
    expect(escaped).not.toContain('<script>');
    expect(escaped).toContain('&lt;script&gt;');
  });

  it('should prevent protocol injection', () => {
    const sanitizeUrl = (url: string) => {
      // Prevent javascript: protocol
      if (/^javascript:/i.test(url)) {
        return '#';
      }
      return url;
    };

    const maliciousUrl = 'javascript:alert("xss")';
    const sanitized = sanitizeUrl(maliciousUrl);
    expect(sanitized).toBe('#');
    
    const safeUrl = 'https://example.com';
    expect(sanitizeUrl(safeUrl)).toBe(safeUrl);
  });

  it('should validate phone numbers', () => {
    const isValidPhone = (phone: string) => {
      // Remove all non-digit characters
      const digits = phone.replace(/\D/g, '');
      // Should be 10-15 digits (typical phone length)
      return digits.length >= 10 && digits.length <= 15;
    };

    expect(isValidPhone('555-123-4567')).toBe(true);
    expect(isValidPhone('(555) 123-4567')).toBe(true);
    expect(isValidPhone('5551234567')).toBe(true);
    expect(isValidPhone('123')).toBe(false);
    expect(isValidPhone('<script>alert("xss")</script>')).toBe(false);
  });

  it('should sanitize text input', () => {
    const sanitizeText = (text: string) => {
      return text
        .trim()
        .replace(/[<>]/g, '') // Remove HTML brackets
        .slice(0, 1000); // Limit length
    };

    const input = '  Some text with <script>alert("xss")</script>  ';
    const sanitized = sanitizeText(input);
    expect(sanitized).toBe('Some text with scriptalert("xss")/script');
    expect(sanitized.length).toBeLessThanOrEqual(1000);
  });
});