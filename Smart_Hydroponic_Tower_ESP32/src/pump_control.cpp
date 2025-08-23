#include "pump_control.h"
#include "sensors.h"

// Pump control variables
bool pumpState = false;
unsigned long pumpLastChange = 0;
PumpConfig pumpConfig = {
  .onTime = 15*60000,      // 15 minutes on by default
  .offTime = 45*60000,     // 45 minutes off by default
  .autoMode = true,     // Auto mode enabled by default
  .manualOverride = false
};

// PWM config for ESP32
#define PUMP_PWM_CHANNEL 0
#define PUMP_PWM_FREQ 1000
#define PUMP_PWM_RES 8
#define PUMP_PWM_ON_DUTY ((int)(0.4 * 255)) // 40% duty cycle

void initPump() {
  ledcSetup(PUMP_PWM_CHANNEL, PUMP_PWM_FREQ, PUMP_PWM_RES);
  ledcAttachPin(waterPumpPin, PUMP_PWM_CHANNEL);
  ledcWrite(PUMP_PWM_CHANNEL, 0); // Start with pump off
  pumpState = false;
  pumpLastChange = millis();
  Serial.println("Pump initialized on pin " + String(waterPumpPin));
  Serial.printf("Auto cycle: %ds ON, %ds OFF\n", pumpConfig.onTime/1000, pumpConfig.offTime/1000);

  pinMode(18, OUTPUT); // Initialize phUpPumpPin as output
  pinMode(19, OUTPUT); // Initialize phDownPumpPin as output
  digitalWrite(18,1);
  digitalWrite(19,1);
}

void updatePumpControl() {
  // Only run auto control if auto mode is enabled and no manual override
  if (!pumpConfig.autoMode || pumpConfig.manualOverride) {
    return;
  }
  
  unsigned long currentTime = millis();
  unsigned long elapsedTime = currentTime - pumpLastChange;
  
  if (pumpState) {
    // Pump is currently ON - check if it should turn OFF
    if (elapsedTime >= pumpConfig.onTime) {
      pumpState = false;
      ledcWrite(PUMP_PWM_CHANNEL, 0);
      pumpLastChange = currentTime;
      Serial.println("Auto: Pump turned OFF");
    }
  } else {
    // Pump is currently OFF - check if it should turn ON
    if (elapsedTime >= pumpConfig.offTime) {
      pumpState = true;
      ledcWrite(PUMP_PWM_CHANNEL, PUMP_PWM_ON_DUTY);
      pumpLastChange = currentTime;
      Serial.println("Auto: Pump turned ON (40%% speed)");
    }
  }
  
  // Update the current sensors structure with pump status
  currentSensors.pumpStatus = pumpState;
}

void setPumpState(bool state) {
  pumpState = state;
  ledcWrite(PUMP_PWM_CHANNEL, state ? PUMP_PWM_ON_DUTY : 0);
  pumpLastChange = millis();
  currentSensors.pumpStatus = state;
  Serial.println(state ? "Manual: Pump turned ON (40%% speed)" : "Manual: Pump turned OFF");
  // Enable manual override when manually controlling
  pumpConfig.manualOverride = true;
}

void togglePump() {
  setPumpState(!pumpState);
}

bool getPumpState() {
  return pumpState;
}

void setPumpTiming(int onMinutes, int offMinutes) {
  if (onMinutes > 0 && offMinutes > 0) {
    pumpConfig.onTime = onMinutes * 60000;
    pumpConfig.offTime = offMinutes * 60000;
    Serial.printf("Pump timing updated: ON=%dmin, OFF=%dmin\n", onMinutes, offMinutes);
    
    // Reset cycle if in auto mode
    if (pumpConfig.autoMode && !pumpConfig.manualOverride) {
      pumpLastChange = millis();
    }
  }
}

void enableAutoMode(bool enable) {
  pumpConfig.autoMode = enable;
  if (enable) {
    pumpConfig.manualOverride = false;
    pumpLastChange = millis(); // Reset cycle timing
    Serial.println("Auto mode enabled");
  } else {
    Serial.println("Auto mode disabled");
  }
}

void setManualOverride(bool override) {
  pumpConfig.manualOverride = override;
  if (!override && pumpConfig.autoMode) {
    pumpLastChange = millis(); // Reset cycle timing when returning to auto
    Serial.println("Manual override disabled - returning to auto mode");
  } else if (override) {
    Serial.println("Manual override enabled");
  }
}

PumpConfig getPumpConfig() {
  return pumpConfig;
}

unsigned long getPumpCycleTimeRemaining() {
  if (!pumpConfig.autoMode || pumpConfig.manualOverride) {
    return 0;
  }
  
  unsigned long currentTime = millis();
  unsigned long elapsedTime = currentTime - pumpLastChange;
  
  if (pumpState) {
    // Pump is ON, return time until it turns OFF
    return (elapsedTime >= pumpConfig.onTime) ? 0 : (pumpConfig.onTime - elapsedTime);
  } else {
    // Pump is OFF, return time until it turns ON
    return (elapsedTime >= pumpConfig.offTime) ? 0 : (pumpConfig.offTime - elapsedTime);
  }
}

String getPumpStatusString() {
  // prefix: ON or OFF
  String status = pumpState ? "ON" : "OFF";

  // if we’re not in pure auto mode, just show manual label
  if (!pumpConfig.autoMode || pumpConfig.manualOverride) {
    if (pumpConfig.manualOverride) status += " (Manual)";
    return status;
  }

  // auto-mode with time remaining
  unsigned long remMs = getPumpCycleTimeRemaining();
  if (remMs > 0) {
    unsigned long totalSecs = remMs / 1000;
    unsigned long mins      = totalSecs / 60;
    unsigned long secs      = totalSecs % 60;
    status += " (" + String(mins) + "m " + String(secs)
           + "s until turning " + (pumpState ? "off)" : "on)");
  }
  return status;
}