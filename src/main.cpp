#include <Arduino.h>
#include "display.h"
#include "sensors.h"

#define measureInterval 1000 //Measure interval, 1000 milliseconds

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
  
  delay(2000);  // Update every 5 seconds
}