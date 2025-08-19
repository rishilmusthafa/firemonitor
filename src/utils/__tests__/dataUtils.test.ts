import { filterLatestAlertsPerVilla, getEmirateFromCity } from '../dataUtils';
import type { Alert } from '@/types/alerts';

describe('dataUtils', () => {
  describe('filterLatestAlertsPerVilla', () => {
    const mockAlert1: Alert = {
      id: '1',
      Account_ID: 'ACC001',
      Title: 'Fire Alarm',
      Title_Ar: 'إنذار حريق',
      Alert_DateTime: '2025-01-17T10:30:00.000Z',
      Status: 'Open',
      Mobile: '0501234567',
      Type: 'fire',
    };

    const mockAlert2: Alert = {
      id: '2',
      Account_ID: 'ACC001', // Same account as alert1
      Title: 'Fire Alarm',
      Title_Ar: 'إنذار حريق',
      Alert_DateTime: '2025-01-17T10:35:00.000Z', // Later time
      Status: 'Open',
      Mobile: '0501234567',
      Type: 'fire',
    };

    const mockAlert3: Alert = {
      id: '3',
      Account_ID: 'ACC002', // Different account
      Title: 'Fire Alarm',
      Title_Ar: 'إنذار حريق',
      Alert_DateTime: '2025-01-17T10:40:00.000Z',
      Status: 'Open',
      Mobile: '0501234568',
      Type: 'fire',
    };

    test('returns empty array for empty input', () => {
      const result = filterLatestAlertsPerVilla([]);
      expect(result).toEqual([]);
    });

    test('returns single alert unchanged', () => {
      const alerts = [mockAlert1];
      const result = filterLatestAlertsPerVilla(alerts);
      expect(result).toEqual([mockAlert1]);
    });

    test('filters duplicate alerts keeping the latest', () => {
      const alerts = [mockAlert1, mockAlert2]; // Same Account_ID, different times
      const result = filterLatestAlertsPerVilla(alerts);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockAlert2); // Should keep the later one
    });

    test('keeps alerts with different Account_IDs', () => {
      const alerts = [mockAlert1, mockAlert3]; // Different Account_IDs
      const result = filterLatestAlertsPerVilla(alerts);
      
      expect(result).toHaveLength(2);
      expect(result).toContain(mockAlert1);
      expect(result).toContain(mockAlert3);
    });

    test('handles multiple duplicates correctly', () => {
      const alert4: Alert = {
        ...mockAlert1,
        id: '4',
        Alert_DateTime: '2025-01-17T10:25:00.000Z', // Earlier than alert1
      };

      const alert5: Alert = {
        ...mockAlert1,
        id: '5',
        Alert_DateTime: '2025-01-17T10:45:00.000Z', // Later than alert2
      };

      const alerts = [mockAlert1, mockAlert2, alert4, alert5, mockAlert3];
      const result = filterLatestAlertsPerVilla(alerts);
      
      expect(result).toHaveLength(2); // ACC001 (latest) + ACC002
      expect(result.find(a => a.Account_ID === 'ACC001')).toEqual(alert5);
      expect(result.find(a => a.Account_ID === 'ACC002')).toEqual(mockAlert3);
    });

    test('handles alerts with same timestamp', () => {
      const alertSameTime: Alert = {
        ...mockAlert1,
        id: '4',
        Alert_DateTime: '2025-01-17T10:30:00.000Z', // Same time as alert1
      };

      const alerts = [mockAlert1, alertSameTime];
      const result = filterLatestAlertsPerVilla(alerts);
      
      expect(result).toHaveLength(1);
      // Should keep one of them (order may vary)
      expect(result[0].Account_ID).toBe('ACC001');
    });

    test('handles null and undefined values', () => {
      const alerts = [mockAlert1, null as any, undefined as any, mockAlert3];
      const result = filterLatestAlertsPerVilla(alerts);
      
      expect(result).toHaveLength(2);
      expect(result).toContain(mockAlert1);
      expect(result).toContain(mockAlert3);
    });

    test('handles alerts without Account_ID', () => {
      const alertNoAccount: Alert = {
        ...mockAlert1,
        id: '4',
        Account_ID: '', // Empty Account_ID
      };

      const alerts = [mockAlert1, alertNoAccount];
      const result = filterLatestAlertsPerVilla(alerts);
      
      expect(result).toHaveLength(2); // Should keep both as they have different Account_IDs
    });

    test('performance with large dataset', () => {
      const largeAlerts: Alert[] = [];
      
      // Create 1000 alerts with 100 unique Account_IDs
      for (let i = 0; i < 1000; i++) {
        const accountId = `ACC${String(i % 100).padStart(3, '0')}`;
        largeAlerts.push({
          ...mockAlert1,
          id: String(i),
          Account_ID: accountId,
          Alert_DateTime: new Date(2025, 0, 17, 10, 30, i).toISOString(),
        });
      }

      const startTime = performance.now();
      const result = filterLatestAlertsPerVilla(largeAlerts);
      const endTime = performance.now();

      expect(result).toHaveLength(100); // Should have 100 unique Account_IDs
      expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
    });
  });

  describe('getEmirateFromCity', () => {
    test('returns correct emirate for Dubai cities', () => {
      expect(getEmirateFromCity('Dubai')).toBe('Dubai');
      expect(getEmirateFromCity('DUBAI')).toBe('Dubai');
      expect(getEmirateFromCity('dubai')).toBe('Dubai');
      expect(getEmirateFromCity('Dubai Marina')).toBe('Dubai');
      expect(getEmirateFromCity('Palm Jumeirah')).toBe('Dubai');
      expect(getEmirateFromCity('Burj Khalifa')).toBe('Dubai');
    });

    test('returns correct emirate for Abu Dhabi cities', () => {
      expect(getEmirateFromCity('Abu Dhabi')).toBe('Abu Dhabi');
      expect(getEmirateFromCity('ABU DHABI')).toBe('Abu Dhabi');
      expect(getEmirateFromCity('abu dhabi')).toBe('Abu Dhabi');
      expect(getEmirateFromCity('Yas Island')).toBe('Abu Dhabi');
      expect(getEmirateFromCity('Saadiyat Island')).toBe('Abu Dhabi');
    });

    test('returns correct emirate for Sharjah cities', () => {
      expect(getEmirateFromCity('Sharjah')).toBe('Sharjah');
      expect(getEmirateFromCity('SHARJAH')).toBe('Sharjah');
      expect(getEmirateFromCity('sharjah')).toBe('Sharjah');
      expect(getEmirateFromCity('Al Qasimiya')).toBe('Sharjah');
    });

    test('returns correct emirate for Ajman cities', () => {
      expect(getEmirateFromCity('Ajman')).toBe('Ajman');
      expect(getEmirateFromCity('AJMAN')).toBe('Ajman');
      expect(getEmirateFromCity('ajman')).toBe('Ajman');
    });

    test('returns correct emirate for Umm Al Quwain cities', () => {
      expect(getEmirateFromCity('Umm Al Quwain')).toBe('Umm Al Quwain');
      expect(getEmirateFromCity('UMM AL QUWAIN')).toBe('Umm Al Quwain');
      expect(getEmirateFromCity('umm al quwain')).toBe('Umm Al Quwain');
    });

    test('returns correct emirate for Ras Al Khaimah cities', () => {
      expect(getEmirateFromCity('Ras Al Khaimah')).toBe('Ras Al Khaimah');
      expect(getEmirateFromCity('RAS AL KHAIMAH')).toBe('Ras Al Khaimah');
      expect(getEmirateFromCity('ras al khaimah')).toBe('Ras Al Khaimah');
    });

    test('returns correct emirate for Fujairah cities', () => {
      expect(getEmirateFromCity('Fujairah')).toBe('Fujairah');
      expect(getEmirateFromCity('FUJAIRAH')).toBe('Fujairah');
      expect(getEmirateFromCity('fujairah')).toBe('Fujairah');
    });

    test('handles edge cases', () => {
      expect(getEmirateFromCity('')).toBe('Unknown');
      expect(getEmirateFromCity('   ')).toBe('Unknown');
      expect(getEmirateFromCity('Invalid City')).toBe('Unknown');
      expect(getEmirateFromCity('Dubai ')).toBe('Dubai'); // Trailing space
      expect(getEmirateFromCity(' Dubai')).toBe('Dubai'); // Leading space
      expect(getEmirateFromCity('  Dubai  ')).toBe('Dubai'); // Both spaces
    });

    test('handles null and undefined', () => {
      expect(getEmirateFromCity(null as any)).toBe('Unknown');
      expect(getEmirateFromCity(undefined as any)).toBe('Unknown');
    });

    test('handles special characters', () => {
      expect(getEmirateFromCity('Dubai-Marina')).toBe('Dubai');
      expect(getEmirateFromCity('Dubai_Marina')).toBe('Dubai');
      expect(getEmirateFromCity('Dubai.Marina')).toBe('Dubai');
    });

    test('handles numbers in city names', () => {
      expect(getEmirateFromCity('Dubai 1')).toBe('Dubai');
      expect(getEmirateFromCity('Dubai 2nd')).toBe('Dubai');
    });

    test('case insensitive matching', () => {
      expect(getEmirateFromCity('dUbAi')).toBe('Dubai');
      expect(getEmirateFromCity('AbU dHaBi')).toBe('Abu Dhabi');
      expect(getEmirateFromCity('sHaRjAh')).toBe('Sharjah');
    });

    test('partial matches', () => {
      expect(getEmirateFromCity('Dubai Marina Tower')).toBe('Dubai');
      expect(getEmirateFromCity('Abu Dhabi Corniche')).toBe('Abu Dhabi');
      expect(getEmirateFromCity('Sharjah Al Majaz')).toBe('Sharjah');
    });
  });
}); 