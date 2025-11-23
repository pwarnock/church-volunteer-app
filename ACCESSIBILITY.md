# Accessibility (WCAG 2.1 AA)

This project is committed to accessibility for all users, following **WCAG 2.1 Level AA** standards.

## Running Accessibility Tests

```bash
# Run accessibility unit tests
bun test -- accessibility

# Run accessibility E2E tests with Axe
bun test:e2e e2e/accessibility.spec.ts

# Run all tests including accessibility
bun test && bun test:e2e
```

## Accessibility Checklist

### Perceivable
- [x] Images have alt text
- [x] Color is not the only means of conveying information
- [x] Text has sufficient contrast (4.5:1 for normal text)
- [x] Content is readable at 200% zoom
- [x] Text size is at least 12px

### Operable
- [x] Keyboard navigation works throughout the site
- [x] Focus indicators are visible
- [x] No keyboard traps
- [x] Skip links to main content exist
- [x] Links have descriptive text (not "Click here")
- [x] Form fields have associated labels
- [x] Required fields are marked

### Understandable
- [x] Heading hierarchy is proper (H1, H2, H3...)
- [x] Form validation errors are clearly marked
- [x] Error messages are associated with fields
- [x] Instructions are provided for complex forms
- [x] Language is clear and simple

### Robust
- [x] HTML is valid and semantic
- [x] ARIA attributes are used correctly
- [x] Components work with assistive technologies
- [x] Color contrast meets standards
- [x] Mobile/responsive design is accessible

## Key Practices

### 1. Form Accessibility

```typescript
// Good: Label associated with input
<label htmlFor="email">Email</label>
<input id="email" type="email" required aria-label="Email address" />

// Bad: No label or aria-label
<input type="email" placeholder="Email" />
```

### 2. Semantic HTML

```typescript
// Good: Use semantic elements
<header>...</header>
<nav>...</nav>
<main>...</main>
<footer>...</footer>

// Bad: Using divs instead
<div class="header">...</div>
```

### 3. Focus Management

```typescript
// Good: Visible focus indicator
button:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

// Bad: Hiding focus
button:focus {
  outline: none;
}
```

### 4. Alt Text for Images

```typescript
// Good: Descriptive alt text
<img 
  src="volunteers.jpg" 
  alt="Volunteers serving meals at community center"
/>

// Bad: Empty or generic alt
<img src="volunteers.jpg" alt="image" />
```

### 5. ARIA Attributes

```typescript
// Good: ARIA attributes for complex components
<div role="dialog" aria-labelledby="dialog-title" aria-modal="true">
  <h2 id="dialog-title">Confirm Action</h2>
</div>

// Bad: Missing ARIA for interactive elements
<div onClick={handleSubmit} style={{ cursor: 'pointer' }}>
  Submit
</div>
```

### 6. Error Messages

```typescript
// Good: Associated error messages
<input
  id="email"
  type="email"
  aria-describedby="email-error"
  aria-invalid={hasError}
/>
{hasError && (
  <div id="email-error" role="alert">
    Please enter a valid email
  </div>
)}

// Bad: Disconnected error message
<input type="email" />
<span style={{ color: 'red' }}>Invalid email</span>
```

### 7. Keyboard Navigation

```typescript
// Make all interactive elements keyboard accessible
<button onClick={handleClick}>Click me</button>

// Don't use divs for clickable elements
// ❌ Bad: <div onClick={handleClick}>Click me</div>

// Good: Use proper tabindex
<div tabIndex={0} role="button" onKeyPress={handleKeyPress}>
  Item
</div>
```

### 8. Color Contrast

```typescript
// Good: 4.5:1 contrast or higher
// Black (#000000) on White (#FFFFFF) = 21:1 ✓
// Dark Blue (#003366) on Light Blue (#CCDDEE) = 8.5:1 ✓

// Bad: Low contrast
// Gray (#808080) on White (#FFFFFF) = 3.1:1 ✗
// Light Blue (#AACCFF) on White (#FFFFFF) = 2.4:1 ✗
```

## Tools for Testing

### Automated Testing
- **Axe DevTools** - Browser extension for Chrome/Firefox
- **WAVE** - Web Accessibility Evaluation Tool
- **axe-playwright** - Automated testing in E2E tests
- **jest-axe** - Automated testing in unit tests

### Manual Testing
- Keyboard-only navigation (unplug mouse)
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Zoom to 200% and test usability
- Test with reduced motion enabled
- Color contrast checkers

### Browser Extensions
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

## WCAG 2.1 Levels

- **Level A**: Basic accessibility
- **Level AA**: Enhanced accessibility (our target)
- **Level AAA**: Advanced accessibility

We target **Level AA** which provides reasonable accessibility for most users.

## Common Issues & Fixes

### Missing Alt Text
```typescript
// ❌ Bad
<img src="icon.svg" />

// ✓ Good
<img src="icon.svg" alt="Settings icon" />

// ✓ Also good (decorative)
<img src="spacer.gif" alt="" aria-hidden="true" />
```

### Poor Color Contrast
```typescript
// ❌ Bad (2.4:1 ratio)
<p style={{ color: '#999999' }}>Light gray text</p>

// ✓ Good (4.5:1 ratio)
<p style={{ color: '#333333' }}>Dark gray text</p>
```

### Missing Form Labels
```typescript
// ❌ Bad
<input placeholder="Email" />

// ✓ Good
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

### Keyboard Inaccessible
```typescript
// ❌ Bad
<div onClick={handleSubmit}>Submit</div>

// ✓ Good
<button onClick={handleSubmit}>Submit</button>
```

### Not Announcing Errors
```typescript
// ❌ Bad
<input type="email" />
{error && <p>{error}</p>}

// ✓ Good
<input
  type="email"
  aria-describedby="error"
  aria-invalid={!!error}
/>
{error && (
  <div id="error" role="alert">
    {error}
  </div>
)}
```

## Resources

### Standards
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)

### Testing
- [Axe Documentation](https://github.com/dequelabs/axe-core)
- [WAVE Tool](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Learning
- [A11Y Project](https://www.a11yproject.com/)
- [WebAIM Articles](https://webaim.org/articles/)
- [Inclusive Design](https://www.inclusivedesignprinciples.org/)

## Continuous Improvement

We review and improve accessibility regularly:
1. Run accessibility tests in CI/CD
2. Test with real users and assistive technologies
3. Fix accessibility issues promptly
4. Stay updated with WCAG guidelines
5. Get feedback from accessibility experts

## Reporting Accessibility Issues

Found an accessibility issue? Please:
1. Document the issue clearly
2. Provide steps to reproduce
3. Include what assistive tech you're using
4. Create an issue in the repository

All accessibility issues are treated as high priority.
