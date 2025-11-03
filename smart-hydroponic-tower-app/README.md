# Smart Hydroponic Tower Mobile App

[![React Native](https://img.shields.io/badge/React%20Native-72.17-blue)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-00979D)](https://www.typescriptlang.org/)
[![Android](https://img.shields.io/badge/Platform-Android-brightgreen)](https://developer.android.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-green)](https://supabase.com/)
[![ESP32](https://img.shields.io/badge/Hardware-ESP32-red)](https://www.espressif.com/en/products/socs/esp32)

## Project Overview

The **Smart Hydroponic Tower Mobile App** is a comprehensive React Native application designed to monitor and control an automated hydroponic growing system. This app serves as the central control hub for a smart hydroponic tower, allowing users to:

- **Monitor real-time sensor data** from their hydroponic system
- **Control pumps and pH levels** remotely
- **Visualize historical data trends** through interactive charts
- **Configure automated cirtculation and pH control** for optimal plant growth
- **Receive alerts** about system status and plant health

### Problems It Solves

1. **Remote Monitoring**: No need to physically check your hydroponic system constantly
2. **Data-Driven Growing**: Make informed decisions based on historical trends and real-time data
3. **Automation Control**: Set up automated watering and pH adjustment schedules
4. **Early Problem Detection**: Get immediate alerts when conditions are outside optimal ranges
5. **Optimal Plant Growth**: Helps you maintain perfect growing conditions
---

## Features

### **Dashboard Screen**
- **Real-time sensor monitoring** with color-coded status indicators
- **Interactive tower visualization** showing water level and flow animations
- **Environmental readings**: Temperature, humidity, CO₂, and light levels
- **Water system status**: pH, EC levels, water temperature, and tank level
- **Manual pump control** with one-tap operation
- **Connection status monitoring** for ESP32 connectivity

### **Data Plotting Screen**
- **Historical data visualization** with interactive charts
- **Multiple time ranges**: Day, week, and month views
- **Multi-sensor plotting**: Compare different parameters over time
- **Data export capabilities** through Supabase integration
- **Connection status monitoring** for database connectivity

### **Settings Screen**
- **Pump automation configuration**:
  - Real-time status monitoring (with scheduling information)
  - Auto/manual mode switching (for manual override)
  - Customizable on/off timing cycles (1-180 minutes)
  
- **pH control system**:
  - Real-time status monitoring (with control information)
  - Sophisticated automated pH adjustment (cooldown for accurate mesurements)
  - Target pH and tolerance settings (to avoid oscillations)
  - Manual pH up/down controls (useful when setting up new main solution)
- **Sensors optimal ranges overview** (static but customisable as a planned feature)
---

## Code Structure

```
smart-hydroponic-tower-app/
├── src/
│   ├── components/                # Reusable UI components
│   │   ├── HorizontalChart.tsx      # Chart visualization component
│   │   ├── PlantLevel.tsx           # Individual plant level display
│   │   ├── StatusIndicator.tsx      # Status indicator component
│   │   ├── TowerVisualization.tsx   # Main tower visualization
│   │   └── WaterValuesPanel.tsx     # Water parameters panel
│   ├── constants/                 # Constant UI components
│   │   └── Colors.ts                # App color scheme definitions
│   ├── screens/                   # Main app screens
│   │   ├── DashboardScreen.tsx      # Real-time monitoring screen
│   │   ├── PlottingScreen.tsx       # Data visualization screen
│   │   └── SettingsScreen.tsx       # System configuration screen
│   └── utils/                     # Utility functions and configurations
│       ├── apiConfig.ts             # ESP32 API communication config
│       ├── sensorUtils.ts           # Sensor data processing utilities
│       ├── supabaseConfig.ts        # Database connection config
│       └── timezoneUtils.ts         # Timezone handling utilities
├── android/                       # Android platform files
├── App.tsx                        # Main application component
├── index.js                       # Entry point
├── package.json                   # Dependencies and scripts
├── quick-install.ps1              # PowerShell installation script
└── README.md                      # This file
```

**Files Modified**:
- `src/utils/timezoneUtils.ts` (new file)
- `src/screens/PlottingScreen.tsx` (updated timezone handling)
- `src/utils/supabaseConfig.ts` (cleaned up timezone logic)
- `TIMEZONE_FIX.md` (detailed documentation)
---

## Development  Dependencies & Requirements

### Core Dependencies
```json
{
  "react": "18.2.0",
  "react-native": "0.72.17",
  "@supabase/supabase-js": "^2.57.2",
  "react-native-chart-kit": "^6.12.0",
  "react-native-linear-gradient": "^2.8.3",
  "react-native-svg": "15.11.2",
  "react-native-vector-icons": "^10.2.0"
}
```

### Development Dependencies
- **TypeScript**: For type safety and better development experience
- **ESLint**: Code linting and formatting
- **Jest**: Testing framework
- **Babel**: JavaScript compilation
- **Metro**: React Native bundler

### System Requirements
- **Node.js**: Version 16 or higher
- **Android Studio**: For Android development
- **Java Development Kit (JDK)**: Version 11 or higher
- **Android SDK**: API level 23 or higher
- **Physical Android device or emulator**
---

## Install and Setup Guide

### Prerequisites
1. **Instal**l  [Node.js ](https://nodejs.org/) (v16 or higher)
2. **Install** [Android Studio](https://developer.android.com/studio)
3. **Set up Android development environment**:
   ```bash
   # Add to your PATH (Windows PowerShell)
   $env:ANDROID_HOME = "C:\Users\YourUsername\AppData\Local\Android\Sdk"
   $env:PATH += ";$env:ANDROID_HOME\platform-tools"
   ```

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vgzoidis/Smart_Hydroponic_Tower.git
   cd smart-hydroponic-tower-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure your ESP32 IP address**:
   Edit `src/utils/apiConfig.ts`:
   ```typescript
   export const API_CONFIG = {
     BASE_URL: 'http://YOUR_ESP32_IP_ADDRESS', // Replace with your ESP32's IP
     TIMEOUT: 8000,
     // ... rest of config
   };
   ```

4. **Configure Supabase (optional for data logging)**:
   Edit `src/utils/supabaseConfig.ts` with your Supabase credentials:
   ```typescript
   const SUPABASE_URL = 'your-supabase-url';
   const SUPABASE_ANON_KEY = 'your-supabase-anon-key';
   ```

5. **Start Metro bundler**:
   ```bash
   npm start
   ```

6. **Run on Android** (in a new terminal):
   ```bash
   npm run android
   ```

### Quick Installation Script
Run the provided PowerShell script:
```bash
.\quick-install.ps1
```

### Quick Setup with Pre-built APK (Only for plots or if using default WLAN setup)

If you want to get started quickly without building from source, you can install the pre-built APK directly on your Android device.

#### System Requirements
- **Android 6.0 (API level 23)** or higher
- **ARM64 or ARM** processor architecture
- **60 MB** free storage space
- **WiFi connection** to same network as your ESP32

#### Installation Steps

1. **Download the APK**:
   - Download the latest `smart-hydroponic-tower.apk` from the [Releases](https://github.com/vgzoidis/Smart_Hydroponic_Tower/releases) section
   - Or transfer the APK file to your Android device

2. **Enable Installation from Unknown Sources**:
   ```
   Settings → Security → Unknown Sources → Enable
   ```
   *Note: On newer Android versions, you'll be prompted to allow installation when you try to install the APK*

3. **Install the APK**:
   - Open your file manager and navigate to the downloaded APK
   - Tap on the APK file and select "Install"
   - Follow the installation prompts

#### Troubleshooting APK Installation

- Ensure your ESP32 and phone are on the same WiFi network
- Check if the webpage is available from a browser
- Verify the ESP32 IP address in the source code

### Initial Setup

1. **Connect your ESP32** to the same WiFi network as your mobile device
2. **Find your ESP32's IP address** from your router or ESP32 serial monitor
3. **Update the IP address** in `src/utils/apiConfig.ts`
4. **Build and Install** a version of the app with the updated IP
5. **Launch the app** on your Android device

---

## How It Works (Under the Hood)

### Architecture Overview

The app follows a **client-server architecture** with three main components:

1. **React Native Frontend** (this app)
2. **ESP32 Microcontroller** (hardware backend)
3. **Supabase Database** (data persistence)



### Data Flow

```
ESP32 Sensors → ESP32 WiFi → HTTP API → React Native App → Supabase Database
                                              ↕
                                  User Interface & Controls
```
### Database Schema (Supabase)
```sql
-- sensor_data table structure
CREATE TABLE sensor_data (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  timestamp BIGINT,
  co2_level NUMERIC,
  ph_level NUMERIC,
  water_temp NUMERIC,
  env_temp NUMERIC,
  humidity NUMERIC,
  light_level NUMERIC,
  ec_level NUMERIC,
  water_level BOOLEAN
);
```

**Note**: Timestamps use EET/EEST timezone but are stored with UTC markers. The app automatically handles this discrepancy.
### Key Algorithms & Logic

#### 1. **Real-time Data Fetching**
```typescript
// Automatic polling every 2 seconds with error handling
const fetchSensorData = useCallback(async () => {
  try {
    const response = await Promise.race([
      fetch(apiUrl, options),
      timeoutPromise // 8-second timeout
    ]);
    
    // Only update state if data actually changed (prevents unnecessary re-renders)
    setSensorData(prev => {
      const newData = processApiResponse(data);
      return JSON.stringify(prev) === JSON.stringify(newData) ? prev : newData;
    });
  } catch (error) {
    handleConnectionError(error);
  }
}, []);
```

#### 2. **Status Calculation Logic**
```typescript
export const getSensorStatus = (value: number, min: number, max: number) => {
  if (value >= min && value <= max) return 'good';
  if (value < min * 0.8 || value > max * 1.2) return 'critical';
  return 'warning';
};
```

#### 3. **Chart Data Processing with Timezone Correction**
The app processes raw sensor data into chart-friendly format:
```typescript
// Timezone-corrected data processing
const convertDbTimestampToLocalTime = (dbTimestamp: string): Date => {
  const utcDate = new Date(dbTimestamp);
  // Extract UTC components and use as local time
  return new Date(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth(),
    utcDate.getUTCDate(),
    utcDate.getUTCHours(), // Correct local hour
    utcDate.getUTCMinutes(),
    utcDate.getUTCSeconds()
  );
};

// Time-based data aggregation with corrected timestamps
const aggregatedData = sensorData.map(record => {
  const localDate = convertDbTimestampToLocalTime(record.created_at);
  return {
    label: getHourLabel(localDate), // Shows correct local time
    value: record.sensor_value
  };
});
```

#### 4. **Pump Control Logic**
```typescript
const togglePump = async () => {
  try {
    const response = await fetch('/pump/toggle', { method: 'POST' });
    // Optimistic UI update followed by data refetch
    await fetchSensorData();
  } catch (error) {
    // Revert UI state on error
  }
};
```



### Performance Optimizations

- **Memoized components** to prevent unnecessary re-renders
- **Optimistic UI updates** for responsive user experience
- **Data deduplication** to reduce API calls
- **Connection pooling** and timeout management

---

## Configuration

### Environment Variables

**ESP32 Configuration** (`src/utils/apiConfig.ts`):
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.100',  // Your ESP32 IP
  TIMEOUT: 8000,                     // Request timeout in ms
  ENDPOINTS: {
    SENSORS: '/sensors',
    PUMP_TOGGLE: '/pump/toggle',
    // ... other endpoints
  }
};
```

**Database Configuration** (`src/utils/supabaseConfig.ts`):
```typescript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

### Customization Options

**Sensor Thresholds** (modify in `sensorUtils.ts`):
- Water temperature: 18-25°C
- pH levels: 5.5-6.5
- EC levels: 1.2-2.0 mS/cm
- Environmental temperature: 20-28°C
- Humidity: 50-70%

**UI Theming** (`src/constants/Colors.ts`):
```typescript
export const Colors = {
  primary: '#2E7D32',
  good: '#4CAF50',
  warning: '#FF9800',
  critical: '#F44336',
  // ... customize colors
};
```

**Polling Intervals**:
- Real-time data: 2 seconds (configurable in App.tsx)
- Chart data: On-demand with caching

---
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

#### Primary Developer
- **Project Creator**: [Vasilis Zoidis / Iti Certh]
- **GitHub**: [@vgzoidis](https://github.com/vgzoidis)
- **Contact**: vgzoidis@ece.auth.gr

---

## Version History

### Current Version: v1.1 (Development - Timezone Fix Release)

**Features Implemented**:
-  Real-time sensor monitoring
-  Manual pump control
-  Historical data visualization
-  Basic automation settings
-  pH control system
-  Connection management
-  **NEW**: Timezone correction for EET/EEST timestamps

**Future features**:
- **Push Notifications**: Real-time alerts for critical conditions
- **Export Functionality**: CSV/PDF export of historical data
- **Configurable**: optimal variable ranges (from the settings tab)
- **Multi-timezone Support**: Configurable timezone settings
- **Multiple tower Support**: Ability to manage more than one towers
- **iOS** support
