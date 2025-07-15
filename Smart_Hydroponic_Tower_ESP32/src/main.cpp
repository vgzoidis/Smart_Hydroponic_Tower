#include <Arduino.h>
#include "display.h"
#include "sensors.h"
#include "wifi_server.h"

#define measureInterval 1000000 //1 second (1,000,000 microseconds)

// Timer variables
hw_timer_t * timer = NULL;
volatile bool readSensors = false;

// Timer interrupt service routine
void IRAM_ATTR onTimer() {
  readSensors = true;
}

void handleSensorUpdate() {
  updateSensorValues(); // Update sensor values
  drawSensorStatus(); // Redraw sensor status with updated values
  updatePreviousValues(); // Update previous values for next clearing cycle
}

void setup() {
  Serial.begin(9600);
  //Serial.println("Starting Hydroponic Tower Dashboard...");
  initDisplay(); // Initialize display and draw the UI 
  initSensors(); // Initialize sensors
  initWiFi(); // Initialize WiFi and web server

  // Initialize timer (Timer 0, divider 80, count up)
  timer = timerBegin(0, 80, true); // ESP32 clock is 80MHz, so: 80MHz/80 = 1MHz = 1μs per tick
  timerAttachInterrupt(timer, &onTimer, true); // Attach interrupt function to timer
  timerAlarmWrite(timer, measureInterval, true); // Set timer to trigger every 1 seconds
  timerAlarmEnable(timer); // Enable the timer
  
  //Serial.println("System initialized successfully!");
}

void loop() {
  if (readSensors) {
    readSensors = false; // Reset the flag
    handleSensorUpdate();
  }
  
  // Handle any additional web server tasks if needed
  handleWebServer();

  
}