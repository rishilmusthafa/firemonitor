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
              'text-xs px-3 py-1 h-auto transition-colors',
              emirate === emirateOption 
                ? 'bg-white text-black font-medium hover:text-white' 
                : 'bg-secondary text-textSecondary hover:bg-secondary/80 hover:text-white'
            )}
          >
            {emirateOption}
          </Button>
        ))}
      </div>
    </div>
  );
} 