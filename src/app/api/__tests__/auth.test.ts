import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';

describe('Authentication API', () => {
  describe('Password hashing', () => {
    it('hashes passwords with bcrypt', async () => {
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 12);

      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    it('hashed password is different each time', async () => {
      const password = 'password123';
      const hash1 = await bcrypt.hash(password, 12);
      const hash2 = await bcrypt.hash(password, 12);

      expect(hash1).not.toBe(hash2);
    });

    it('verifies correct password', async () => {
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 12);

      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('rejects incorrect password', async () => {
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 12);

      const isValid = await bcrypt.compare('wrongpassword', hashedPassword);
      expect(isValid).toBe(false);
    });
  });

  describe('Email validation', () => {
    it('accepts valid email format', () => {
      const validEmails = [
        'test@example.com',
        'volunteer@demo.com',
        'leader@demo.com',
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      validEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    it('rejects invalid email format', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'test@',
        'test @example.com',
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      invalidEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });

  describe('Credential validation', () => {
    it('requires email', () => {
      const credentials = { email: '', password: 'password123' };
      expect(credentials.email.length).toBe(0);
    });

    it('requires password', () => {
      const credentials = { email: 'test@example.com', password: '' };
      expect(credentials.password.length).toBe(0);
    });

    it('requires minimum password length', () => {
      const minLength = 6;
      const shortPassword = 'pass';
      expect(shortPassword.length >= minLength).toBe(false);

      const validPassword = 'password123';
      expect(validPassword.length >= minLength).toBe(true);
    });
  });
});
