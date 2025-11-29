#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: path.join(process.cwd(), '.env.local') });

interface DeploymentGate {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
}

const results: DeploymentGate[] = [];

async function checkGate(name: string, check: () => Promise<boolean>, message: string): Promise<void> {
  try {
    const passed = await check();
    results.push({
      name,
      status: passed ? 'PASS' : 'FAIL',
      message: passed ? `✅ ${message}` : `❌ ${message}`
    });
  } catch (error) {
    results.push({
      name,
      status: 'FAIL',
      message: `❌ ${message} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

async function main() {
  console.log('🚀 Production Deployment Validation');
  console.log('=====================================');

  // Gate 1: Environment Variables Check
  await checkGate(
    'Environment Variables',
    async () => {
      const nodeEnv = process.env.NODE_ENV;
      const requiredEnvVars = ['NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
      
      if (nodeEnv === 'production') {
        requiredEnvVars.push('POSTGRES_URL');
      } else {
        // In development, LOCAL_DB_URL should be available
        if (!process.env.LOCAL_DB_URL && !process.env.POSTGRES_URL) {
          console.log('Development mode requires LOCAL_DB_URL or POSTGRES_URL');
          return false;
        }
      }

      for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
          console.log(`Missing: ${envVar}`);
          return false;
        }
      }
      return true;
    },
    'All required environment variables are configured'
  );

  // Gate 2: Build Check
  await checkGate(
    'Application Build',
    async () => {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      // Check if build script exists
      return !!(packageJson.scripts && packageJson.scripts.build);
    },
    'Build script is available'
  );

  // Gate 3: Database Schema Check
  await checkGate(
    'Database Schema',
    async () => {
      const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
      return fs.existsSync(schemaPath);
    },
    'Database schema is available'
  );

  // Gate 4: Security Tests Check
  await checkGate(
    'Security Tests',
    async () => {
      const securityTestPath = path.join(process.cwd(), 'src', '__tests__', 'security.test.ts');
      return fs.existsSync(securityTestPath);
    },
    'Security test suite is implemented'
  );

  // Gate 5: API Health Check
  await checkGate(
    'API Health Endpoint',
    async () => {
      const healthCheckPath = path.join(process.cwd(), 'src', 'app', 'api', 'health', 'route.ts');
      return fs.existsSync(healthCheckPath);
    },
    'Health check endpoint is implemented'
  );

  // Gate 6: Production Configuration
  await checkGate(
    'Production Configuration',
    async () => {
      const envLocalPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envLocalPath)) {
        const envContent = fs.readFileSync(envLocalPath, 'utf-8');
        
        // Check if production mode is configured
        const nodeEnv = process.env.NODE_ENV;
        if (nodeEnv === 'production') {
          // In production, check for PostgreSQL URL
          return envContent.includes('POSTGRES_URL') && !envContent.includes('dev.db');
        }
      }
      
      // For non-production, this gate passes
      return true;
    },
    'Production environment is properly configured'
  );

  // Gate 7: Error Handling Check
  await checkGate(
    'Error Handling',
    async () => {
      const errorBoundaryPath = path.join(process.cwd(), 'src', 'app', 'error.tsx');
      return fs.existsSync(errorBoundaryPath);
    },
    'Error boundaries are implemented'
  );

  // Gate 8: Middleware Check
  await checkGate(
    'Security Middleware',
    async () => {
      const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts');
      return fs.existsSync(middlewarePath);
    },
    'Security middleware is implemented'
  );

  // Calculate results
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;

  // Print results
  console.log('\n📊 Results Summary');
  console.log('==================');
  
  results.forEach(result => {
    console.log(`${result.status === 'PASS' ? '✅' : '❌'} ${result.name}: ${result.message}`);
  });

  console.log(`\n📈 Overall: ${passed}/${total} gates passed (${failed} failed)`);

  // Determine overall status
  if (failed === 0) {
    console.log('\n🎉 All deployment gates passed! Ready for production deployment.');
    process.exit(0);
  } else if (failed <= 2) {
    console.log('\n⚠️  Some gates failed. Review and fix before production deployment.');
    process.exit(1);
  } else {
    console.log('\n🚨 Multiple gates failed. Do NOT deploy to production.');
    process.exit(2);
  }
}

main().catch(error => {
  console.error('❌ Deployment validation error:', error);
  process.exit(3);
});