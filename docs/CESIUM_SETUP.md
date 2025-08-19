# Cesium Assets Setup

This document explains how Cesium assets are configured in the Fire Monitor application.

## Overview

Cesium assets (textures, workers, widgets, etc.) are stored locally in the `public/cesium/` folder to ensure proper loading and avoid external dependencies.

## File Structure

```
public/
└── cesium/
    ├── Assets/          # Textures and other assets
    ├── ThirdParty/      # Third-party libraries
    ├── Widgets/         # Cesium widgets
    ├── Workers/         # Web workers
    ├── Cesium.js        # Main Cesium library
    ├── index.js         # ES6 module entry point
    └── index.cjs        # CommonJS entry point
```

## Setup Instructions

### Initial Setup

1. Create the cesium directory:
   ```bash
   mkdir -p public/cesium
   ```

2. Copy Cesium assets from node_modules:
   ```bash
   cp -r node_modules/cesium/Build/Cesium/* public/cesium/
   ```

### Using the NPM Script

We've added a convenient npm script to copy Cesium assets:

```bash
npm run copy-cesium
```

### After Cesium Updates

If you update the Cesium package, run the copy script again:

```bash
npm update cesium
npm run copy-cesium
```

## Configuration

### MapView Component

The `MapView` component is configured to use local Cesium assets:

```typescript
// Set the base URL for Cesium assets to use local files
window.CESIUM_BASE_URL = '/cesium/';
```

### Next.js Configuration

The `next.config.ts` includes headers and rewrites to ensure Cesium assets are properly served:

```typescript
async headers() {
  return [
    {
      source: '/cesium/:path*',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: '*',
        },
      ],
    },
  ];
}
```

## Benefits

1. **Offline Support**: Cesium works without internet connection
2. **Performance**: Faster loading of assets from local server
3. **Reliability**: No dependency on external CDNs
4. **Version Control**: Assets are bundled with the application

## Troubleshooting

### Assets Not Loading

1. Ensure the `public/cesium/` directory exists and contains files
2. Check that `window.CESIUM_BASE_URL` is set correctly
3. Verify the Next.js configuration is applied

### Build Issues

1. Run `npm run copy-cesium` before building
2. Ensure the public folder is included in the build
3. Check that all Cesium dependencies are installed

## Notes

- The Cesium assets are quite large (~10MB total)
- Consider using a CDN in production for better performance
- The local setup is ideal for development and offline scenarios 