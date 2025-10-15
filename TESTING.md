# Testing Documentation

This document provides comprehensive information about testing in the LodgeFlow application.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Testing Patterns](#testing-patterns)
- [Coverage](#coverage)
- [Troubleshooting](#troubleshooting)

## Overview

LodgeFlow uses the following testing stack:

- **Jest 30.2.0** - Test runner
- **React Testing Library 16.3.0** - Component testing
- **@testing-library/jest-dom 6.9.1** - Custom Jest matchers
- **@testing-library/user-event 14.6.1** - User interaction simulation
- **jest-environment-jsdom** - DOM environment for tests

## Setup

All testing dependencies are already installed. The testing infrastructure includes:

### Configuration Files

- `jest.config.js` - Jest configuration with Next.js integration
- `jest.setup.js` - Global test setup with mocks
- `__tests__/test-utils.tsx` - Custom render utilities
- `__tests__/jest.d.ts` - TypeScript declarations for Jest matchers
- `__tests__/__mocks__/` - Mock implementations

### Mocked Dependencies

The following are automatically mocked in all tests:

- **Next.js Router** - `next/router` and `next/navigation`
- **Clerk Authentication** - All auth hooks and components
- **React Query** - `useQuery` and `useMutation` hooks
- **Framer Motion** - Animation library (for faster tests)
- **Browser APIs** - `fetch`, `matchMedia`, `IntersectionObserver`, `ResizeObserver`

## Running Tests

### Available Scripts

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage

# Run all checks (format, lint, test)
pnpm ci:check
```

### Test File Patterns

Tests are automatically discovered if they match:

- `**/__tests__/**/*.test.{js,jsx,ts,tsx}`
- `**/?(*.)+(spec|test).{js,jsx,ts,tsx}`

## Writing Tests

### Component Tests

Use the custom `render` function from `test-utils.tsx` which includes necessary providers:

```tsx
import { render, screen } from '@/__tests__/test-utils';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### HeroUI Components

HeroUI components render with different accessibility patterns than standard HTML:

#### Button with Link

```tsx
// ❌ Wrong - HeroUI Button with as={Link} has role="button"
const link = screen.getByRole('link');

// ✅ Correct - Query by button role
const button = screen.getByRole('button', { name: /view details/i });
expect(button).toHaveAttribute('href', '/cabins/1');
```

#### Select Component

```tsx
// ❌ Wrong - Multiple elements with same text
const label = screen.getByText(/capacity/i);

// ✅ Correct - Get first matching element
const label = screen.getAllByText(/capacity/i)[0];

// ✅ Better - Query by button role (HeroUI Select uses button)
const select = screen.getByRole('button', { name: /capacity/i });
```

### Hook Tests

Test custom hooks using `renderHook` from React Testing Library:

```tsx
import { renderHook } from '@testing-library/react';
import { createTestQueryClient } from '@/__tests__/test-utils';
import { useCabins } from '@/hooks/useCabins';

describe('useCabins', () => {
  it('fetches cabins data', async () => {
    const { result } = renderHook(() => useCabins(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={createTestQueryClient()}>
          {children}
        </QueryClientProvider>
      ),
    });

    // Test hook behavior
  });
});
```

### API Route Tests

Test API routes by mocking the request and response objects:

```tsx
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/cabins/route';

describe('GET /api/cabins', () => {
  it('returns cabins list', async () => {
    const request = new NextRequest('http://localhost:3000/api/cabins');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });
});
```

## Testing Patterns

### Mocking Data

Use type assertions for complex Mongoose types:

```tsx
const mockCabin = {
  _id: '1',
  name: 'Test Cabin',
  // ... other properties
} as any;
```

### Testing User Interactions

Use `@testing-library/user-event` for realistic user interactions:

```tsx
import userEvent from '@testing-library/user-event';

it('handles user input', async () => {
  const user = userEvent.setup();
  render(<MyForm />);

  await user.type(screen.getByLabelText(/name/i), 'John Doe');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(screen.getByText(/success/i)).toBeInTheDocument();
});
```

### Testing Async Operations

Wait for elements to appear or disappear:

```tsx
import { waitFor } from '@testing-library/react';

it('loads data asynchronously', async () => {
  render(<DataComponent />);

  // Wait for loading to complete
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  expect(screen.getByText(/data loaded/i)).toBeInTheDocument();
});
```

### Testing Authentication

Clerk authentication is mocked globally. To test authenticated states:

```tsx
// The mock always returns an authenticated user
it('shows user profile when authenticated', () => {
  render(<ProfileComponent />);
  expect(screen.getByText('test@example.com')).toBeInTheDocument();
});
```

### Testing React Query

React Query is mocked with default values. For specific test cases:

```tsx
import { useQuery } from '@tanstack/react-query';

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}));

it('handles loading state', () => {
  (useQuery as jest.Mock).mockReturnValue({
    data: undefined,
    isLoading: true,
    error: null,
  });

  render(<CabinList />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});
```

## Coverage

### Coverage Thresholds

The project maintains a 50% coverage threshold for:

- Branches
- Functions
- Lines
- Statements

### Coverage Reports

Generate coverage reports with:

```bash
pnpm test:coverage
```

Coverage reports are generated in the `coverage/` directory:

- `coverage/lcov-report/index.html` - HTML report
- `coverage/lcov.info` - LCOV format (for CI tools)

### Excluded from Coverage

The following directories are excluded from coverage:

- `node_modules/`
- `.next/`
- `coverage/`
- Test files themselves

## Troubleshooting

### Common Issues

#### "Your test suite must contain at least one test"

**Cause:** Jest is treating utility files as test suites.

**Solution:** Ensure files without tests don't match the test pattern:

- Use `.test.tsx` extension only for actual test files
- Utility files should be in `__tests__/` but without `.test` in the name

#### "Unable to find an accessible element with the role"

**Cause:** HeroUI components render with different roles than standard HTML.

**Solution:**

- Use `getAllByText()` for elements with duplicate labels
- Query HeroUI Button+Link by `role="button"` not `role="link"`
- Query HeroUI Select by `role="button"` not `role="textbox"`

#### "Cannot read properties of undefined"

**Cause:** Component expects data that isn't provided in tests.

**Solution:**

- Check that all required props are provided
- Ensure mocks return expected data structure
- Use type assertions (`as any`) for complex types if needed

#### Tests are slow

**Cause:** Tests are running against real network or animations.

**Solution:**

- Check that `framer-motion` is properly mocked
- Ensure `fetch` calls are mocked
- Verify `createTestQueryClient()` has `retry: false`

### ESLint Issues in Tests

If ESLint complains about Jest globals (describe, it, expect), ensure your test file matches the pattern in `eslint.config.mjs`:

```javascript
{
  files: ['*.test.ts', '*.test.tsx', '*.test.js', '*.test.jsx'],
  // ...
}
```

### TypeScript Issues

If TypeScript doesn't recognize Jest matchers:

1. Check that `jest.d.ts` exists in `__tests__/`
2. Ensure `@types/jest` is installed
3. Verify `tsconfig.json` includes test files

## Best Practices

1. **Arrange-Act-Assert** - Structure tests clearly:

   ```tsx
   it('test description', () => {
     // Arrange - Set up test data
     const mockData = { ... };

     // Act - Perform action
     render(<Component data={mockData} />);

     // Assert - Verify behavior
     expect(screen.getByText('...')).toBeInTheDocument();
   });
   ```

2. **Query Priority** - Use queries in this order:

   - `getByRole` (most accessible)
   - `getByLabelText` (for forms)
   - `getByText` (visible text)
   - `getByTestId` (last resort)

3. **Avoid Implementation Details** - Test behavior, not implementation:

   ```tsx
   // ❌ Bad - testing implementation
   expect(component.state.count).toBe(1);

   // ✅ Good - testing behavior
   expect(screen.getByText('Count: 1')).toBeInTheDocument();
   ```

4. **One Assertion per Test** - Keep tests focused:

   ```tsx
   // ❌ Bad - testing multiple things
   it('renders and handles click and updates state', () => { ... });

   // ✅ Good - separate concerns
   it('renders component', () => { ... });
   it('handles click event', () => { ... });
   it('updates state on interaction', () => { ... });
   ```

5. **Descriptive Test Names** - Make test intentions clear:

   ```tsx
   // ❌ Bad
   it('works', () => { ... });

   // ✅ Good
   it('displays discount badge when cabin has discount', () => { ... });
   ```

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [HeroUI Documentation](https://www.heroui.com/)

---

Last updated: 2025-01-XX
