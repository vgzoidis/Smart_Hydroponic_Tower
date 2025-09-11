# Smart Hydroponic Tower - Super Fast Development Install
# For rapid development iterations - minimal checks, maximum speed

Write-Host "⚡ SUPER FAST Dev Install" -ForegroundColor Yellow
Write-Host "========================" -ForegroundColor Yellow

# Quick device check
$devices = adb devices 2>$null
if (-not ($devices -match "device$")) {
    Write-Host "❌ No device connected!" -ForegroundColor Red
    exit 1
}

Write-Host "🔨 Fast build..." -ForegroundColor Cyan
.\android\gradlew -p android assembleDebug --parallel --daemon --build-cache --offline 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed - trying online..." -ForegroundColor Yellow
    .\android\gradlew -p android assembleDebug --parallel --daemon --build-cache
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "📱 Installing..." -ForegroundColor Cyan
$result = adb install -r android\app\build\outputs\apk\debug\app-debug.apk 2>$null

if ($result -match "Success") {
    Write-Host "✅ Installed! Opening..." -ForegroundColor Green
    adb shell am start -n com.smarthydroponictowerapp/.MainActivity 2>$null
} else {
    Write-Host "❌ Install failed: $result" -ForegroundColor Red
}
