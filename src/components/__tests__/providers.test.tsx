/**
 * Providers Component Tests
 *
 * Domain: Component testing
 * Responsibility: Test session and context providers
 * Boundaries: Component only, no external dependencies
 */

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { Providers } from '@/components/providers';

// Mock next-auth/react to avoid SessionProvider complexity
vi.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="session-provider">{children}</div>
  ),
}));

describe('Providers Component', () => {
  it('should render children', () => {
    // Arrange
    const testContent = <div>Test Content</div>;

    // Act
    const result = Providers({ children: testContent });

    // Assert
    expect(result).toBeDefined();
    expect(result.type.name).toBe('SessionProvider');
    expect(result.props.children).toBe(testContent);
  });

  it('should wrap children properly', () => {
    // Arrange
    const testContent = <div data-testid="test-child">Child Content</div>;

    // Act
    const result = Providers({ children: testContent });

    // Assert
    expect(result).toBeDefined();
    expect(result.props.children).toBe(testContent);
  });

  it('should render SessionProvider wrapper', () => {
    // Arrange
    const testContent = (
      <div data-testid="wrapped-content">Wrapped Content</div>
    );

    // Act
    const result = Providers({ children: testContent });

    // Assert
    expect(result).toBeDefined();
    expect(result.type.name).toBe('SessionProvider');
    expect(result.props.children).toBe(testContent);
  });
});
