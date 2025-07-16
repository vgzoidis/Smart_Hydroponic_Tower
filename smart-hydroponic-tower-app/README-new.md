# 🌱 Smart Hydroponic Tower App

An intuitive React Native dashboard for monitoring and controlling your hydroponic tower system.

## ✨ Features

- **📊 Real-time Dashboard** - Comprehensive sensor monitoring
- **🎨 Color-coded Status** - Green/Yellow/Red indicators for all sensors
- **🏗️ Tower Visualization** - Visual representation of your 5-level hydroponic tower
- **💧 Water System Monitoring** - Temperature, pH, level, and pump status
- **📱 Mobile-first Design** - Optimized for Android devices

## 🚀 Quick Install

1. **Connect your Android device** via USB with debugging enabled
2. **Run the install script:**
   ```powershell
   .\quick-install.ps1
   ```

The script will automatically:
- Build the latest APK
- Remove any previous version
- Install the new dashboard app
- Show installation status

## 📱 Dashboard Interface

### Sensor Monitoring
- **Light**: Optimal 150-300 lx
- **Temperature**: Optimal 20-26°C  
- **Humidity**: Optimal 40-60%
- **CO2**: Optimal 400-1000 ppm
- **Water Temp**: Optimal 18-25°C
- **pH**: Optimal 5.5-7.0

### Status Colors
- 🟢 **Green**: Values within optimal range
- 🟡 **Yellow**: Values slightly outside range
- 🔴 **Red**: Values requiring attention

## 📁 Project Structure

```
smart-hydroponic-tower-app/
├── App.tsx              # Main dashboard component
├── android/             # Android build configuration
├── quick-install.ps1    # One-command build & install
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## 🔧 Development

This is a React Native 0.72.17 project with:
- TypeScript for type safety
- Custom PNG icons (192x192px)
- Standalone APK builds (no Metro dependency)
- Color-coded sensor status system

## 📋 Requirements

- Node.js and npm
- Android SDK Platform Tools (ADB)
- Connected Android device or emulator

## 🎯 Usage

The app displays simulated sensor data that matches your ESP32 interface. In production, you would connect this to your actual ESP32 sensor readings via API calls or WebSocket connections.
