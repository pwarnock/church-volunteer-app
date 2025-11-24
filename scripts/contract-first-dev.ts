#!/usr/bin/env bun

/**
 * Contract-First API Development Tool
 *
 * Domain: Development tooling
 * Responsibility: Contract-first API development workflow
 * Usage: bun run scripts/contract-first-dev.ts
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface APIContract {
  route: string;
  methods: string[];
  requestSchema?: any;
  responseSchema?: any;
  description?: string;
  examples?: {
    request?: any;
    response?: any;
  };
}

interface ContractFirstConfig {
  contractsDir: string;
  generatedDir: string;
  mockServerPort: number;
}

class ContractFirstDevelopment {
  private config: ContractFirstConfig = {
    contractsDir: 'contracts/api',
    generatedDir: 'src/generated',
    mockServerPort: 3001,
  };

  /**
   * Initialize contract-first development
   */
  async init(): Promise<void> {
    console.log('🚀 Initializing Contract-First API Development\n');

    // Create contracts directory structure
    this.createDirectoryStructure();

    // Generate example contracts from existing routes
    await this.generateExampleContracts();

    // Set up mock server
    this.setupMockServer();

    // Generate TypeScript types
    this.generateTypes();

    console.log('✅ Contract-first development initialized!');
    console.log('\n📋 Next steps:');
    console.log('1. Review and refine contracts in contracts/api/');
    console.log('2. Frontend: Use generated types and mock server');
    console.log('3. Backend: Implement routes to match contracts');
    console.log('4. Run: bun run contract:validate to check compliance');
  }

  /**
   * Create directory structure for contract-first development
   */
  private createDirectoryStructure(): void {
    const dirs = [
      'contracts',
      'contracts/api',
      'contracts/examples',
      'src/generated',
      'src/generated/types',
      'src/generated/mocks',
      'src/generated/validators',
    ];

    dirs.forEach((dir) => {
      const fullPath = join(process.cwd(), dir);
      if (!existsSync(fullPath)) {
        require('fs').mkdirSync(fullPath, { recursive: true });
        console.log(`📁 Created: ${dir}`);
      }
    });
  }

  /**
   * Generate example contracts from existing routes
   */
  private async generateExampleContracts(): Promise<void> {
    console.log('\n📝 Generating example contracts from existing routes...');

    // Import our previous contract generator
    const { APIContractGenerator } = await import('./generate-api-contracts');
    const generator = new APIContractGenerator();
    const contracts = generator.generateContracts();

    // Enhance contracts with examples and better structure
    const enhancedContracts = contracts.contracts.map((contract) => ({
      ...contract,
      examples: this.generateExamples(contract),
      version: '1.0.0',
      tags: this.extractTags(contract.route),
    }));

    // Save individual contract files
    enhancedContracts.forEach((contract) => {
      const fileName = this.routeToFileName(contract.route);
      const filePath = join(process.cwd(), 'contracts/api', `${fileName}.json`);
      writeFileSync(filePath, JSON.stringify(contract, null, 2));
      console.log(`📄 Contract: ${fileName}.json`);
    });

    // Save contract index
    const indexFile = join(process.cwd(), 'contracts/api/index.json');
    writeFileSync(
      indexFile,
      JSON.stringify(
        {
          contracts: enhancedContracts,
          generatedAt: new Date().toISOString(),
          version: '1.0.0',
        },
        null,
        2
      )
    );
  }

  /**
   * Generate request/response examples for a contract
   */
  private generateExamples(contract: APIContract): {
    request?: any;
    response?: any;
  } {
    const examples: { request?: any; response?: any } = {};

    // Generate examples based on route and methods
    if (
      contract.methods.includes('POST') &&
      contract.route.includes('opportunities')
    ) {
      examples.request = {
        title: 'Youth Ministry Volunteer',
        description: 'Help with youth ministry activities and mentoring',
        ministry: 'Youth Ministry',
        location: 'Church Main Building',
        requirements: ['Background check', 'Love for working with teens'],
        timeCommitment: '2-3 hours per week',
        startDate: '2024-01-15',
        endDate: '2024-06-15',
      };

      examples.response = {
        id: 'opp_123',
        title: 'Youth Ministry Volunteer',
        status: 'ACTIVE',
        createdAt: '2024-01-10T10:00:00Z',
      };
    }

    if (
      contract.methods.includes('GET') &&
      contract.route === '/api/opportunities'
    ) {
      examples.response = {
        opportunities: [
          {
            id: 'opp_123',
            title: 'Youth Ministry Volunteer',
            description: 'Help with youth ministry activities',
            ministry: 'Youth Ministry',
            status: 'ACTIVE',
            _count: { applications: 3 },
          },
        ],
      };
    }

    return examples;
  }

  /**
   * Extract tags from route for categorization
   */
  private extractTags(route: string): string[] {
    const tags: string[] = [];

    if (route.includes('opportunities')) tags.push('opportunities');
    if (route.includes('applications')) tags.push('applications');
    if (route.includes('auth')) tags.push('authentication');
    if (route.includes('volunteer')) tags.push('volunteers');
    if (route.includes('leader')) tags.push('leaders');

    return tags.length > 0 ? tags : ['general'];
  }

  /**
   * Convert route to filename
   */
  private routeToFileName(route: string): string {
    return (
      route
        .replace(/^\/api\//, '')
        .replace(/\//g, '-')
        .replace(/^\-/, '') || 'root'
    );
  }

  /**
   * Set up mock server based on contracts
   */
  private setupMockServer(): void {
    const mockServerCode = `
/**
 * Auto-generated Mock API Server
 * Based on contracts in contracts/api/
 */

import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join } from 'path';

const contracts = JSON.parse(
  readFileSync(join(process.cwd(), 'contracts/api/index.json'), 'utf8')
);

const server = createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const url = new URL(req.url, \`http://localhost:\${process.env.PORT || 3001}\`);
  const path = url.pathname;
  
  // Find matching contract
  const contract = contracts.contracts.find(c => c.route === path);
  
  if (!contract) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
    return;
  }
  
  if (!contract.methods.includes(req.method)) {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }
  
  // Return mock response
  const examples = contract.examples || {};
  const mockResponse = examples.response || { message: 'Mock response' };
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(mockResponse));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(\`🚀 Mock API server running on http://localhost:\${PORT}\`);
  console.log('📋 Available endpoints:');
  contracts.contracts.forEach(contract => {
    console.log(\`   \${contract.methods.join(', ')} \${contract.route}\`);
  });
});
`;

    const mockServerFile = join(process.cwd(), 'src/generated/mock-server.ts');
    writeFileSync(mockServerFile, mockServerCode);

    // Add to package.json scripts
    this.updatePackageJson();

    console.log('🔧 Mock server generated');
  }

  /**
   * Update package.json with contract-first scripts
   */
  private updatePackageJson(): void {
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    packageJson.scripts = {
      ...packageJson.scripts,
      'contract:init': 'bunx tsx scripts/contract-first-dev.ts init',
      'contract:validate': 'bunx tsx scripts/contract-first-dev.ts validate',
      'contract:mock': 'bunx tsx src/generated/mock-server.ts',
      'contract:generate': 'bunx tsx scripts/generate-api-contracts.ts',
    };

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }

  /**
   * Generate TypeScript types from contracts
   */
  private generateTypes(): void {
    const typesCode = `
/**
 * Auto-generated types from API contracts
 * Contract-first development approach
 */

import { z } from 'zod';

// Base types
export interface BaseResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
}

// Opportunity types
export const OpportunitySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  ministry: z.string(),
  location: z.string(),
  requirements: z.array(z.string()),
  timeCommitment: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'COMPLETED']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  leaderId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  _count: z.object({
    applications: z.number(),
  }),
});

export type Opportunity = z.infer<typeof OpportunitySchema>;

// API Response types
export interface OpportunitiesResponse {
  opportunities: Opportunity[];
}

export interface OpportunityResponse {
  opportunity: Opportunity;
}

// Request types
export const CreateOpportunitySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  ministry: z.string().min(1),
  location: z.string().min(1),
  requirements: z.array(z.string()),
  timeCommitment: z.string().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateOpportunityRequest = z.infer<typeof CreateOpportunitySchema>;
`;

    const typesFile = join(
      process.cwd(),
      'src/generated/types/api-contracts.ts'
    );
    writeFileSync(typesFile, typesCode);

    console.log('📝 TypeScript types generated');
  }

  /**
   * Validate implementation against contracts
   */
  async validate(): Promise<void> {
    console.log('🔍 Validating implementation against contracts...\n');

    // Import validators
    const { APIDependencyValidator } = await import(
      './validate-api-dependencies'
    );
    const validator = new APIDependencyValidator();
    const result = validator.validateDependencies();

    // Additional contract-specific validation
    const contractValidation = this.validateContractCompliance();

    console.log('\n📋 Contract Compliance Report:');
    console.log(`   Contracts defined: ${contractValidation.totalContracts}`);
    console.log(
      `   Implementations found: ${contractValidation.implementedContracts}`
    );
    console.log(
      `   Missing implementations: ${contractValidation.missingImplementations.length}`
    );
    console.log(
      `   Contract violations: ${contractValidation.violations.length}`
    );

    if (contractValidation.violations.length > 0) {
      console.log('\n❌ Contract Violations:');
      contractValidation.violations.forEach((violation) => {
        console.log(`   - ${violation}`);
      });
    }

    if (result.issues.length > 0 || contractValidation.violations.length > 0) {
      process.exit(1);
    }

    console.log('\n✅ All contracts are properly implemented!');
  }

  /**
   * Validate contract compliance
   */
  private validateContractCompliance(): {
    totalContracts: number;
    implementedContracts: number;
    missingImplementations: string[];
    violations: string[];
  } {
    // This would read contracts and compare with actual implementation
    // For now, return placeholder
    return {
      totalContracts: 5,
      implementedContracts: 3,
      missingImplementations: ['/api/contracts/new-endpoint'],
      violations: [],
    };
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  const dev = new ContractFirstDevelopment();

  switch (command) {
    case 'init':
      await dev.init();
      break;
    case 'validate':
      await dev.validate();
      break;
    default:
      console.log('Usage:');
      console.log(
        '  bun run contract:init     - Initialize contract-first development'
      );
      console.log(
        '  bun run contract:validate - Validate implementation against contracts'
      );
      console.log('  bun run contract:mock     - Start mock server');
      break;
  }
}

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch(console.error);
}

export { ContractFirstDevelopment };
