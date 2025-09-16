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

### Recent Updates & Fixes

#### ⭐ **Timezone Fix Implementation**
**Problem Solved**: Database timestamps were displaying 3 hours ahead of actual recording time.

**Root Cause**: Database stores timestamps as `2024-09-16T17:00:00+00:00` (marked as UTC) but they actually represent local EET/EEST time. JavaScript was interpreting them as UTC and converting to system timezone.

**Solution**: New `timezoneUtils.ts` extracts UTC time components and uses them as local time components:
```typescript
// Before: 17:00 EET data showed as 20:00 (wrong)
// After: 17:00 EET data shows as 17:00 (correct)
const localDate = new Date(
  utcDate.getUTCFullYear(),
  utcDate.getUTCMonth(),
  utcDate.getUTCDate(),
  utcDate.getUTCHours(), // Correct local hour
  utcDate.getUTCMinutes(),
  utcDate.getUTCSeconds()
);
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

### Component Interaction

1. **App.tsx** manages global state and real-time data fetching
2. **Screen components** receive data as props and handle user interactions
3. **Utility functions** process data and manage API communications
4. **UI components** provide reusable interface elements

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

## Contributing Guide

### Development Workflow

1. **Fork the repository** on GitHub
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** following the code style guidelines
4. **Test thoroughly** on physical device
5. **Submit a pull request** with detailed description

### Code Style Guidelines

- **TypeScript**: Use strict typing, avoid `any`
- **Component Structure**: Functional components with hooks
- **Naming**: Use descriptive names, PascalCase for components
- **File Organization**: Group related functionality
- **Comments**: Document complex logic and API interactions

### Areas for Contribution

- **New sensor integrations** (soil moisture, nutrients, etc.)
- **Enhanced data visualization** (3D charts, AR features)
- **iOS support** (currently Android-only)
- **Notification system** for alerts
- **Machine learning** for growth predictions
- **Multi-tower support** for commercial operations

### Testing

```bash
# Run tests
npm test

# Run linter
npm run lint

# Type checking
npx tsc --noEmit
```

---

## Troubleshooting & Common Issues

### Connection Issues

**Problem**: App shows "Connection Error"
**Solutions**:
1. Verify ESP32 and phone are on same WiFi network
2. Check ESP32 IP address in `apiConfig.ts`
3. Ensure ESP32 web server is running
4. Test ESP32 endpoints in browser: `http://ESP32_IP/sensors`

**Problem**: Intermittent connectivity
**Solutions**:
1. Increase timeout value in `apiConfig.ts`
2. Check WiFi signal strength
3. Restart ESP32 and router

### Performance Issues

**Problem**: App is slow or laggy
**Solutions**:
1. Close other apps to free memory
2. Restart the React Native app
3. Clear Metro cache: `npx react-native start --reset-cache`

**Problem**: Charts not loading
**Solutions**:
1. Check Supabase configuration
2. Verify internet connection
3. Check database permissions

### Build Issues

**Problem**: Android build fails
**Solutions**:
```bash
# Clean build
cd android
./gradlew clean
cd ..

# Reset Metro cache
npx react-native start --reset-cache

# Rebuild
npm run android
```

**Problem**: Dependencies not installing
**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules
npm install
```

### Data Issues

**Problem**: Sensor readings appear incorrect
**Solutions**:
1. Check sensor calibration on ESP32
2. Verify API response format
3. Check sensor status thresholds in `sensorUtils.ts`

**Problem**: Historical data missing
**Solutions**:
1. Verify Supabase connection
2. Check ESP32 data logging functionality
3. Review database table structure

**Problem**: Chart timestamps showing wrong time (FIXED)**
**Solution**: The app now includes timezone correction utilities that handle EET/EEST timestamps correctly. See `TIMEZONE_FIX.md` for details.

**Problem**: Chart data not aggregating properly
**Solutions**:
1. Check `PlottingScreen.tsx` aggregation logic
2. Verify database date format consistency
3. Ensure timezone conversion is working correctly

---

## License & Credits

### License
This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Credits

**Development Team**:
- **Primary Developer**: [Your Name]
- **Hardware Integration**: ESP32 Development Team
- **Database Design**: Supabase Integration Team

**Technologies Used**:
- **React Native**: Cross-platform mobile development
- **Supabase**: Backend-as-a-Service for data storage
- **ESP32**: Microcontroller platform
- **Chart Kit**: Data visualization library

### Acknowledgments

- **React Native Community** for excellent documentation and support
- **Supabase Team** for providing robust backend services
- **Open Source Contributors** for various libraries used in this project
- **Hydroponic Growing Community** for domain knowledge and requirements

### References

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Supabase Documentation](https://supabase.com/docs)
- [ESP32 Arduino Core](https://github.com/espressif/arduino-esp32)
- [Hydroponic Growing Guidelines](https://extension.oregonstate.edu/sites/default/files/documents/1/hydroponiclettuceproduction.pdf)

---

## Version History

### Current Version: v1.1 (Development - Timezone Fix Release)

**Features Implemented**:
- ✅ Real-time sensor monitoring
- ✅ Manual pump control
- ✅ Historical data visualization
- ✅ Basic automation settings
- ✅ pH control system
- ✅ Connection management
- ✅ **NEW**: Timezone correction for EET/EEST timestamps
- ✅ **NEW**: Enhanced chart data processing
- ✅ **NEW**: Improved time-based data aggregation

**Recent Fixes (v1.1)**:
- 🐛 **Fixed**: Chart timestamps now display correct local time (EET/EEST)
- 🐛 **Fixed**: Database timezone handling corrected
- 🐛 **Fixed**: Time range aggregation works properly with local timestamps
- 📚 **Added**: Comprehensive timezone fix documentation

**Current Limitations**:
- Android only (iOS support planned)
- Single tower support
- Basic notification system

### Planned Features (v2.0 - Next Release)

**Near-term Goals (Next 1-2 months)**:
- 🔄 **iOS Support**: Complete React Native iOS build configuration
- 🔄 **Push Notifications**: Real-time alerts for critical conditions
- 🔄 **Offline Mode**: Local data caching when connection is lost
- 🔄 **Enhanced Charts**: More chart types and statistical analysis
- 🔄 **Export Functionality**: CSV/PDF export of historical data
- 🔄 **Multi-timezone Support**: Configurable timezone settings

### Future Roadmap (v1.0.0 - Production Release)

**Medium-term Goals (3-6 months)**:
- 🔮 **Multi-Tower Support**: Manage multiple hydroponic systems
- 🔮 **Plant Database**: Crop-specific growing recommendations
- 🔮 **Machine Learning**: Predictive analytics for optimal growing
- 🔮 **Social Features**: Share growing data with community
- 🔮 **Commercial Features**: Scalability for greenhouse operations

**Long-term Vision (6+ months)**:
- 🚀 **IoT Integration**: Support for additional sensor types
- 🚀 **Cloud Infrastructure**: Scalable backend for enterprise use
- 🚀 **AI Assistant**: Intelligent growing recommendations
- 🚀 **Marketplace Integration**: Connect with suppliers and buyers
- 🚀 **Augmented Reality**: AR visualization of plant health

### Version Control

**Semantic Versioning** (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes to API or core functionality
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes and minor improvements

**Release Schedule**:
- **Weekly**: Development builds for testing
- **Monthly**: Feature releases with new functionality
- **Quarterly**: Major version releases with significant updates

---

## Getting Help

### Support Channels

**Documentation**: This README and inline code comments
**Issues**: [GitHub Issues](https://github.com/vgzoidis/Smart_Hydroponic_Tower/issues)
**Community**: Join our growing community of hydroponic enthusiasts

### Reporting Bugs

When reporting bugs, please include:
1. **Device information** (Android version, device model)
2. **App version** and build number
3. **Steps to reproduce** the issue
4. **Expected vs actual behavior**
5. **Screenshots or logs** if applicable

### Feature Requests

We welcome feature requests! Please provide:
1. **Use case description** - what problem does this solve?
2. **Proposed solution** - how should it work?
3. **Priority level** - how important is this feature?
4. **Implementation ideas** - any technical considerations

---

**Happy Growing! 🌱** 

*Transform your hydroponic experience with data-driven automation and real-time monitoring.*
