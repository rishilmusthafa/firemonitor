# 🔥 FireMonitor - Real-Time Fire Alarm Monitoring System

A modern, real-time fire alarm monitoring system built with Next.js, TypeScript, and Cesium for 3D geospatial visualization. The system provides comprehensive monitoring of fire alarms across multiple emirates in the UAE with advanced filtering, real-time updates, and interactive 3D mapping.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Components](#components)
- [Hooks](#hooks)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [3D Mapping](#3d-mapping)
- [Real-Time Updates](#real-time-updates)
- [Performance Optimizations](#performance-optimizations)
- [Development](#development)
- [Deployment](#deployment)

## 🎯 Overview

FireMonitor is a sophisticated web application designed for real-time monitoring of fire alarm systems across multiple locations. It provides:

- **Real-time alert monitoring** with live updates
- **3D geospatial visualization** using Cesium
- **Multi-emirate support** for UAE regions
- **Advanced filtering and search** capabilities
- **Responsive design** for desktop and mobile
- **Dark/Light theme** support
- **Performance optimized** for large datasets

## ✨ Features

### 🚨 Alert Management
- Real-time fire alarm monitoring
- Alert status tracking (Open, Closed, Countdown, Overdue)
- Automatic duplicate alert filtering
- Alert history and statistics
- Emirate-based alert filtering

### 🗺️ 3D Mapping
- Interactive 3D globe visualization
- Villa and alert marker placement
- Dynamic zoom-based marker clustering
- Click-to-view location details
- Smooth camera animations

### 📊 Dashboard
- Real-time alert statistics
- Emirate-based filtering
- Alert countdown timers
- System status indicators
- Refresh capabilities

### 🎨 User Interface
- Modern, responsive design
- Dark/Light theme toggle
- Animated components with Framer Motion
- Glass morphism effects
- Mobile-friendly interface

### 🔧 Technical Features
- TypeScript for type safety
- React Query for data fetching
- Zustand for state management
- Web Workers for performance
- Optimized rendering

## 🏗️ Architecture

The application follows a modern React architecture with:

```
src/
├── app/                 # Next.js app router
├── components/          # React components
├── hooks/              # Custom React hooks
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── workers/            # Web Workers
└── lib/                # Library configurations
```

### Core Architecture Principles

1. **Component-Based**: Modular, reusable components
2. **Hook-Based**: Custom hooks for business logic
3. **State Management**: Centralized state with Zustand
4. **Performance**: Web Workers for heavy computations
5. **Type Safety**: Full TypeScript implementation

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### 3D Visualization
- **Cesium** - 3D geospatial visualization
- **Resium** - React components for Cesium

### State Management
- **Zustand** - Lightweight state management
- **React Query** - Server state management

### Data Processing
- **Web Workers** - Background processing
- **Day.js** - Date manipulation

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Vite** - Build tooling

## 📁 Project Structure

```
firemonitor/
├── docs/                    # Documentation
├── public/                  # Static assets
│   ├── cesium/             # Cesium library files
│   └── icons/              # Application icons
├── src/
│   ├── app/                # Next.js app router
│   │   ├── api/            # API routes
│   │   ├── demo/           # Demo page
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   │   ├── ui/             # UI components
│   │   ├── AlertDetails.tsx
│   │   ├── AlertFilters.tsx
│   │   ├── AlertList.tsx
│   │   ├── CityFilter.tsx
│   │   ├── CountdownTimer.tsx
│   │   ├── CounterCard.tsx
│   │   ├── GlobeLoader.tsx
│   │   ├── Header.tsx
│   │   ├── LoadingScreen.tsx
│   │   ├── MapView.tsx
│   │   ├── RefreshButton.tsx
│   │   ├── SystemStatus.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── VillaDetails.tsx
│   ├── hooks/              # Custom hooks
│   │   ├── useAlerts.ts
│   │   ├── useAlertsWorker.ts
│   │   ├── useFlyToLocation.ts
│   │   ├── useMapDataWorker.ts
│   │   └── useVillas.ts
│   ├── store/              # State management
│   │   ├── useMapStore.ts
│   │   └── useUIStore.ts
│   ├── types/              # TypeScript types
│   │   ├── alerts.d.ts
│   │   └── villas.d.ts
│   ├── utils/              # Utility functions
│   │   └── dataUtils.ts
│   └── workers/            # Web Workers
│       └── AlertsWorker.ts
├── .env.local              # Environment variables
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies
├── tailwind.config.ts      # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd firemonitor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables**
   ```env
   NEXT_PUBLIC_CESIUM_ACCESS_TOKEN=your_cesium_token
   NEXT_PUBLIC_API_BASE_URL=https://your-api-url
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_CESIUM_ACCESS_TOKEN` | Cesium access token for 3D maps | Yes |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL for API endpoints | Yes |

### Cesium Configuration

The application uses Cesium for 3D mapping with local assets:

```typescript
// Cesium base URL configuration
window.CESIUM_BASE_URL = '/cesium/';
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `https://10.1.61.100/get-alerts` | GET | Fetch alerts data from external API |
| `/api/v1/villas` | GET | Fetch villas data |

## 🧩 Components

### Core Components

#### AlertDetails.tsx
Modal component for displaying detailed alert information with:
- Alert status and countdown timer
- Location information
- Contact details
- Interactive map navigation

#### AlertList.tsx
Horizontal scrolling list of alerts with:
- Real-time updates
- Status-based filtering
- Emirate filtering
- Click-to-view details

#### MapView.tsx
3D map component using Cesium with:
- Interactive globe visualization
- Dynamic marker placement
- Zoom-based clustering
- Click handlers for markers

#### VillaDetails.tsx
Modal component for villa information with:
- Villa status and details
- Location coordinates
- Contact information
- Map navigation

### UI Components

#### CounterCard.tsx
Statistics display card with:
- Animated counters
- Status indicators
- Responsive design

#### CountdownTimer.tsx
Real-time countdown timer for alerts with:
- Animated display
- Auto-update functionality
- Status-based styling

#### LoadingScreen.tsx
Application loading screen with:
- Animated globe
- Progress indicators
- Error handling

### Utility Components

#### RefreshButton.tsx
Manual refresh button with:
- Loading states
- Error handling
- Animated icon

#### ThemeToggle.tsx
Dark/Light theme switcher with:
- Persistent state
- Smooth transitions
- Icon animations

## 🎣 Hooks

### Data Hooks

#### useAlerts.ts
Manages alert data fetching with:
- React Query integration
- Error handling
- Caching strategies
- Real-time updates

#### useVillas.ts
Manages villa data fetching with:
- Data normalization
- Error handling
- Caching

### Worker Hooks

#### useAlertsWorker.ts
Web Worker for alert processing with:
- Background processing
- Real-time filtering
- Performance optimization
- Emirate-based filtering

#### useMapDataWorker.ts
Web Worker for map data processing with:
- Marker clustering
- Viewport filtering
- Performance optimization
- Dynamic updates

### Utility Hooks

#### useFlyToLocation.ts
Map navigation hook with:
- Camera controls
- Smooth animations
- Location targeting

## 📊 State Management

### Zustand Stores

#### useMapStore.ts
Manages map-related state:
```typescript
interface MapStore {
  viewportBounds: ViewportBounds | null;
  cameraHeight: number;
  flyToLocation: (location: Location) => void;
  setViewportBounds: (bounds: ViewportBounds | null) => void;
  setCameraHeight: (height: number) => void;
}
```

#### useUIStore.ts
Manages UI-related state:
```typescript
interface UIStore {
  emirate: string;
  theme: 'light' | 'dark';
  setEmirate: (emirate: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}
```

## 🔌 API Integration

### Data Fetching

The application uses React Query for efficient data fetching:

```typescript
// Alert data fetching
const { data: alerts, isLoading, error } = useAlerts();

// Villa data fetching
const { data: villas, isLoading, error } = useVillas();
```

### Real-Time Updates

- **Polling**: Automatic data refresh every 10 seconds
- **Manual Refresh**: User-triggered data updates
- **Optimistic Updates**: Immediate UI feedback

## 🗺️ 3D Mapping

### Cesium Integration

The application uses Cesium for 3D geospatial visualization:

#### Features
- **Interactive Globe**: Full 3D Earth visualization
- **Dynamic Markers**: Real-time marker placement
- **Clustering**: Performance-optimized marker grouping
- **Camera Controls**: Smooth navigation and zooming

#### Marker Types
- **Alert Markers**: Red/Green icons for open/closed alerts
- **Villa Markers**: Green icons for villa locations
- **Cluster Markers**: Grouped markers for performance

#### Performance Optimizations
- **Viewport Culling**: Only render visible markers
- **LOD System**: Level-of-detail based on zoom
- **Web Workers**: Background processing for heavy computations

## ⚡ Real-Time Updates

### Update Mechanisms

1. **Automatic Polling**: 10-second intervals
2. **Manual Refresh**: User-initiated updates
3. **WebSocket Ready**: Infrastructure for real-time connections

### Data Processing

- **Duplicate Filtering**: Automatic removal of duplicate alerts
- **Status Updates**: Real-time status changes
- **Countdown Timers**: Live countdown for active alerts

## 🚀 Performance Optimizations

### Frontend Optimizations

1. **React Query**: Efficient caching and background updates
2. **Web Workers**: Heavy computations off main thread
3. **Virtual Scrolling**: Large list performance
4. **Lazy Loading**: Component and data lazy loading
5. **Memoization**: React.memo and useMemo usage

### Map Optimizations

1. **Marker Clustering**: Reduce render load
2. **Viewport Culling**: Only render visible elements
3. **LOD System**: Detail based on zoom level
4. **Debounced Updates**: Prevent excessive re-renders

### Data Optimizations

1. **Duplicate Filtering**: Remove redundant data
2. **Pagination**: Load data in chunks
3. **Caching**: React Query caching strategies
4. **Compression**: Optimized data transfer

## 🛠️ Development

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

### Code Quality

- **ESLint**: Code linting and formatting
- **TypeScript**: Type safety and IntelliSense
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality checks

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Setup

1. **Set production environment variables**
2. **Configure API endpoints**
3. **Set up Cesium access token**
4. **Configure CDN for static assets**

### Deployment Platforms

- **Vercel**: Recommended for Next.js applications
- **Netlify**: Alternative deployment option
- **Docker**: Containerized deployment
- **AWS/GCP**: Cloud deployment options

### Performance Monitoring

- **Core Web Vitals**: Monitor loading performance
- **Error Tracking**: Monitor application errors
- **Analytics**: User behavior tracking
- **Uptime Monitoring**: Service availability

## 📝 API Documentation

### Alerts API

```typescript
interface Alert {
  id: string;
  Account_ID: string;
  Title: string;
  Title_Ar?: string;
  Alert_DateTime: string;
  Status: 'Open' | 'Closed';
  Mobile?: string;
  Type: string;
}
```

### Villas API

```typescript
interface Villa {
  Account_Number: string;
  Customer_Name: string;
  Email_Address?: string;
  Latitude: string;
  Longitude: string;
  Address?: string;
  City: string;
}
```

## 🔧 Troubleshooting

### Common Issues

1. **Cesium not loading**: Check access token and base URL
2. **API errors**: Verify endpoint configuration
3. **Performance issues**: Check marker clustering settings
4. **Memory leaks**: Monitor Web Worker cleanup

### Debug Mode

Enable debug logging by setting:
```env
NEXT_PUBLIC_DEBUG=true
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Cesium** for 3D geospatial visualization
- **Next.js** for the React framework
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Zustand** for state management

---

**FireMonitor** - Real-time fire alarm monitoring with 3D visualization 🚨🗺️
