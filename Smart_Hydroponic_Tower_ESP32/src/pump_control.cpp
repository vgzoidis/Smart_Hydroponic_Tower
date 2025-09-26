#include "pump_control.h"
#include "sensors.h"

// Pump control variables
bool pumpState = false;
unsigned long pumpLastChange = 0;
PumpConfig pumpConfig = {
  .onTime = 15*60000,      // 15 minutes on by default
  .offTime = 45*60000,     // 45 minutes off by default
  .autoMode = true,     // Auto mode enabled by default
};

// PWM config for ESP32
#define PUMP_PWM_CHANNEL 0
#define PUMP_PWM_FREQ 1000
#define PUMP_PWM_RES 8
#define PUMP_PWM_ON_DUTY ((int)(0.4 * 255)) // 40% duty cycle

// pH Control Parameters
#define PH_TARGET_DEFAULT 6.0        // Default target pH value
#define PH_TOLERANCE_DEFAULT 0.5     // Default acceptable range around target (±0.5)
#define PH_DEADBAND 0.2      // Dead band to prevent oscillation
#define PH_PUMP_ON_TIME 10000 // pH pump on time in milliseconds (10  seconds)
#define PH_PUMP_COOLDOWN 60000 // Cooldown between pH adjustments (60 seconds)

// pH Control Variables
bool phUpActive = false;
bool phDownActive = false;
unsigned long phUpLastActivation = 0;
unsigned long phDownLastActivation = 0;
unsigned long phUpStartTime = 0;
unsigned long phDownStartTime = 0;

// pH Configuration
PHConfig phConfig = {
  .target = PH_TARGET_DEFAULT,
  .tolerance = PH_TOLERANCE_DEFAULT,
  .autoMode = true
};

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
  // Only run auto control if auto mode is enabled
  if (!pumpConfig.autoMode) {
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
  pumpConfig.autoMode = false;
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
    if (pumpConfig.autoMode) {
      pumpLastChange = millis();
    }
  }
}

void enableAutoMode(bool enable) {
  pumpConfig.autoMode = enable;
  if (enable) {
    pumpConfig.autoMode = true;
    pumpLastChange = millis(); // Reset cycle timing
    Serial.println("Auto mode enabled");
  } else {
    Serial.println("Auto mode disabled");
  }
}

PumpConfig getPumpConfig() {
  return pumpConfig;
}

unsigned long getPumpCycleTimeRemaining() {
  if (!pumpConfig.autoMode) {
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
  if (!pumpConfig.autoMode) {
    status += " (Manual)";
    return status;
  }

  // auto-mode with time remaining
  unsigned long remMs = getPumpCycleTimeRemaining();
  if (remMs > 0) {
    unsigned long totalSecs = remMs / 1000;
    unsigned long mins      = totalSecs / 60;
    unsigned long secs      = totalSecs % 60;
    status += " (" + String(mins) + "m " + String(secs)
           + "s <br>until turning " + (pumpState ? "off)" : "on)");
  }
  return status;
}

// pH Control Functions
void updatePHControl() {
  // Only run auto control if auto mode is enabled
  if (!phConfig.autoMode) {
    return;
  }
  
  unsigned long currentTime = millis();
  
  // Turn off pumps automatically after their on-time in auto mode
  if (phUpActive && (currentTime - phUpStartTime >= PH_PUMP_ON_TIME)) {
    digitalWrite(phUpPumpPin, LOW);
    phUpActive = false;
    phUpLastActivation = currentTime;
    Serial.println("pH UP pump turned OFF (auto)");
  }
  
  if (phDownActive && (currentTime - phDownStartTime >= PH_PUMP_ON_TIME)) {
    digitalWrite(phDownPumpPin, LOW);
    phDownActive = false;
    phDownLastActivation = currentTime;
    Serial.println("pH DOWN pump turned OFF (auto)");
  }
  
  // Get current pH reading
  extern SensorData currentSensors;
  float currentPH = currentSensors.waterPH;
  
  // Skip pH control if reading is invalid
  if (currentPH <= 0 || currentPH > 14) {
    return;
  }
  
  // Calculate pH difference from target
  float phDifference = currentPH - phConfig.target;
  
  // Check if pH is outside acceptable range and cooldown has passed
  if (abs(phDifference) > phConfig.tolerance) {
    
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
  String status;
  
  extern SensorData currentSensors;
  float currentPH = currentSensors.waterPH;
  
  // Determine pH condition
  float phDifference = currentPH - phConfig.target;
  String phCondition;
  
  if (abs(phDifference) <= phConfig.tolerance) {
    phCondition = "pH In Range";
  } else if (phDifference > phConfig.tolerance) {
    phCondition = "pH Too High";
  } else {
    phCondition = "pH Too Low";
  }
  
  // Build status string: "pH Condition: current pH (Mode details)"
  status = phCondition + ": " + String(currentPH, 2) + "<br>(";
  
  if (!phConfig.autoMode) {
    // Manual mode - show what's currently active
    if (phUpActive) {
      status += "Manual - pH Up";
    } else if (phDownActive) {
      status += "Manual - pH Down";
    } else {
      status += "Manual - Off";
    }
  } else {
    // Auto mode
    if (phUpActive) {
      // pH UP pump running in auto mode
      unsigned long timeRemaining = PH_PUMP_ON_TIME - (millis() - phUpStartTime);
      if (timeRemaining > 0 && timeRemaining <= PH_PUMP_ON_TIME) {
        status += "Auto - pH Up " + String(timeRemaining/1000) + "s";
      } else {
        status += "Auto - pH Up";
      }
    } else if (phDownActive) {
      // pH DOWN pump running in auto mode
      unsigned long timeRemaining = PH_PUMP_ON_TIME - (millis() - phDownStartTime);
      if (timeRemaining > 0 && timeRemaining <= PH_PUMP_ON_TIME) {
        status += "Auto - pH Down " + String(timeRemaining/1000) + "s";
      } else {
        status += "Auto - pH Down";
      }
    } else {
      // Auto mode but no pumps running - check if in cooldown
      unsigned long currentTime = millis();
      unsigned long upCooldownRemaining = 0;
      unsigned long downCooldownRemaining = 0;
      
      if (currentTime - phUpLastActivation < PH_PUMP_COOLDOWN) {
        upCooldownRemaining = PH_PUMP_COOLDOWN - (currentTime - phUpLastActivation);
      }
      if (currentTime - phDownLastActivation < PH_PUMP_COOLDOWN) {
        downCooldownRemaining = PH_PUMP_COOLDOWN - (currentTime - phDownLastActivation);
      }
      
      if (upCooldownRemaining > 0 || downCooldownRemaining > 0) {
        unsigned long maxCooldown = max(upCooldownRemaining, downCooldownRemaining);
        status += "Auto - Cooldown " + String(maxCooldown/1000) + "s";
      } else {
        status += "Auto";
      }
    }
  }
  
  status += ")";
  return status;
}

// Toggle pH pump functions (manual mode)
void togglePHUp() {
  phConfig.autoMode = false;  // Switch to manual mode
  
  if (phUpActive) {
    // Turn OFF pH UP pump
    digitalWrite(phUpPumpPin, LOW);
    phUpActive = false;
    phUpLastActivation = millis();
    Serial.println("pH UP pump turned OFF (manual)");
  } else {
    // Turn ON pH UP pump (but turn off pH DOWN if active)
    if (phDownActive) {
      digitalWrite(phDownPumpPin, LOW);
      phDownActive = false;
      Serial.println("pH DOWN pump turned OFF (switching to pH UP)");
    }
    digitalWrite(phUpPumpPin, HIGH);
    phUpActive = true;
    phUpStartTime = millis();
    Serial.println("pH UP pump turned ON (manual)");
  }
}

void togglePHDown() {
  phConfig.autoMode = false;  // Switch to manual mode
  
  if (phDownActive) {
    // Turn OFF pH DOWN pump
    digitalWrite(phDownPumpPin, LOW);
    phDownActive = false;
    phDownLastActivation = millis();
    Serial.println("pH DOWN pump turned OFF (manual)");
  } else {
    // Turn ON pH DOWN pump (but turn off pH UP if active)
    if (phUpActive) {
      digitalWrite(phUpPumpPin, LOW);
      phUpActive = false;
      Serial.println("pH UP pump turned OFF (switching to pH DOWN)");
    }
    digitalWrite(phDownPumpPin, HIGH);
    phDownActive = true;
    phDownStartTime = millis();
    Serial.println("pH DOWN pump turned ON (manual)");
  }
}

void stopPHPumps() {
  phConfig.autoMode = false;  // Switch to manual mode
  
  if (phUpActive) {
    digitalWrite(phUpPumpPin, LOW);
    phUpActive = false;
    phUpLastActivation = millis();
    Serial.println("pH UP pump stopped manually");
  }
  
  if (phDownActive) {
    digitalWrite(phDownPumpPin, LOW);
    phDownActive = false;
    phDownLastActivation = millis();
    Serial.println("pH DOWN pump stopped manually");
  }
}

// pH Configuration functions (similar to pump control)
void enablePHAutoMode(bool enable) {
  phConfig.autoMode = enable;
  if (enable) {
    Serial.println("pH Auto mode enabled");
    
    // When switching to auto mode, stop any manual pumps and immediately evaluate pH
    if (phUpActive || phDownActive) {
      // Turn off any manually running pumps
      if (phUpActive) {
        digitalWrite(phUpPumpPin, LOW);
        phUpActive = false;
        phUpLastActivation = millis();
        Serial.println("pH UP pump stopped (switching to auto)");
      }
      if (phDownActive) {
        digitalWrite(phDownPumpPin, LOW);
        phDownActive = false;
        phDownLastActivation = millis();
        Serial.println("pH DOWN pump stopped (switching to auto)");
      }
      
      // Immediately evaluate current pH and take action if needed
      extern SensorData currentSensors;
      float currentPH = currentSensors.waterPH;
      
      if (currentPH > 0 && currentPH <= 14) {
        float phDifference = currentPH - phConfig.target;
        unsigned long currentTime = millis();
        
        // Only start pumps if not in cooldown period
        if (abs(phDifference) > phConfig.tolerance) {
          if (phDifference > PH_DEADBAND && (currentTime - phDownLastActivation >= PH_PUMP_COOLDOWN)) {
            // pH too high - activate pH DOWN pump immediately
            digitalWrite(phDownPumpPin, HIGH);
            phDownActive = true;
            phDownStartTime = currentTime;
            Serial.printf("Auto mode: pH too high (%.2f) - activating pH DOWN pump\n", currentPH);
          } else if (phDifference < -PH_DEADBAND && (currentTime - phUpLastActivation >= PH_PUMP_COOLDOWN)) {
            // pH too low - activate pH UP pump immediately
            digitalWrite(phUpPumpPin, HIGH);
            phUpActive = true;
            phUpStartTime = currentTime;
            Serial.printf("Auto mode: pH too low (%.2f) - activating pH UP pump\n", currentPH);
          }
        }
      }
    }
  } else {
    Serial.println("pH Auto mode disabled (manual mode)");
    
    // When switching to manual mode, stop any auto-controlled pumps
    if (phUpActive) {
      digitalWrite(phUpPumpPin, LOW);
      phUpActive = false;
      phUpLastActivation = millis();
    }
    if (phDownActive) {
      digitalWrite(phDownPumpPin, LOW);
      phDownActive = false;
      phDownLastActivation = millis();
    }
  }
}

void setPHTarget(float target, float tolerance) {
  phConfig.target = target;
  phConfig.tolerance = tolerance;
  Serial.printf("pH control updated - Target: %.1f, Tolerance: ±%.1f\n", target, tolerance);
}

PHConfig getPHConfig() {
  return phConfig;
}

// Get current pH pump states
bool getPHUpState() {
  return phUpActive;
}

bool getPHDownState() {
  return phDownActive;
}