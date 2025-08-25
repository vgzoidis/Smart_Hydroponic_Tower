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

// pH Control Parameters
#define PH_TARGET 6.0        // Target pH value
#define PH_TOLERANCE 0.5     // Acceptable range around target (±0.5)
#define PH_DEADBAND 0.2      // Dead band to prevent oscillation
#define PH_PUMP_ON_TIME 5000 // pH pump on time in milliseconds (5 seconds)
#define PH_PUMP_COOLDOWN 60000 // Cooldown between pH adjustments (60 seconds)

// pH Control Variables
bool phUpActive = false;
bool phDownActive = false;
bool phUpManualMode = false;    // Track if pH UP is in manual mode
bool phDownManualMode = false;  // Track if pH DOWN is in manual mode
unsigned long phUpLastActivation = 0;
unsigned long phDownLastActivation = 0;
unsigned long phUpStartTime = 0;
unsigned long phDownStartTime = 0;

void initPump() {
  ledcSetup(PUMP_PWM_CHANNEL, PUMP_PWM_FREQ, PUMP_PWM_RES);
  ledcAttachPin(waterPumpPin, PUMP_PWM_CHANNEL);
  ledcWrite(PUMP_PWM_CHANNEL, 0); // Start with pump off
  pumpState = false;
  pumpLastChange = millis();
  Serial.println("Pump initialized on pin " + String(waterPumpPin));
  Serial.printf("Auto cycle: %ds ON, %ds OFF\n", pumpConfig.onTime/1000, pumpConfig.offTime/1000);

  pinMode(phUpPumpPin, OUTPUT); // Initialize phUpPumpPin as output
  pinMode(phDownPumpPin, OUTPUT); // Initialize phDownPumpPin as output
  digitalWrite(phUpPumpPin, LOW);
  digitalWrite(phDownPumpPin, LOW);
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

// pH Control Functions
void updatePHControl() {
  unsigned long currentTime = millis();
  
  // Only turn off pumps automatically if they're not in manual mode
  if (phUpActive && !phUpManualMode && (currentTime - phUpStartTime >= PH_PUMP_ON_TIME)) {
    digitalWrite(phUpPumpPin, LOW);
    phUpActive = false;
    phUpLastActivation = currentTime;
    Serial.println("pH UP pump turned OFF (auto)");
  }
  
  if (phDownActive && !phDownManualMode && (currentTime - phDownStartTime >= PH_PUMP_ON_TIME)) {
    digitalWrite(phDownPumpPin, LOW);
    phDownActive = false;
    phDownLastActivation = currentTime;
    Serial.println("pH DOWN pump turned OFF (auto)");
  }
  
  // Skip automatic pH control if either pump is in manual mode
  if (phUpManualMode || phDownManualMode) {
    return;
  }
  
  // Get current pH reading
  extern SensorData currentSensors;
  float currentPH = currentSensors.waterPH;
  
  // Skip pH control if reading is invalid
  if (currentPH <= 0 || currentPH > 14) {
    return;
  }
  
  // Calculate pH difference from target
  float phDifference = currentPH - PH_TARGET;
  
  // Check if pH is outside acceptable range and cooldown has passed
  if (abs(phDifference) > PH_TOLERANCE) {
    
    // pH is too high - need to lower it
    if (phDifference > PH_DEADBAND && !phDownActive && !phUpActive) {
      if (currentTime - phDownLastActivation >= PH_PUMP_COOLDOWN) {
        digitalWrite(phDownPumpPin, HIGH);
        phDownActive = true;
        phDownStartTime = currentTime;
        Serial.printf("pH too high (%.2f) - activating pH DOWN pump\n", currentPH);
      }
    }
    // pH is too low - need to raise it  
    else if (phDifference < -PH_DEADBAND && !phUpActive && !phDownActive) {
      if (currentTime - phUpLastActivation >= PH_PUMP_COOLDOWN) {
        digitalWrite(phUpPumpPin, HIGH);
        phUpActive = true;
        phUpStartTime = currentTime;
        Serial.printf("pH too low (%.2f) - activating pH UP pump\n", currentPH);
      }
    }
  }
}

// Get pH control status
String getPHControlStatus() {
  String status = "pH Control: ";
  
  extern SensorData currentSensors;
  float currentPH = currentSensors.waterPH;
  
  status += "Current=" + String(currentPH, 2) + " ";
  status += "Target=" + String(PH_TARGET, 1) + " ";
  
  if (phUpActive) {
    status += phUpManualMode ? "[pH UP MANUAL]" : "[pH UP AUTO]";
  } else if (phDownActive) {
    status += phDownManualMode ? "[pH DOWN MANUAL]" : "[pH DOWN AUTO]"; 
  } else {
    float phDifference = currentPH - PH_TARGET;
    if (abs(phDifference) <= PH_TOLERANCE) {
      status += "[IN RANGE]";
    } else {
      status += "[WAITING]";
    }
  }
  
  return status;
}

// Manual pH control functions - permanent activation until manually stopped
void activatePHUp() {
  if (!phDownActive) {  // Prevent simultaneous operation
    digitalWrite(phUpPumpPin, HIGH);
    phUpActive = true;
    phUpManualMode = true;  // Set manual mode
    phUpStartTime = millis();
    Serial.println("Manual pH UP pump activated (permanent until stopped)");
  } else {
    Serial.println("Cannot activate pH UP - pH DOWN pump is active");
  }
}

void activatePHDown() {
  if (!phUpActive) {  // Prevent simultaneous operation
    digitalWrite(phDownPumpPin, HIGH);
    phDownActive = true;
    phDownManualMode = true;  // Set manual mode
    phDownStartTime = millis();
    Serial.println("Manual pH DOWN pump activated (permanent until stopped)");
  } else {
    Serial.println("Cannot activate pH DOWN - pH UP pump is active");
  }
}

void stopPHPumps() {
  if (phUpActive) {
    digitalWrite(phUpPumpPin, LOW);
    phUpActive = false;
    phUpManualMode = false;  // Clear manual mode
    phUpLastActivation = millis();
    Serial.println("pH UP pump stopped manually");
  }
  
  if (phDownActive) {
    digitalWrite(phDownPumpPin, LOW);
    phDownActive = false;
    phDownManualMode = false;  // Clear manual mode
    phDownLastActivation = millis();
    Serial.println("pH DOWN pump stopped manually");
  }
}