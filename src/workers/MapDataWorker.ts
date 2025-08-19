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
  status?: 'open' | 'closed';
  accountNumber: string;
  customerName: string;
  alertData?: Alert;
}

interface FilterAndClusterParams {
  viewportBounds: ViewportBounds;
  cameraHeight: number;
  emirate: string;
  showNonAlertAboveZoom: boolean;
}

// Emirate bounds mapping
const EMIRATE_BOUNDS = {
  "Dubai": { west: 55.0, east: 55.6, south: 24.9, north: 25.5 },
  "Abu Dhabi": { west: 52.5, east: 55.5, south: 22.5, north: 25.3 },
  "Sharjah": { west: 55.3, east: 55.9, south: 25.1, north: 25.5 },
  "Ajman": { west: 55.4, east: 55.6, south: 25.3, north: 25.5 },
  "Umm Al Quwain": { west: 55.5, east: 55.8, south: 25.5, north: 25.7 },
  "Ras Al Khaimah": { west: 55.6, east: 56.2, south: 25.5, north: 26.2 },
  "Fujairah": { west: 56.0, east: 56.5, south: 25.0, north: 25.7 },
  "All": { west: 52.5, east: 56.6, south: 22.5, north: 26.5 }
};

// Emirate mapping based on cities
const EMIRATE_MAPPING: Record<string, string> = {
  'Dubai': 'Dubai',
  'Abu Dhabi': 'Abu Dhabi',
  'Sharjah': 'Sharjah',
  'Ajman': 'Ajman',
  'Umm Al Quwain': 'Umm Al Quwain',
  'Ras Al Khaimah': 'Ras Al Khaimah',
  'Fujairah': 'Fujairah',
};

function getEmirateFromCity(city: string): string {
  return EMIRATE_MAPPING[city] || 'Other';
}

function isInViewport(villa: Villa, bounds: ViewportBounds): boolean {
  return villa.Longitude >= bounds.west && 
         villa.Longitude <= bounds.east && 
         villa.Latitude >= bounds.south && 
         villa.Latitude <= bounds.north;
}

function createClusters(markers: Marker[], maxDistance: number = 0.01): Cluster[] {
  const clusters: Cluster[] = [];
  const processed = new Set<string>();

  for (let i = 0; i < markers.length; i++) {
    if (processed.has(markers[i].id)) continue;

    const cluster = [markers[i]];
    processed.add(markers[i].id);

    for (let j = i + 1; j < markers.length; j++) {
      if (processed.has(markers[j].id)) continue;

      const distance = Math.sqrt(
        Math.pow(markers[i].lon - markers[j].lon, 2) + 
        Math.pow(markers[i].lat - markers[j].lat, 2)
      );

      if (distance <= maxDistance) {
        cluster.push(markers[j]);
        processed.add(markers[j].id);
      }
    }

    if (cluster.length > 1) {
      const avgLon = cluster.reduce((sum, m) => sum + m.lon, 0) / cluster.length;
      const avgLat = cluster.reduce((sum, m) => sum + m.lat, 0) / cluster.length;
      clusters.push({ lon: avgLon, lat: avgLat, count: cluster.length });
    }
  }

  return clusters;
}

class MapDataWorker {
  private villas: Villa[] = [];
  private alerts: Alert[] = [];
  private alertVillaIds: Set<string> = new Set();

  init({ villas, alerts }: { villas: Villa[]; alerts: Alert[] }) {
    this.villas = villas;
    this.alerts = alerts;
    
    // Create set of villa account numbers that have alerts
    this.alertVillaIds = new Set(
      alerts.map(alert => alert.Account_ID)
    );
  }

  filterAndCluster({
    viewportBounds,
    cameraHeight,
    emirate,
    showNonAlertAboveZoom
  }: FilterAndClusterParams): { clusters: Cluster[]; markers: Marker[] } {
    // Filter villas by emirate
    let filteredVillas = this.villas;
    if (emirate !== 'All') {
      filteredVillas = this.villas.filter(villa => 
        getEmirateFromCity(villa.City) === emirate
      );
    }

    // Filter by viewport
    const viewportVillas = filteredVillas.filter(villa => 
      isInViewport(villa, viewportBounds)
    );

    // Determine which villas to show based on camera height
    const shouldShowNonAlertVillas = cameraHeight < 100000; // 100km threshold
    const showAllVillas = showNonAlertAboveZoom || shouldShowNonAlertVillas;

    // Create markers
    const markers: Marker[] = [];
    
    for (const villa of viewportVillas) {
      const hasAlert = this.alertVillaIds.has(villa.Account_Number);
      const alert = this.alerts.find(a => a.Account_ID === villa.Account_Number);
      
      // Show alert villas always, show non-alert villas based on threshold
      if (hasAlert || showAllVillas) {
        markers.push({
          id: villa.Account_Number,
          lon: villa.Longitude,
          lat: villa.Latitude,
          isAlert: hasAlert,
          status: alert?.Status === 'Open' ? 'open' : 'closed',
          accountNumber: villa.Account_Number,
          customerName: villa.Customer_Name,
          alertData: alert,
        });
      }
    }

    // Create clusters based on camera height
    const clusterDistance = cameraHeight > 50000 ? 0.02 : 0.01; // Larger clusters at higher altitude
    const clusters = createClusters(markers, clusterDistance);

    return {
      clusters,
      markers: markers.filter(marker => {
        // Remove markers that are part of clusters
        return !clusters.some(cluster => {
          const distance = Math.sqrt(
            Math.pow(marker.lon - cluster.lon, 2) + 
            Math.pow(marker.lat - cluster.lat, 2)
          );
          return distance <= clusterDistance;
        });
      })
    };
  }

  getEmirateBounds(emirate: string): ViewportBounds | null {
    return EMIRATE_BOUNDS[emirate as keyof typeof EMIRATE_BOUNDS] || null;
  }
}

// Create and expose an instance instead of the class
const mapDataWorkerInstance = new MapDataWorker();
expose(mapDataWorkerInstance); 