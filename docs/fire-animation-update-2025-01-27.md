# Fire Animation System Update - January 27, 2025

## Overview
Enhanced the fire animation system to intelligently highlight only newly received alerts and countdown alerts, rather than showing fire animation for all open alerts.

## Problem Statement
**Original Issue**: Fire animation was showing for ALL open alerts, creating visual noise and making it difficult to identify newly received alerts.

**User Requirements**:
1. Show fire animation only for NEWLY received open alerts
2. Show fire animation for countdown alerts
3. Remove fire animation after 2 minutes for both new and countdown alerts
4. Highlight new alerts to make them easily identifiable

## Solution Architecture

### Key Changes Made

#### 1. State Management Enhancement
**File**: `src/components/AlertList.tsx`

**Before**:
```typescript
const [newAlertIds, setNewAlertIds] = useState<Set<string>>(new Set());
```

**After**:
```typescript
const [newAlertTimestamps, setNewAlertTimestamps] = useState<Map<string, number>>(new Map());
const [isInitialLoad, setIsInitialLoad] = useState(true);
```

#### 2. New Alert Detection Logic
**Problem**: On first load, all alerts were considered "new" because `previousAlerts` was empty.

**Solution**: Added `isInitialLoad` flag to prevent false positives on initial load.

```typescript
// Only detect new alerts if this is not the initial load
if (!isInitialLoad) {
  currentAlertIds.forEach(id => {
    if (!previousAlertIds.has(id)) {
      newIds.add(id);
    }
  });
}
```

#### 3. Timestamp-Based Animation Tracking
**Problem**: `setNewAlertIds(newIds)` was overwriting previous new alert IDs every 10 seconds, causing animations to disappear prematurely.

**Solution**: Use timestamp-based tracking to persist animation state across refresh cycles.

```typescript
// Update new alert timestamps - add new alerts with current timestamp
setNewAlertTimestamps(prev => {
  const updated = new Map(prev);
  const now = Date.now();
  newIds.forEach(id => {
    updated.set(id, now);
  });
  return updated;
});
```

#### 4. Automatic Cleanup System
**Implementation**: Cleanup runs every 10 seconds to remove expired animations.

```typescript
// Clean up expired new alert animations (after 2 minutes)
useEffect(() => {
  const cleanupExpiredAlerts = () => {
    const now = Date.now();
    const twoMinutes = 2 * 60 * 1000;
    
    setNewAlertTimestamps(prev => {
      const updated = new Map(prev);
      let hasChanges = false;
      
      for (const [alertId, timestamp] of updated.entries()) {
        if (now - timestamp > twoMinutes) {
          updated.delete(alertId);
          hasChanges = true;
        }
      }
      
      return hasChanges ? updated : prev;
    });
  };

  const cleanupInterval = setInterval(cleanupExpiredAlerts, 10000);
  return () => clearInterval(cleanupInterval);
}, []);
```

#### 5. Centralized Animation Logic
**Helper Function**: `shouldShowFireAnimation(alertId)` centralizes all animation decisions.

```typescript
const shouldShowFireAnimation = (alertId: string) => {
  // Check if it's a new alert (within 2 minutes)
  const newAlertTimestamp = newAlertTimestamps.get(alertId);
  if (newAlertTimestamp) {
    const now = Date.now();
    const twoMinutes = 2 * 60 * 1000;
    if (now - newAlertTimestamp <= twoMinutes) {
      return true;
    }
  }
  
  // Check if it's a countdown alert
  return countdownAnimationIds.has(alertId);
};
```

#### 6. AlertDetails Component Update
**File**: `src/components/AlertDetails.tsx`

**Added**: `showFireAnimation` prop to control animation in details modal.

```typescript
interface AlertDetailsProps {
  // ... existing props
  showFireAnimation?: boolean;
}
```

**Updated**: FireEffect usage in details modal.

```typescript
<FireEffect isActive={showFireAnimation} className="w-full h-full">
```

## Workflow Explanation

### Initial Load
1. Fetch alerts from API
2. Set `isInitialLoad = true`
3. Store alerts in `previousAlerts` for future comparison
4. **No fire animations** (prevents false positives)

### 10-Second Refresh Cycle
1. Fetch latest alerts
2. Compare current alert IDs with `previousAlerts`
3. **If NOT initial load**: Detect new alerts (IDs in current but not in previous)
4. Add new alert timestamps to `newAlertTimestamps`
5. Update `countdownAnimationIds` for countdown status alerts
6. Update `previousAlerts` for next comparison
7. Set `isInitialLoad = false` after first successful load

### Animation Display Logic
- **New Alerts**: Show fire animation if timestamp exists and is within 2 minutes
- **Countdown Alerts**: Show fire animation if in `countdownAnimationIds`
- **All Other Alerts**: No fire animation

### Automatic Cleanup
- **Every 10 seconds**: Remove expired new alert timestamps (> 2 minutes old)
- **Countdown cleanup**: Remove countdown animations after 2 minutes

## Key Benefits

1. **Reduced Visual Noise**: Only new alerts animate, not all open alerts
2. **Clear New Alert Identification**: Fire animation highlights truly new alerts
3. **Persistent Animation**: 10-second refresh doesn't interrupt 2-minute animation window
4. **Automatic Cleanup**: No manual intervention needed
5. **Performance**: Reduced animation overhead
6. **Consistent Behavior**: Same logic in list and details modal

## Debug Features

### Console Logging
```typescript
console.log('🔥 Animation Debug:', {
  isInitialLoad,
  newAlertIds: Array.from(newIds),
  countdownIds: Array.from(countdownIds),
  totalAlerts: result.items.length,
  newAlertTimestamps: Object.fromEntries(newAlertTimestamps)
});
```

### Visual Debug Indicator
Small fire emoji (🔥) appears next to alerts with active fire animation.

## Files Modified

1. **`src/components/AlertList.tsx`**
   - Complete state management rewrite
   - New timestamp-based tracking system
   - Automatic cleanup implementation
   - Centralized animation logic

2. **`src/components/AlertDetails.tsx`**
   - Added `showFireAnimation` prop
   - Updated FireEffect usage

## Testing Scenarios

### Scenario 1: New Alert Arrival
1. System running with existing alerts
2. New alert arrives via API
3. **Expected**: Fire animation appears for 2 minutes
4. **Expected**: Animation persists through 10-second refreshes

### Scenario 2: Countdown Alert
1. Alert switches to countdown status
2. **Expected**: Fire animation appears
3. **Expected**: Animation continues for countdown duration (up to 2 minutes)

### Scenario 3: Animation Expiry
1. New alert with fire animation
2. Wait 2 minutes
3. **Expected**: Fire animation disappears automatically

### Scenario 4: Initial Load
1. Fresh page load with existing alerts
2. **Expected**: No fire animations (prevents false positives)

## Rollback Instructions

If issues arise, the system can be rolled back by:

1. Reverting `src/components/AlertList.tsx` to previous state
2. Reverting `src/components/AlertDetails.tsx` to previous state
3. The original behavior (fire animation for all open alerts) will be restored

## Future Enhancements

1. **Configurable Animation Duration**: Make 2-minute timeout configurable
2. **Sound Notifications**: Add audio alerts for new alerts
3. **Animation Intensity**: Vary animation intensity based on alert priority
4. **User Preferences**: Allow users to disable animations
5. **Animation History**: Track which alerts have been highlighted

---

**Last Updated**: January 27, 2025  
**Status**: Implemented and Tested  
**Author**: AI Assistant  
**Review Status**: Ready for Production 