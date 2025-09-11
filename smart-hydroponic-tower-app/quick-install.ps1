# Smart Hydroponic Tower - Quick Install Script
# Builds and installs the dashboard app in one command
#
# Usage:
#   .\quick-install.ps1          # Standard install
#   .\quick-install.ps1 -Fast    # Skip uninstall (faster)
#   .\quick-install.ps1 -Clean   # Clean build from scratch

Write-Host "🌱 Smart Hydroponic Tower - Quick Install" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

if ($Fast) {
    Write-Host "⚡ Fast Mode: Enabled" -ForegroundColor Cyan
}
if ($Clean) {
    Write-Host "🧹 Clean Mode: Enabled" -ForegroundColor Cyan
}

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

# Check if we need a clean build (optional parameter)
param(
    [switch]$Clean = $false,
    [switch]$Fast = $false
)

if ($Clean) {
    Write-Host "`n🧹 Cleaning build cache..." -ForegroundColor Yellow
    .\android\gradlew -p android clean
    Remove-Item -Recurse -Force "android\app\build" -ErrorAction SilentlyContinue
    Write-Host "✅ Cache cleared" -ForegroundColor Green
}

# Build APK with optimizations
Write-Host "`n🔨 Building dashboard app..." -ForegroundColor Yellow
if ($Fast) {
    # Fast build with parallel execution and daemon
    .\android\gradlew -p android assembleDebug --parallel --daemon --build-cache
} else {
    # Standard build with optimizations
    .\android\gradlew -p android assembleDebug --parallel --daemon
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Uninstall old version completely (skip if fast mode)
if (-not $Fast) {
    Write-Host "`n🗑️ Removing old version..." -ForegroundColor Yellow
    $result = adb uninstall com.smarthydroponictowerapp 2>$null
    if ($result -eq "Success") {
        Write-Host "✅ Old version removed" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ No previous version found" -ForegroundColor Cyan
    }
} else {
    Write-Host "`n⚡ Fast mode: Skipping uninstall..." -ForegroundColor Cyan
}

# Clear app data from device (skip if fast mode)
if (-not $Fast) {
    Write-Host "🧹 Clearing app data..." -ForegroundColor Yellow
    adb shell pm clear com.smarthydroponictowerapp 2>$null
}

# Install new version
Write-Host "`n📲 Installing new dashboard..." -ForegroundColor Yellow
$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"

# Check if APK exists
if (-not (Test-Path $apkPath)) {
    Write-Host "❌ APK not found at $apkPath" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Show APK info before installing
$apk = Get-Item $apkPath
$sizeMB = [math]::Round($apk.Length / 1MB, 1)
Write-Host "📦 Installing APK: $sizeMB MB" -ForegroundColor White

$installResult = adb install -r $apkPath  # -r flag for reinstall/replace

if ($installResult -match "Success") {
    Write-Host "✅ Dashboard installed!" -ForegroundColor Green
    
    Write-Host "`n🎉 Installation Complete!" -ForegroundColor Green
    Write-Host "📦 Size: $sizeMB MB" -ForegroundColor White
    Write-Host "✨ Features: Dashboard UI, Color-coded Sensors, Tower View" -ForegroundColor Cyan
    
    # Wait a moment then open app
    Write-Host "`n🚀 Opening app on device..." -ForegroundColor Green
    Start-Sleep -Seconds 1
    adb shell am start -n com.smarthydroponictowerapp/.MainActivity
    
    Write-Host "`n💡 Speed up future installs:" -ForegroundColor Yellow
    Write-Host "   .\quick-install.ps1 -Fast    (Skip uninstall/clear data)" -ForegroundColor Gray
    Write-Host "   .\quick-install.ps1 -Clean   (Full clean build)" -ForegroundColor Gray
} else {
    Write-Host "❌ Installation failed: $installResult" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}


