import { expose } from 'comlink';

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

interface ProcessedAlert {
  id: string;
  accountId: string;
  title: string;
  titleAr?: string;
  datetime: string;
  status: 'closed' | 'countdown' | 'overdue';
  secondsRemaining?: number;
  mobile?: string;
  type: string;
}

interface ProcessTodayResult {
  openToday: number;
  totalToday: number;
  items: ProcessedAlert[];
}

interface Villa {
  Account_Number: string;
  Customer_Name: string;
  Email_Address?: string;
  Latitude: number;
  Longitude: number;
  Address?: string;
  City: string;
}

class AlertsWorker {
  private alerts: Alert[] = [];
  private villas: Villa[] = [];
  private nowUtc: string = '';

  init({ alerts, villas, nowUtc }: { alerts: Alert[]; villas: Villa[]; nowUtc: string }) {
    this.alerts = alerts;
    this.villas = villas;
    this.nowUtc = nowUtc;
    

  }

  processToday({ nowUtc }: { nowUtc: string }): ProcessTodayResult {
    this.nowUtc = nowUtc;
    const now = new Date(nowUtc);
    
    // Use UTC dates for consistent UTC timezone handling
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // Filter alerts for today using UTC
    const todayAlerts = this.alerts.filter(alert => {
      const alertDate = new Date(alert.Alert_DateTime);
      return alertDate >= todayStart && alertDate < todayEnd;
    });

    // Process each alert using UTC
    const processedAlerts: ProcessedAlert[] = todayAlerts.map(alert => {
      // Use UTC timestamps exactly as they come from API
      const alertDate = new Date(alert.Alert_DateTime);
      const secondsSinceAlert = Math.floor((now.getTime() - alertDate.getTime()) / 1000);
      

      
      // Debug logging for countdown issues
      if (secondsSinceAlert < 0) {
        console.warn('⚠️ Alert date is in the future:', {
          alertId: alert.id,
          alertDateTime: alert.Alert_DateTime,
          now: now.toISOString(),
          secondsSinceAlert
        });
      }
      
      let status: 'closed' | 'countdown' | 'overdue';
      let secondsRemaining: number | undefined;

      if (alert.Status === 'Closed') {
        status = 'closed';
      } else {
        // Open alerts: check if within 2-minute window
        const twoMinutes = 2 * 60; // 2 minutes in seconds
        
        // Handle negative seconds (future dates) - these should be treated as overdue
        if (secondsSinceAlert < 0) {
          status = 'overdue'; // Future alerts are considered overdue
          secondsRemaining = undefined;
        } else if (secondsSinceAlert <= twoMinutes) {
          status = 'countdown';
          secondsRemaining = twoMinutes - secondsSinceAlert;
        } else {
          status = 'overdue';
        }
        
        // Validate secondsRemaining is reasonable
        if (secondsRemaining !== undefined && (secondsRemaining < 0 || secondsRemaining > twoMinutes)) {
          console.error('❌ Invalid secondsRemaining:', {
            alertId: alert.id,
            secondsSinceAlert,
            secondsRemaining,
            twoMinutes
          });
          secondsRemaining = Math.max(0, Math.min(twoMinutes, secondsRemaining));
        }
        

      }

      // Find matching villa for additional info
      const villa = this.villas.find(v => v.Account_Number === alert.Account_ID);

      return {
        id: alert.id,
        accountId: alert.Account_ID,
        title: alert.Title,
        titleAr: alert.Title_Ar,
        datetime: alert.Alert_DateTime,
        status,
        secondsRemaining,
        mobile: alert.Mobile,
        type: alert.Type,
      };
    });

    const openToday = processedAlerts.filter(alert => alert.status !== 'closed').length;
    const totalToday = processedAlerts.length;

    return {
      openToday,
      totalToday,
      items: processedAlerts
    };
  }

  getAlertStats(): {
    totalAlerts: number;
    openAlerts: number;
    closedAlerts: number;
    overdueAlerts: number;
    countdownAlerts: number;
  } {
    const now = new Date(this.nowUtc);
    const twoMinutes = 2 * 60; // 2 minutes in seconds

    let openAlerts = 0;
    let closedAlerts = 0;
    let overdueAlerts = 0;
    let countdownAlerts = 0;

    this.alerts.forEach(alert => {
      if (alert.Status === 'Closed') {
        closedAlerts++;
      } else {
        // Use UTC timestamps exactly as they come from API
        const alertDate = new Date(alert.Alert_DateTime);
        const secondsSinceAlert = Math.floor((now.getTime() - alertDate.getTime()) / 1000);
        
        // Handle future alerts as overdue
        if (secondsSinceAlert < 0) {
          overdueAlerts++;
        } else if (secondsSinceAlert <= twoMinutes) {
          countdownAlerts++;
        } else {
          overdueAlerts++;
        }
        openAlerts++;
      }
    });

    return {
      totalAlerts: this.alerts.length,
      openAlerts,
      closedAlerts,
      overdueAlerts,
      countdownAlerts,
    };
  }

  getAlertsByEmirate(emirate: string): Alert[] {
    if (emirate === 'All') {
      // For 'All', deduplicate by account ID and keep latest
      const alertMap = new Map<string, Alert>();
      this.alerts.forEach(alert => {
        const existing = alertMap.get(alert.Account_ID);
        if (!existing || new Date(alert.Alert_DateTime) > new Date(existing.Alert_DateTime)) {
          alertMap.set(alert.Account_ID, alert);
        }
      });
      return Array.from(alertMap.values());
    }

    // Get villa account numbers for the selected emirate (case-insensitive comparison)
    const emirateVillaIds = new Set(
      this.villas
        .filter(villa => villa.City?.toLowerCase() === emirate.toLowerCase())
        .map(villa => villa.Account_Number)
    );

    // Filter alerts for villas in the selected emirate and deduplicate by account ID
    const emirateAlerts = this.alerts.filter(alert => emirateVillaIds.has(alert.Account_ID));
    const alertMap = new Map<string, Alert>();
    
    emirateAlerts.forEach(alert => {
      const existing = alertMap.get(alert.Account_ID);
      if (!existing || new Date(alert.Alert_DateTime) > new Date(existing.Alert_DateTime)) {
        alertMap.set(alert.Account_ID, alert);
      }
    });

    return Array.from(alertMap.values());
  }
}

// Create and expose an instance instead of the class
const alertsWorkerInstance = new AlertsWorker();
expose(alertsWorkerInstance); 