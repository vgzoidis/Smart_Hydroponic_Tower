#include "display.h"
#include "sensors.h"

// Initialize display using Arduino_GFX_Library
Arduino_DataBus *bus = new Arduino_ESP32SPI(TFT_DC, TFT_CS, TFT_SCLK, TFT_MOSI, -1 /* MISO not used */);
Arduino_GFX *gfx = new Arduino_ST7789(bus, TFT_RST, 0 /* rotation */, true /* IPS */, 240, 320);

void initDisplay() {
  gfx->begin();
  gfx->fillScreen(BLACK);
  
  // Stylized title with background and border
  gfx->fillRect(5, 0, 230, 32, 0x0320);        // Dark green background
  gfx->drawRect(5, 0, 230, 32, GREEN);         // Green border
  gfx->drawRect(6, 1, 228, 30, WHITE);         // White inner border
  
  // Main title text
  gfx->setTextColor(WHITE);
  gfx->setTextSize(2);
  gfx->setCursor(15, 9);
  gfx->print(" HYDROPONIC TOWER");
}

void drawHydroponicTower() {
  // Tower base (water reservoir) - moved to bottom of screen
  gfx->fillRect(80, 290, 80, 30, BLUE);        // Water reservoir (bottom edge at Y=320)
  gfx->drawRect(80, 290, 80, 30, WHITE);       // Reservoir outline
  
  // Tower main structure (PVC pipe) - adjusted to connect to new reservoir position
  gfx->fillRect(110, 90, 20, 200, DARKGREY);   // Main tower pipe (extends to Y=290)
  gfx->drawRect(110, 90, 20, 200, WHITE);      // Pipe outline
  
  // Growing levels (plant sites) - from bottom to top
  // Level 1 (bottom)
  gfx->fillCircle(100, 260, 15, BROWN);        // Growing cup
  gfx->fillCircle(140, 260, 15, BROWN);        // Growing cup
  gfx->fillCircle(100, 260, 8, GREEN);         // Plant
  gfx->fillCircle(140, 260, 8, GREEN);         // Plant
  
  // Level 2
  gfx->fillCircle(100, 220, 15, BROWN);        // Growing cup
  gfx->fillCircle(140, 220, 15, BROWN);        // Growing cup
  gfx->fillCircle(100, 220, 8, GREEN);         // Plant
  gfx->fillCircle(140, 220, 8, GREEN);         // Plant
  
  // Level 3
  gfx->fillCircle(100, 180, 15, BROWN);        // Growing cup
  gfx->fillCircle(140, 180, 15, BROWN);        // Growing cup
  gfx->fillCircle(100, 180, 8, GREEN);         // Plant
  gfx->fillCircle(140, 180, 8, GREEN);         // Plant
  
  // Level 4
  gfx->fillCircle(100, 140, 15, BROWN);        // Growing cup
  gfx->fillCircle(140, 140, 15, BROWN);        // Growing cup
  gfx->fillCircle(100, 140, 8, GREEN);         // Plant
  gfx->fillCircle(140, 140, 8, GREEN);         // Plant
  
  // Level 5 (top)
  gfx->fillCircle(100, 100, 15, BROWN);        // Growing cup
  gfx->fillCircle(140, 100, 15, BROWN);        // Growing cup
  gfx->fillCircle(100, 100, 8, GREEN);         // Plant
  gfx->fillCircle(140, 100, 8, GREEN);         // Plant
  
  // Water flow lines (showing nutrient flow)
  gfx->drawLine(120, 95, 120, 285, CYAN);      // Water flow down
  gfx->drawLine(115, 100, 115, 285, CYAN);     // Water flow down
  
  // Pump (in reservoir)
  gfx->fillRect(145, 295, 10, 10, RED);        // Pump
  gfx->drawRect(145, 295, 10, 10, WHITE);      // Pump outline
}

void drawSensorStatus() {
  // Set text size for readability
  gfx->setTextSize(1);
  
  // Clear and immediately redraw each sensor value to minimize flicker
  
  // Water Temperature - clear previous, then draw new immediately
  gfx->setTextColor(BLACK);  
  gfx->setCursor(15, 290);
  gfx->print("H2O: ");
  gfx->printf("%.1fC", previousSensors.waterTemp);
  
  uint16_t waterTempColor = getStatusColor(currentSensors.waterTemp, 18, 24, 15, 28, 12, 32);
  gfx->setTextColor(WHITE);
  gfx->setCursor(15, 290);
  gfx->print("H2O: ");
  gfx->setTextColor(waterTempColor);
  gfx->printf("%.1fC", currentSensors.waterTemp);
  
  // Water pH - clear previous, then draw new immediately
  gfx->setTextColor(BLACK);  
  gfx->setCursor(15, 300);
  gfx->print("pH: ");
  gfx->printf("%.1f", previousSensors.waterPH);
  
  uint16_t phColor = getStatusColor(currentSensors.waterPH, 5.8, 6.5, 5.5, 7.0, 5.0, 7.5);
  gfx->setTextColor(WHITE);
  gfx->setCursor(15, 300);
  gfx->print("pH: ");
  gfx->setTextColor(phColor);
  gfx->printf("%.1f", currentSensors.waterPH);
  
  // Water Level - clear previous, then draw new immediately
  gfx->setTextColor(BLACK);  
  gfx->setCursor(15, 310);
  gfx->print("Level: ");
  gfx->print(previousSensors.waterLevel ? "OK" : "LOW");
  
  uint16_t waterLevelColor = getStatusColorBool(currentSensors.waterLevel);
  gfx->setTextColor(WHITE);
  gfx->setCursor(15, 310);
  gfx->print("Level: ");
  gfx->setTextColor(waterLevelColor);
  gfx->print(currentSensors.waterLevel ? "OK" : "LOW");
  
  // Pump Status - clear previous, then draw new immediately
  gfx->setTextColor(BLACK);  
  gfx->setCursor(170, 295);
  gfx->print("Pump: ");
  gfx->print(previousSensors.pumpStatus ? "ON" : "OFF");
  
  gfx->setTextColor(WHITE);
  gfx->setCursor(170, 295);
  gfx->print("Pump: ");
  gfx->setTextColor(currentSensors.pumpStatus ? GREEN : RED);
  gfx->print(currentSensors.pumpStatus ? "ON" : "OFF");
  
  // Environment Temperature - clear previous, then draw new immediately
  gfx->setTextColor(BLACK);  
  gfx->setCursor(172, 98);
  gfx->print("Temp: ");
  gfx->printf("%.1fC", previousSensors.envTemp);
  
  uint16_t envTempColor = getStatusColor(currentSensors.envTemp, 20, 26, 18, 30, 15, 35);
  gfx->setTextColor(WHITE);
  gfx->setCursor(172, 98);
  gfx->print("Temp: ");
  gfx->setTextColor(envTempColor);
  gfx->printf("%.1fC", currentSensors.envTemp);
  
  // Environment Humidity - clear previous, then draw new immediately
  gfx->setTextColor(BLACK);  
  gfx->setCursor(172, 113);
  gfx->print("Hum: ");
  gfx->printf("%.0f%%", previousSensors.envHumidity);
  
  uint16_t humidityColor = getStatusColor(currentSensors.envHumidity, 50, 70, 40, 80, 30, 90);
  gfx->setTextColor(WHITE);
  gfx->setCursor(172, 113);
  gfx->print("Hum: ");
  gfx->setTextColor(humidityColor);
  gfx->printf("%.0f%%", currentSensors.envHumidity);
  
  // Light Level - clear previous, then draw new immediately
  gfx->setTextColor(BLACK);  
  gfx->setCursor(87, 73);
  gfx->print("Light: ");
  gfx->printf("%.0f", previousSensors.lightLevel);
  gfx->print(" lx");
  
  uint16_t lightColor = getStatusColor(currentSensors.lightLevel, 800, 1200, 600, 1500, 400, 1800);
  gfx->setTextColor(WHITE);
  gfx->setCursor(87, 73);
  gfx->print("Light: ");
  gfx->setTextColor(lightColor);
  gfx->printf("%.0f", currentSensors.lightLevel);
  gfx->print(" lx");
  
  // CO2 Level - clear previous, then draw new immediately
  gfx->setTextColor(BLACK);  
  gfx->setCursor(172, 183);
  gfx->print("CO2: ");
  gfx->printf("%.0f", previousSensors.co2Level);
  
  uint16_t co2Color = getStatusColor(currentSensors.co2Level, 400, 800, 300, 1000, 200, 1200);
  gfx->setTextColor(WHITE);
  gfx->setCursor(172, 183);
  gfx->print("CO2: ");
  gfx->setTextColor(co2Color);
  gfx->printf("%.0f", currentSensors.co2Level);
  
  // System Status (top left) - redraw once at the end
  gfx->fillCircle(15, 50, 8, GREEN);           // Status circle
  gfx->setTextColor(WHITE);
  gfx->setTextSize(2);
  gfx->setCursor(32, 44);
  gfx->print("System OK");
}

// Function to get status color based on value ranges
uint16_t getStatusColor(float value, float minGood, float maxGood, float minYellow, float maxYellow, float minOrange, float maxOrange) {
  // Check if value is in the optimal green range
  if (value >= minGood && value <= maxGood) return GREEN;
  
  // Check if value is in the warning yellow range
  if (value >= minYellow && value <= maxYellow) return YELLOW;
  
  // Check if orange range is specified and value is in orange range
  if (minOrange != -999 && maxOrange != -999) {
    if (value >= minOrange && value <= maxOrange) return ORANGE;
  }
  
  // Any value outside all specified ranges is critical (red)
  return RED;
}

// Function to get status color for boolean values
uint16_t getStatusColorBool(bool status) {
  return status ? GREEN : RED;  // true = OK (green), false = LOW (red)
}
