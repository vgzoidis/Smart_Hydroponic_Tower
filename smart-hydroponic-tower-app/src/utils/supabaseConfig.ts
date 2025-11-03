// Import URL polyfill for React Native
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const SUPABASE_URL = 'https://link.supabase.co';
const SUPABASE_ANON_KEY = 'anon-key';

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

    // Get current time - since database timestamps are already in local EET/EEST,
    // we don't need to adjust for timezone offset in our queries
    const now = new Date();
    let startDate: Date;
    let limit: number;

    switch (timeRange) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        limit = 500; // ~288 expected points for 24 hours at 5-min intervals
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        limit = 3000; // Increased further to ensure we get all week data
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        limit = 10000; // Very high limit to ensure we get all data since Aug 28
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        limit = 500; // Default to same as 'day' case
    }

    // For better performance, we can also sort by descending order and take the most recent data
    // This ensures we get the latest data even if there's more data than our limit
    let { data, error } = await client
      .from('sensor_data')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false }) // Get most recent data first
      .limit(limit);

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
