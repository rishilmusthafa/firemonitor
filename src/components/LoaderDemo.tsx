'use client';

import { useState } from 'react';
import LoadingScreen from './LoadingScreen';
import GlobeLoader from './GlobeLoader';

export default function LoaderDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLoader, setSelectedLoader] = useState<'original' | 'globe'>('globe');

  const startLoading = () => {
    setIsLoading(true);
    // Simulate loading for 8 seconds
    setTimeout(() => {
      setIsLoading(false);
    }, 8000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex flex-col items-center justify-center p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          Fire Monitor UAE - Loader Demo
        </h1>
        <p className="text-cyan-300 mb-8">
          Choose your preferred loading experience
        </p>
        
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={() => setSelectedLoader('original')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              selectedLoader === 'original'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Original Loader
          </button>
          <button
            onClick={() => setSelectedLoader('globe')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              selectedLoader === 'globe'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Globe Loader (Aceternity UI Style)
          </button>
        </div>

        <button
          onClick={startLoading}
          disabled={isLoading}
          className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading...' : 'Start Loading Demo'}
        </button>
      </div>

      {/* Loader Display */}
      {selectedLoader === 'original' ? (
        <LoadingScreen isLoading={isLoading} onComplete={() => setIsLoading(false)} />
      ) : (
        <GlobeLoader isLoading={isLoading} onComplete={() => setIsLoading(false)} />
      )}

      {/* Feature Comparison */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-bold text-white mb-4">Original Loader</h3>
          <ul className="text-slate-300 space-y-2">
            <li>• Classic animated globe with orbiting elements</li>
            <li>• Simple progress bar with gradient</li>
            <li>• Floating status cards</li>
            <li>• Space-themed background particles</li>
            <li>• Corner decorations with emojis</li>
          </ul>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-bold text-white mb-4">Globe Loader (Aceternity UI)</h3>
          <ul className="text-slate-300 space-y-2">
            <li>• Advanced 3D globe with realistic lighting</li>
            <li>• Aceternity UI card stack animation</li>
            <li>• Enhanced space background with nebula effects</li>
            <li>• Pulse rings and data streams</li>
            <li>• More sophisticated animations and transitions</li>
          </ul>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 text-center text-slate-400">
        <p className="text-sm">
          The Globe Loader uses Aceternity UI design patterns and advanced Framer Motion animations
          to create a more immersive and modern loading experience.
        </p>
      </div>
    </div>
  );
} 