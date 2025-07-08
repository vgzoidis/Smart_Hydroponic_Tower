#include "sensors.h"

// Global sensor data
SensorData currentSensors = {
  .waterLevel = false,
  .co2Level = 450.0,
  .waterPH = 7.3,
  .waterTemp = 22.5,
  .envTemp = 25.0,
  .envHumidity = 75.0,
  .lightLevel = 850.0,
  .pumpStatus = true
};

// Previous values for clearing old text
PreviousValues previousSensors = {
  .waterLevel = false,
  .co2Level = 450.0,
  .waterPH = 7.3,
  .waterTemp = 22.5,
  .envTemp = 25.0,
  .envHumidity = 75.0,
  .lightLevel = 850.0,
  .pumpStatus = true
};

void initSensors() {
  // Initialize any sensor hardware here
  // For now, we're using mock values
  Serial.println("Sensors initialized");
}

void updateSensorValues() {
  // Simulate real sensor readings - replace with actual sensor code
  currentSensors.waterLevel = false;    // Mock boolean value
  currentSensors.co2Level = 450.0;
  currentSensors.waterPH = 6.2;
  currentSensors.waterTemp = 22.5;
  currentSensors.envTemp = 24.0;
  currentSensors.envHumidity = 65.0;
  currentSensors.lightLevel = 850.0;
  currentSensors.pumpStatus = false;    // Mock pump status
  
  // TODO: Replace above with actual sensor readings:
  // currentSensors.waterLevel = readWaterLevelSensor();
  // currentSensors.co2Level = readCO2Sensor();
  // currentSensors.waterPH = readPHSensor();
  // currentSensors.waterTemp = readWaterTempSensor();
  // currentSensors.envTemp = readEnvTempSensor();
  // currentSensors.envHumidity = readHumiditySensor();
  // currentSensors.lightLevel = readLightSensor();
  // currentSensors.pumpStatus = getPumpStatus();
}

void updatePreviousValues() {
  previousSensors.waterLevel = currentSensors.waterLevel;
  previousSensors.co2Level = currentSensors.co2Level;
  previousSensors.waterPH = currentSensors.waterPH;
  previousSensors.waterTemp = currentSensors.waterTemp;
  previousSensors.envTemp = currentSensors.envTemp;
  previousSensors.envHumidity = currentSensors.envHumidity;
  previousSensors.lightLevel = currentSensors.lightLevel;
  previousSensors.pumpStatus = currentSensors.pumpStatus;
}
