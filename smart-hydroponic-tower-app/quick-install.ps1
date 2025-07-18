# Smart Hydroponic Tower - Quick Install Script
# Builds and installs the dashboard app in one command

Write-Host "🌱 Smart Hydroponic Tower - Quick Install" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Check ADB connection
Write-Host "`n📱 Checking device connection..." -ForegroundColor Yellow
$devices = adb devices 2>$null
if ($devices -match "device$") {
    Write-Host "✅ Device connected" -ForegroundColor Green
} else {
    Write-Host "❌ No device found. Please connect your Android device." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Clean build cache first
#Write-Host "`n🧹 Cleaning build cache..." -ForegroundColor Yellow
#.\android\gradlew -p android clean
#Remove-Item -Recurse -Force "android\app\build" -ErrorAction SilentlyContinue
#Write-Host "✅ Cache cleared" -ForegroundColor Green

# Build APK
Write-Host "`n🔨 Building dashboard app..." -ForegroundColor Yellow
.\android\gradlew -p android assembleDebug

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Uninstall old version completely
Write-Host "`n🗑️ Removing old version..." -ForegroundColor Yellow
$result = adb uninstall com.smarthydroponictowerapp 2>$null
if ($result -eq "Success") {
    Write-Host "✅ Old version removed" -ForegroundColor Green
} else {
    Write-Host "ℹ️ No previous version found" -ForegroundColor Cyan
}

# Clear app data from device
Write-Host "🧹 Clearing app data..." -ForegroundColor Yellow
adb shell pm clear com.smarthydroponictowerapp 2>$null

# Install new version
Write-Host "`n📲 Installing new dashboard..." -ForegroundColor Yellow
$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
$installResult = adb install $apkPath

if ($installResult -match "Success") {
    Write-Host "✅ Dashboard installed!" -ForegroundColor Green
    
    # Get file info
    $apk = Get-Item $apkPath
    $sizeMB = [math]::Round($apk.Length / 1MB, 1)
    
    Write-Host "`n🎉 Installation Complete!" -ForegroundColor Green
    Write-Host "📦 Size: $sizeMB MB" -ForegroundColor White
    Write-Host "✨ New Features: Dashboard UI, Color-coded Sensors, Tower View" -ForegroundColor Cyan
    
    # Wait a moment then open app
    Write-Host "`n🚀 Opening app on device..." -ForegroundColor Green
    Start-Sleep -Seconds 2
    adb shell am start -n com.smarthydroponictowerapp/.MainActivity
} else {
    Write-Host "❌ Installation failed: $installResult" -ForegroundColor Red
}

# Add this at the very end of your script:
Write-Host "Opening app on device..." -ForegroundColor Green
adb shell am start -n com.smarthydroponictowerapp/.MainActivity
