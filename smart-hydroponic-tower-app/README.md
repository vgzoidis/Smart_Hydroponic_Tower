# Smart Hydroponic Tower App

A React Native mobile application for monitoring and controlling smart hydroponic tower systems.

## 🌱 Features

- **Dashboard**: Real-time monitoring of your hydroponic system
- **Water System**: Monitor water levels, pH, and nutrient concentration
- **Lighting Control**: Manage LED grow lights and schedules
- **Environment**: Track temperature, humidity, and air quality
- **Plant Tracking**: Monitor plant growth and health
- **Alerts**: Receive notifications for system issues

## 📋 Prerequisites

Before you can run this app, you need to install:

1. **Node.js** (version 16 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **Android Development Environment**
   - Install [Android Studio](https://developer.android.com/studio)
   - Set up Android SDK and emulator
   - Configure environment variables (ANDROID_HOME)
   - Install Android SDK Build-Tools and Platform-Tools

## 🚀 Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Connect your Android device or start an emulator**
   - Enable USB debugging on your device
   - Or start an Android emulator from Android Studio

3. **Build and deploy the app**
   ```bash
   npm run deploy-debug
   ```
   OR for release version:
   ```bash
   npm run deploy-release
   ```
   OR use the interactive script:
   ```bash
   .\build-and-install.ps1
   ```

4. **Verify configuration (optional)**
   ```bash
   .\verify-config.ps1
   ```

## 📱 Development Commands

- `npm run build-bundle` - Create JavaScript bundle for standalone operation
- `npm run build-android-debug` - Build debug Android APK
- `npm run build-android-release` - Build release Android APK
- `npm run deploy-debug` - Complete debug build and deploy process
- `npm run deploy-release` - Complete release build and deploy process
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## ✅ Metro-Free Guarantee

This app is configured to work **completely independently** without requiring Metro bundler:

- ✅ **Developer support disabled** - No Metro connection attempts
- ✅ **JavaScript bundled** - All code embedded in APK
- ✅ **Production network config** - No development server dependencies
- ✅ **Forced bundling** - Build system always uses bundled JS

**You should see your hydroponic interface, NOT a Metro welcome screen!**

## 🏗️ Project Structure

```
├── App.tsx                 # Main application component
├── android/                # Android-specific files
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## 🔧 Building for Production

This app is configured to work as a standalone application without requiring a Metro development server. The JavaScript code is bundled directly into the APK for optimal performance and reliability.

## 📄 License

This project is licensed under the MIT License.
   npm start
   ```

4. **Run on Android**
   ```bash
   npm run android
   ```

5. **Run on iOS** (Mac only)
   ```bash
   npm run ios
   ```

## 🛠️ Development Setup in VS Code

### Recommended Extensions
- React Native Tools
- TypeScript Nightly
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint

### Debugging
1. Install React Native Tools extension
2. Set breakpoints in your code
3. Use "Debug Android" or "Debug iOS" from VS Code command palette

## 📱 Project Structure

```
SmartHydroponicTowerApp/
├── App.tsx              # Main app component
├── index.js             # App entry point
├── package.json         # Dependencies and scripts
├── android/             # Android-specific code
├── ios/                 # iOS-specific code (when running on Mac)
├── src/                 # Source code
│   ├── components/      # Reusable components
│   ├── screens/         # App screens
│   ├── services/        # API and data services
│   └── utils/           # Utility functions
└── __tests__/           # Test files
```

## 🔧 Available Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## 📦 Key Dependencies

- **React Native**: Cross-platform mobile framework
- **TypeScript**: Type-safe JavaScript
- **React Navigation**: Navigation library
- **React Native Screens**: Native navigation components

## 🚨 Troubleshooting

### Common Issues

1. **Metro bundler not starting**
   - Clear cache: `npx react-native start --reset-cache`

2. **Android build issues**
   - Clean project: `cd android && ./gradlew clean && cd ..`
   - Rebuild: `npm run android`

3. **iOS build issues** (Mac only)
   - Clean build folder in Xcode
   - Reinstall pods: `cd ios && pod install && cd ..`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🌐 Resources

- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [React Navigation Documentation](https://reactnavigation.org/)
