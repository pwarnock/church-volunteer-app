/**
 * Logger compatibility wrapper
 *
 * This file maintains backward compatibility while the implementation
 * has been moved to a modular structure.
 */

// Re-export everything from the new modular logger
export * from './logger/index.js';

// Create a default export for backward compatibility
import { logger as defaultLogger } from './logger/index.js';
export default defaultLogger;
