#!/usr/bin/env bun

/**
 * API Contract Generator
 *
 * Domain: Development tooling
 * Responsibility: Auto-generate API contracts from route definitions
 * Usage: bun run scripts/generate-api-contracts.ts
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, relative } from 'path';

interface APIContract {
  route: string;
  methods: HTTPMethod[];
  requestSchema?: any;
  responseSchema?: any;
  description?: string;
  file: string;
}

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ContractCollection {
  contracts: APIContract[];
  generatedAt: string;
  version: string;
}

class APIContractGenerator {
  private projectRoot = process.cwd();
  private srcDir = join(this.projectRoot, 'src');
  private outputDir = join(this.projectRoot, 'contracts');

  /**
   * Generate API contracts from all route files
   */
  generateContracts(): ContractCollection {
    const contracts = this.extractContractsFromRoutes();

    return {
      contracts,
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  /**
   * Extract contracts from API route files
   */
  private extractContractsFromRoutes(): APIContract[] {
    const contracts: APIContract[] = [];
    const apiDir = join(this.srcDir, 'app', 'api');

    if (!statSync(apiDir).isDirectory()) {
      return contracts;
    }

    const scanAPIDirectory = (dir: string, basePath = '') => {
      const items = readdirSync(dir);

      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          scanAPIDirectory(fullPath, join(basePath, item));
        } else if (item === 'route.ts' || item === 'route.js') {
          const contract = this.extractContractFromFile(fullPath, basePath);
          if (contract) {
            contracts.push(contract);
          }
        }
      }
    };

    scanAPIDirectory(apiDir);
    return contracts;
  }

  /**
   * Extract contract from a single route file
   */
  private extractContractFromFile(
    filePath: string,
    basePath: string
  ): APIContract | null {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const route = `/api/${basePath}`;

      // Extract HTTP methods
      const methods = this.extractHTTPMethods(content);
      if (methods.length === 0) {
        return null;
      }

      // Extract schemas from the file
      const { requestSchema, responseSchema, description } =
        this.extractSchemas(content);

      return {
        route,
        methods,
        requestSchema,
        responseSchema,
        description,
        file: relative(this.projectRoot, filePath),
      };
    } catch (error) {
      console.warn(
        `Warning: Could not extract contract from ${filePath}:`,
        error
      );
      return null;
    }
  }

  /**
   * Extract HTTP methods from route file content
   */
  private extractHTTPMethods(content: string): HTTPMethod[] {
    const methods: HTTPMethod[] = [];

    // Look for exported HTTP method handlers
    const methodPatterns = [
      { pattern: /export\s+const\s+GET\s*=/, method: 'GET' as HTTPMethod },
      { pattern: /export\s+const\s+POST\s*=/, method: 'POST' as HTTPMethod },
      { pattern: /export\s+const\s+PUT\s*=/, method: 'PUT' as HTTPMethod },
      {
        pattern: /export\s+const\s+DELETE\s*=/,
        method: 'DELETE' as HTTPMethod,
      },
      { pattern: /export\s+const\s+PATCH\s*=/, method: 'PATCH' as HTTPMethod },
    ];

    for (const { pattern, method } of methodPatterns) {
      if (pattern.test(content)) {
        methods.push(method);
      }
    }

    return methods;
  }

  /**
   * Extract request/response schemas and description from route file
   */
  private extractSchemas(content: string): {
    requestSchema?: any;
    responseSchema?: any;
    description?: string;
  } {
    const result: {
      requestSchema?: any;
      responseSchema?: any;
      description?: string;
    } = {};

    // Extract description from JSDoc comments
    const descriptionMatch = content.match(/\/\*\*\s*\n\s*\*\s*([^*]+)\s*\n/);
    if (descriptionMatch) {
      result.description = descriptionMatch[1].trim();
    }

    // Extract Zod schemas
    const schemaPatterns = [
      {
        pattern: /requestSchema\s*:\s*(\w+Schema)/,
        type: 'request' as const,
        extract: (match: RegExpMatchArray) =>
          this.extractZodSchema(content, match[1]),
      },
      {
        pattern: /responseSchema\s*:\s*(\w+Schema)/,
        type: 'response' as const,
        extract: (match: RegExpMatchArray) =>
          this.extractZodSchema(content, match[1]),
      },
    ];

    for (const { pattern, type, extract } of schemaPatterns) {
      const match = content.match(pattern);
      if (match) {
        const schema = extract(match);
        if (schema) {
          if (type === 'request') {
            result.requestSchema = schema;
          } else {
            result.responseSchema = schema;
          }
        }
      }
    }

    // Try to infer schemas from validation calls
    if (!result.requestSchema) {
      const validationMatch = content.match(/(\w+Schema)\.safeParse/);
      if (validationMatch) {
        result.requestSchema = this.extractZodSchema(
          content,
          validationMatch[1]
        );
      }
    }

    return result;
  }

  /**
   * Extract Zod schema definition from file content
   */
  private extractZodSchema(content: string, schemaName: string): any {
    try {
      // Look for schema definition
      const schemaPattern = new RegExp(
        `const\\s+${schemaName}\\s*=\\s*({[\\s\\S]*?});`
      );
      const match = content.match(schemaPattern);

      if (!match) {
        return {
          type: 'unknown',
          description: `Schema ${schemaName} not found`,
        };
      }

      // Simple schema parsing (in real implementation, use AST parsing)
      const schemaDef = match[1];

      // Parse basic Zod patterns
      if (schemaDef.includes('z.object(')) {
        return this.parseZodObject(schemaDef);
      } else if (schemaDef.includes('z.string(')) {
        return { type: 'string' };
      } else if (schemaDef.includes('z.number(')) {
        return { type: 'number' };
      } else if (schemaDef.includes('z.boolean(')) {
        return { type: 'boolean' };
      }

      return { type: 'schema', definition: schemaDef };
    } catch (error) {
      return { type: 'error', error: String(error) };
    }
  }

  /**
   * Parse Zod object schema
   */
  private parseZodObject(schemaDef: string): any {
    try {
      const objectMatch = schemaDef.match(/z\.object\(\s*({[\s\S]*?})\s*\)/);
      if (!objectMatch) {
        return { type: 'object', properties: {} };
      }

      const objectBody = objectMatch[1];
      const properties: any = {};

      // Parse field definitions
      const fieldPattern = /(\w+)\s*:\s*z\.(\w+)\([^)]*\)/g;
      let fieldMatch;

      while ((fieldMatch = fieldPattern.exec(objectBody)) !== null) {
        const [, fieldName, fieldType] = fieldMatch;
        properties[fieldName] = { type: fieldType.toLowerCase() };
      }

      return {
        type: 'object',
        properties,
      };
    } catch (error) {
      return { type: 'object', error: String(error) };
    }
  }

  /**
   * Save contracts to file
   */
  saveContracts(contracts: ContractCollection): void {
    // Ensure output directory exists
    try {
      statSync(this.outputDir);
    } catch {
      // Directory doesn't exist, create it
      require('fs').mkdirSync(this.outputDir, { recursive: true });
    }

    const outputFile = join(this.outputDir, 'api-contracts.json');
    writeFileSync(outputFile, JSON.stringify(contracts, null, 2));

    console.log(`✅ API contracts saved to: ${outputFile}`);
  }

  /**
   * Generate TypeScript types from contracts
   */
  generateTypeScriptTypes(contracts: ContractCollection): void {
    let types = `// Auto-generated API contract types
// Generated at: ${contracts.generatedAt}
// Version: ${contracts.version}

`;

    for (const contract of contracts.contracts) {
      const routeName = this.routeToTypeName(contract.route);

      types += `// ${contract.description || contract.route}\n`;

      if (contract.requestSchema) {
        types += `export interface ${routeName}Request ${this.schemaToTypeScript(contract.requestSchema)}\n`;
      }

      if (contract.responseSchema) {
        types += `export interface ${routeName}Response ${this.schemaToTypeScript(contract.responseSchema)}\n`;
      }

      types += `\n`;
    }

    const typesFile = join(this.outputDir, 'api-contracts.types.ts');
    writeFileSync(typesFile, types);

    console.log(`✅ TypeScript types saved to: ${typesFile}`);
  }

  /**
   * Convert route path to TypeScript type name
   */
  private routeToTypeName(route: string): string {
    return (
      route
        .split('/')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('') + 'API'
    );
  }

  /**
   * Convert schema to TypeScript type definition
   */
  private schemaToTypeScript(schema: any): string {
    if (typeof schema === 'string') {
      return schema;
    }

    switch (schema.type) {
      case 'object':
        if (schema.properties) {
          const props = Object.entries(schema.properties)
            .map(
              ([key, value]) => `  ${key}: ${this.schemaToTypeScript(value)};`
            )
            .join('\n');
          return `{\n${props}\n}`;
        }
        return 'object';
      case 'string':
        return 'string';
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      default:
        return 'any';
    }
  }

  /**
   * Generate a comprehensive report
   */
  generateReport(contracts: ContractCollection): void {
    console.log('\n📋 API Contract Generation Report\n');
    console.log('='.repeat(50));

    console.log(`\n📊 Summary:`);
    console.log(`   Contracts generated: ${contracts.contracts.length}`);
    console.log(`   Generated at: ${contracts.generatedAt}`);
    console.log(`   Version: ${contracts.version}`);

    console.log(`\n🔗 API Endpoints:`);
    for (const contract of contracts.contracts) {
      console.log(`   ${contract.methods.join(', ')} ${contract.route}`);
      if (contract.description) {
        console.log(`      └─ ${contract.description}`);
      }
    }

    console.log('\n' + '='.repeat(50));
  }
}

// Main execution
async function main() {
  const generator = new APIContractGenerator();
  const contracts = generator.generateContracts();

  generator.generateReport(contracts);
  generator.saveContracts(contracts);
  generator.generateTypeScriptTypes(contracts);
}

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch(console.error);
}

export { APIContractGenerator };
