'use client';

import { useEffect, useState } from 'react';
import { wrap } from 'comlink';

interface AlertsWorkerAPI {
  init: (params: { alerts: any[]; nowUtc: string }) => Promise<void>;
  processToday: (params: { nowUtc: string }) => Promise<{
    openToday: number;
    totalToday: number;
    items: any[];
  }>;
}

export default function WorkerTest() {
  const [workerResponse, setWorkerResponse] = useState<string>('');

  useEffect(() => {
    const testWorker = async () => {
      try {
        // Create a worker instance
        const worker = new Worker(new URL('../workers/AlertsWorker.ts', import.meta.url), {
          type: 'module',
        });
        
        const workerApi = wrap(worker) as AlertsWorkerAPI;
        const result = await workerApi.processToday({ nowUtc: new Date().toISOString() });
        
        setWorkerResponse(`Worker test successful: ${result.openToday}/${result.totalToday} alerts`);
      } catch (error) {
        setWorkerResponse(`Worker test failed: ${error}`);
      }
    };

    testWorker();
  }, []);

  return (
    <div className="fixed bottom-4 left-4 bg-secondary p-4 rounded-lg text-sm">
      <div>Worker Test: {workerResponse}</div>
    </div>
  );
} 