#!/usr/bin/env bun

/**
 * API Dependency Validator
 *
 * Domain: Development tooling
 * Responsibility: Static analysis of fetch() calls and API route validation
 * Usage: bun run scripts/validate-api-dependencies.ts
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

interface APIEndpoint {
  route: string;
  methods: string[];
  file: string;
  line?: number;
}

interface FetchCall {
  url: string;
  method?: string;
  file: string;
  line: number;
  component: string;
}

interface ValidationResult {
  fetchCalls: FetchCall[];
  apiRoutes: APIEndpoint[];
  missingRoutes: string[];
  orphanedRoutes: APIEndpoint[];
  issues: string[];
}

class APIDependencyValidator {
  private projectRoot = process.cwd();
  private srcDir = join(this.projectRoot, 'src');

  /**
   * Extract all fetch() calls from TypeScript/JavaScript files
   */
  extractFetchCalls(): FetchCall[] {
    const fetchCalls: FetchCall[] = [];

    const scanDirectory = (dir: string) => {
      const items = readdirSync(dir);

      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);

        if (
          stat.isDirectory() &&
          !item.startsWith('.') &&
          item !== 'node_modules'
        ) {
          scanDirectory(fullPath);
        } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
          this.extractFromFile(fullPath, fetchCalls);
        }
      }
    };

    scanDirectory(this.srcDir);
    return fetchCalls;
  }

  /**
   * Extract fetch calls from a single file
   */
  private extractFromFile(filePath: string, fetchCalls: FetchCall[]): void {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      const relativePath = relative(this.projectRoot, filePath);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNumber = i + 1;

        // Match fetch() calls with various patterns
        const fetchPatterns = [
          /fetch\s*\(\s*['"`]([^'"`]+)['"`]/g,
          /fetch\s*\(\s*\{[^}]*url\s*:\s*['"`]([^'"`]+)['"`]/g,
          /\.get\s*\(\s*['"`]([^'"`]+)['"`]/g,
          /\.post\s*\(\s*['"`]([^'"`]+)['"`]/g,
          /\.put\s*\(\s*['"`]([^'"`]+)['"`]/g,
          /\.delete\s*\(\s*['"`]([^'"`]+)['"`]/g,
        ];

        for (const pattern of fetchPatterns) {
          let match;
          while ((match = pattern.exec(line)) !== null) {
            const url = match[1];

            // Skip external URLs and HTTP headers
            if (
              url.startsWith('http://') ||
              url.startsWith('https://') ||
              url.startsWith('x-') ||
              url.startsWith('user-agent') ||
              url.startsWith('authorization') ||
              url.startsWith('content-type')
            ) {
              continue;
            }

            // Extract method from context if available
            let method: string | undefined;
            if (line.includes('.get(')) method = 'GET';
            else if (line.includes('.post(')) method = 'POST';
            else if (line.includes('.put(')) method = 'PUT';
            else if (line.includes('.delete(')) method = 'DELETE';

            fetchCalls.push({
              url,
              method,
              file: relativePath,
              line: lineNumber,
              component: this.extractComponentName(filePath),
            });
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not process ${filePath}:`, error);
    }
  }

  /**
   * Extract component name from file path
   */
  private extractComponentName(filePath: string): string {
    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.replace(/\.(ts|tsx|js|jsx)$/, '');
  }

  /**
   * Extract all API routes from the file system
   */
  extractAPIRoutes(): APIEndpoint[] {
    const apiRoutes: APIEndpoint[] = [];
    const apiDir = join(this.srcDir, 'app', 'api');

    if (!statSync(apiDir).isDirectory()) {
      return apiRoutes;
    }

    const scanAPIDirectory = (dir: string, basePath = '') => {
      const items = readdirSync(dir);

      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          scanAPIDirectory(fullPath, join(basePath, item));
        } else if (item === 'route.ts' || item === 'route.js') {
          // Extract HTTP methods from the route file
          const methods = this.extractHTTPMethods(fullPath);
          const route = `/api/${basePath}`;

          apiRoutes.push({
            route,
            methods,
            file: relative(this.projectRoot, fullPath),
          });
        }
      }
    };

    scanAPIDirectory(apiDir);
    return apiRoutes;
  }

  /**
   * Extract HTTP methods from a route file
   */
  private extractHTTPMethods(filePath: string): string[] {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const methods: string[] = [];

      // Look for exported HTTP method handlers
      const methodPatterns = [
        /export\s+const\s+GET\s*=/,
        /export\s+const\s+POST\s*=/,
        /export\s+const\s+PUT\s*=/,
        /export\s+const\s+DELETE\s*=/,
        /export\s+const\s+PATCH\s*=/,
      ];

      if (methodPatterns[0].test(content)) methods.push('GET');
      if (methodPatterns[1].test(content)) methods.push('POST');
      if (methodPatterns[2].test(content)) methods.push('PUT');
      if (methodPatterns[3].test(content)) methods.push('DELETE');
      if (methodPatterns[4].test(content)) methods.push('PATCH');

      return methods;
    } catch (error) {
      console.warn(
        `Warning: Could not extract methods from ${filePath}:`,
        error
      );
      return [];
    }
  }

  /**
   * Validate dependencies between fetch calls and API routes
   */
  validateDependencies(): ValidationResult {
    const fetchCalls = this.extractFetchCalls();
    const apiRoutes = this.extractAPIRoutes();

    const issues: string[] = [];
    const missingRoutes: string[] = [];
    const orphanedRoutes: APIEndpoint[] = [];

    // Check for missing routes
    for (const fetch of fetchCalls) {
      const matchingRoute = apiRoutes.find((route) =>
        this.routeMatches(fetch.url, route.route)
      );

      if (!matchingRoute) {
        missingRoutes.push(fetch.url);
        issues.push(
          `❌ Missing API route: ${fetch.url} called in ${fetch.file}:${fetch.line}`
        );
      } else if (
        fetch.method &&
        !matchingRoute.methods.includes(fetch.method)
      ) {
        issues.push(
          `❌ Method mismatch: ${fetch.method} ${fetch.url} not supported by ${matchingRoute.file}`
        );
      }
    }

    // Check for orphaned routes (exclude utility endpoints)
    const utilityRoutes = [
      '/api/docs',
      '/api/health',
      '/api/metrics',
      '/api/simple',
      '/api/test-dashboard',
    ];

    for (const route of apiRoutes) {
      // Skip utility routes - they don't need to be called by frontend
      if (utilityRoutes.includes(route.route)) {
        continue;
      }

      const isUsed = fetchCalls.some((fetch) =>
        this.routeMatches(fetch.url, route.route)
      );

      if (!isUsed) {
        orphanedRoutes.push(route);
        issues.push(
          `⚠️  Orphaned route: ${route.route} defined in ${route.file} but not used`
        );
      }
    }

    return {
      fetchCalls,
      apiRoutes,
      missingRoutes,
      orphanedRoutes,
      issues,
    };
  }

  /**
   * Check if a fetch URL matches a route pattern
   */
  private routeMatches(fetchUrl: string, route: string): boolean {
    // Handle dynamic routes like /api/opportunities/[id]
    const routePattern = route
      .replace(/\[([^\]]+)\]/g, '([^/]+)')
      .replace('/', '\\/');

    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(fetchUrl);
  }

  /**
   * Generate a comprehensive report
   */
  generateReport(result: ValidationResult): void {
    console.log('\n🔍 API Dependency Validation Report\n');
    console.log('='.repeat(50));

    console.log(`\n📊 Summary:`);
    console.log(`   Fetch calls found: ${result.fetchCalls.length}`);
    console.log(`   API routes found: ${result.apiRoutes.length}`);
    console.log(`   Missing routes: ${result.missingRoutes.length}`);
    console.log(`   Orphaned routes: ${result.orphanedRoutes.length}`);
    console.log(`   Total issues: ${result.issues.length}`);

    if (result.issues.length > 0) {
      console.log(`\n❌ Issues Found:`);
      result.issues.forEach((issue) => console.log(`   ${issue}`));
    } else {
      console.log(`\n✅ No issues found! All API dependencies are valid.`);
    }

    // Detailed sections
    if (result.missingRoutes.length > 0) {
      console.log(`\n🚫 Missing Routes:`);
      result.missingRoutes.forEach((route) => console.log(`   - ${route}`));
    }

    if (result.orphanedRoutes.length > 0) {
      console.log(`\n👻 Orphaned Routes:`);
      result.orphanedRoutes.forEach((route) =>
        console.log(`   - ${route.route} (${route.methods.join(', ')})`)
      );
    }

    console.log('\n' + '='.repeat(50));
  }
}

// Main execution
async function main() {
  const validator = new APIDependencyValidator();
  const result = validator.validateDependencies();

  validator.generateReport(result);

  // Exit with error code if issues found
  if (result.issues.length > 0) {
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch(console.error);
}

export { APIDependencyValidator };
