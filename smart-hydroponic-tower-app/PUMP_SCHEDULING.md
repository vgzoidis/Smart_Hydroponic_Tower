# Pump Scheduling Feature Documentation

## Overview

The Smart Hydroponic Tower app now includes comprehensive pump scheduling functionality that allows you to:

- Toggle between automatic and manual pump modes
- Configure custom pump timing schedules
- Monitor real-time pump status with countdown timers
- View current pump configuration and operational status

## Features

### 1. Auto Mode Toggle
- **Auto Mode ON**: The pump operates according to the configured schedule (on-time/off-time cycles)
- **Auto Mode OFF**: Manual control mode - pump can be controlled via the dashboard toggle button

### 2. Pump Timing Configuration
- **On Time**: Duration (in minutes) the pump stays ON during each cycle
- **Off Time**: Duration (in minutes) the pump stays OFF between cycles
- Both values must be at least 1 minute

### 3. Real-time Status Display
The app shows detailed pump status information such as:
- `"ON (2m 34s until turning off)"` - Pump is currently running
- `"OFF (4m 47s until turning on)"` - Pump is in off cycle with countdown
- `"Manual Mode - OFF"` - Pump is in manual mode and currently off
- `"Manual Mode - ON"` - Pump is in manual mode and currently on

## How to Use

### Accessing Pump Settings
1. Open the Smart Hydroponic Tower app
2. Navigate to the **Settings** tab (bottom navigation)
3. Find the "Pump Configuration" section

### Configuring Automatic Scheduling
1. In the Settings screen, locate the "Auto Mode" toggle
2. Enable Auto Mode by sliding the toggle to ON
3. Set your desired timing:
   - **On Time**: How long the pump should run (e.g., 1 minute)
   - **Off Time**: How long to wait between pump cycles (e.g., 5 minutes)
4. Tap "Update Schedule" to apply the changes
5. The pump will immediately start following the new schedule

### Manual Control
1. Turn OFF Auto Mode using the toggle switch
2. Use the pump button on the Dashboard screen to manually control the pump
3. The pump will remain in the state you set until you change it

### Monitoring Status
- The "Current Status" field updates every 2 seconds
- Status shows whether pump is ON/OFF and time remaining in current cycle
- Green text indicates pump is running, gray text indicates pump is off

## API Integration

The app communicates with your ESP32 device using the following endpoints:

- `GET /pump/status` - Retrieves current pump status and configuration
- `PUT /pump/config` - Updates pump configuration (auto mode, timing)
- `POST /pump/toggle` - Toggles pump state (manual mode only)

### Changing Network Configuration
To use the app with a different ESP32 IP address:
1. Open `src/utils/apiConfig.ts`
2. Update the `BASE_URL` value to match your ESP32's IP address
3. Rebuild and reinstall the app

## Example Usage Scenarios

### Scenario 1: Quick Watering Every 5 Minutes
- Auto Mode: ON
- On Time: 1 minute
- Off Time: 5 minutes
- Result: Pump runs for 1 minute every 5 minutes

### Scenario 2: Deep Watering Twice Per Hour
- Auto Mode: ON  
- On Time: 3 minutes
- Off Time: 27 minutes
- Result: Pump runs for 3 minutes, then waits 27 minutes (30-minute cycle)

### Scenario 3: Manual Control for Testing
- Auto Mode: OFF
- Use Dashboard pump button to control manually
- Ideal for testing, maintenance, or irregular watering needs

## Troubleshooting

### Common Issues

**"Failed to fetch pump status"**
- Check WiFi connection
- Verify ESP32 is powered on and connected to network
- Confirm IP address in apiConfig.ts matches your ESP32

**Changes not taking effect**
- Ensure Auto Mode is enabled for scheduled operation
- Check that timing values are at least 1 minute
- Verify successful "Configuration updated" message appears

**Status not updating**
- Status refreshes every 2 seconds automatically
- Pull down to refresh if needed
- Check network connection

### Network Configuration
The default IP address is set to `10.65.171.23`. If your ESP32 has a different IP:
1. Check your router's connected devices
2. Note the ESP32's IP address
3. Update `src/utils/apiConfig.ts`
4. Rebuild the app

## Technical Details

### Status Text Format
The ESP32 returns status text in the format:
- `"ON (Xm Ys until turning off)"` for active pump
- `"OFF (Xm Ys until turning on)"` for scheduled pump  
- `"Manual Mode - ON/OFF"` for manual control

### Configuration Storage
- Pump configurations are stored on the ESP32 device
- Settings persist through power cycles
- App retrieves current settings on startup

### Real-time Updates
- Status updates every 2 seconds
- Configuration changes take effect immediately
- Network timeouts handled gracefully with error messages
