# Phase 2 - Data Intake & Analysis Complete

**Date:** 2025-01-27  
**Phase Goal:** Load `/data/*.json` via app route handlers and validate/normalize with zod

## Acceptance Checklist ✅

- [x] `/app/api/v1/villas/route.ts` reads `/data/villas.json` and returns normalized array
- [x] `/app/api/v1/alerts/route.ts` reads `/data/alerts.json`
- [x] Created `/types/*.d.ts` and zod schemas with proper validation
- [x] Created hooks: `useVillas` (staleTime: Infinity), `useAlerts` (refetchInterval: 10s)
- [x] Added explicit data analysis step with console logging
- [x] Both endpoints return normalized, typed data
- [x] Analysis logs visible in console
- [x] Hooks fetch successfully with proper error handling

## Files Added/Changed

### New Files:
- `src/types/villas.d.ts` - Villa type definitions
- `src/types/alerts.d.ts` - Alert type definitions
- `src/lib/schemas.ts` - Zod validation schemas
- `src/utils/dataUtils.ts` - Data processing utilities
- `src/app/api/v1/villas/route.ts` - Villas API endpoint
- `src/app/api/v1/alerts/route.ts` - Alerts API endpoint
- `src/hooks/useVillas.ts` - Villas data hook
- `src/hooks/useAlerts.ts` - Alerts data hook

### Modified Files:
- `package.json` - Added zod and dayjs dependencies

## Full File Contents

### src/types/villas.d.ts
```typescript
export interface Villa {
  Account_Number: string;
  Customer_Name: string;
  Email_Address?: string;
  Latitude: string; // Will be converted to number
  Longitude: string; // Will be converted to number
  Address?: string;
  City: string;
}

export interface NormalizedVilla {
  Account_Number: string;
  Customer_Name: string;
  Email_Address?: string;
  Latitude: number;
  Longitude: number;
  Address?: string;
  City: string;
}
```

### src/types/alerts.d.ts
```typescript
export interface Alert {
  id: string;
  Account_ID: string;
  User_ID?: string;
  Mobile?: string;
  Title: string;
  Type: string;
  Alert_DateTime: string; // ISO string
  Status: 'Open' | 'Closed';
  Premise_ID?: string;
  Title_Ar?: string;
  Type_Ar?: string;
}

export interface ProcessedAlert {
  id: string;
  accountId: string;
  title: string;
  titleAr?: string;
  datetime: string;
  status: 'closed' | 'countdown' | 'overdue';
  secondsRemaining?: number;
}

export interface ProcessTodayResult {
  openToday: number;
  totalToday: number;
  items: ProcessedAlert[];
}
```

### src/lib/schemas.ts
```typescript
import { z } from 'zod';

// Villa schema
export const VillaSchema = z.object({
  Account_Number: z.string(),
  Customer_Name: z.string(),
  Email_Address: z.string().email().optional(),
  Latitude: z.string().transform((val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) {
      throw new Error(`Invalid latitude: ${val}`);
    }
    return num;
  }),
  Longitude: z.string().transform((val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) {
      throw new Error(`Invalid longitude: ${val}`);
    }
    return num;
  }),
  Address: z.string().optional(),
  City: z.string(),
});

export const VillasArraySchema = z.array(VillaSchema);

// Alert schema
export const AlertSchema = z.object({
  id: z.string(),
  Account_ID: z.string(),
  User_ID: z.string().optional(),
  Mobile: z.string().optional(),
  Title: z.string(),
  Type: z.string(),
  Alert_DateTime: z.string().datetime(),
  Status: z.enum(['Open', 'Closed']),
  Premise_ID: z.string().optional(),
  Title_Ar: z.string().optional(),
  Type_Ar: z.string().optional(),
});

export const AlertsArraySchema = z.array(AlertSchema);

// Data analysis result schema
export const DataAnalysisSchema = z.object({
  totalVillas: z.number(),
  uniqueAccountNumbers: z.number(),
  totalAlerts: z.number(),
  todayAlerts: z.number(),
  orphanAlerts: z.number(),
  cities: z.array(z.string()),
  emirates: z.array(z.string()),
});
```

### src/utils/dataUtils.ts
```typescript
import { Villa, NormalizedVilla } from '@/types/villas';
import { Alert } from '@/types/alerts';
import dayjs from 'dayjs';

// Emirate mapping based on cities
const EMIRATE_MAPPING: Record<string, string> = {
  'Dubai': 'Dubai',
  'Abu Dhabi': 'Abu Dhabi',
  'Sharjah': 'Sharjah',
  'Ajman': 'Ajman',
  'Umm Al Quwain': 'Umm Al Quwain',
  'Ras Al Khaimah': 'Ras Al Khaimah',
  'Fujairah': 'Fujairah',
  // Add more city mappings as needed
};

export function normalizeVilla(villa: Villa): NormalizedVilla {
  return {
    ...villa,
    Latitude: parseFloat(villa.Latitude),
    Longitude: parseFloat(villa.Longitude),
  };
}

export function getEmirateFromCity(city: string): string {
  return EMIRATE_MAPPING[city] || 'Other';
}

export function isToday(dateString: string): boolean {
  return dayjs(dateString).isSame(dayjs(), 'day');
}

export function secondsSince(dateString: string): number {
  return dayjs().diff(dayjs(dateString), 'second');
}

export function analyzeData(villas: Villa[], alerts: Alert[]) {
  const normalizedVillas = villas.map(normalizeVilla);
  const villaAccountNumbers = new Set(normalizedVillas.map(v => v.Account_Number));
  
  const todayAlerts = alerts.filter(alert => isToday(alert.Alert_DateTime));
  const orphanAlerts = alerts.filter(alert => !villaAccountNumbers.has(alert.Account_ID));
  
  const cities = [...new Set(normalizedVillas.map(v => v.City))];
  const emirates = [...new Set(cities.map(getEmirateFromCity))];
  
  return {
    totalVillas: normalizedVillas.length,
    uniqueAccountNumbers: villaAccountNumbers.size,
    totalAlerts: alerts.length,
    todayAlerts: todayAlerts.length,
    orphanAlerts: orphanAlerts.length,
    cities,
    emirates,
  };
}

export function filterVillasByEmirate(villas: NormalizedVilla[], emirate: string): NormalizedVilla[] {
  if (emirate === 'All') {
    return villas;
  }
  
  return villas.filter(villa => getEmirateFromCity(villa.City) === emirate);
}

export function joinVillasAndAlerts(villas: NormalizedVilla[], alerts: Alert[]) {
  const villaMap = new Map(villas.map(v => [v.Account_Number, v]));
  
  return alerts.map(alert => ({
    ...alert,
    villa: villaMap.get(alert.Account_ID),
  })).filter(item => item.villa); // Only include alerts with matching villas
}
```

### src/app/api/v1/villas/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { VillasArraySchema } from '@/lib/schemas';
import type { NormalizedVilla } from '@/types/villas';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Read villas data from file
    const dataPath = join(process.cwd(), 'src', 'data', 'villas.json');
    const rawData = readFileSync(dataPath, 'utf-8');
    const villasData = JSON.parse(rawData);
    
    // Validate and normalize data (zod transforms strings to numbers)
    const normalizedVillas = VillasArraySchema.parse(villasData) as NormalizedVilla[];
    
    // Log data analysis
    console.log('=== VILLAS DATA ANALYSIS ===');
    console.log(`Total villas: ${normalizedVillas.length}`);
    console.log(`Unique Account Numbers: ${new Set(normalizedVillas.map(v => v.Account_Number)).size}`);
    
    const cities = [...new Set(normalizedVillas.map(v => v.City))];
    console.log(`Cities found: ${cities.length}`);
    console.log(`Sample cities: ${cities.slice(0, 5).join(', ')}`);
    
    // Check for invalid coordinates
    const invalidCoords = normalizedVillas.filter(v => 
      isNaN(v.Latitude) || isNaN(v.Longitude) || 
      v.Latitude < -90 || v.Latitude > 90 ||
      v.Longitude < -180 || v.Longitude > 180
    );
    
    if (invalidCoords.length > 0) {
      console.warn(`Found ${invalidCoords.length} villas with invalid coordinates`);
    }
    
    return NextResponse.json({
      success: true,
      data: normalizedVillas,
      count: normalizedVillas.length,
      analysis: {
        totalVillas: normalizedVillas.length,
        uniqueAccountNumbers: new Set(normalizedVillas.map(v => v.Account_Number)).size,
        cities: cities.length,
        invalidCoordinates: invalidCoords.length,
      }
    });
    
  } catch (error) {
    console.error('Error loading villas data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load villas data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
```

### src/app/api/v1/alerts/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AlertsArraySchema } from '@/lib/schemas';
import { analyzeData } from '@/utils/dataUtils';
import type { Alert } from '@/types/alerts';
import type { Villa } from '@/types/villas';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Read alerts data from file
    const alertsPath = join(process.cwd(), 'src', 'data', 'alerts.json');
    const alertsRawData = readFileSync(alertsPath, 'utf-8');
    const alertsData = JSON.parse(alertsRawData) as Alert[];
    
    // Read villas data for analysis
    const villasPath = join(process.cwd(), 'src', 'data', 'villas.json');
    const villasRawData = readFileSync(villasPath, 'utf-8');
    const villasData = JSON.parse(villasRawData) as Villa[];
    
    // Validate alerts data
    const validatedAlerts = AlertsArraySchema.parse(alertsData);
    
    // Perform data analysis
    const analysis = analyzeData(villasData, validatedAlerts);
    
    // Log data analysis
    console.log('=== ALERTS DATA ANALYSIS ===');
    console.log(`Total alerts: ${analysis.totalAlerts}`);
    console.log(`Today's alerts: ${analysis.todayAlerts}`);
    console.log(`Orphan alerts (no matching villa): ${analysis.orphanAlerts}`);
    console.log(`Total villas: ${analysis.totalVillas}`);
    console.log(`Unique account numbers: ${analysis.uniqueAccountNumbers}`);
    console.log(`Cities found: ${analysis.cities.length}`);
    console.log(`Emirates found: ${analysis.emirates.length}`);
    
    // Get today's alerts
    const todayAlerts = validatedAlerts.filter(alert => {
      const alertDate = new Date(alert.Alert_DateTime);
      const today = new Date();
      return alertDate.toDateString() === today.toDateString();
    });
    
    return NextResponse.json({
      success: true,
      data: validatedAlerts,
      count: validatedAlerts.length,
      todayAlerts: todayAlerts,
      todayCount: todayAlerts.length,
      analysis
    });
    
  } catch (error) {
    console.error('Error loading alerts data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load alerts data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
```

### src/hooks/useVillas.ts
```typescript
import { useQuery } from '@tanstack/react-query';
import type { NormalizedVilla } from '@/types/villas';

interface VillasResponse {
  success: boolean;
  data: NormalizedVilla[];
  count: number;
  analysis: {
    totalVillas: number;
    uniqueAccountNumbers: number;
    cities: number;
    invalidCoordinates: number;
  };
}

export function useVillas() {
  return useQuery<VillasResponse>({
    queryKey: ['villas'],
    queryFn: async () => {
      const response = await fetch('/api/v1/villas');
      if (!response.ok) {
        throw new Error('Failed to fetch villas');
      }
      return response.json();
    },
    staleTime: Infinity, // Villas data doesn't change often
    retry: 1,
  });
}
```

### src/hooks/useAlerts.ts
```typescript
import { useQuery } from '@tanstack/react-query';
import type { Alert } from '@/types/alerts';

interface AlertsResponse {
  success: boolean;
  data: Alert[];
  count: number;
  todayAlerts: Alert[];
  todayCount: number;
  analysis: {
    totalVillas: number;
    uniqueAccountNumbers: number;
    totalAlerts: number;
    todayAlerts: number;
    orphanAlerts: number;
    cities: string[];
    emirates: string[];
  };
}

export function useAlerts() {
  return useQuery<AlertsResponse>({
    queryKey: ['alerts'],
    queryFn: async () => {
      const response = await fetch('/api/v1/alerts');
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      return response.json();
    },
    refetchInterval: 10000, // Refetch every 10 seconds
    retry: 1,
  });
}
```

## Data Analysis Features

### Villas Analysis:
- Total villas count
- Unique Account Numbers
- Cities found
- Invalid coordinates detection
- Sample cities logging

### Alerts Analysis:
- Total alerts count
- Today's alerts count
- Orphan alerts (no matching villa)
- Cities and emirates mapping
- Data validation with zod

### Key Features:
- ✅ **Zod validation** for runtime type safety
- ✅ **Coordinate normalization** (string → number)
- ✅ **Data analysis logging** to console
- ✅ **Error handling** with detailed error messages
- ✅ **TypeScript types** for all data structures
- ✅ **React Query hooks** with proper caching
- ✅ **10-second refresh** for alerts data
- ✅ **Infinite stale time** for villas data

## How to Rollback

1. Delete all files listed in "New Files" section
2. Remove zod and dayjs from package.json dependencies
3. Run `npm install` to restore original dependencies

## Next Steps

Phase 3 will focus on building the visible layout with header counters, city filter, and basic UI shell components.

## Data Structure Summary

### Villas Schema:
```typescript
{
  Account_Number: string,
  Customer_Name: string,
  Email_Address?: string,
  Latitude: number, // Normalized from string
  Longitude: number, // Normalized from string
  Address?: string,
  City: string
}
```

### Alerts Schema:
```typescript
{
  id: string,
  Account_ID: string,
  User_ID?: string,
  Mobile?: string,
  Title: string,
  Type: string,
  Alert_DateTime: string, // ISO datetime
  Status: 'Open' | 'Closed',
  Premise_ID?: string,
  Title_Ar?: string,
  Type_Ar?: string
}
```

### Join Key:
- `villas.Account_Number === alerts.Account_ID` 