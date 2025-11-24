# TESTING PHILOSOPHY - Verifiability Over Everything

## 🎯 #1 PRIORITY: TESTS MUST RUN

**Code quality is meaningless without verifiability.**

If tests don't run, we have NO confidence in the system. Perfect code that can't be verified is WORSE than working code with test gaps.

### **The Hierarchy of Testing Needs:**

1. **CRITICAL**: Tests execute without errors
2. **CRITICAL**: Tests connect to real systems
3. **IMPORTANT**: Tests pass consistently
4. **NICE**: Test coverage is comprehensive
5. **NICE**: Code follows best practices

## 🚨 **RED FLAGS - When to Stop Everything:**

### **Immediate Blockers:**

- ❌ Native bindings missing (tests can't run)
- ❌ Database connection failures
- ❌ E2E tests can't start browser
- ❌ Integration tests timeout
- ❌ Build failures preventing test execution

### **Fix Before Proceeding:**

```bash
# These MUST work before any other work:
bun test:e2e                    # Must execute
bun test src/__tests__/integration/  # Must execute
bun test:bdd                     # Must execute
```

## 📋 **VERIFICATION CHECKLIST**

### **Before Any Code Changes:**

- [ ] Unit tests run: `bun test --run`
- [ ] Integration tests run: `bun test src/__tests__/integration/`
- [ ] E2E tests run: `bun test:e2e`
- [ ] BDD tests run: `bun test:bdd`

### **After Any Database Changes:**

- [ ] SQLite bindings work locally
- [ ] Integration tests pass
- [ ] E2E tests with real data pass

### **Before Any Deployment:**

- [ ] All test categories execute
- [ ] All tests pass in CI environment
- [ ] Manual E2E verification on staging

## 🔧 **TROUBLESHOOTING FIRST PRINCIPLES**

### **SQLite Bindings Issue?**

```bash
# ALWAYS try these first:
sudo apt-get install build-essential python3
bun add -D better-sqlite3 --force
# OR use Docker for consistent environment
```

### **E2E Tests Won't Start?**

```bash
# ALWAYS check:
bunx playwright install --with-deps
bun run build  # Ensure app builds
bun run dev &   # Start dev server
bun test:e2e    # Then run tests
```

### **Integration Tests Fail?**

```bash
# ALWAYS verify:
bunx prisma db push    # Schema in sync
bunx prisma generate   # Client generated
# Check database file exists: ls prisma/dev.db
```

## 🎪 **QUALITY vs VERIFIABILITY**

### **Quality (Nice to Have):**

- TypeScript strict mode
- ESLint/Prettier consistency
- Code coverage metrics
- Elegant abstractions

### **Verifiability (Must Have):**

- Tests execute without errors
- Tests connect to real systems
- Tests provide meaningful feedback
- Tests run consistently

### **Trade-off Decision:**

**ALWAYS choose verifiability over quality.**

Working tests with messy code > Perfect code with broken tests

## 🚀 **DEPLOYMENT READINESS = VERIFIABILITY**

### **Ready to Deploy When:**

- ✅ All test categories execute
- ✅ Critical user journeys verified
- ✅ Database operations confirmed
- ✅ No blocking errors

### **NOT Ready When:**

- ❌ Any test category fails to run
- ❌ Integration tests blocked by dependencies
- ❌ E2E tests can't connect
- ❌ "Should work but can't test"

## 📖 **THIS DOCUMENT'S PURPOSE**

This is a **living document** that prioritizes:

1. **Tests must run**
2. **Tests must verify real functionality**
3. **Everything else is secondary**

When in doubt: **Make it work, then make it pretty.**

---

_"Confidence comes from verifiability, not perfection."_
