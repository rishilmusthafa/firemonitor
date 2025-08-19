export interface Alert {
  id: string;
  Account_ID: string;
  User_ID?: string | null;
  Mobile?: string | null;
  Title: string;
  Type: string;
  Alert_DateTime: string; // ISO string
  Status: 'Open' | 'Closed';
  Premise_ID?: string | null;
  Title_Ar?: string | null;
  Type_Ar?: string | null;
}

export interface ProcessedAlert {
  id: string;
  accountId: string;
  title: string;
  titleAr?: string | null;
  datetime: string;
  status: 'closed' | 'countdown' | 'overdue';
  secondsRemaining?: number;
  mobile?: string | null;
  type: string;
}

export interface ProcessTodayResult {
  openToday: number;
  totalToday: number;
  items: ProcessedAlert[];
} 