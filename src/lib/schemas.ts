import { z } from 'zod';

// Villa schema
export const VillaSchema = z.object({
  Account_Number: z.string(),
  Customer_Name: z.string(),
  Email_Address: z.string().optional().nullable(),
  Latitude: z.string().transform((val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) {
      throw new Error(`Invalid latitude: ${val}`);
    }
    return num;
  }),
  Longitude: z.string().transform((val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) {
      throw new Error(`Invalid longitude: ${val}`);
    }
    return num;
  }),
  Address: z.string().optional().nullable(),
  City: z.string(),
});

export const VillasArraySchema = z.array(VillaSchema);

// Alert schema
export const AlertSchema = z.object({
  id: z.string(),
  Account_ID: z.string(),
  User_ID: z.string().optional().nullable(),
  Mobile: z.string().optional().nullable(),
  Title: z.string(),
  Type: z.string(),
  Alert_DateTime: z.string().datetime(),
  Status: z.enum(['Open', 'Closed']),
  Premise_ID: z.string().optional().nullable(),
  Title_Ar: z.string().optional().nullable(),
  Type_Ar: z.string().optional().nullable(),
});

export const AlertsArraySchema = z.array(AlertSchema);

// Data analysis result schema
export const DataAnalysisSchema = z.object({
  totalVillas: z.number(),
  uniqueAccountNumbers: z.number(),
  totalAlerts: z.number(),
  todayAlerts: z.number(),
  orphanAlerts: z.number(),
  cities: z.array(z.string()),
  emirates: z.array(z.string()),
}); 