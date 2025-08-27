#include "data_logger.h"

// Global variables
static bool loggerEnabled = true;
static unsigned long lastLogTime = 0;
static int failedUploads = 0;
static int successfulUploads = 0;
static String lastStatus = "Ready";

void initDataLogger() {
  Serial.println("=== Data Logger Initialization ===");
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("✓ WiFi connected - Data logger ready");
    lastStatus = "Initialized";
  } else {
    Serial.println("⚠ WiFi not connected - Data logger offline");
    lastStatus = "WiFi Offline";
  }
  
  Serial.println("Data logger will upload sensor data every 5 minutes");
  Serial.println("===================================");
}

void logSensorDataToCloud() {
  if (!loggerEnabled) {
    return;
  }
  
  // Check if it's time to log (every 5 minutes)
  unsigned long currentTime = millis();
  if (currentTime - lastLogTime < LOG_INTERVAL_MS) {
    return;
  }
  
  lastLogTime = currentTime;
  
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Cannot log: WiFi not connected");
    lastStatus = "WiFi Offline";
    return;
  }
  
  // Use the current sensor data from the global sensors
  Serial.println("📊 Uploading sensor data to cloud...");
  Serial.printf("CO2: %.0f ppm, pH: %.2f, Water: %.1f°C, Air: %.1f°C\n", 
                currentSensors.co2Level, currentSensors.waterPH, 
                currentSensors.waterTemp, currentSensors.envTemp);
  
  // Attempt upload
  if (uploadSensorData(currentSensors)) {
    Serial.println("✅ Data uploaded successfully!");
    lastStatus = "Upload Success";
    successfulUploads++;
    failedUploads = 0; // Reset failed counter on success
  } else {
    failedUploads++;
    Serial.printf("❌ Upload failed (attempt %d)\n", failedUploads);
    lastStatus = "Upload Failed";
  }
}

bool uploadSensorData(const SensorData& data) {
  HTTPClient http;
  
  // Configure HTTP client for Supabase
  String url = String(SUPABASE_URL) + "/rest/v1/sensor_data";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_API_KEY);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_API_KEY));
  http.addHeader("Prefer", "return=minimal");
  
  // Create JSON payload
  String jsonPayload = createJsonFromSensorData(data);
  
  // Attempt upload with retries
  int attempts = 0;
  int httpResponseCode = -1;
  
  while (attempts < MAX_RETRY_ATTEMPTS) {
    attempts++;
    
    httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode >= 200 && httpResponseCode < 300) {
      break; // Success!
    } else {
      Serial.printf("Upload attempt %d failed with HTTP code: %d\n", attempts, httpResponseCode);
      if (attempts < MAX_RETRY_ATTEMPTS) {
        delay(1000); // Wait 1 second before retry
      }
    }
  }
  
  http.end();
  return (httpResponseCode >= 200 && httpResponseCode < 300);
}

String createJsonFromSensorData(const SensorData& data) {
  DynamicJsonDocument doc(512);
  
  doc["timestamp"] = millis() / 1000; // Current timestamp in seconds
  doc["co2_level"] = data.co2Level;
  doc["ph_level"] = data.waterPH;
  doc["water_temp"] = data.waterTemp;
  doc["env_temp"] = data.envTemp;
  doc["humidity"] = data.envHumidity;
  doc["light_level"] = data.lightLevel;
  doc["ec_level"] = data.waterEC;
  doc["water_level"] = data.waterLevel;
  
  String jsonString;
  serializeJson(doc, jsonString);
  return jsonString;
}

// Status and control functions
bool isDataLoggerEnabled() {
  return loggerEnabled;
}

void enableDataLogger(bool enable) {
  loggerEnabled = enable;
  if (enable) {
    Serial.println("📊 Data logger ENABLED");
    lastStatus = "Enabled";
  } else {
    Serial.println("📊 Data logger DISABLED");
    lastStatus = "Disabled";
  }
}

String getLoggerStatus() {
  return lastStatus;
}

int getFailedUploadCount() {
  return failedUploads;
}

int getSuccessfulUploadCount() {
  return successfulUploads;
}

// Manual logging function (for testing/immediate upload)
void triggerManualLog() {
  Serial.println("🔧 Manual log triggered");
  lastLogTime = 0; // Reset timer to force immediate log
  logSensorDataToCloud();
}
