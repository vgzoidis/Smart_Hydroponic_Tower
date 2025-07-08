#include <Arduino.h>
#include "display.h"
#include "sensors.h"

void setup() {
  Serial.begin(115200);
  Serial.println("Starting Hydroponic Tower Dashboard...");
  
  // Initialize display
  initDisplay();
  
  // Initialize sensors
  initSensors();
  
  // Draw the hydroponic tower once in setup
  drawHydroponicTower();
  
  // Draw initial sensor status
  drawSensorStatus();
  
  Serial.println("System initialized successfully!");
}

void loop() {
  // Update sensor values (simulate real sensor readings)
  updateSensorValues();
  
  // Redraw sensor status with updated values
  drawSensorStatus();
  
  // Update previous values for next clearing cycle
  updatePreviousValues();
  
  delay(5000);  // Update every 5 seconds
}