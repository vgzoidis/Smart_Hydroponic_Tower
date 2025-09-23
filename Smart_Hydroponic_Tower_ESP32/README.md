# Smart Hydroponic Tower - ESP32 Control System

[![PlatformIO CI](https://img.shields.io/badge/PlatformIO-IoT%20Development-blue)](https://platformio.org/)
[![ESP32](https://img.shields.io/badge/Hardware-ESP32-red)](https://www.espressif.com/en/products/socs/esp32)
[![Arduino Framework](https://img.shields.io/badge/Framework-Arduino-00979D)](https://www.arduino.cc/)

## Project Overview

The Smart Hydroponic Tower is an automated hydroponic growing system designed to monitor and control the optimal growing conditions for plants. This ESP32-based  IoT system continuously monitors environmental and water parameters, automatically controls pumps for nutrient circulation and pH adjustment, and provides both local display and remote web-based monitoring capabilities.

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

## Features

### Comprehensive Sensor Monitoring
- **Water Temperature**: DS18B20 sensor with ±0.5°C accuracy
- **pH Level**: Analog pH sensor with moving average filtering for stability
- **EC (Electrical Conductivity)**: Measures nutrient concentration in water
- **Water Level**: Digital sensor to prevent pump dry-running
- **Environmental Temperature & Humidity**: DHT22 sensor for ambient conditions
- **Light Level**: BH1750 digital light sensor for photosynthetic monitoring
- **CO2 Level**: MH-Z19 NDIR sensor for atmospheric CO2 measurement

### Local Display Interface
- **2" IPS LCD Display**: Real-time sensor readings with color-coded status indicators
- **Visual Tower Representation**: Graphical representation of the hydroponic system
- **Status Colors**: 
  - 🟢 Green: Optimal range
  - 🟡 Yellow: Warning range
  - 🟠 Orange: Caution range
  - 🔴 Red: Critical range
- **System Status Display**: Pump states, connectivity, and alerts

### Web-Based Remote Control
- **Real-time Dashboard**: Live sensor data updates via JSON API
- **Pump Control**: Manual pump operation and automatic cycling configuration
- **pH Control**: Automated pH adjustment with configurable targets
- **Data Export**: JSON API for sensor data integration
- **CORS Support**: Cross-origin requests for web applications

### Automated Control Systems
- **Pump Cycling**: Configurable on/off timing (default: 15min on, 45min off)
- **pH Control**: Automatic pH adjustment with dual pumps (pH up/down)
- **Smart Logic**: Prevents pump dry-running and system conflicts
- **Manual Override**: Manual control with automatic mode disable

### Data Logging & Cloud Integration
- **Supabase Integration**: Automatic cloud data logging every 5 minutes
- **Historical Data**: Permanent storage for trend analysis
- **Retry Logic**: Automatic retry for failed uploads with exponential backoff
- **Offline Operation**: Continues operation when cloud is unavailable

### Safety & Reliability Features
- **Watchdog Timer**: System restart protection during network operations
- **Moving Average Filtering**: Stable pH readings despite sensor noise
- **Static IP Configuration**: Reliable network connectivity
- **Error Handling**: Comprehensive error checking and recovery
- **Status Reporting**: Detailed system status and diagnostics
- **Network Resilience**: Operation continues even if WiFi fails (attempts reconnection in the background)

## Code Structure

```
Smart_Hydroponic_Tower_ESP32/
├── src/                        # Source code files
│   ├── main.cpp                 # Main program entry point and timer setup
│   ├── sensors.cpp              # Sensor initialization and data reading
│   ├── display.cpp              # TFT display control and UI rendering
│   ├── pump_control.cpp         # Pump automation and pH control logic
│   ├── wifi_server.cpp          # WiFi connection and web server setup
│   └── data_logger.cpp          # Cloud data logging and Supabase integration
├── include/                    # Header files
│   ├── sensors.h                # Sensor data structures and function declarations
│   ├── display.h                # Display configuration and color definitions
│   ├── pump_control.h           # Pump control structures and functions
│   ├── wifi_server.h            # Network configuration and server functions
│   ├── data_logger.h            # Cloud logging configuration
│   └── web_page.h               # HTML web interface definition
├── platformio.ini              # PlatformIO project configuration
└── supabase_schema.sql         # Database schema for cloud logging
```

## Dependencies & Requirements

### Hardware Requirements
- **ESP32 Development Board** (ESP32-WROOM-32 or compatible)
- **2' IPS LCD Display** (ST7789 controller, 240x320 resolution)
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
- **Power Supply**: 250V AC to 12V DC (2A)
- **DC/DC Converter**: 12V to 5V (the ESP32 handles the 3.3V regulation)

### Software Dependencies

#### PlatformIO Libraries (automatically installed):
```ini
lib_deps = 
    adafruit/DHT sensor library@^1.4.6      # Temperature/humidity sensor
    paulstoffregen/OneWire@^2.3.7           # DS18B20 communication protocol
    milesburton/DallasTemperature@^4.0.4    # DS18B20 temperature sensor
    greenponik/DFRobot_ESP_EC_BY_GREENPONIK@^1.1.4  # EC sensor library
    wifwaf/MH-Z19@^1.5.4                   # CO2 sensor communication
    claws/BH1750@^1.3.0                    # Light sensor I2C library
    moononournation/GFX Library for Arduino@^1.6.0  # Display graphics
    bblanchon/ArduinoJson@^6.21.3          # JSON parsing/generation
    ESP Async WebServer@^1.2.3             # Asynchronous web server
```

#### Development Tools:
- **PlatformIO Core**: IoT development platform
- **Visual Studio Code**: Recommended IDE with PlatformIO extension
- **Git**: Version control

#### Cloud Services:
- **Supabase Account**: For data logging and historical analysis
- **WiFi Network**: 2.4GHz network with internet access

## Setup & Installation Guide

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
- Use pull-up resistors for OneWire (DS18B20 - water temp)
- Connect pH and water level sensor through voltage divider
- Ensure proper power supply isolation for pumps

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

#### 3.3 Set up Optimal Sensor Ranges
Edit sensor ranges in `src/display.cpp` function `drawSensorStatus()`:
```cpp
// Adjust these ranges for your specific requirements
uint16_t waterTempColor = getStatusColor(currentSensors.waterTemp, 18, 22, 15, 25, 12, 28);
uint16_t phColor = getStatusColor(currentSensors.waterPH, 5.5, 6.5, 5, 7, 4, 8);
...
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

## Usage Instructions

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

## How It Works (Under the Hood)

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
- Allows for the oxygenation of the roots without letting them dry
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
- Prevents watchdog timer reset during lengthy network operations
- Exponential backoff for failed uploads
- Graceful degradation when cloud is unavailable
- Local operation continues regardless of connectivity

## License & Credits

### License

This project is licensed under the **MIT License**.

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
- **Project Creator**: [Vasilis Zoidis/Iti Certh]
- **GitHub**: [@vgzoidis](https://github.com/vgzoidis)
- **Contact**: vgzoidis@ece.auth.gr

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

### Version History

- **v1.0** (2025-09-12) - Initial release
  - Sensor monitoring using LCD display
  - Pump control and automation
  - Web interface and API
  - Supabase data logging
  - pH control automation
  - Mobile app companion

- **v1.1** (Future) - Planned features
  - Ability to set optimal ranges though the webpage and mobile app
  - Other variable automation (Light/Temprature...)
  - Additional sensor support
  - Static Configuration variables (Avoid losing setup after reset)
  - Advanced analytics
