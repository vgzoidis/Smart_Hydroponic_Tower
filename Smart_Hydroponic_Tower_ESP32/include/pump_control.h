#ifndef PUMP_CONTROL_H
#define PUMP_CONTROL_H

#include <Arduino.h>

// Pump configuration
#define waterPumpPin 19  // GPIO pin for water pump

// Pump control structure
struct PumpConfig {
  unsigned long onTime;     // Time pump stays on (milliseconds)
  unsigned long offTime;    // Time pump stays off (milliseconds)
  bool autoMode;            // Auto cycling mode enabled/disabled
  bool manualOverride;      // Manual override active
};

// Function declarations
void initPump();
void updatePumpControl();
void setPumpState(bool state);
void togglePump();
bool getPumpState();
void setPumpTiming(int onSeconds, int offSeconds);
void enableAutoMode(bool enable);
void setManualOverride(bool override);
PumpConfig getPumpConfig();
unsigned long getPumpCycleTimeRemaining();
String getPumpStatusString();

#endif