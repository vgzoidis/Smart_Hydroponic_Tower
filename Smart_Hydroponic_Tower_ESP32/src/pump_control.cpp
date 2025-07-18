#include "pump_control.h"
#include "sensors.h"

// Pump control variables
bool pumpState = false;
unsigned long pumpLastChange = 0;
PumpConfig pumpConfig = {
  .onTime = 1*60000,      // 1 minute on by default
  .offTime = 1*60000,     // 1 minute off by default
  .autoMode = true,     // Auto mode enabled by default
  .manualOverride = false
};

void initPump() {
  pinMode(waterPumpPin, OUTPUT);
  digitalWrite(waterPumpPin, LOW); // Start with pump off
  pumpState = false;
  pumpLastChange = millis();
  Serial.println("Pump initialized on pin " + String(waterPumpPin));
  Serial.printf("Auto cycle: %ds ON, %ds OFF\n", pumpConfig.onTime/1000, pumpConfig.offTime/1000);
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
      digitalWrite(waterPumpPin, LOW);
      pumpLastChange = currentTime;
      Serial.println("Auto: Pump turned OFF");
    }
  } else {
    // Pump is currently OFF - check if it should turn ON
    if (elapsedTime >= pumpConfig.offTime) {
      pumpState = true;
      digitalWrite(waterPumpPin, HIGH);
      pumpLastChange = currentTime;
      Serial.println("Auto: Pump turned ON");
    }
  }
  
  // Update the current sensors structure with pump status
  currentSensors.pumpStatus = pumpState;
}

void setPumpState(bool state) {
  pumpState = state;
  digitalWrite(waterPumpPin, state ? HIGH : LOW);
  pumpLastChange = millis();
  currentSensors.pumpStatus = state;
  
  Serial.println(state ? "Manual: Pump turned ON" : "Manual: Pump turned OFF");
  
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
  String status = pumpState ? "Running" : "Stopped";
  
  if (pumpConfig.manualOverride) {
    status += " (Manual)";
  } else if (pumpConfig.autoMode) {
    unsigned long remaining = getPumpCycleTimeRemaining();
    if (remaining > 0) {
      status += " (Auto - " + String(remaining / 1000) + "s remaining)";
    } else {
      status += " (Auto)";
    }
  } else {
    status += " (Manual Mode)";
  }
  
  return status;
}