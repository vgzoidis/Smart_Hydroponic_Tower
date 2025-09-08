import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
// Replace these with your actual Supabase project URL and anon key
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Interface for sensor data stored in Supabase
export interface SensorDataRecord {
  id: number;
  created_at: string;
  water_temp: number;
  water_ph: number;
  ec_level: number;
  water_level: boolean;
  pump_status: boolean;
  env_temp: number;
  humidity: number;
  light_level: number;
  co2_level: number;
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

  const { data, error } = await supabase
    .from('sensor_data') // Replace with your actual table name
    .select('*')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching sensor data:', error);
    throw error;
  }

  return data || [];
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

  const { count, error } = await supabase
    .from('sensor_data')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate.toISOString());

  if (error) {
    console.error('Error getting data count:', error);
    return 0;
  }

  return count || 0;
};
