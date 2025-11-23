# Fixing Production Demo Login Issue

## Problem Analysis
The production Vercel deployment at https://church-volunteer-pdtdizlyr-pete-warnocks-projects.vercel.app has **Vercel Deployment Protection** enabled, which blocks all API access including:
- `/api/auth/signup` - User registration
- `/api/auth/signin` - User authentication  
- `/api/auth/session` - Session management
- `/api/opportunities` - Opportunity management
- `/api/applications` - Application handling

## Root Cause
Vercel's deployment protection is designed to prevent unauthorized access to production deployments, but it's also blocking legitimate API calls needed for the demo login functionality.

## Solution: Disable Deployment Protection

### Option 1: Through Vercel Dashboard (Recommended)
1. Go to https://vercel.com/pete-warnocks-projects/church-volunteer-app
2. Navigate to **Settings → Protection**
3. **Disable** "Password Protection" 
4. **Disable** "Vercel Authentication" 
5. Save changes

### Option 2: Using Environment Variables
Add environment variable to disable protection:
```bash
vercel env add DISABLE_PROTECTION=true
```

### Option 3: Using Bypass Token (For Testing)
Generate bypass token and access URLs with:
```
https://church-volunteer-pdtdizlyr-pete-warnocks-projects.vercel.app/api/auth/signup?x-vercel-protection-bypass=YOUR_TOKEN
```

## Implementation Steps

### 1. Disable Protection (Recommended Approach)
```bash
# Navigate to Vercel project settings
# Go to: https://vercel.com/pete-warnocks-projects/church-volunteer-app/settings/protection

# Disable these protections:
- Password Protection: OFF
- Vercel Authentication: OFF
- Keep: Trusted IPs (if any)
```

### 2. Update Environment Variables
```bash
# Add to project
vercel env add DISABLE_PROTECTION=true

# Or add multiple variables at once
cat > .env.production << EOF
DISABLE_PROTECTION=true
VERCEL_AUTOMATION_BYPASS_SECRET=your-bypass-secret
EOF

vercel env add .env.production
```

### 3. Redeploy Application
```bash
# Deploy with protection disabled
vercel --prod

# Or deploy specific changes
vercel --prod --prebuilt
```

### 4. Verify Fix
```bash
# Test signup API
curl -X POST https://church-volunteer-pdtdizlyr-pete-warnocks-projects.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@demo.com","password":"password123","role":"VOLUNTEER"}'

# Test signin API  
curl -X POST https://church-volunteer-pdtdizlyr-pete-warnocks-projects.vercel.app/api/auth/signin \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test@demo.com&password=password123&csrfToken=test"
```

### 5. Update Documentation
Update README.md with production access instructions:
```markdown
## Production Access

The production deployment may have Vercel deployment protection enabled. If you encounter access issues:

1. **Disable Protection**: Go to Vercel dashboard → Settings → Protection → Disable all protections
2. **Bypass Token**: Generate bypass token for automated access
3. **Contact**: If issues persist, contact Vercel support

### Current Status
- ✅ Local Development: http://localhost:3000 (Fully functional)
- ⚠️ Production: https://church-volunteer-pdtdizlyr-pete-warnocks-projects.vercel.app (Protection enabled)
```

### 6. Alternative: Use Preview Deployment
Deploy to a preview environment where protection might be disabled:
```bash
vercel --preview
```

### 7. Manual Fix via Vercel Dashboard
Since CLI is prompting for input, the fastest solution is:

1. **Go to Vercel Dashboard**: https://vercel.com/pete-warnocks-projects/church-volunteer-app
2. **Navigate to Settings → Protection**  
3. **Disable "Password Protection" and "Vercel Authentication"**
4. **Save changes**
5. **Redeploy**: Run `vercel --prod`

## Next Steps

1. **Immediate**: Disable deployment protection in Vercel dashboard
2. **Deploy**: Redeploy application with protection disabled
3. **Test**: Verify demo login functionality works on production
4. **Document**: Update README with production access instructions

## Expected Outcome

After disabling protection, the demo login should work:
- **Volunteer Account**: volunteer@demo.com / password123
- **Leader Account**: leader@demo.com / password123  
- **Second Volunteer**: mike@demo.com / password123

All authentication flows, opportunity browsing, and application management should be fully functional on production.