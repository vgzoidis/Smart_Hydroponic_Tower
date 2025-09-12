# Smart Hydroponic Tower - ESP32 Control System

[![PlatformIO CI](https://img.shields.io/badge/PlatformIO-IoT%20Development-blue)](https://platformio.org/)
[![ESP32](https://img.shields.io/badge/Hardware-ESP32-red)](https://www.espressif.com/en/products/socs/esp32)
[![Arduino Framework](https://img.shields.io/badge/Framework-Arduino-00979D)](https://www.arduino.cc/)

## 🌱 Project Overview

The Smart Hydroponic Tower is an automated hydroponic growing system designed to monitor and control the optimal growing conditions for plants. This ESP32-based IoT system continuously monitors environmental and water parameters, automatically controls pumps for nutrient circulation and pH adjustment, and provides both local display and remote web-based monitoring capabilities.

**What problems does it solve?**
- **Automated Monitoring**: Eliminates the need for manual checking of pH, EC, temperature, and other critical parameters
- **Remote Access**: Allows monitoring and control from anywhere via web interface
- **Data Logging**: Stores historical data for analysis and optimization
- **Automated Control**: Maintains optimal growing conditions through automated pump control
- **Alert System**: Visual indicators for parameter ranges (optimal, warning, critical)

**Key Benefits:**
- Reduces manual labor and monitoring time
- Improves plant growth through consistent optimal conditions
- Provides data-driven insights for growing optimization
- Enables remote monitoring and control
- Scales from hobby to commercial applications

## ✨ Features

### 🔍 Comprehensive Sensor Monitoring
- **Water Temperature**: DS18B20 sensor with ±0.5°C accuracy
- **pH Level**: Analog pH sensor with moving average filtering for stability
- **EC (Electrical Conductivity)**: Measures nutrient concentration in water
- **Water Level**: Digital sensor to prevent pump dry-running
- **Environmental Temperature & Humidity**: DHT22 sensor for ambient conditions
- **Light Level**: BH1750 digital light sensor for photosynthetic monitoring
- **CO2 Level**: MH-Z19 NDIR sensor for atmospheric CO2 measurement

### 🖥️ Local Display Interface
- **2.4" TFT Display**: Real-time sensor readings with color-coded status indicators
- **Visual Tower Representation**: Graphical representation of the hydroponic system
- **Status Colors**: 
  - 🟢 Green: Optimal range
  - 🟡 Yellow: Warning range
  - 🟠 Orange: Caution range
  - 🔴 Red: Critical range
- **System Status Display**: Pump states, connectivity, and alerts

### 🌐 Web-Based Remote Control
- **Real-time Dashboard**: Live sensor data updates via JSON API
- **Pump Control**: Manual pump operation and automatic cycling configuration
- **pH Control**: Automated pH adjustment with configurable targets
- **Data Export**: JSON API for sensor data integration
- **CORS Support**: Cross-origin requests for web applications

### 🔄 Automated Control Systems
- **Pump Cycling**: Configurable on/off timing (default: 15min on, 45min off)
- **pH Control**: Automatic pH adjustment with dual pumps (pH up/down)
- **Smart Logic**: Prevents pump dry-running and system conflicts
- **Manual Override**: Manual control with automatic mode disable

### 📊 Data Logging & Cloud Integration
- **Supabase Integration**: Automatic cloud data logging every 5 minutes
- **Historical Data**: Permanent storage for trend analysis
- **Retry Logic**: Automatic retry for failed uploads with exponential backoff
- **Offline Operation**: Continues operation when cloud is unavailable

### 🛡️ Safety & Reliability Features
- **Watchdog Timer**: System restart protection during network operations
- **Moving Average Filtering**: Stable pH readings despite sensor noise
- **Static IP Configuration**: Reliable network connectivity
- **Error Handling**: Comprehensive error checking and recovery
- **Status Reporting**: Detailed system status and diagnostics

## 📁 Code Structure

```
Smart_Hydroponic_Tower_ESP32/
├── src/                          # Source code files
│   ├── main.cpp                 # Main program entry point and timer setup
│   ├── sensors.cpp              # Sensor initialization and data reading
│   ├── display.cpp              # TFT display control and UI rendering
│   ├── pump_control.cpp         # Pump automation and pH control logic
│   ├── wifi_server.cpp          # WiFi connection and web server setup
│   └── data_logger.cpp          # Cloud data logging and Supabase integration
├── include/                      # Header files
│   ├── sensors.h                # Sensor data structures and function declarations
│   ├── display.h                # Display configuration and color definitions
│   ├── pump_control.h           # Pump control structures and functions
│   ├── wifi_server.h            # Network configuration and server functions
│   ├── data_logger.h            # Cloud logging configuration
│   └── web_page.h              # HTML web interface definition
├── platformio.ini               # PlatformIO project configuration
└── supabase_schema.sql          # Database schema for cloud logging
```

### 🔗 File Interactions

**Main Control Flow:**
```
main.cpp (Timer ISR) → sensors.cpp (Data Collection) → display.cpp (Local Display)
                                   ↓
                    pump_control.cpp (Automation Logic)
                                   ↓
                    wifi_server.cpp (Web API) ← → data_logger.cpp (Cloud Sync)
```

**Key Responsibilities:**

- **`main.cpp`**: System initialization, timer-based sensor reading coordination
- **`sensors.cpp`**: Hardware abstraction layer for all sensors, data preprocessing
- **`display.cpp`**: User interface rendering, status visualization, color coding
- **`pump_control.cpp`**: Business logic for pump automation and pH control
- **`wifi_server.cpp`**: Network interface, RESTful API, web server
- **`data_logger.cpp`**: Cloud integration, data persistence, retry logic

## 📦 Dependencies & Requirements

### Hardware Requirements
- **ESP32 Development Board** (ESP32-WROOM-32 or compatible)
- **2.4" TFT Display** (ST7789 controller, 240x320 resolution)
- **Sensors:**
  - DS18B20 waterproof temperature sensor
  - Analog pH sensor (with BNC connector)
  - EC (electrical conductivity) sensor
  - DHT22 temperature/humidity sensor
  - BH1750 light sensor (I2C)
  - MH-Z19 CO2 sensor (UART)
  - Water level sensor (float switch or optical)
- **Pumps:**
  - Water circulation pump (12V)
  - pH adjustment pumps (2x peristaltic pumps)
- **Power Supply**: 12V/2A (with 5V/3.3V regulation)

### Software Dependencies

#### PlatformIO Libraries (automatically installed):
```ini
lib_deps = 
    adafruit/DHT sensor library@^1.4.6      # Temperature/humidity sensor
    paulstoffregen/OneWire@^2.3.7           # DS18B20 communication protocol
    milesburton/DallasTemperature@^4.0.4    # DS18B20 temperature sensor
    wifwaf/MH-Z19@^1.5.4                   # CO2 sensor communication
    claws/BH1750@^1.3.0                    # Light sensor I2C library
    moononournation/GFX Library for Arduino@^1.6.0  # Display graphics
    bblanchon/ArduinoJson@^6.21.3          # JSON parsing/generation
    ESP Async WebServer@^1.2.3             # Asynchronous web server
    greenponik/DFRobot_ESP_EC_BY_GREENPONIK@^1.1.4  # EC sensor library
```

#### Development Tools:
- **PlatformIO Core**: IoT development platform
- **Visual Studio Code**: Recommended IDE with PlatformIO extension
- **Git**: Version control

#### Cloud Services:
- **Supabase Account**: For data logging and historical analysis
- **WiFi Network**: 2.4GHz network with internet access

## 🚀 Setup & Installation Guide

### Step 1: Hardware Assembly

#### Pin Connections:
```cpp
// Display Connections (SPI)
#define TFT_CS     33  // Chip Select
#define TFT_RST    5   // Reset
#define TFT_DC     32  // Data/Command
#define TFT_MOSI   26  // Master Out Slave In
#define TFT_SCLK   25  // Serial Clock

// Sensor Connections
#define waterTempPin 13    // DS18B20 (OneWire)
#define waterLevelPin 14   // Water level sensor (Digital)
#define waterPHPin 36      // pH sensor (Analog)
#define waterECPin 34      // EC sensor (Analog)
#define DHTPIN 4           // DHT22 sensor

// Pump Control
#define waterPumpPin 23    // Main water pump (PWM)
#define phUpPumpPin 18     // pH UP pump (Digital)
#define phDownPumpPin 19   // pH DOWN pump (Digital)

// CO2 Sensor (UART)
#define RX_PIN 16          // ESP32 RX to MH-Z19 TX
#define TX_PIN 17          // ESP32 TX to MH-Z19 RX

// I2C Sensors (BH1750)
// SDA: GPIO 21 (default)
// SCL: GPIO 22 (default)
```

#### Wiring Diagram Notes:
- Use pull-up resistors (4.7kΩ) for OneWire (DS18B20)
- Connect pH sensor through voltage divider if needed
- Ensure proper power supply isolation for pumps
- Use optocouplers for pump control if using high-voltage pumps

### Step 2: Software Installation

#### 2.1 Install PlatformIO
```bash
# Install PlatformIO Core
pip install platformio

# Or install VS Code with PlatformIO extension
# https://platformio.org/platformio-ide
```

#### 2.2 Clone and Setup Project
```bash
# Clone the repository
git clone https://github.com/yourusername/Smart_Hydroponic_Tower.git
cd Smart_Hydroponic_Tower/Smart_Hydroponic_Tower_ESP32

# Install dependencies (automatic with PlatformIO)
pio lib install

# Build the project
pio run
```

### Step 3: Configuration

#### 3.1 WiFi Configuration
Edit `src/wifi_server.cpp`:
```cpp
// WiFi credentials - UPDATE THESE FOR YOUR NETWORK!
const char* ssid = "YourWiFiNetwork";
const char* password = "YourWiFiPassword";

// Static IP configuration (optional but recommended)
IPAddress staticIP(192, 168, 1, 100);  // Change to your network
IPAddress gateway(192, 168, 1, 1);     // Your router IP
IPAddress subnet(255, 255, 255, 0);    // Your subnet mask
```

#### 3.2 Supabase Configuration (Optional)
1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Run the SQL schema from `supabase_schema.sql`
4. Update `include/data_logger.h`:
```cpp
#define SUPABASE_URL "https://your-project.supabase.co"
#define SUPABASE_API_KEY "your-anon-key"
```

#### 3.3 Sensor Calibration
Edit sensor ranges in `src/display.cpp` function `drawSensorStatus()`:
```cpp
// Adjust these ranges for your specific requirements
uint16_t waterTempColor = getStatusColor(currentSensors.waterTemp, 18, 22, 15, 25, 12, 28);
uint16_t phColor = getStatusColor(currentSensors.waterPH, 5.5, 6.5, 5, 7, 4, 8);
// Parameters: (value, minGood, maxGood, minYellow, maxYellow, minOrange, maxOrange)
```

### Step 4: Upload and Test

```bash
# Connect ESP32 via USB
# Upload firmware
pio run --target upload

# Monitor serial output
pio device monitor
```

## 📖 Usage Instructions

### Initial Startup

1. **Power On**: Connect power supply and ESP32 will boot
2. **WiFi Connection**: Monitor serial output for IP address assignment
3. **Display Check**: TFT display should show "HYDROPONIC TOWER" title
4. **Sensor Verification**: Check that all sensors show reasonable values

### Web Interface Access

#### Finding Your ESP32:
```bash
# Check serial monitor for IP address, or scan network:
nmap -sn 192.168.1.0/24  # Adjust for your network
```

#### Basic API Usage:
```bash
# Get current sensor data
curl http://192.168.1.100/sensors

# Toggle main pump
curl -X POST http://192.168.1.100/pump/toggle

# Get pump status
curl http://192.168.1.100/pump/status

# Set pump timing (15 min on, 45 min off)
curl -X PUT http://192.168.1.100/pump/config \
  -H "Content-Type: application/json" \
  -d '{"onTime": 900, "offTime": 2700, "autoMode": true}'
```

### Display Interface

#### Status Colors:
- **🟢 Green**: Optimal growing conditions
- **🟡 Yellow**: Acceptable but monitor closely
- **🟠 Orange**: Outside ideal range, intervention may be needed
- **🔴 Red**: Critical levels, immediate attention required

#### Reading the Display:
```
Top: System title and status messages
Middle: Tower visualization with plant positions
Bottom Left: Water parameters (temp, pH, EC)
Bottom Right: Pump status and water level
Right Side: Environmental data (temp, humidity, light, CO2)
```

### pH Control System

#### Automatic Mode:
- Target pH: 6.0 ± 0.5 (configurable)
- Automatic pump activation when outside range
- 5-second pump bursts with 60-second cooldown
- Dead band to prevent oscillation

#### Manual Mode:
```bash
# Enable manual pH control
curl -X PUT http://192.168.1.100/ph/config \
  -H "Content-Type: application/json" \
  -d '{"autoMode": false}'

# Manually activate pH UP pump
curl -X POST http://192.168.1.100/ph/up

# Stop all pH pumps
curl -X POST http://192.168.1.100/ph/stop
```

### Data Logging

#### Cloud Logging:
- Automatic upload every 5 minutes
- Includes all sensor readings with timestamp
- Retry logic for failed uploads
- Manual trigger available via web API

#### Manual Data Upload:
```bash
curl -X POST http://192.168.1.100/logger/manual
```

## 🔧 How It Works (Under the Hood)

### System Architecture

The Smart Hydroponic Tower uses a **timer-interrupt driven architecture** for precise and reliable operation:

```cpp
// Main control loop (1-second intervals)
Timer ISR → Read Sensors → Update Display → Control Pumps → Handle Web Requests → Log Data
```

### Core Components Deep Dive

#### 1. Timer-Based Sensor Reading
```cpp
// Hardware timer ensures precise 1-second intervals
hw_timer_t * timer = NULL;
volatile bool readSensors = false;

void IRAM_ATTR onTimer() {
  readSensors = true;  // Set flag for main loop
}
```

**Why this approach?**
- Prevents sensor reading delays from affecting timing
- Ensures consistent data collection intervals
- Allows web server to remain responsive
- Reduces power consumption through efficient scheduling

#### 2. Moving Average pH Filtering
```cpp
float calculatePHMovingAverage(float newReading) {
  phSum -= phReadings[phIndex];           // Remove oldest
  phReadings[phIndex] = newReading;       // Add new reading
  phSum += newReading;                    // Update sum
  phIndex = (phIndex + 1) % PH_SAMPLES;  // Circular buffer
  return phSum / samplesCount;            // Return average
}
```

**Why moving averages?**
- pH sensors are inherently noisy
- Prevents false triggering of pH pumps
- Provides stable readings for automation
- Configurable sample count for responsiveness vs. stability

#### 3. PWM Pump Control
```cpp
#define PUMP_PWM_ON_DUTY ((int)(0.4 * 255))  // 40% duty cycle

void setPumpState(bool state) {
  ledcWrite(PUMP_PWM_CHANNEL, state ? PUMP_PWM_ON_DUTY : 0);
}
```

**Benefits of PWM control:**
- Reduces pump wear and noise
- Lower power consumption
- Gentler water circulation
- Better control over flow rates

#### 4. Automated Pump Cycling Logic
```cpp
void updatePumpControl() {
  unsigned long elapsedTime = currentTime - pumpLastChange;
  
  if (pumpState) {
    // Pump is ON - check if it's time to turn OFF
    if (elapsedTime >= pumpConfig.onTime) {
      setPumpState(false);
    }
  } else {
    // Pump is OFF - check if it's time to turn ON
    if (elapsedTime >= pumpConfig.offTime) {
      setPumpState(true);
    }
  }
}
```

**Design rationale:**
- Mimics natural rainfall patterns
- Prevents root rot from over-watering
- Allows nutrient absorption between cycles
- Configurable timing for different plants/seasons

#### 5. Asynchronous Web Server
```cpp
AsyncWebServer server(80);

server.on("/sensors", HTTP_GET, [](AsyncWebServerRequest *request){
  request->send(200, "application/json", getSensorDataJSON());
});
```

**Advantages of async server:**
- Non-blocking operation
- Handles multiple simultaneous requests
- Doesn't interfere with sensor timing
- Better performance on single-core operations

#### 6. Color-Coded Status System
```cpp
uint16_t getStatusColor(float value, float minGood, float maxGood, 
                       float minYellow, float maxYellow, 
                       float minOrange, float maxOrange) {
  if (value >= minGood && value <= maxGood) return GREEN;
  if (value >= minYellow && value <= maxYellow) return YELLOW;
  if (value >= minOrange && value <= maxOrange) return ORANGE;
  return RED;
}
```

**Status ranges example (pH):**
- 🟢 Green (Optimal): 5.5 - 6.5
- 🟡 Yellow (Acceptable): 5.0 - 7.0  
- 🟠 Orange (Caution): 4.0 - 8.0
- 🔴 Red (Critical): Outside 4.0 - 8.0

#### 7. Cloud Data Logging with Retry Logic
```cpp
bool uploadSensorData(const SensorData& data) {
  int attempts = 0;
  while (attempts < MAX_RETRY_ATTEMPTS) {
    esp_task_wdt_reset();  // Prevent watchdog timeout
    int httpResponseCode = http.POST(jsonPayload);
    if (httpResponseCode >= 200 && httpResponseCode < 300) {
      return true;  // Success
    }
    attempts++;
    delay(1000 * attempts);  // Exponential backoff
  }
  return false;  // Failed after retries
}
```

**Reliability features:**
- Watchdog timer reset during network operations
- Exponential backoff for failed uploads
- Graceful degradation when cloud is unavailable
- Local operation continues regardless of connectivity

### Error Handling and Safety

#### 1. Sensor Validation
```cpp
// Validate sensor readings before use
if (currentSensors.waterTemp < -50 || currentSensors.waterTemp > 100) {
  // Invalid reading - use previous value or default
}
```

#### 2. Pump Safety
```cpp
// Prevent pump operation without water
if (!currentSensors.waterLevel) {
  setPumpState(false);  // Emergency stop
  Serial.println("Emergency: Pump stopped - no water detected");
}
```

#### 3. Network Resilience
```cpp
// Continue operation even if WiFi fails
if (WiFi.status() != WL_CONNECTED) {
  // Local operation continues
  // Attempt reconnection in background
}
```

## ⚙️ Configuration

### Environment Variables and Settings

#### WiFi Configuration
Located in `src/wifi_server.cpp`:
```cpp
const char* ssid = "YourNetwork";
const char* password = "YourPassword";

// Static IP (recommended for stable access)
IPAddress staticIP(192, 168, 1, 100);
IPAddress gateway(192, 168, 1, 1);
IPAddress subnet(255, 255, 255, 0);
```

#### Sensor Calibration
Located in `src/sensors.cpp`:
```cpp
#define phOffset 0.6    // pH sensor calibration offset

// Moving average samples (higher = more stable, less responsive)
#define PH_SAMPLES 10
```

#### Pump Timing Configuration
Located in `src/pump_control.cpp`:
```cpp
PumpConfig pumpConfig = {
  .onTime = 15*60000,      // 15 minutes on
  .offTime = 45*60000,     // 45 minutes off
  .autoMode = true,        // Enable automatic cycling
};

// pH Control timing
#define PH_PUMP_ON_TIME 5000     // 5 seconds
#define PH_PUMP_COOLDOWN 60000   // 60 seconds between adjustments
```

#### Display Colors and Ranges
Located in `src/display.cpp`:
```cpp
// Customize these ranges for your specific plants
uint16_t waterTempColor = getStatusColor(
  currentSensors.waterTemp, 
  18, 22,    // Optimal range (green)
  15, 25,    // Acceptable range (yellow)
  12, 28     // Warning range (orange), beyond = red
);
```

#### Data Logging Configuration
Located in `include/data_logger.h`:
```cpp
#define LOG_INTERVAL_MS 300000     // Upload every 5 minutes
#define MAX_RETRY_ATTEMPTS 3       // Retry failed uploads 3 times
```

### Supabase Database Configuration

#### Setting Up Supabase:
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy the SQL schema from `supabase_schema.sql`
4. Run in Supabase SQL Editor
5. Get your URL and API key from project settings

#### Database Schema:
```sql
CREATE TABLE sensor_data (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    timestamp BIGINT NOT NULL,
    co2_level REAL,
    ph_level REAL,
    water_temp REAL,
    env_temp REAL,
    humidity REAL,
    light_level REAL,
    ec_level REAL,
    water_level BOOLEAN
);
```

### Customization Options

#### Adding New Sensors:
1. Define pin in appropriate header file
2. Add initialization in `initSensors()`
3. Add reading logic in `updateSensorValues()`
4. Add display code in `drawSensorStatus()`
5. Update JSON output in `getSensorDataJSON()`

#### Modifying Control Logic:
```cpp
// Example: Custom pump timing based on light levels
if (currentSensors.lightLevel > 1000) {
  // Longer cycles during bright periods
  pumpConfig.onTime = 20*60000;   // 20 minutes
  pumpConfig.offTime = 40*60000;  // 40 minutes
} else {
  // Shorter cycles during dark periods
  pumpConfig.onTime = 10*60000;   // 10 minutes
  pumpConfig.offTime = 50*60000;  // 50 minutes
}
```

#### Adding Web API Endpoints:
```cpp
server.on("/custom/endpoint", HTTP_GET, [](AsyncWebServerRequest *request){
  // Your custom logic here
  request->send(200, "application/json", "{\"status\":\"ok\"}");
});
```

## 🤝 Contributing Guide

### Development Setup

#### Prerequisites:
- PlatformIO Core or IDE
- Git for version control
- ESP32 development board for testing
- Basic understanding of C++ and Arduino framework

#### Setting Up Development Environment:
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/yourusername/Smart_Hydroponic_Tower.git
cd Smart_Hydroponic_Tower/Smart_Hydroponic_Tower_ESP32

# Create development branch
git checkout -b feature/your-feature-name

# Install dependencies
pio lib install

# Build and test
pio run
pio run --target upload
```

### Code Style Guidelines

#### Naming Conventions:
```cpp
// Variables: camelCase
int sensorValue = 0;
float waterTemperature = 0.0;

// Functions: camelCase
void updateSensorValues();
bool getPumpState();

// Constants: UPPER_CASE
#define MAX_RETRY_ATTEMPTS 3
#define LOG_INTERVAL_MS 300000

// Classes/Structs: PascalCase
struct SensorData {
  float waterTemp;
  bool pumpStatus;
};
```

#### Code Organization:
- Keep functions focused and single-purpose
- Use meaningful variable and function names
- Comment complex logic and hardware-specific code
- Group related functionality in appropriate files

#### Hardware Abstraction:
```cpp
// Good: Hardware abstraction
void setPumpState(bool state);

// Avoid: Direct hardware access in business logic
// ledcWrite(PUMP_PWM_CHANNEL, state ? PUMP_PWM_ON_DUTY : 0);
```

### Adding New Features

#### 1. New Sensor Integration:
```cpp
// 1. Add pin definition in appropriate header
#define NEW_SENSOR_PIN 35

// 2. Add to SensorData struct in sensors.h
struct SensorData {
  // existing fields...
  float newSensorValue;
};

// 3. Initialize in initSensors()
// 4. Read in updateSensorValues()
// 5. Display in drawSensorStatus()
// 6. Add to JSON API
```

#### 2. New Control Logic:
- Add configuration struct if needed
- Implement control function
- Add web API endpoints
- Update display if visual feedback needed
- Document configuration options

#### 3. New Communication Protocol:
- Create separate module file
- Implement connection handling
- Add error recovery
- Update configuration documentation

### Testing Guidelines

#### Unit Testing:
```cpp
// Test sensor range validation
void testSensorRanges() {
  assert(getStatusColor(6.0, 5.5, 6.5, 5.0, 7.0) == GREEN);
  assert(getStatusColor(5.0, 5.5, 6.5, 5.0, 7.0) == YELLOW);
}
```

#### Integration Testing:
- Test all sensors with known inputs
- Verify pump timing accuracy
- Test web API responses
- Validate data logging functionality

#### Hardware Testing Checklist:
- [ ] All sensors read reasonable values
- [ ] Pumps respond to commands
- [ ] Display shows correct information
- [ ] WiFi connection stable
- [ ] Web interface accessible
- [ ] Data logging works

### Pull Request Process

1. **Create Feature Branch**: Use descriptive names like `feature/ph-sensor-calibration`
2. **Make Changes**: Follow code style guidelines
3. **Test Thoroughly**: Ensure all functionality works
4. **Update Documentation**: Add/update comments and README
5. **Submit Pull Request**: Include clear description of changes

#### Pull Request Template:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Tested on hardware
- [ ] All sensors working
- [ ] Web interface tested
- [ ] No breaking changes

## Screenshots/Logs
Include relevant screenshots or serial monitor logs
```

### Bug Reports

#### Issue Template:
```markdown
**Describe the Bug**
Clear description of what's happening

**To Reproduce**
Steps to reproduce the behavior

**Expected Behavior**
What you expected to happen

**Hardware Setup**
- ESP32 board type
- Sensor models
- Wiring configuration

**Software Environment**
- PlatformIO version
- Library versions
- Upload logs
```

## 🛠️ Troubleshooting & Common Issues

### Hardware Issues

#### 1. Display Not Working
**Symptoms**: Blank screen, garbled display, partial display

**Solutions**:
```cpp
// Check pin connections in display.h
#define TFT_CS     33  // Verify these match your wiring
#define TFT_RST    5   
#define TFT_DC     32  
#define TFT_MOSI   26  
#define TFT_SCLK   25  

// Test display initialization
void debugDisplay() {
  gfx->begin();
  gfx->fillScreen(RED);    // Should show red screen
  delay(1000);
  gfx->fillScreen(GREEN);  // Should show green screen
  delay(1000);
  gfx->fillScreen(BLUE);   // Should show blue screen
}
```

**Common causes**:
- Incorrect wiring (check SPI connections)
- Insufficient power supply (display needs 3.3V, adequate current)
- Wrong display controller (code assumes ST7789)

#### 2. Sensor Reading Issues

**pH Sensor Problems**:
```cpp
// Calibration procedure
float rawPH = analogRead(waterPHPin) * 5.0 / 4096.0;
Serial.printf("Raw pH reading: %.3f V\n", rawPH);

// Expected values:
// pH 7.0 (neutral): ~2.5V
// pH 4.0 (acidic):  ~3.0V  
// pH 10.0 (basic):  ~2.0V
```

**Temperature Sensor (DS18B20) Issues**:
```cpp
// Check if sensor is detected
sensors.getDeviceCount();  // Should return 1 or more
if (sensors.getDeviceCount() == 0) {
  Serial.println("No DS18B20 sensors found!");
  // Check wiring, pull-up resistor (4.7kΩ)
}
```

**I2C Sensor Issues (BH1750)**:
```cpp
// Scan I2C bus for devices
Wire.begin();
for (byte address = 1; address < 127; address++) {
  Wire.beginTransmission(address);
  if (Wire.endTransmission() == 0) {
    Serial.printf("I2C device found at 0x%02X\n", address);
  }
}
// BH1750 should appear at 0x23 or 0x5C
```

#### 3. Pump Control Issues

**Pump Not Responding**:
```cpp
// Test pump directly
void testPump() {
  Serial.println("Testing pump ON");
  ledcWrite(PUMP_PWM_CHANNEL, 255);  // Full power test
  delay(5000);
  
  Serial.println("Testing pump OFF");
  ledcWrite(PUMP_PWM_CHANNEL, 0);
  delay(2000);
}
```

**Check pump wiring**:
- Verify pump power supply (usually 12V)
- Check MOSFET/relay driver circuit
- Ensure ESP32 GPIO can handle pump current

### Network Issues

#### 4. WiFi Connection Problems

**Static IP Conflicts**:
```cpp
// Disable static IP temporarily
// Comment out this section in wifi_server.cpp:
/*
if(!WiFi.config(staticIP, gateway, subnet, primaryDNS, secondaryDNS)) {
  Serial.println("Static IP configuration failed");
}
*/

// Check what IP was assigned
Serial.print("ESP32 IP: ");
Serial.println(WiFi.localIP());
```

**Network Discovery**:
```bash
# Find ESP32 on network
nmap -sn 192.168.1.0/24

# Test web server
curl http://ESP32_IP/sensors
```

#### 5. Web Server Issues

**CORS Problems**:
```javascript
// Browser console error: "CORS policy"
// Solution: Server already includes CORS headers
// Check that requests include proper headers:

fetch('http://192.168.1.100/sensors', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
})
```

**API Not Responding**:
```cpp
// Debug web server
server.onNotFound([](AsyncWebServerRequest *request){
  Serial.printf("404: %s\n", request->url().c_str());
  request->send(404, "text/plain", "Not found");
});
```

### Software Issues

#### 6. Memory Problems

**Stack Overflow**:
```cpp
// Symptoms: ESP32 restarts randomly, "Guru Meditation Error"
// Solution: Monitor stack usage

void checkMemory() {
  Serial.printf("Free heap: %d bytes\n", ESP.getFreeHeap());
  Serial.printf("Min free heap: %d bytes\n", ESP.getMinFreeHeap());
  
  // Warning if less than 10KB free
  if (ESP.getFreeHeap() < 10000) {
    Serial.println("WARNING: Low memory!");
  }
}
```

**Memory leaks**:
- Avoid dynamic allocation in loops
- Ensure proper cleanup of HTTP clients
- Use static JSON documents where possible

#### 7. Timing Issues

**Timer Interrupt Problems**:
```cpp
// Symptoms: Irregular sensor readings, system freezes
// Debug timer operation
volatile unsigned long timerCount = 0;

void IRAM_ATTR onTimer() {
  timerCount++;  // Should increment every second
  readSensors = true;
}

void checkTimer() {
  static unsigned long lastCount = 0;
  if (timerCount == lastCount) {
    Serial.println("ERROR: Timer not running!");
  }
  lastCount = timerCount;
}
```

### Data Logging Issues

#### 8. Supabase Connection Problems

**Authentication Errors**:
```cpp
// Check API key and URL
#define SUPABASE_URL "https://yourproject.supabase.co"
#define SUPABASE_API_KEY "your-anon-key-here"

// Test connection manually
void testSupabaseConnection() {
  HTTPClient http;
  http.begin(String(SUPABASE_URL) + "/rest/v1/sensor_data?select=count");
  http.addHeader("apikey", SUPABASE_API_KEY);
  
  int httpCode = http.GET();
  Serial.printf("Supabase test: HTTP %d\n", httpCode);
  Serial.println(http.getString());
  http.end();
}
```

**JSON Format Issues**:
```cpp
// Debug JSON generation
String json = createJsonFromSensorData(currentSensors);
Serial.println("Generated JSON:");
Serial.println(json);

// Validate JSON format
DynamicJsonDocument testDoc(512);
DeserializationError error = deserializeJson(testDoc, json);
if (error) {
  Serial.printf("JSON error: %s\n", error.c_str());
}
```

### Performance Issues

#### 9. Slow Response Times

**Web server optimization**:
```cpp
// Use smaller JSON documents
StaticJsonDocument<256> doc;  // Instead of DynamicJsonDocument

// Cache frequently accessed data
String cachedSensorJSON;
unsigned long lastCacheUpdate = 0;

String getSensorDataJSON() {
  unsigned long now = millis();
  if (now - lastCacheUpdate > 1000) {  // Update cache every second
    cachedSensorJSON = generateSensorJSON();
    lastCacheUpdate = now;
  }
  return cachedSensorJSON;
}
```

#### 10. Power Consumption Issues

**Sleep mode implementation**:
```cpp
// For battery operation, implement light sleep
void enterLightSleep() {
  esp_sleep_enable_timer_wakeup(1000000);  // 1 second
  esp_light_sleep_start();
}

// Use only when not actively monitoring
```

### Diagnostic Tools

#### Serial Monitor Debug Output
```cpp
// Add debug levels
#define DEBUG_LEVEL 2  // 0=none, 1=errors, 2=info, 3=verbose

#define DEBUG_PRINT(level, ...) \
  if (DEBUG_LEVEL >= level) Serial.printf(__VA_ARGS__)

// Usage
DEBUG_PRINT(2, "Sensor reading: pH=%.2f, temp=%.1f\n", ph, temp);
```

#### LED Status Indicators
```cpp
// Use built-in LED for status
#define STATUS_LED 2

void blinkError(int count) {
  for (int i = 0; i < count; i++) {
    digitalWrite(STATUS_LED, HIGH);
    delay(200);
    digitalWrite(STATUS_LED, LOW);
    delay(200);
  }
}

// Error codes:
// 1 blink: Sensor error
// 2 blinks: Network error  
// 3 blinks: Memory error
```

## 📄 License & Credits

### License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Smart Hydroponic Tower Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Credits and Acknowledgments

#### Primary Developer
- **Project Creator**: [Your Name/Organization]
- **GitHub**: [@yourusername](https://github.com/yourusername)
- **Contact**: your.email@example.com

#### Open Source Libraries
This project builds upon excellent open-source libraries:

- **[Arduino Core for ESP32](https://github.com/espressif/arduino-esp32)** - ESP32 Arduino framework
- **[PlatformIO](https://platformio.org/)** - IoT development platform
- **[ArduinoJson](https://arduinojson.org/)** by Benoit Blanchon - JSON parsing and generation
- **[ESPAsyncWebServer](https://github.com/me-no-dev/ESPAsyncWebServer)** - Asynchronous web server
- **[GFX Library for Arduino](https://github.com/moononournation/Arduino_GFX)** - Display graphics
- **[DHT Sensor Library](https://github.com/adafruit/DHT-sensor-library)** by Adafruit - Temperature/humidity sensor
- **[OneWire](https://github.com/PaulStoffregen/OneWire)** by Paul Stoffregen - DS18B20 communication
- **[DallasTemperature](https://github.com/milesburton/Arduino-Temperature-Control-Library)** by Miles Burton - DS18B20 library
- **[MH-Z19](https://github.com/WifWaf/MH-Z19)** by WifWaf - CO2 sensor library
- **[BH1750](https://github.com/claws/BH1750)** by claws - Light sensor library

#### Hardware Inspiration
- **Hydroponic Growing Techniques** - Traditional and modern hydroponic methods
- **ESP32 Community** - Extensive documentation and examples
- **Arduino Community** - Libraries and code examples

#### Cloud Services
- **[Supabase](https://supabase.com/)** - Backend as a Service for data storage
- **PostgreSQL** - Underlying database technology

#### Educational Resources
- **MIT OpenCourseWare** - Electronics and programming concepts
- **ESP32 Documentation** by Espressif Systems
- **Hydroponic Nutrient Management** - Agricultural extension publications

#### Testing and Feedback
- Beta testers and early adopters
- Hydroponic community members
- Arduino/ESP32 forum contributors

### Special Thanks

- **Hydroponic Community** for sharing growing knowledge and requirements
- **Open Source Contributors** who maintain the excellent libraries used
- **PlatformIO Team** for making IoT development accessible
- **Supabase Team** for providing easy-to-use database services
- **Everyone** who provided feedback, bug reports, and feature suggestions

### Contributing Back

This project aims to give back to the open-source community. If you find this project useful:

1. ⭐ **Star the repository** to show your support
2. 🐛 **Report bugs** to help improve the project
3. 💡 **Suggest features** for future development
4. 🔧 **Contribute code** through pull requests
5. 📚 **Share knowledge** by improving documentation
6. 🌱 **Share your results** to help others learn

### Disclaimer

This project is provided for educational and experimental purposes. While designed with safety in mind:

- **Electrical Safety**: Always follow proper electrical safety practices when working with pumps and power supplies
- **Water Safety**: Ensure proper waterproofing of electrical components
- **Plant Health**: Monitor plants closely when implementing automated systems
- **System Reliability**: This is experimental software - always have backup monitoring for critical applications

The authors are not responsible for any damage to equipment, plants, or property resulting from the use of this software and hardware design.

### Version History

- **v1.0.0** (2025-01-XX) - Initial release
  - Basic sensor monitoring and display
  - Pump control and automation
  - Web interface and API
  - Supabase data logging

- **v1.1.0** (Future) - Planned features
  - pH control automation improvements
  - Additional sensor support
  - Mobile app companion
  - Advanced analytics

---

## 🌟 Support the Project

If this project helped you with your hydroponic growing:

- ⭐ **Star this repository**
- 🔄 **Share with fellow growers**
- 🐛 **Report issues you encounter**
- 💝 **Consider sponsoring development**

**Happy Growing! 🌱**

---

*For the latest updates, documentation, and community discussions, visit our [GitHub repository](https://github.com/yourusername/Smart_Hydroponic_Tower).*
