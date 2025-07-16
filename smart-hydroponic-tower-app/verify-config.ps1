#!/usr/bin/env pwsh
# Smart Hydroponic Tower App - Configuration Verification Script

Write-Host "🔍 Smart Hydroponic Tower App - Configuration Verification" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green
Write-Host ""

$allGood = $true

# Check 1: MainApplication.java has developer support disabled
Write-Host "🔧 Checking MainApplication.java configuration..." -ForegroundColor Cyan
$mainAppPath = "android\app\src\main\java\com\smarthydroponictowerapp\MainApplication.java"
if (Test-Path $mainAppPath) {
    $content = Get-Content $mainAppPath -Raw
    if ($content -match "return false;") {
        Write-Host "✅ Developer support is correctly disabled" -ForegroundColor Green
    } else {
        Write-Host "❌ Developer support is NOT disabled - app may try to connect to Metro" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "❌ MainApplication.java not found" -ForegroundColor Red
    $allGood = $false
}

# Check 2: JavaScript bundle exists
Write-Host "🔧 Checking for JavaScript bundle..." -ForegroundColor Cyan
$bundlePath = "android\app\src\main\assets\index.android.bundle"
if (Test-Path $bundlePath) {
    $bundleSize = (Get-Item $bundlePath).Length
    Write-Host "✅ JavaScript bundle exists ($([math]::Round($bundleSize/1KB, 2)) KB)" -ForegroundColor Green
} else {
    Write-Host "❌ JavaScript bundle not found - run 'npm run build-bundle' first" -ForegroundColor Red
    $allGood = $false
}

# Check 3: build.gradle has correct React Native configuration
Write-Host "🔧 Checking build.gradle configuration..." -ForegroundColor Cyan
$buildGradlePath = "android\app\build.gradle"
if (Test-Path $buildGradlePath) {
    $content = Get-Content $buildGradlePath -Raw
    if ($content -match "debuggableVariants = \[\]") {
        Write-Host "✅ Build configuration forces bundling for all variants" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Build configuration may allow Metro connections" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ build.gradle not found" -ForegroundColor Red
    $allGood = $false
}

# Check 4: Network security config is production-ready
Write-Host "🔧 Checking network security configuration..." -ForegroundColor Cyan
$netConfigPath = "android\app\src\main\res\xml\network_security_config.xml"
if (Test-Path $netConfigPath) {
    $content = Get-Content $netConfigPath -Raw
    if ($content -match 'cleartextTrafficPermitted="false"') {
        Write-Host "✅ Network security is configured for production" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Network security allows cleartext traffic" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Network security config not found" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""
if ($allGood) {
    Write-Host "🎉 All configurations look good! Your app should work without Metro." -ForegroundColor Green
    Write-Host "   To build and install: .\build-and-install.ps1" -ForegroundColor Blue
} else {
    Write-Host "⚠️  Some issues found. Please review the configuration." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📝 Quick commands:" -ForegroundColor Cyan
Write-Host "   npm run deploy-debug    - Build and install debug version" -ForegroundColor White
Write-Host "   npm run deploy-release  - Build and install release version" -ForegroundColor White
Write-Host "   .\build-and-install.ps1 - Interactive build and install" -ForegroundColor White
