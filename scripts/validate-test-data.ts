/**
 * Test Data Validation Script
 *
 * Domain: Test data integrity validation
 * Responsibility: Validate test data schemas and structure
 * Boundaries: Validation only, no test execution
 */

import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface TestDataSchema {
  type: string;
  required: string[];
  optional?: string[];
}

export class TestDataValidator {
  private testDataDir = 'src/test-data';
  private schemas: Map<string, TestDataSchema> = new Map();

  constructor() {
    this.defineSchemas();
  }

  private defineSchemas(): void {
    // Define expected schemas for different test data types
    this.schemas.set('application', {
      type: 'application',
      required: ['opportunityId', 'volunteerId', 'status'],
      optional: ['message', 'createdAt'],
    });

    this.schemas.set('user', {
      type: 'user',
      required: ['id', 'email', 'name', 'role'],
      optional: ['profile'],
    });

    this.schemas.set('opportunity', {
      type: 'opportunity',
      required: [
        'id',
        'title',
        'description',
        'ministry',
        'location',
        'status',
      ],
      optional: ['requirements', 'timeCommitment', 'startDate', 'endDate'],
    });

    this.schemas.set('profile', {
      type: 'profile',
      required: [],
      optional: [
        'bio',
        'spiritualGifts',
        'interests',
        'availability',
        'skills',
        'experience',
      ],
    });
  }

  private validateFile(filePath: string): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    try {
      const content = readFileSync(filePath, 'utf-8');
      const fileName = filePath.split('/').pop() || '';

      // Check if it's a TypeScript file
      if (fileName.endsWith('.ts')) {
        // Basic TypeScript syntax check
        if (
          content.includes('export default') &&
          !content.includes('export const')
        ) {
          result.warnings.push(
            'Consider using export const instead of export default for test data'
          );
        }

        // Check for common issues
        if (content.includes('any')) {
          result.warnings.push(
            'Found "any" type - consider using specific types'
          );
        }

        if (content.includes('console.log')) {
          result.warnings.push('Found console.log in test data file');
        }

        // Check for proper exports
        if (!content.includes('export')) {
          result.errors.push('Test data file must export data');
        }
      }

      // Check JSON structure if it's a JSON file
      if (fileName.endsWith('.json')) {
        try {
          JSON.parse(content);
        } catch (parseError) {
          result.errors.push(`Invalid JSON: ${parseError}`);
        }
      }
    } catch (error) {
      result.errors.push(`Failed to read file: ${error}`);
    }

    result.valid = result.errors.length === 0;
    return result;
  }

  private validateTestDataStructure(): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    if (!existsSync(this.testDataDir)) {
      result.errors.push('Test data directory not found');
      return result;
    }

    const files = readdirSync(this.testDataDir);

    // Check for required files
    const requiredFiles = ['storage.ts', 'factory.ts'];
    requiredFiles.forEach((file) => {
      if (!files.includes(file)) {
        result.errors.push(`Missing required file: ${file}`);
      }
    });

    // Check for test data files
    const dataFiles = files.filter(
      (file) =>
        file.endsWith('.ts') &&
        !file.includes('.test.') &&
        !file.includes('.spec.')
    );

    if (dataFiles.length === 0) {
      result.warnings.push('No test data files found');
    }

    // Validate each test data file
    dataFiles.forEach((file) => {
      const filePath = join(this.testDataDir, file);
      const fileResult = this.validateFile(filePath);
      result.errors.push(...fileResult.errors);
      result.warnings.push(...fileResult.warnings);
    });

    result.valid = result.errors.length === 0;
    return result;
  }

  private validateFactoryExports(): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    try {
      const factoryPath = join(this.testDataDir, 'factory.ts');
      if (!existsSync(factoryPath)) {
        result.errors.push('factory.ts not found');
        return result;
      }

      const content = readFileSync(factoryPath, 'utf-8');

      // Check for required exports
      const requiredExports = [
        'generateTestData',
        'testDataFactory',
        'baseTestData',
      ];

      requiredExports.forEach((exportName) => {
        if (
          !content.includes(`export ${exportName}`) &&
          !content.includes(`export { ${exportName}`)
        ) {
          result.errors.push(`Missing required export: ${exportName}`);
        }
      });

      // Check for factory functions
      if (!content.includes('testDataFactory.')) {
        result.warnings.push('testDataFactory methods not found');
      }
    } catch (error) {
      result.errors.push(`Failed to validate factory exports: ${error}`);
    }

    result.valid = result.errors.length === 0;
    return result;
  }

  private validateStorageImplementation(): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    try {
      const storagePath = join(this.testDataDir, 'storage.ts');
      if (!existsSync(storagePath)) {
        result.errors.push('storage.ts not found');
        return result;
      }

      const content = readFileSync(storagePath, 'utf-8');

      // Check for required class/interface
      if (!content.includes('class') && !content.includes('interface')) {
        result.errors.push('Storage implementation not found');
      }

      // Check for required methods
      const requiredMethods = ['save', 'load', 'history'];
      requiredMethods.forEach((method) => {
        if (!content.includes(method) || content.includes(`${method}(`)) {
          result.warnings.push(
            `Storage method "${method}" may not be properly implemented`
          );
        }
      });

      // Check for file system operations
      if (
        !content.includes('writeFileSync') &&
        !content.includes('writeFile')
      ) {
        result.warnings.push('No file write operations found');
      }

      if (!content.includes('readFileSync') && !content.includes('readFile')) {
        result.warnings.push('No file read operations found');
      }
    } catch (error) {
      result.errors.push(`Failed to validate storage implementation: ${error}`);
    }

    result.valid = result.errors.length === 0;
    return result;
  }

  private validateDataConsistency(): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    try {
      // Check if factory and storage are consistent
      const factoryPath = join(this.testDataDir, 'factory.ts');
      const storagePath = join(this.testDataDir, 'storage.ts');

      if (existsSync(factoryPath) && existsSync(storagePath)) {
        const factoryContent = readFileSync(factoryPath, 'utf-8');
        const storageContent = readFileSync(storagePath, 'utf-8');

        // Check for consistent data types
        const factoryTypes = this.extractTypes(factoryContent);
        const storageTypes = this.extractTypes(storageContent);

        const missingTypes = factoryTypes.filter(
          (type) => !storageTypes.includes(type)
        );
        if (missingTypes.length > 0) {
          result.warnings.push(
            `Storage may not handle types: ${missingTypes.join(', ')}`
          );
        }
      }
    } catch (error) {
      result.errors.push(`Failed to validate data consistency: ${error}`);
    }

    result.valid = result.errors.length === 0;
    return result;
  }

  private extractTypes(content: string): string[] {
    const types: string[] = [];

    // Extract type definitions and usage
    const typeMatches = content.match(/interface\s+\w+|type\s+\w+/g) || [];
    typeMatches.forEach((match) => {
      const type = match.replace(/interface\s+|type\s+/, '');
      if (type && !types.includes(type)) {
        types.push(type);
      }
    });

    return types;
  }

  public validate(): ValidationResult {
    console.log('🔍 Validating test data integrity...');

    const structureResult = this.validateTestDataStructure();
    const factoryResult = this.validateFactoryExports();
    const storageResult = this.validateStorageImplementation();
    const consistencyResult = this.validateDataConsistency();

    const allErrors = [
      ...structureResult.errors,
      ...factoryResult.errors,
      ...storageResult.errors,
      ...consistencyResult.errors,
    ];

    const allWarnings = [
      ...structureResult.warnings,
      ...factoryResult.warnings,
      ...storageResult.warnings,
      ...consistencyResult.warnings,
    ];

    const result: ValidationResult = {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    };

    this.printValidationResult(result);
    return result;
  }

  private printValidationResult(result: ValidationResult): void {
    console.log('\n📊 Test Data Validation Results');
    console.log('='.repeat(50));

    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach((error) => {
        console.log(`   • ${error}`);
      });
    }

    if (result.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      result.warnings.forEach((warning) => {
        console.log(`   • ${warning}`);
      });
    }

    if (result.valid) {
      console.log('\n✅ Test data validation passed!');
    } else {
      console.log('\n🚫 Test data validation failed!');
    }

    console.log('='.repeat(50) + '\n');
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  const validator = new TestDataValidator();
  const result = validator.validate();
  process.exit(result.valid ? 0 : 1);
}
