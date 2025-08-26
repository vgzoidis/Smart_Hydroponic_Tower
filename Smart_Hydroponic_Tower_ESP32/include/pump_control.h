#ifndef PUMP_CONTROL_H
#define PUMP_CONTROL_H

#include <Arduino.h>

// Pump configuration
#define waterPumpPin 23  // GPIO pin for water pump
#define phDownPumpPin 19   // GPIO pin for pH down pump
#define phUpPumpPin 18    // GPIO pin for pH up pump

// Pump control structure
struct PumpConfig {
  unsigned long onTime;     // Time pump stays on (milliseconds)
  unsigned long offTime;    // Time pump stays off (milliseconds)
  bool autoMode;            // Auto cycling mode enabled/disabled
  bool manualOverride;      // Manual override active
};

// pH Configuration structure
struct PHConfig {
  float target;           // Target pH value
  float tolerance;        // Acceptable range around target
  bool autoMode;          // Auto pH control enabled/disabled (manual when false)
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

// pH Control Functions
void updatePHControl();
String getPHControlStatus();
void togglePHUp();               // Toggle pH UP pump (manual mode)
void togglePHDown();             // Toggle pH DOWN pump (manual mode)
void stopPHPumps();              // Stop all pH pumps (manual mode)
void enablePHAutoMode(bool enable);  // Enable/disable pH auto mode
void setPHTarget(float target, float tolerance);  // Set pH target and tolerance
PHConfig getPHConfig();          // Get pH configuration
bool getPHUpState();            // Get pH UP pump state
bool getPHDownState();          // Get pH DOWN pump state

#endif