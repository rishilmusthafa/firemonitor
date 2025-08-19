import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { NormalizedVilla } from '@/types/villas';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Read villas data from file
    const dataPath = join(process.cwd(), 'src', 'data', 'villas.json');
  
    
    const rawData = readFileSync(dataPath, 'utf-8');
    
    const villasData = JSON.parse(rawData);
    
    // Manual transformation (working approach)
    const normalizedVillas: NormalizedVilla[] = villasData.map((villa: Record<string, unknown>) => ({
      Account_Number: villa.Account_Number as string,
      Customer_Name: villa.Customer_Name as string,
      Email_Address: villa.Email_Address as string | undefined,
      Latitude: parseFloat(villa.Latitude as string),
      Longitude: parseFloat(villa.Longitude as string),
      Address: villa.Address as string | undefined,
      City: villa.City as string,
    }));
    const cities = [...new Set(normalizedVillas.map(v => v.City))];
    
    // Check for invalid coordinates
    const invalidCoords = normalizedVillas.filter(v => 
      isNaN(v.Latitude) || isNaN(v.Longitude) || 
      v.Latitude < -90 || v.Latitude > 90 ||
      v.Longitude < -180 || v.Longitude > 180
    );
    
    if (invalidCoords.length > 0) {
      console.warn(`Found ${invalidCoords.length} villas with invalid coordinates`);
    }
    
    return NextResponse.json({
      success: true,
      data: normalizedVillas,
      count: normalizedVillas.length,
      analysis: {
        totalVillas: normalizedVillas.length,
        uniqueAccountNumbers: new Set(normalizedVillas.map(v => v.Account_Number)).size,
        cities: cities.length,
        invalidCoordinates: invalidCoords.length,
      }
    });
    
  } catch (error) {
    console.error('Error loading villas data:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load villas data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 