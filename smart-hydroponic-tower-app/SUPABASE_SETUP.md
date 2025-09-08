# Supabase Configuration

Since you already have your Supabase project set up with data, you just need to configure your credentials.

## Quick Setup

1. **Update Supabase Credentials:**
   
   Open `src/utils/supabaseConfig.ts` and replace the placeholder values:
   
   ```typescript
   const SUPABASE_URL = 'YOUR_ACTUAL_SUPABASE_PROJECT_URL';
   const SUPABASE_ANON_KEY = 'YOUR_ACTUAL_SUPABASE_ANON_KEY';
   ```

   You can find these values in your Supabase project dashboard:
   - Go to Settings → API
   - Copy the "Project URL" and "anon/public" key

2. **Your Database Schema:**
   
   The app is now configured to work with your existing `sensor_data` table that has:
   - `co2_level`
   - `ph_level` 
   - `water_temp`
   - `env_temp`
   - `humidity`
   - `light_level`
   - `ec_level`
   - `water_level`

3. **Features Available:**
   
   - ✅ Time range selection (Day/Week/Month)
   - ✅ Sensor type selection (7 different sensors)
   - ✅ Interactive line charts
   - ✅ Data point counts
   - ✅ Error handling when Supabase is not configured
   - ✅ Loading states and retry functionality

## Database Schema Match

Your SQL schema is perfectly supported:
```sql
CREATE TABLE sensor_data (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    timestamp BIGINT NOT NULL,
    co2_level REAL,
    ph_level REAL,
    water_temp REAL,
    env_temp REAL,
    humidity REAL,
    light_level REAL,
    ec_level REAL,
    water_level BOOLEAN
);
```

The plotting screen will automatically handle null values and display appropriate messages when no data is available.

## Testing

After updating your credentials:
1. Navigate to the "Plotting" tab
2. Select different time ranges (Day/Week/Month)
3. Choose different sensors to plot
4. Verify that your historical data appears in the charts

## Notes

- The app will not crash if Supabase credentials are not configured (shows warning instead)
- Charts automatically adapt to your actual data ranges
- Time labels adjust based on selected time range
- All sensor readings support null values safely
