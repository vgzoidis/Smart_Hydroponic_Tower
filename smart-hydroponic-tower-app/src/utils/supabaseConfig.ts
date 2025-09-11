// Import URL polyfill for React Native
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const SUPABASE_URL = 'https://jnvbsbphxvypcuorolen.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpudmJzYnBoeHZ5cGN1b3JvbGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMDY4MjEsImV4cCI6MjA3MTc4MjgyMX0.S0MrRcN_fNfTdIeIRPO6uqB7QfpwtY4vIchLpr8tTH0';

// Interface for sensor data stored in Supabase
export interface SensorDataRecord {
  id: number;
  created_at: string;
  timestamp: number;
  co2_level: number | null;
  ph_level: number | null;
  water_temp: number | null;
  env_temp: number | null;
  humidity: number | null;
  light_level: number | null;
  ec_level: number | null;
  water_level: boolean | null;
}

// Time range options
export type TimeRange = 'day' | 'week' | 'month';

// Simple client creation with minimal configuration
export const createSupabaseClient = () => {
  try {
    // Try with absolutely no options first
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    return client;
  } catch (error) {
    console.error('Supabase client creation failed:', error);
    return null;
  }
};

// Simple test function that just tries to connect
export const testConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    if (typeof createClient !== 'function') {
      return { success: false, message: 'Supabase createClient is not a function - library import failed' };
    }
    
    const client = createSupabaseClient();
    if (!client) {
      return { success: false, message: 'Failed to create client' };
    }
    
    // Try the simplest possible query
    const { count, error } = await client
      .from('sensor_data')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return { success: false, message: `Database error: ${error.message}` };
    }

    return { success: true, message: `Connected successfully - ${count} records found` };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { 
      success: false, 
      message: `Connection test failed: ${errorMessage}` 
    };
  }
};

// Simple data fetch function
export const fetchSensorData = async (timeRange: TimeRange): Promise<{ data: SensorDataRecord[]; error: string | null }> => {
  try {
    const client = createSupabaseClient();
    if (!client) {
      return { data: [], error: 'Failed to create client' };
    }

    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const { data, error } = await client
      .from('sensor_data')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Data fetch exception:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
