# Installation Guide for Visual & Performance Testing

This guide will help you install the visual regression and performance testing dependencies for the FireMonitor project.

## 🚨 Dependency Resolution Issues

Due to React 19 compatibility, some dependencies may have conflicts. Here's how to resolve them:

## 📦 Installation Steps

### Step 1: Install Dependencies with Legacy Peer Deps

```bash
# Use the legacy peer deps flag to resolve React 19 conflicts
npm install --legacy-peer-deps
```

Or use the provided script:

```bash
npm run install:legacy
```

### Step 2: Alternative Installation Methods

If you still encounter issues, try these alternatives:

#### Option A: Clean Install
```bash
# Remove existing node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Install with legacy peer deps
npm install --legacy-peer-deps
```

#### Option B: Use Yarn (Alternative)
```bash
# Install yarn if not already installed
npm install -g yarn

# Install dependencies
yarn install
```

#### Option C: Use pnpm (Alternative)
```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install dependencies
pnpm install
```

## 🔧 Dependency Versions

### Updated Dependencies for React 19 Compatibility

- **@testing-library/react**: `^15.0.0` (supports React 19)
- **React**: `19.1.0`
- **React DOM**: `19.1.0`

### Removed Dependencies

- **@percy/cli**: Removed due to compatibility issues
- **@percy/playwright**: Removed due to compatibility issues

## 🎯 What's Available After Installation

### Visual Regression Testing
- ✅ Playwright-based visual testing
- ✅ Screenshot comparison
- ✅ Multiple viewport testing
- ✅ Component-level visual tests

### Performance Testing
- ✅ Core Web Vitals monitoring
- ✅ Lighthouse performance audits
- ✅ Memory usage tracking
- ✅ Performance budget checking

## 🚀 Running Tests

### Visual Regression Tests
```bash
# Run visual regression tests
npm run test:visual

# Update visual snapshots
npm run test:visual:update
```

### Performance Tests
```bash
# Run performance tests
npm run test:performance

# View performance reports
npm run test:performance:report
```

### All Tests
```bash
# Run all tests (unit, e2e, visual, performance)
npm run test:all
```

## 🛠️ Troubleshooting

### Common Issues

#### Issue 1: React Version Conflicts
```bash
# Error: ERESOLVE could not resolve
# Solution: Use legacy peer deps
npm install --legacy-peer-deps
```

#### Issue 2: Testing Library Compatibility
```bash
# Error: peer react@"^18.0.0" from @testing-library/react
# Solution: Updated to @testing-library/react@^15.0.0
```

#### Issue 3: Percy Import Errors
```bash
# Error: Cannot find module '@percy/playwright'
# Solution: Removed Percy, using standard Playwright visual testing
```

### Manual Dependency Resolution

If you encounter specific dependency conflicts:

1. **Check the error message** for conflicting packages
2. **Update package.json** with compatible versions
3. **Use --legacy-peer-deps** flag
4. **Consider using alternative package managers** (yarn, pnpm)

### Environment Setup

#### Required Environment Variables
```bash
# For Cesium (if not already set)
NEXT_PUBLIC_CESIUM_ACCESS_TOKEN=your_cesium_token_here
```

#### Optional Environment Variables
```bash
# For debugging
NEXT_PUBLIC_DEBUG=true

# For performance monitoring
NEXT_PUBLIC_PERFORMANCE_MONITORING=true
```

## 📋 Verification Steps

After installation, verify everything works:

1. **Check Dependencies**
   ```bash
   npm list --depth=0
   ```

2. **Run Unit Tests**
   ```bash
   npm test
   ```

3. **Run Visual Tests**
   ```bash
   npm run test:visual
   ```

4. **Run Performance Tests**
   ```bash
   npm run test:performance
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🔄 Alternative Visual Testing Setup

Since Percy was removed, you can set up alternative visual testing:

### Option 1: Chromatic (Recommended)
```bash
# Install Chromatic
npm install --save-dev chromatic

# Add to package.json scripts
"test:visual:chromatic": "chromatic --project-token=your_token"
```

### Option 2: BackstopJS
```bash
# Install BackstopJS
npm install --save-dev backstopjs

# Initialize BackstopJS
npx backstop init
```

### Option 3: Applitools
```bash
# Install Applitools
npm install --save-dev @applitools/eyes-playwright

# Add to your visual tests
import { Eyes } from '@applitools/eyes-playwright';
```

## 📚 Additional Resources

- [Playwright Visual Testing](https://playwright.dev/docs/test-screenshots)
- [React Testing Library v15](https://testing-library.com/docs/react-testing-library/intro/)
- [Lighthouse Performance](https://developers.google.com/web/tools/lighthouse)
- [Core Web Vitals](https://web.dev/vitals/)

## 🆘 Getting Help

If you encounter issues:

1. **Check the error logs** in the terminal
2. **Review package.json** for version conflicts
3. **Try the alternative installation methods**
4. **Check the troubleshooting section above**
5. **Create an issue** with detailed error information

---

This installation guide should help you successfully set up visual regression and performance testing for the FireMonitor project! 🎉 