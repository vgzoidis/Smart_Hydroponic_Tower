#include <Arduino.h>
#include "display.h"
#include "sensors.h"

#define measureInterval 1000000 //1 second

// Timer variables
hw_timer_t * timer = NULL;
volatile bool readSensors = false;

// Timer interrupt service routine
void IRAM_ATTR onTimer() {
  readSensors = true;
}

void setup() {
  Serial.begin(9600);

  Serial.println("Starting Hydroponic Tower Dashboard...");
  
  // Initialize display
  initDisplay();
  
  // Initialize sensors
  initSensors();
  
  // Draw the hydroponic tower once in setup
  drawHydroponicTower();
  
  // Draw initial sensor status
  drawSensorStatus();

  // Initialize timer (Timer 0, divider 80, count up)
  // ESP32 clock is 80MHz, so with divider 80: 80MHz/80 = 1MHz = 1μs per tick
  timer = timerBegin(0, 80, true);
  
  // Attach interrupt function to timer
  timerAttachInterrupt(timer, &onTimer, true);
  
  // Set timer to trigger every 1 seconds (1,000,000 microseconds)
  timerAlarmWrite(timer, measureInterval, true);
  
  // Enable the timer
  timerAlarmEnable(timer);
  
  Serial.println("System initialized successfully!");
}

void loop() {
  if (readSensors) {
    readSensors = false; // Reset the flag
    
  // Update sensor values (simulate real sensor readings)
  updateSensorValues();
  
  // Redraw sensor status with updated values
  drawSensorStatus();
  
  // Update previous values for next clearing cycle
  updatePreviousValues();
  }
}