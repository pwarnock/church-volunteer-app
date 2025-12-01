# Free & Open Source Code Quality Tools

## Recommended Stack (100% Free)

### 1. ESLint with Complexity Rules
```bash
bun add -D @typescript-eslint/eslint-plugin eslint-plugin-complexity
```
- Already integrated with your linting
- CI/CD friendly
- Customizable complexity thresholds

### 2. Plato for Visual Reports
```bash
bun add -D plato
```
- Generate HTML complexity reports
- Great for code reviews and documentation
- Visual dependency graphs

### 3. jscpd for Duplication Detection
```bash
bun add -D jscpd
```
- Find duplicate code
- Often indicates refactoring opportunities
- CLI integration

### 4. SonarQube Community Edition (Self-hosted)
- Most comprehensive free option
- Requires server setup
- Integrates with CI/CD

### 5. Custom Complexity Script (Already Created)
- Tailored to your specific needs
- TypeScript aware
- CI/CD exit codes

## Integration Commands

```json
{
  "scripts": {
    "check:complexity": "bunx tsx scripts/check-complexity.ts",
    "check:duplicates": "bunx jscpd src/",
    "report:complexity": "bunx plato -r reports -t -x **/*.test.* src/",
    "lint:complexity": "bunx eslint --rule 'complexity: [2, 10]' src/"
  }
}
```

## Why These Tools?

1. **No cost** - All free and open source
2. **CI/CD ready** - Exit codes for pipeline integration
3. **TypeScript aware** - Modern JS/TS support
4. **Lightweight** - No heavy infrastructure needed
5. **Extensible** - Customizable rules and thresholds