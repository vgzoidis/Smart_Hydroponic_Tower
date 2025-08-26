-- Simple Supabase Schema for Smart Hydroponic Tower
-- Copy and paste this into your Supabase SQL Editor

-- Create the sensor data table
CREATE TABLE IF NOT EXISTS sensor_data (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    timestamp BIGINT NOT NULL,
    
    -- Sensor readings
    co2_level REAL,
    ph_level REAL,
    water_temp REAL,
    env_temp REAL,
    humidity REAL,
    light_level REAL,
    ec_level REAL,
    water_level BOOLEAN
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sensor_data_timestamp ON sensor_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_sensor_data_created_at ON sensor_data(created_at);

-- Test query (run this to verify data is coming in)
-- SELECT 
--     created_at,
--     co2_level,
--     ph_level,
--     water_temp,
--     env_temp,
--     humidity,
--     light_level
-- FROM sensor_data 
-- ORDER BY created_at DESC 
-- LIMIT 10;
