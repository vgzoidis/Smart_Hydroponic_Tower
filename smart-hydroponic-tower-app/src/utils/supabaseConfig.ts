import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const SUPABASE_URL = 'https://jnvbsbphxvypcuorolen.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpudmJzYnBoeHZ5cGN1b3JvbGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMDY4MjEsImV4cCI6MjA3MTc4MjgyMX0.S0MrRcN_fNfTdIeIRPO6uqB7QfpwtY4vIchLpr8tTH0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

  try {
    const { data, error } = await supabase
      .from('sensor_data')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching sensor data:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getSensorData:', error);
    return [];
  }
};

// Function to get the latest sensor readings count for each time range
export const getDataPointsCount = async (timeRange: TimeRange): Promise<number> => {
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

  try {
    const { count, error } = await supabase
      .from('sensor_data')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    if (error) {
      console.error('Error getting data count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getDataPointsCount:', error);
    return 0;
  }
};
