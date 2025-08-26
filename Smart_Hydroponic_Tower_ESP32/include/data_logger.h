#ifndef DATA_LOGGER_H
#define DATA_LOGGER_H

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "sensors.h"

// Supabase Configuration (replace with your actual values)
#define SUPABASE_URL "https://jnvbsbphxvypcuorolen.supabase.co"
#define SUPABASE_API_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpudmJzYnBoeHZ5cGN1b3JvbGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMDY4MjEsImV4cCI6MjA3MTc4MjgyMX0.S0MrRcN_fNfTdIeIRPO6uqB7QfpwtY4vIchLpr8tTH0"

// Simple data logging configuration
#define LOG_INTERVAL_MS 300000  // Log every 5 minutes
#define MAX_RETRY_ATTEMPTS 3    // Max retries for failed uploads

// Basic function declarations
void initDataLogger();
void logSensorDataToCloud();
void triggerManualLog();
bool uploadSensorData(const SensorData& data);
String createJsonFromSensorData(const SensorData& data);

// Status functions
bool isDataLoggerEnabled();
void enableDataLogger(bool enable);
String getLoggerStatus();
int getFailedUploadCount();

#endif
