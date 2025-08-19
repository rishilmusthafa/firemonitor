export interface Villa {
  Account_Number: string;
  Customer_Name: string;
  Email_Address?: string;
  Latitude: string; // Will be converted to number
  Longitude: string; // Will be converted to number
  Address?: string;
  City: string;
}

export interface NormalizedVilla {
  Account_Number: string;
  Customer_Name: string;
  Email_Address?: string;
  Latitude: number;
  Longitude: number;
  Address?: string;
  City: string;
} 