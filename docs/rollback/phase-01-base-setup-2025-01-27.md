# Phase 1 - Base Setup Complete

**Date:** 2025-01-27  
**Phase Goal:** Scaffolding, theming, providers, Cesium token, ShadCN, workers baseline

## Acceptance Checklist ✅

- [x] Next.js 15 TS project with TypeScript strict mode
- [x] All dependencies installed (tailwind, next-themes, @tanstack/react-query, zustand, cesium, resium, framer-motion, dayjs, zod, comlink, shadcn/ui)
- [x] Tailwind config with darkMode: 'class'
- [x] QueryClientProvider and ThemeProvider in layout (client-side)
- [x] Environment type definitions for NEXT_PUBLIC_CESIUM_ACCESS_TOKEN
- [x] Basic ShadCN components (Button, Card)
- [x] Basic Resium Cesium globe centered on UAE
- [x] Empty workers returning mock data via comlink
- [x] Dark/light theme toggle working
- [x] App runs without errors

## Files Added/Changed

### New Files:
- `env.d.ts` - Environment type definitions
- `tailwind.config.ts` - Tailwind configuration with dark mode
- `src/lib/utils.ts` - Utility functions for class merging
- `src/components/ui/button.tsx` - Button component
- `src/components/ui/card.tsx` - Card component
- `src/components/Providers.tsx` - Client-side providers wrapper
- `src/store/useUIStore.ts` - UI state management
- `src/store/useMapStore.ts` - Map state management
- `src/workers/MapDataWorker.ts` - Map data processing worker
- `src/workers/AlertsWorker.ts` - Alerts processing worker
- `src/components/MapView.tsx` - Cesium map component
- `src/components/ThemeToggle.tsx` - Theme toggle component

### Modified Files:
- `src/app/layout.tsx` - Updated to use client-side Providers
- `src/app/page.tsx` - Basic layout with map
- `src/app/globals.css` - Custom color scheme

## Full File Contents

### env.d.ts
```typescript
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_CESIUM_ACCESS_TOKEN: string;
    }
  }
}

export {};
```

### tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#1E1E1E",
        secondary: "#2E2E2E",
        accent: "#00FFC2",
        alert: "#FF6B35",
        alertBackground: "#FFE5E0",
        maintenance: "#FFD93D",
        textPrimary: "#FFFFFF",
        textSecondary: "#CFCFCF",
        background: "#121212",
      },
    },
  },
  plugins: [],
};

export default config;
```

### src/lib/utils.ts
```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### src/components/ui/button.tsx
```typescript
import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    
    const variantClasses = {
      default: "bg-primary text-white hover:bg-primary/90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
    };
    
    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    };
    
    return (
      <button
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
```

### src/components/ui/card.tsx
```typescript
import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

### src/components/Providers.tsx
```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

### src/store/useUIStore.ts
```typescript
import { create } from 'zustand';

export type Emirate = 'All' | 'Dubai' | 'Abu Dhabi' | 'Sharjah' | 'Ajman' | 'Umm Al Quwain' | 'Ras Al Khaimah' | 'Fujairah';

interface UIState {
  emirate: Emirate;
  setEmirate: (emirate: Emirate) => void;
}

export const useUIStore = create<UIState>((set) => ({
  emirate: 'All',
  setEmirate: (emirate: Emirate) => set({ emirate }),
}));
```

### src/store/useMapStore.ts
```typescript
import { create } from 'zustand';

interface ViewportBounds {
  west: number;
  east: number;
  south: number;
  north: number;
}

interface MapState {
  viewportBounds: ViewportBounds | null;
  cameraHeight: number;
  setViewportBounds: (bounds: ViewportBounds) => void;
  setCameraHeight: (height: number) => void;
}

export const useMapStore = create<MapState>((set) => ({
  viewportBounds: null,
  cameraHeight: 1000000, // Default high altitude
  setViewportBounds: (bounds: ViewportBounds) => set({ viewportBounds: bounds }),
  setCameraHeight: (height: number) => set({ cameraHeight: height }),
}));
```

### src/workers/MapDataWorker.ts
```typescript
import { expose } from 'comlink';

interface Villa {
  Account_Number: string;
  Customer_Name: string;
  Email_Address?: string;
  Latitude: number;
  Longitude: number;
  Address?: string;
  City: string;
}

interface ViewportBounds {
  west: number;
  east: number;
  south: number;
  north: number;
}

interface Cluster {
  lon: number;
  lat: number;
  count: number;
}

interface Marker {
  id: string;
  lon: number;
  lat: number;
  isAlert: boolean;
}

interface FilterAndClusterParams {
  viewportBounds: ViewportBounds;
  cameraHeight: number;
  emirate: string;
  showNonAlertAboveZoom: boolean;
}

class MapDataWorker {
  private villas: Villa[] = [];

  init({ villas }: { villas: Villa[] }) {
    this.villas = villas;
  }

  filterAndCluster({
    viewportBounds,
    cameraHeight,
    emirate,
    showNonAlertAboveZoom
  }: FilterAndClusterParams): { clusters: Cluster[]; markers: Marker[] } {
    // Mock implementation for Phase 1
    return {
      clusters: [],
      markers: []
    };
  }
}

expose(MapDataWorker);
```

### src/workers/AlertsWorker.ts
```typescript
import { expose } from 'comlink';

interface Alert {
  id: string;
  Account_ID: string;
  User_ID?: string;
  Mobile?: string;
  Title: string;
  Type: string;
  Alert_DateTime: string;
  Status: 'Open' | 'Closed';
  Premise_ID?: string;
  Title_Ar?: string;
  Type_Ar?: string;
}

interface ProcessedAlert {
  id: string;
  accountId: string;
  title: string;
  titleAr?: string;
  datetime: string;
  status: 'closed' | 'countdown' | 'overdue';
  secondsRemaining?: number;
}

interface ProcessTodayResult {
  openToday: number;
  totalToday: number;
  items: ProcessedAlert[];
}

class AlertsWorker {
  private alerts: Alert[] = [];
  private nowUtc: string = '';

  init({ alerts, nowUtc }: { alerts: Alert[]; nowUtc: string }) {
    this.alerts = alerts;
    this.nowUtc = nowUtc;
  }

  processToday({ nowUtc }: { nowUtc: string }): ProcessTodayResult {
    // Mock implementation for Phase 1
    return {
      openToday: 4,
      totalToday: 30,
      items: []
    };
  }
}

expose(AlertsWorker);
```

### src/components/MapView.tsx
```typescript
'use client';

import { useEffect, useRef } from 'react';
import { Viewer, Entity, Camera } from 'resium';
import * as Cesium from 'cesium';

// Set Cesium access token
if (typeof window !== 'undefined') {
  Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ACCESS_TOKEN as string;
}

export default function MapView() {
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  useEffect(() => {
    // Center on UAE when component mounts
    if (viewerRef.current) {
      viewerRef.current.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(55.2708, 25.2048, 1000000), // UAE center
        orientation: {
          heading: 0.0,
          pitch: -Cesium.Math.PI_OVER_TWO,
          roll: 0.0,
        },
      });
    }
  }, []);

  return (
    <div className="w-full h-full">
      <Viewer
        ref={viewerRef}
        full
        baseLayerPicker={false}
        navigationHelpButton={false}
        homeButton={false}
        sceneModePicker={false}
        geocoder={false}
        animation={false}
        timeline={false}
        fullscreenButton={false}
        vrButton={false}
        selectionIndicator={false}
        infoBox={false}
        navigationInstructionsInitiallyVisible={false}
        scene3DOnly={true}
        shouldAnimate={true}
      />
    </div>
  );
}
```

### src/components/ThemeToggle.tsx
```typescript
'use client';

import { useTheme } from 'next-themes';
import { Button } from './ui/button';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="fixed top-4 right-4 z-50"
    >
      {theme === 'dark' ? '🌞' : '🌙'}
    </Button>
  );
}
```

### src/app/layout.tsx
```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fire Monitor - UAE",
  description: "24/7 Fire Monitoring Dashboard for UAE Villas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### src/app/page.tsx
```typescript
import MapView from '@/components/MapView';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-textPrimary">
      <ThemeToggle />
      <div className="h-screen">
        <MapView />
      </div>
    </div>
  );
}
```

### src/app/globals.css
```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
  --primary: #1E1E1E;
  --secondary: #2E2E2E;
  --accent: #00FFC2;
  --alert: #FF6B35;
  --alertBackground: #FFE5E0;
  --maintenance: #FFD93D;
  --textPrimary: #FFFFFF;
  --textSecondary: #CFCFCF;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-secondary: var(--secondary);
  --color-accent: var(--accent);
  --color-alert: var(--alert);
  --color-alertBackground: var(--alertBackground);
  --color-maintenance: var(--maintenance);
  --color-textPrimary: var(--textPrimary);
  --color-textSecondary: var(--textSecondary);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

.dark {
  --background: #121212;
  --foreground: #ededed;
  --primary: #1E1E1E;
  --secondary: #2E2E2E;
  --accent: #00FFC2;
  --alert: #FF6B35;
  --alertBackground: #FFE5E0;
  --maintenance: #FFD93D;
  --textPrimary: #FFFFFF;
  --textSecondary: #CFCFCF;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), Arial, Helvetica, sans-serif;
}
```

## How to Rollback

1. Delete all files listed in "New Files" section
2. Restore original content of files listed in "Modified Files" section
3. Remove added dependencies from package.json
4. Run `npm install` to restore original dependencies

## Next Steps

Phase 2 will focus on data intake and analysis, loading the JSON files and validating schemas with zod. 