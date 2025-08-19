# FireMonitor Testing Documentation

## Overview

This document provides comprehensive testing guidelines and documentation for the FireMonitor application. The testing strategy covers unit tests, integration tests, and end-to-end tests to ensure code quality and reliability.

## Testing Stack

- **Jest**: Unit and integration testing framework
- **React Testing Library**: Component testing utilities
- **Playwright**: End-to-end testing framework
- **MSW (Mock Service Worker)**: API mocking for tests

## Test Structure

```
src/
├── components/__tests__/          # Component unit tests
├── hooks/__tests__/              # Hook unit tests
├── utils/__tests__/              # Utility function tests
└── workers/__tests__/            # Web Worker tests

tests/
├── e2e/                         # End-to-end tests
└── integration/                 # Integration tests

docs/
└── TESTING.md                   # This documentation
```

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- AlertList.test.tsx
```

### End-to-End Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific E2E test
npm run test:e2e -- app.spec.ts
```

## Test Categories

### 1. Unit Tests

#### Component Tests
- **AlertList.test.tsx**: Tests alert list rendering, filtering, and interactions
- **CountdownTimer.test.tsx**: Tests countdown functionality and time formatting
- **Header.test.tsx**: Tests header statistics and emirate filtering
- **MapView.test.tsx**: Tests 3D map rendering and interactions
- **ErrorBoundary.test.tsx**: Tests error handling and recovery

#### Hook Tests
- **useAlertsWorker.test.ts**: Tests alert processing and worker fallback
- **useMapDataWorker.test.ts**: Tests map data processing
- **useAlerts.test.ts**: Tests alert data fetching
- **useVillas.test.ts**: Tests villa data fetching

#### Utility Tests
- **dataUtils.test.ts**: Tests data filtering and emirate mapping functions

### 2. Integration Tests

#### API Integration
- Tests data fetching from external APIs
- Tests error handling for network failures
- Tests data transformation and validation

#### Worker Integration
- Tests Web Worker initialization and fallback
- Tests data processing in background threads
- Tests communication between main thread and workers

### 3. End-to-End Tests

#### User Journey Tests
- Application loading and initialization
- Alert list functionality and interactions
- Map navigation and marker interactions
- Filtering and data updates
- Error handling and recovery

#### Cross-Browser Tests
- Chrome, Firefox, Safari compatibility
- Mobile and desktop responsiveness
- Performance across different devices

## Test Coverage Areas

### Core Functionality
- ✅ Alert processing and filtering
- ✅ Real-time countdown timers
- ✅ 3D map rendering and interactions
- ✅ Data fetching and caching
- ✅ Error handling and recovery
- ✅ Web Worker fallback mechanisms

### User Interface
- ✅ Component rendering and state management
- ✅ User interactions (clicks, navigation)
- ✅ Responsive design across screen sizes
- ✅ Accessibility features (ARIA labels, keyboard navigation)
- ✅ Loading states and error messages

### Data Management
- ✅ API integration and error handling
- ✅ Data transformation and validation
- ✅ Caching strategies and stale data handling
- ✅ Real-time updates and polling

### Performance
- ✅ Large dataset handling
- ✅ Memory usage and cleanup
- ✅ Debounced updates and optimizations
- ✅ Web Worker performance benefits

## Testing Best Practices

### 1. Test Organization
```typescript
describe('Component Name', () => {
  describe('Feature Category', () => {
    test('specific behavior', () => {
      // Test implementation
    });
  });
});
```

### 2. Mocking Strategy
```typescript
// Mock external dependencies
jest.mock('@/hooks/useAlertsWorker');
jest.mock('@/hooks/useVillas');

// Mock complex objects
const mockAlert = {
  id: '1',
  Account_ID: 'ACC001',
  Title: 'Fire Alarm',
  Alert_DateTime: '2025-01-17T10:30:00.000Z',
  Status: 'Open' as const,
};
```

### 3. Async Testing
```typescript
test('handles async operations', async () => {
  const { result } = renderHook(() => useAlertsWorker());
  
  await waitFor(() => {
    expect(result.current.isWorkerReady).toBe(true);
  });
});
```

### 4. Error Testing
```typescript
test('handles errors gracefully', () => {
  mockUseAlerts.mockReturnValue({
    data: undefined,
    error: new Error('API Error'),
    isLoading: false,
  });

  render(<AlertList />);
  expect(screen.getByText('Error message')).toBeInTheDocument();
});
```

## Test Data Management

### Mock Data Structure
```typescript
const mockVilla = {
  Account_Number: 'ACC001',
  Customer_Name: 'John Doe',
  Email_Address: 'john@example.com',
  Latitude: 25.2048,
  Longitude: 55.2708,
  Address: 'Dubai Marina',
  City: 'Dubai',
};

const mockAlert = {
  id: '1',
  Account_ID: 'ACC001',
  Title: 'Fire Alarm',
  Title_Ar: 'إنذار حريق',
  Alert_DateTime: '2025-01-17T10:30:00.000Z',
  Status: 'Open' as const,
  Mobile: '0501234567',
  Type: 'fire',
};
```

### Test Utilities
```typescript
// Helper function for creating test alerts
const createMockAlert = (overrides = {}) => ({
  id: '1',
  Account_ID: 'ACC001',
  Title: 'Fire Alarm',
  Alert_DateTime: '2025-01-17T10:30:00.000Z',
  Status: 'Open' as const,
  ...overrides,
});
```

## Performance Testing

### Load Testing
- Test with large datasets (1000+ alerts)
- Monitor memory usage and cleanup
- Test Web Worker performance benefits

### Responsiveness Testing
- Test on different screen sizes
- Test on different devices and browsers
- Monitor frame rates and smoothness

## Accessibility Testing

### Automated Testing
- ARIA label validation
- Keyboard navigation testing
- Color contrast verification
- Screen reader compatibility

### Manual Testing
- Keyboard-only navigation
- Screen reader testing
- High contrast mode testing
- Zoom and font size testing

## Continuous Integration

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e
```

### Pre-commit Hooks
- Run unit tests before commit
- Check test coverage thresholds
- Validate test file structure

## Debugging Tests

### Common Issues
1. **Async timing issues**: Use `waitFor` and proper async/await
2. **Mock setup problems**: Ensure mocks are properly configured
3. **Component state issues**: Use `act` for state updates
4. **Network mocking**: Use MSW for API mocking

### Debug Commands
```bash
# Run tests with verbose output
npm test -- --verbose

# Run tests with debugging
npm test -- --detectOpenHandles

# Run specific test with debugging
npm test -- --testNamePattern="specific test name"
```

## Coverage Requirements

### Minimum Coverage Thresholds
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

## Test Maintenance

### Regular Tasks
- Update test data to match API changes
- Refactor tests when components change
- Add tests for new features
- Remove obsolete tests

### Test Review Process
- Code review includes test review
- Ensure tests cover edge cases
- Validate test data accuracy
- Check for test performance issues

## Troubleshooting

### Common Problems

#### Tests Failing Intermittently
- Check for race conditions in async tests
- Ensure proper cleanup in `afterEach`
- Use `waitFor` for async operations

#### Mock Issues
- Verify mock setup in `beforeEach`
- Check mock return values
- Ensure mocks are properly typed

#### Component Testing Issues
- Use `data-testid` attributes for reliable selection
- Avoid testing implementation details
- Focus on user behavior and outcomes

### Getting Help
- Check Jest and React Testing Library documentation
- Review existing test patterns in the codebase
- Consult team members for complex testing scenarios

## Future Improvements

### Planned Enhancements
- [ ] Add visual regression testing
- [ ] Implement performance benchmarking
- [ ] Add stress testing for large datasets
- [ ] Enhance accessibility testing automation

### Testing Tools Evaluation
- [ ] Consider Cypress for E2E testing
- [ ] Evaluate Storybook for component testing
- [ ] Research visual testing tools
- [ ] Explore contract testing for APIs

## Conclusion

This testing strategy ensures the FireMonitor application maintains high quality and reliability. Regular test maintenance and updates are essential for keeping the test suite effective and relevant.

For questions or suggestions about testing, please refer to the team's testing guidelines or contact the development team. 