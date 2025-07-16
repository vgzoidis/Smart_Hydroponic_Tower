#!/usr/bin/env pwsh
# Smart Hydroponic Tower App - Build and Install Script

Write-Host "🌱 Smart Hydroponic Tower App - Build and Install" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

# Check if ADB is available
try {
    adb version | Out-Null
    Write-Host "✅ ADB is available" -ForegroundColor Green
} catch {
    Write-Host "❌ ADB not found. Please install Android SDK Platform-Tools." -ForegroundColor Red
    exit 1
}

# Check if device/emulator is connected
$devices = adb devices | Select-String "device$"
if ($devices.Count -eq 0) {
    Write-Host "❌ No Android device or emulator found." -ForegroundColor Red
    Write-Host "   Please connect a device or start an emulator first." -ForegroundColor Yellow
    exit 1
}

Write-Host "📱 Found $($devices.Count) connected device(s)" -ForegroundColor Green
Write-Host ""

# Ask user which build type they want
Write-Host "🔧 Which build would you like to create?" -ForegroundColor Cyan
Write-Host "1) Debug build (faster, for testing)" -ForegroundColor Yellow
Write-Host "2) Release build (optimized, for production)" -ForegroundColor Yellow
$choice = Read-Host "Enter your choice (1 or 2)"

if ($choice -eq "2") {
    $buildType = "release"
    $scriptName = "deploy-release"
    Write-Host "� Building release version..." -ForegroundColor Cyan
} else {
    $buildType = "debug"
    $scriptName = "deploy-debug"
    Write-Host "🔧 Building debug version..." -ForegroundColor Cyan
}

Write-Host ""

# Run the complete build and deploy process
Write-Host "🔧 Running complete build and deploy process..." -ForegroundColor Cyan
try {
    npm run $scriptName
    Write-Host "✅ Build and installation completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Build or installation failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 4: Launch app
Write-Host "🔧 Launching app..." -ForegroundColor Cyan
try {
    adb shell am start -n com.smarthydroponictowerapp/.MainActivity
    Write-Host "✅ App launched successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not launch app automatically. Please launch it manually." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Build and installation complete!" -ForegroundColor Green
Write-Host "Your Smart Hydroponic Tower App is ready to use!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Note: This app uses bundled JavaScript and does NOT require Metro!" -ForegroundColor Blue
Write-Host "   You should see your hydroponic interface, not a Metro welcome screen." -ForegroundColor Blue
