import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const SUPABASE_URL = 'https://jnvbsbphxvypcuorolen.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpudmJzYnBoeHZ5cGN1b3JvbGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMDY4MjEsImV4cCI6MjA3MTc4MjgyMX0.S0MrRcN_fNfTdIeIRPO6uqB7QfpwtY4vIchLpr8tTH0';

// Initialize Supabase client with error handling
let supabase: any = null;
let initializationError: string | null = null;

try {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false, // Disable session persistence to avoid storage issues
      autoRefreshToken: false, // Disable auto refresh for simpler setup
    },
    global: {
      headers: {
        'X-Client-Info': 'smart-hydroponic-tower-app',
      },
      fetch: (url: RequestInfo | URL, options: RequestInit = {}) => {
        // Custom fetch with timeout and better error handling for React Native
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        );
        
        const fetchPromise = fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });
        
        return Promise.race([fetchPromise, timeoutPromise]);
      },
    },
  });
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  initializationError = error instanceof Error ? error.message : 'Unknown initialization error';
}

export { supabase };

// Simple network connectivity test
export const testNetworkConnectivity = async (): Promise<boolean> => {
  try {
    console.log('Testing basic network connectivity...');
    const response = await fetch('https://httpbin.org/status/200', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Network connectivity test failed:', error);
    return false;
  }
};

// Test function to verify Supabase connection
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    if (!supabase) {
      console.error('Supabase client not initialized:', initializationError);
      return false;
    }

    // First test basic network connectivity
    console.log('Testing basic network connectivity...');
    const hasNetwork = await testNetworkConnectivity();
    if (!hasNetwork) {
      console.error('No network connectivity detected');
      return false;
    }
    console.log('Network connectivity confirmed');

    console.log('Testing Supabase connection...');
    const { error } = await supabase
      .from('sensor_data')
      .select('id', { count: 'exact', head: true })
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test exception:', error);
    return false;
  }
};

// Interface for sensor data stored in Supabase (matching your actual schema)
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

// Function to get sensor data for a specific time range
export const getSensorData = async (timeRange: TimeRange): Promise<SensorDataRecord[]> => {
  try {
    if (!supabase) {
      throw new Error(`Supabase client not initialized: ${initializationError || 'Unknown error'}`);
    }

    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    console.log(`Fetching sensor data for ${timeRange} from ${startDate.toISOString()}`);

    const { data, error } = await supabase
      .from('sensor_data')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching sensor data:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`Successfully fetched ${data?.length || 0} sensor records`);
    return data || [];
  } catch (error) {
    console.error('Error in getSensorData:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while fetching sensor data');
  }
};

// Function to get the latest sensor readings count for each time range
export const getDataPointsCount = async (timeRange: TimeRange): Promise<number> => {
  try {
    if (!supabase) {
      throw new Error(`Supabase client not initialized: ${initializationError || 'Unknown error'}`);
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

    console.log(`Counting sensor data for ${timeRange} from ${startDate.toISOString()}`);

    const { count, error } = await supabase
      .from('sensor_data')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    if (error) {
      console.error('Error getting data count:', error);
      throw new Error(`Count error: ${error.message}`);
    }

    console.log(`Data count for ${timeRange}: ${count || 0}`);
    return count || 0;
  } catch (error) {
    console.error('Error in getDataPointsCount:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while counting sensor data');
  }
};
