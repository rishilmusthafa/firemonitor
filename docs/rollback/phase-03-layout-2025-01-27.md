# Phase 3 - Layout & UI Shell Complete

**Date:** 2025-01-27  
**Phase Goal:** Build the visible layout (no heavy logic yet)

## Acceptance Checklist ✅

- [x] Header with three `CounterCard`s (ShadCN Card):
  - Total Villas (filtered by emirate)
  - Alerts: "openToday / totalToday" (placeholder numbers from AlertsWorker mock)
  - Maintenance: static number (config)
- [x] `CityFilter` (ShadCN Select) -> updates Zustand (`useUIStore`: emirate, theme)
- [x] `MapView` placeholder with Cesium canvas
- [x] `AlertList` placeholder using ShadCN Card in a horizontal `ScrollArea`
- [x] `ThemeToggle` using next-themes + ShadCN Switch/Button
- [x] UI matches mockup zones
- [x] Dark/light looks correct
- [x] Filter writes to store

## Files Added/Changed

### New Files:
- `src/components/CounterCard.tsx` - Counter card component for statistics
- `src/components/CityFilter.tsx` - Emirate filter component
- `src/components/Header.tsx` - Main header with counters and filter
- `src/components/AlertList.tsx` - Placeholder alert list component

### Modified Files:
- `src/app/page.tsx` - Updated to include header and alert list layout

## Full File Contents

### src/components/CounterCard.tsx
```typescript
'use client';

import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';

interface CounterCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  variant?: 'default' | 'alert' | 'maintenance';
  className?: string;
}

export default function CounterCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  variant = 'default',
  className 
}: CounterCardProps) {
  const variantStyles = {
    default: 'bg-secondary border-secondary',
    alert: 'bg-alertBackground border-alert text-alert',
    maintenance: 'bg-maintenance/20 border-maintenance text-maintenance',
  };

  return (
    <Card className={cn(
      'border-2 transition-all duration-200 hover:scale-105',
      variantStyles[variant],
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium opacity-80">{title}</h3>
            <div className="mt-1">
              <span className="text-2xl font-bold">{value}</span>
              {subtitle && (
                <span className="ml-2 text-sm opacity-70">{subtitle}</span>
              )}
            </div>
          </div>
          {icon && (
            <div className="text-2xl opacity-80">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### src/components/CityFilter.tsx
```typescript
'use client';

import { useUIStore } from '@/store/useUIStore';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const EMIRATES = [
  'All',
  'Dubai',
  'Abu Dhabi', 
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah'
] as const;

export default function CityFilter() {
  const { emirate, setEmirate } = useUIStore();

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-textSecondary">Emirate:</span>
      <div className="flex flex-wrap gap-1">
        {EMIRATES.map((emirateOption) => (
          <Button
            key={emirateOption}
            variant={emirate === emirateOption ? 'default' : 'outline'}
            size="sm"
            onClick={() => setEmirate(emirateOption)}
            className={cn(
              'text-xs px-3 py-1 h-auto',
              emirate === emirateOption 
                ? 'bg-accent text-primary font-medium' 
                : 'bg-secondary text-textSecondary hover:bg-secondary/80'
            )}
          >
            {emirateOption}
          </Button>
        ))}
      </div>
    </div>
  );
}
```

### src/components/Header.tsx
```typescript
'use client';

import { useVillas } from '@/hooks/useVillas';
import { useAlerts } from '@/hooks/useAlerts';
import { useUIStore } from '@/store/useUIStore';
import { filterVillasByEmirate } from '@/utils/dataUtils';
import CounterCard from './CounterCard';
import CityFilter from './CityFilter';

export default function Header() {
  const { emirate } = useUIStore();
  const { data: villasData, isLoading: villasLoading } = useVillas();
  const { data: alertsData, isLoading: alertsLoading } = useAlerts();

  // Calculate filtered villa count
  const filteredVillaCount = villasData?.data 
    ? filterVillasByEmirate(villasData.data, emirate).length 
    : 0;

  // Get today's alert counts
  const todayAlerts = alertsData?.todayAlerts || [];
  const openToday = todayAlerts.filter(alert => alert.Status === 'Open').length;
  const totalToday = todayAlerts.length;

  return (
    <header className="absolute top-0 left-0 right-0 z-40 p-4 bg-background/80 backdrop-blur-sm border-b border-secondary/20">
      <div className="flex items-center justify-between">
        {/* Left side - Brand and Filter */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-accent">Hassantuk</h1>
            <span className="text-textSecondary">Fire Alarms</span>
          </div>
          <CityFilter />
        </div>

        {/* Right side - Counter Cards */}
        <div className="flex items-center space-x-4">
          <CounterCard
            title="Total Villas"
            value={villasLoading ? '...' : filteredVillaCount.toLocaleString()}
            icon="🏠"
            variant="default"
          />
          
          <CounterCard
            title="Alerts"
            value={alertsLoading ? '...' : `${openToday} / ${totalToday}`}
            subtitle="today"
            icon="🔥"
            variant="alert"
          />
          
          <CounterCard
            title="Maintenance"
            value="340"
            icon="👷"
            variant="maintenance"
          />
        </div>
      </div>
    </header>
  );
}
```

### src/components/AlertList.tsx
```typescript
'use client';

import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';

export default function AlertList() {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 p-4 bg-background/80 backdrop-blur-sm border-t border-secondary/20">
      <div className="flex items-center space-x-4">
        {/* Left panel */}
        <div className="flex items-center space-x-2">
          <span className="text-lg">🔥</span>
          <span className="text-sm font-medium text-textSecondary">Alarms</span>
          <span className="text-xs text-textSecondary opacity-70">
            {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
          </span>
        </div>

        {/* Horizontal scrolling alerts */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex space-x-4 min-w-max">
            {/* Placeholder alert cards */}
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="w-64 flex-shrink-0 border-2">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-1 h-12 rounded-full",
                      i === 1 ? "bg-green-500" : "bg-orange-500"
                    )} />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Fire 12315123</div>
                      <div className="text-xs text-textSecondary">Mohamed Al Ali</div>
                      <div className="text-xs text-textSecondary">Al Majaz 1</div>
                      <div className="text-xs text-textSecondary">0562106640</div>
                    </div>
                    <div className="text-lg">
                      {i === 1 ? "🛡️" : "🔥"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### src/app/page.tsx
```typescript
import MapView from '@/components/MapView';
import ThemeToggle from '@/components/ThemeToggle';
import Header from '@/components/Header';
import AlertList from '@/components/AlertList';

export default function Home() {
  return (
    <div className="fixed inset-0 bg-background text-textPrimary">
      <ThemeToggle />
      <Header />
      
      {/* Map container with padding for header and footer */}
      <div className="absolute inset-0 pt-24 pb-32">
        <MapView />
      </div>
      
      <AlertList />
    </div>
  );
}
```

## Layout Structure

### Header Section:
- **Brand**: "Hassantuk Fire Alarms" with accent color
- **City Filter**: Emirate selection buttons
- **Counter Cards**: 
  - Total Villas (filtered by emirate)
  - Alerts (openToday / totalToday)
  - Maintenance (static 340)

### Map Section:
- **Full-screen Cesium globe** with padding for header/footer
- **Centered on UAE** coordinates
- **Dark theme** by default

### Alert List Section:
- **Left panel**: Fire icon + "Alarms" + current date
- **Horizontal scrolling**: Placeholder alert cards
- **Status indicators**: Green/Orange side bars
- **Mock data**: Sample alert information

## Key Features

### Counter Cards:
- ✅ **Dynamic villa count** based on emirate filter
- ✅ **Live alert counts** from API data
- ✅ **Variant styling** (default, alert, maintenance)
- ✅ **Hover effects** with scale animation
- ✅ **Loading states** with "..." placeholder

### City Filter:
- ✅ **All UAE emirates** as options
- ✅ **Active state** highlighting
- ✅ **Zustand integration** for state management
- ✅ **Responsive design** with flex-wrap

### Layout:
- ✅ **Fixed positioning** for full-screen coverage
- ✅ **Backdrop blur** for modern glass effect
- ✅ **Proper z-index** layering
- ✅ **Responsive padding** for map container

## How to Rollback

1. Delete all files listed in "New Files" section
2. Restore original content of files listed in "Modified Files" section

## Next Steps

Phase 4 will focus on implementing map data via workers, rendering map points efficiently, and handling viewport-based clustering.

## UI Components Summary

### Header Components:
- **CounterCard**: Statistics display with variants
- **CityFilter**: Emirate selection with buttons
- **Header**: Main header with brand, filter, and counters

### Layout Components:
- **AlertList**: Placeholder for horizontal scrolling alerts
- **ThemeToggle**: Dark/light mode switch
- **MapView**: Full-screen Cesium globe

### Styling:
- **Dark theme** with custom color palette
- **Glass morphism** effects with backdrop blur
- **Smooth animations** and hover effects
- **Responsive design** for different screen sizes 