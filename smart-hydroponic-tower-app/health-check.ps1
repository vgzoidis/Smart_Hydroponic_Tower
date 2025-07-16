# Smart Hydroponic Tower - Build Health Check
# Run this script to verify build integrity before deploying

Write-Host "🔍 Smart Hydroponic Tower - Build Health Check" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

$issues = 0

# Check 1: Gradle Wrapper Files
Write-Host "1. Checking Gradle Wrapper..." -ForegroundColor Yellow
if (Test-Path "android\gradlew.bat") {
    $gradlewContent = Get-Content "android\gradlew.bat" -Raw
    if ($gradlewContent.Length -gt 100) {
        Write-Host "   ✅ gradlew.bat exists and has content" -ForegroundColor Green
    } else {
        Write-Host "   ❌ gradlew.bat is empty or corrupted" -ForegroundColor Red
        $issues++
    }
} else {
    Write-Host "   ❌ gradlew.bat missing" -ForegroundColor Red
    $issues++
}

if (Test-Path "android\gradle\wrapper\gradle-wrapper.jar") {
    Write-Host "   ✅ gradle-wrapper.jar exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ gradle-wrapper.jar missing" -ForegroundColor Red
    $issues++
}

# Check 2: Debug Keystore
Write-Host "2. Checking Debug Keystore..." -ForegroundColor Yellow
if (Test-Path "android\app\debug.keystore") {
    Write-Host "   ✅ debug.keystore exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ debug.keystore missing" -ForegroundColor Red
    $issues++
}

# Check 3: Essential Drawable Resources
Write-Host "3. Checking Drawable Resources..." -ForegroundColor Yellow
if (Test-Path "android\app\src\main\res\drawable\rn_edit_text_material.xml") {
    Write-Host "   ✅ rn_edit_text_material.xml exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ rn_edit_text_material.xml missing" -ForegroundColor Red
    $issues++
}

# Check 4: App Icons
Write-Host "4. Checking App Icons..." -ForegroundColor Yellow
if (Test-Path "android\app\src\main\res\mipmap-anydpi-v26\ic_launcher.xml") {
    Write-Host "   ✅ Adaptive app icons exist" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Modern adaptive icons missing" -ForegroundColor Yellow
}

if (Test-Path "android\app\src\main\res\mipmap-mdpi\ic_launcher.xml") {
    Write-Host "   ✅ Fallback app icons exist" -ForegroundColor Green
} else {
    Write-Host "   ❌ Fallback app icons missing" -ForegroundColor Red
    $issues++
}

# Check 5: AndroidManifest Icon References
Write-Host "5. Checking AndroidManifest..." -ForegroundColor Yellow
$manifestContent = Get-Content "android\app\src\main\AndroidManifest.xml" -Raw
if ($manifestContent -match 'android:icon="@mipmap/ic_launcher"') {
    Write-Host "   ✅ AndroidManifest uses proper icon reference" -ForegroundColor Green
} else {
    Write-Host "   ❌ AndroidManifest has incorrect icon reference" -ForegroundColor Red
    $issues++
}

# Check 6: Path Override Setting
Write-Host "6. Checking Path Override Setting..." -ForegroundColor Yellow
$gradlePropsContent = Get-Content "android\gradle.properties" -Raw
if ($gradlePropsContent -match 'android.overridePathCheck=true') {
    Write-Host "   ✅ Path override setting configured" -ForegroundColor Green
} else {
    Write-Host "   ❌ Path override setting missing" -ForegroundColor Red
    $issues++
}

# Summary
Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
if ($issues -eq 0) {
    Write-Host "🎉 ALL CHECKS PASSED! Build should be robust." -ForegroundColor Green
    Write-Host "Your app is ready for building and deployment." -ForegroundColor Green
} else {
    Write-Host "⚠️  FOUND $issues ISSUE(S) - Please fix before building!" -ForegroundColor Red
    Write-Host "Some issues may cause build failures." -ForegroundColor Yellow
}
Write-Host "=============================================" -ForegroundColor Green
