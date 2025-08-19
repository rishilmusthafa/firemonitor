import { Villa, NormalizedVilla } from '@/types/villas';
import { Alert } from '@/types/alerts';
import dayjs from 'dayjs';

// Emirate mapping based on cities
const EMIRATE_MAPPING: Record<string, string> = {
  'Dubai': 'Dubai',
  'Abu Dhabi': 'Abu Dhabi',
  'Sharjah': 'Sharjah',
  'Sharjah ': 'Sharjah', // Handle trailing space
  'Ajman': 'Ajman',
  'Umm Al Quwain': 'Umm Al Quwain',
  'Umm al Quwain': 'Umm Al Quwain', // Add lowercase 'al' variation
  'Ras Al Khaimah': 'Ras Al Khaimah',
  'Ras Al khaimah': 'Ras Al Khaimah', // Handle mixed case
  'Ras al-Khaimah': 'Ras Al Khaimah', // Handle hyphenated version
  'Fujairah': 'Fujairah',
  'Alain': 'Abu Dhabi', // Alain is part of Abu Dhabi
  'Tarif': 'Other', // Unknown location
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

/**
 * Filters alerts to keep only the latest alert for each villa
 * @param alerts Array of alerts
 * @returns Filtered array with only the latest alert per villa
 */
export function filterLatestAlertsPerVilla(alerts: Alert[]): Alert[] {
  // Group alerts by Account_ID (villa)
  const alertsByVilla = new Map<string, Alert[]>();
  
  alerts.forEach(alert => {
    const villaId = alert.Account_ID;
    if (!alertsByVilla.has(villaId)) {
      alertsByVilla.set(villaId, []);
    }
    alertsByVilla.get(villaId)!.push(alert);
  });
  
  // For each villa, keep only the latest alert
  const latestAlerts: Alert[] = [];
  let duplicatesFound = 0;
  
  alertsByVilla.forEach((villaAlerts, villaId) => {
    if (villaAlerts.length === 1) {
      // Only one alert for this villa, keep it
      latestAlerts.push(villaAlerts[0]);
    } else {
      // Multiple alerts for this villa, find the latest one
      duplicatesFound += villaAlerts.length - 1;
      
      const latestAlert = villaAlerts.reduce((latest, current) => {
        const latestDate = new Date(latest.Alert_DateTime);
        const currentDate = new Date(current.Alert_DateTime);
        return currentDate > latestDate ? current : latest;
      });
      latestAlerts.push(latestAlert);
    }
  });
  
  // Sort by Alert_DateTime (newest first) for consistent ordering
  return latestAlerts.sort((a, b) => 
    new Date(b.Alert_DateTime).getTime() - new Date(a.Alert_DateTime).getTime()
  );
} 