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
    console.log('Attempting to create Supabase client...');
    console.log('URL:', SUPABASE_URL);
    console.log('Key length:', SUPABASE_ANON_KEY.length);
    
    // Try with absolutely no options first
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('Supabase client created successfully');
    return client;
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    console.error('Error type:', typeof error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return null;
  }
};

// Simple test function that just tries to connect
export const testConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Starting connection test...');
    
    // First check if we can create the client
    const client = createSupabaseClient();
    if (!client) {
      return { success: false, message: 'Failed to create client - check console for details' };
    }

    console.log('Client created, testing database connection...');
    
    // Try the simplest possible query
    const { count, error } = await client
      .from('sensor_data')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log('Connection test error:', error.message);
      return { success: false, message: `Database error: ${error.message}` };
    }

    console.log('Connection test successful, found', count, 'records');
    return { success: true, message: `Connected successfully - ${count} records found` };
  } catch (error) {
    console.error('Connection test exception:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { 
      success: false, 
      message: `Connection failed: ${errorMessage}` 
    };
  }
};

// Simple data fetch function
export const fetchSensorData = async (timeRange: TimeRange): Promise<{ data: SensorDataRecord[]; error: string | null }> => {
  try {
    console.log(`Fetching data for ${timeRange}...`);
    
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
      console.error('Data fetch error:', error);
      return { data: [], error: error.message };
    }

    console.log(`Successfully fetched ${data?.length || 0} records`);
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Data fetch exception:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
