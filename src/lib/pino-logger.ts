/**
 * Pino Logger - Refactored for maintainability
 *
 * This is a compatibility wrapper for the refactored pino logger module.
 * All functionality has been preserved while improving code organization.
 */

// Re-export everything from the modular pino logger
export * from './pino/index.js';

// For backward compatibility, create a default export
export { logger as default } from './pino/index.js';
