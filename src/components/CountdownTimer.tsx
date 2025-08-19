'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  secondsRemaining: number;
  onComplete?: () => void;
  className?: string;
}

export default function CountdownTimer({ secondsRemaining, onComplete, className = '' }: CountdownTimerProps) {
  // Log the incoming value for debugging

  
  // Validate and clamp secondsRemaining to reasonable range (0-120 seconds for 2-minute window)
  const validSecondsRemaining = Math.max(0, Math.min(120, secondsRemaining));
  
  // Log if we're clamping the value
  if (secondsRemaining !== validSecondsRemaining) {
    console.warn('CountdownTimer: Clamping invalid secondsRemaining:', {
      original: secondsRemaining,
      clamped: validSecondsRemaining
    });
  }
  
  const [timeLeft, setTimeLeft] = useState(validSecondsRemaining);

  useEffect(() => {
    setTimeLeft(validSecondsRemaining);
  }, [validSecondsRemaining]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTime12Hour = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const totalMinutes = minutes + Math.floor(remainingSeconds / 60);
    
    // Convert to 12-hour format
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const secs = remainingSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const getColorClass = () => {
    if (timeLeft <= 30) return 'text-red-500'; // Last 30 seconds
    if (timeLeft <= 60) return 'text-orange-500'; // Last 1 minute
    return 'text-green-500'; // First minute
  };

  return (
    <span className={`font-mono font-bold ${getColorClass()} ${className}`}>
      {formatTime12Hour(timeLeft)}
    </span>
  );
} 