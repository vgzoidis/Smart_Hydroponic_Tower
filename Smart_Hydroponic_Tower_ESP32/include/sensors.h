#ifndef SENSORS_H
#define SENSORS_H

#include <Arduino.h>

// Sensor data structure
struct SensorData {
  bool waterLevel;
  float co2Level;
  float waterPH;
  float waterTemp;
  float envTemp;
  float envHumidity;
  float lightLevel;
  bool pumpStatus;
};

// Previous values for clearing old text
struct PreviousValues {
  bool waterLevel;
  float co2Level;
  float waterPH;
  float waterTemp;
  float envTemp;
  float envHumidity;
  float lightLevel;
  bool pumpStatus;
};

// External variables
extern SensorData currentSensors;
extern PreviousValues previousSensors;

// Function declarations
void initSensors();
void updateSensorValues();
void updatePreviousValues();

#endif
