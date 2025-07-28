#include <Arduino.h>
#include "display.h"
#include "sensors.h"
#include "wifi_server.h"
#include "pump_control.h"

#define measureInterval 1000000 //1 second (1,000,000 microseconds)

// Timer variables
hw_timer_t * timer = NULL;
volatile bool readSensors = false;

// Timer interrupt service routine
void IRAM_ATTR onTimer() {
  readSensors = true;
}

void handleSystemUpdate() {
  updateSensorValues(); // Update sensor values
  updatePumpControl();  // Update pump control
  drawSensorStatus(); // Redraw sensor status with updated values
  updatePreviousValues(); // Update previous values for next clearing cycle
}

void setup() {
  Serial.begin(115200);
  //Serial.println("Starting Hydroponic Tower Dashboard...");
  initDisplay(); // Initialize display and draw the UI 
  initSensors(); // Initialize sensors
  initPump();    // Initialize pump control
  //initWiFi(); // Initialize WiFi and web server

  // Initialize timer (Timer 0, divider 80, count up)
  timer = timerBegin(0, 80, true); // ESP32 clock is 80MHz, so: 80MHz/80 = 1MHz = 1μs per tick
  timerAttachInterrupt(timer, &onTimer, true); // Attach interrupt function to timer
  timerAlarmWrite(timer, measureInterval, true); // Set timer to trigger every 1 seconds
  timerAlarmEnable(timer); // Enable the timer
  pinMode(18, OUTPUT); // Set GPIO 18 as output for LED indication
  
  
  //Serial.println("System initialized successfully!");
  ledcSetup(1, 1000, 8);
  ledcAttachPin(19, 1);
}

void loop() {
  if (readSensors) {
    readSensors = false; // Reset the flag
    handleSystemUpdate();
  }
  
  // Handle any additional web server tasks if needed
  handleWebServer();
  ledcWrite(1, 100);
  delay(2000);
  ledcWrite(1, 0);
  delay(2000);
  
}