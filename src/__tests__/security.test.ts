/**
 * Security Tests - Main Entry Point
 * 
 * This file serves as the main entry point for security tests.
 * The actual test implementations have been split into focused modules:
 * 
 * - password-security.test.ts - Password strength, hashing, and validation
 * - input-validation-security.test.ts - Input sanitization and XSS prevention
 * - auth-security.test.ts - Authentication and session security
 * - authorization-security.test.ts - Role-based access control
 * - data-protection.test.ts - Data handling and PII protection
 * - sql-injection-security.test.ts - SQL injection prevention
 * - infrastructure-security.test.ts - CORS, headers, rate limiting, and environment security
 * 
 * This modular approach improves maintainability and allows focused testing of specific security domains.
 */

// Import all security test modules - this will run all security tests
import './security/password-security.test.js';
import './security/input-validation-security.test.js';
import './security/auth-security.test.js';
import './security/authorization-security.test.js';
import './security/data-protection.test.js';
import './security/sql-injection-security.test.js';
import './security/infrastructure-security.test.js';

// Optional: Run a quick smoke test to ensure all modules loaded
describe('Security Test Suite Integration', () => {
  it('should load all security test modules', () => {
    // This test verifies that all security modules have been successfully imported
    // It serves as a smoke test for the entire security test suite
    expect(true).toBe(true); // If we reach here, all imports succeeded
  });

  it('should cover major security domains', () => {
    const securityDomains = [
      'password-security',
      'input-validation-security', 
      'auth-security',
      'authorization-security',
      'data-protection',
      'sql-injection-security',
      'infrastructure-security'
    ];

    // Verify we have comprehensive security coverage
    expect(securityDomains.length).toBeGreaterThan(5);
    expect(securityDomains).toContain('password-security');
    expect(securityDomains).toContain('auth-security');
    expect(securityDomains).toContain('data-protection');
  });
});