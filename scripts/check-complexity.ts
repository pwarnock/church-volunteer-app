#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

interface FileComplexity {
  file: string;
  lines: number;
  functions: number;
  complexity: number;
  issues: string[];
}

function calculateComplexity(content: string): number {
  // Simple cyclomatic complexity calculation
  const patterns = [
    /\bif\b/g,
    /\belse\s+if\b/g,
    /\bfor\b/g,
    /\bwhile\b/g,
    /\bdo\b/g,
    /\bswitch\b/g,
    /\bcase\b/g,
    /\bcatch\b/g,
    /\b&&/g,
    /\|\|/g,
    /\?./g,
  ];

  let complexity = 1; // Base complexity

  patterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      complexity += matches.length;
    }
  });

  return complexity;
}

function analyzeFile(filePath: string): FileComplexity | null {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').length;

    // Count function declarations
    const functions = (
      content.match(
        /function\s+\w+|=>\s*{|\w+\s*:\s*\([^)]*\)\s*=>|const\s+\w+\s*=\s*\([^)]*\)\s*=>/g
      ) || []
    ).length;

    const complexity = calculateComplexity(content);

    const issues: string[] = [];

    // Generate issues based on thresholds
    if (lines > 300) {
      issues.push(`File too large: ${lines} lines (recommend < 300)`);
    }

    if (functions > 10) {
      issues.push(
        `Too many functions: ${functions} functions (recommend < 10)`
      );
    }

    if (complexity > 50) {
      issues.push(`High complexity: ${complexity} (recommend < 50)`);
    }

    if (lines / functions < 5 && functions > 0) {
      issues.push(
        'Functions may be too small - consider consolidating related logic'
      );
    }

    if (lines / functions > 50 && functions > 0) {
      issues.push('Functions may be too large - consider splitting');
    }

    return {
      file: path.relative(process.cwd(), filePath),
      lines,
      functions,
      complexity,
      issues,
    };
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error);
    return null;
  }
}

function findTsFiles(dir: string, extensions = ['.ts', '.tsx']): string[] {
  const files: string[] = [];

  function traverse(currentDir: string) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (
        stat.isDirectory() &&
        !item.startsWith('.') &&
        item !== 'node_modules'
      ) {
        traverse(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          // Skip generated files and test setup files
          if (
            !item.includes('.d.ts') &&
            !item.includes('.test.') &&
            !item.includes('.spec.') &&
            !fullPath.includes('/generated/')
          ) {
            files.push(fullPath);
          }
        }
      }
    }
  }

  traverse(dir);
  return files;
}

// Analyze all TypeScript files
const files = findTsFiles('./src');
const results = files.map(analyzeFile).filter(Boolean) as FileComplexity[];

// Sort by total issues score
results.sort((a, b) => b.issues.length - a.issues.length);

// Print results
console.log('\n🔍 Code Complexity Analysis Report\n');
console.log('=====================================\n');

const highIssueFiles = results.filter((r) => r.issues.length > 0);

if (highIssueFiles.length === 0) {
  console.log('✅ No complexity issues found!');
} else {
  console.log(
    `📊 Found ${highIssueFiles.length} files with complexity issues:\n`
  );

  highIssueFiles.forEach((file) => {
    console.log(`📁 ${file.file}`);
    console.log(
      `   Lines: ${file.lines} | Functions: ${file.functions} | Complexity: ${file.complexity}`
    );
    console.log('   Issues:');
    file.issues.forEach((issue) => {
      console.log(`     ⚠️  ${issue}`);
    });
    console.log('');
  });
}

// Summary statistics
console.log('\n📈 Summary Statistics:');
console.log(`Total files analyzed: ${results.length}`);
console.log(`Files with issues: ${highIssueFiles.length}`);
console.log(
  `Average lines per file: ${Math.round(results.reduce((sum, r) => sum + r.lines, 0) / results.length)}`
);
console.log(
  `Average complexity per file: ${Math.round(results.reduce((sum, r) => sum + r.complexity, 0) / results.length)}`
);

// Exit with error code if high-priority issues exist
const criticalIssues = highIssueFiles.filter((f) =>
  f.issues.some(
    (issue) => issue.includes('too large') || issue.includes('High complexity')
  )
);

if (criticalIssues.length > 0) {
  console.log(
    `\n🚨 Found ${criticalIssues.length} files with critical complexity issues`
  );
  process.exit(1);
} else {
  console.log('\n✅ No critical complexity issues');
}
