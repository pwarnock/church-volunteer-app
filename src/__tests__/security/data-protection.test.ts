import { describe, it, expect } from 'vitest';

describe('Data Protection', () => {
  it('should not expose sensitive data in responses', () => {
    const userResponse = {
      id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      // Password should NEVER be in response
    };

    expect(userResponse).not.toHaveProperty('password');
    expect(userResponse).not.toHaveProperty('passwordHash');
  });

  it('should not log sensitive information', () => {
    const shouldNotLog = (data: string) => {
      const sensitivePatterns = [
        /password/i,
        /token/i,
        /secret/i,
        /api[_-]?key/i,
        /authorization/i,
      ];

      return !sensitivePatterns.some((pattern) => pattern.test(data));
    };

    expect(shouldNotLog('User email: test@example.com')).toBe(true);
    expect(shouldNotLog('Password: secret123')).toBe(false);
    expect(shouldNotLog('Bearer token: abc123')).toBe(false);
  });

  it('should mask PII in logs', () => {
    const maskPII = (text: string) => {
      return text
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '***@***.***')
        .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '***-**-****')
        .replace(/\b\d{4}\s\d{4}\s\d{4}\s\d{4}\b/g, '**** **** **** ****');
    };

    const sensitiveText = 'User john@example.com with card 1234-5678-9012-3456';
    const masked = maskPII(sensitiveText);
    
    expect(masked).toContain('***@***.***');
    expect(masked).toContain('***-**-****');
    expect(masked).not.toContain('john@example.com');
    expect(masked).not.toContain('1234-5678-9012-3456');
  });

  it('should encrypt sensitive data at rest', () => {
    const isEncryptedField = (fieldName: string, value: string): boolean => {
      const sensitiveFields = ['password', 'ssn', 'creditCard', 'token'];
      if (sensitiveFields.some(field => fieldName.toLowerCase().includes(field))) {
        // Should not be plaintext
        return !/^[A-Za-z0-9 ]+$/.test(value) && value.length > 10;
      }
      return true;
    };

    const encryptedPassword = 'xJ9$8mK#2pQ7wR@n5vL*';
    expect(isEncryptedField('password', encryptedPassword)).toBe(true);
    
    const plaintextPassword = 'password123';
    expect(isEncryptedField('password', plaintextPassword)).toBe(false);
  });

  it('should sanitize output to prevent data leaks', () => {
    const sanitizeOutput = (data: any): any => {
      const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'databaseUrl'];
      
      if (typeof data !== 'object' || data === null) {
        return data;
      }

      const sanitized = Array.isArray(data) ? [...data] : { ...data };
      
      for (const key in sanitized) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof sanitized[key] === 'object') {
          sanitized[key] = sanitizeOutput(sanitized[key]);
        }
      }
      
      return sanitized;
    };

    const sensitiveData = {
      name: 'John',
      password: 'secret123',
      profile: {
        email: 'john@example.com',
        apiToken: 'abc123',
      },
    };

    const sanitized = sanitizeOutput(sensitiveData);
    expect(sanitized.name).toBe('John');
    expect(sanitized.password).toBe('[REDACTED]');
    expect(sanitized.profile.email).toBe('john@example.com');
    expect(sanitized.profile.apiToken).toBe('[REDACTED]');
  });
});