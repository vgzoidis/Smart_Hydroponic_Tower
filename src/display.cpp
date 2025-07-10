#include "display.h"
#include "sensors.h"

// Initialize display using Arduino_GFX_Library
Arduino_DataBus *bus = new Arduino_ESP32SPI(TFT_DC, TFT_CS, TFT_SCLK, TFT_MOSI, -1 /* MISO not used */);
Arduino_GFX *gfx = new Arduino_ST7789(bus, TFT_RST, 0 /* rotation */, true /* IPS */, 240, 320);

// Startup flag to show initial status
static bool isStartup = true;

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
  
   // Growing levels (plant sites) - using loop
  int plantY[] = {260, 220, 180, 140, 100};
  for (int i = 0; i < 5; i++) {
    gfx->fillCircle(100, plantY[i], 15, BROWN);  // Left growing cup
    gfx->fillCircle(140, plantY[i], 15, BROWN);  // Right growing cup
    gfx->fillCircle(100, plantY[i], 8, GREEN);   // Left plant
    gfx->fillCircle(140, plantY[i], 8, GREEN);   // Right plant
  }
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

  //Clear previous value, then draw new immediately to minimize flicker

  // Water Temperature
  gfx->setTextColor(BLACK);  
  gfx->setCursor(15, 290);
  gfx->printf("H2O: %.1fC", previousSensors.waterTemp);
  
  uint16_t waterTempColor = getStatusColor(currentSensors.waterTemp, 18, 22, 25, 15, 28, 12);
  gfx->setTextColor(WHITE);
  gfx->setCursor(15, 290);
  gfx->print("H2O: ");
  gfx->setTextColor(waterTempColor);
  gfx->printf("%.1fC", currentSensors.waterTemp);
  
  // Water pH
  gfx->setTextColor(BLACK);  
  gfx->setCursor(15, 300);
  gfx->printf("pH: %.1f", previousSensors.waterPH);
  
  uint16_t phColor = getStatusColor(currentSensors.waterPH, 5.5, 6.5, 5, 7, 4, 8);
  gfx->setTextColor(WHITE);
  gfx->setCursor(15, 300);
  gfx->print("pH: ");
  gfx->setTextColor(phColor);
  gfx->printf("%.1f", currentSensors.waterPH);
  
  // Water Level
  gfx->setTextColor(BLACK);  
  gfx->setCursor(15, 310);
  gfx->printf("Level: %s", previousSensors.waterLevel ? "OK" : "LOW");
  
  uint16_t waterLevelColor = getStatusColor(currentSensors.waterLevel);
  gfx->setTextColor(WHITE);
  gfx->setCursor(15, 310);
  gfx->print("Level: ");
  gfx->setTextColor(waterLevelColor);
  gfx->print(currentSensors.waterLevel ? "OK" : "LOW");
  
  // Pump Status
  gfx->setTextColor(BLACK);  
  gfx->setCursor(170, 295);
  gfx->printf("Pump: %s", previousSensors.pumpStatus ? "ON" : "OFF");
  
  uint16_t pumpStatusColor = getStatusColor(currentSensors.pumpStatus);
  gfx->setTextColor(WHITE);
  gfx->setCursor(170, 295);
  gfx->print("Pump: ");
  gfx->setTextColor(pumpStatusColor);
  gfx->print(currentSensors.pumpStatus ? "ON" : "OFF");
  
  // Environment Temperature
  gfx->setTextColor(BLACK);  
  gfx->setCursor(162, 105);
  gfx->printf("Temp: %.1fC", previousSensors.envTemp);
  
  uint16_t envTempColor = getStatusColor(currentSensors.envTemp, 15, 25, 13, 30, 10, 33);
  gfx->setTextColor(WHITE);
  gfx->setCursor(162, 105);
  gfx->print("Temp: ");
  gfx->setTextColor(envTempColor);
  gfx->printf("%.1fC", currentSensors.envTemp);
  
  // Environment Humidity
  gfx->setTextColor(BLACK);  
  gfx->setCursor(162, 120);
  gfx->printf("Hum: %.0f%%", previousSensors.envHumidity);
  
  uint16_t humidityColor = getStatusColor(currentSensors.envHumidity, 50, 70, 35, 85, 25, 95);
  gfx->setTextColor(WHITE);
  gfx->setCursor(162, 120);
  gfx->print("Hum: ");
  gfx->setTextColor(humidityColor);
  gfx->printf("%.0f%%", currentSensors.envHumidity);
  
  // Light Level
  gfx->setTextColor(BLACK);  
  gfx->setCursor(85, 72);
  gfx->printf("Light: %.0f lx", previousSensors.lightLevel);
  
  uint16_t lightColor = getStatusColor(currentSensors.lightLevel, 10, 40000, 5, 50000, 2, 90000);
  gfx->setTextColor(WHITE);
  gfx->setCursor(85, 72);
  gfx->print("Light: ");
  gfx->setTextColor(lightColor);
  gfx->printf("%.0f lx", currentSensors.lightLevel);
  
  // CO2 Level
  gfx->setTextColor(BLACK);  
  gfx->setCursor(162, 167);
  gfx->printf("CO2: %.0fppm", previousSensors.co2Level);
  
  uint16_t co2Color = getStatusColor(currentSensors.co2Level, 400, 1500, 200, 1800, 100, 2200);
  gfx->setTextColor(WHITE);
  gfx->setCursor(162, 167);
  gfx->print("CO2: ");
  gfx->setTextColor(co2Color);
  gfx->printf("%.0fppm", currentSensors.co2Level);
  
  // Calculate overall system status based on worst sensor (excluding pump)
  uint16_t systemStatusColor = GREEN; // Start with best status
  const char* systemStatusText = "System OK";
  
  // Check if this is the first startup
  if (isStartup) {
    systemStatusColor = BLUE;
    systemStatusText = "Start up";
    isStartup = false; // Clear startup flag after first display
  } else {
    // Check all sensor colors and find the worst one
    uint16_t sensorColors[] = {waterTempColor, phColor, waterLevelColor, envTempColor, humidityColor, lightColor, co2Color};
    
    for (int i = 0; i < 7; i++) {
      if (sensorColors[i] == RED) {
        systemStatusColor = RED;
        systemStatusText = "Critical";
        break; // Red is worst, no need to check further
      } else if (sensorColors[i] == ORANGE && systemStatusColor != RED) {
        systemStatusColor = ORANGE;
        systemStatusText = "Warning";
      } else if (sensorColors[i] == YELLOW && systemStatusColor != RED && systemStatusColor != ORANGE) {
        systemStatusColor = YELLOW;
        systemStatusText = "Caution";
      }
    }
  }
  
  // Clear previous system status text with a black rectangle
  gfx->fillRect(32, 44, 120, 16, BLACK); // Clear text area (width: 120px, height: 16px for size 2 text)
  
  // System Status (top left) - color matches worst sensor status
  gfx->fillCircle(15, 50, 8, systemStatusColor);  // Dynamic status circle color
  gfx->setTextColor(WHITE);
  gfx->setTextSize(2);
  gfx->setCursor(32, 44);
  gfx->print(systemStatusText);
}

// Function to get status color based on value ranges (float)
uint16_t getStatusColor(float value, float minGood, float maxGood, float minYellow, float maxYellow, float minOrange, float maxOrange) {
    if (value >= minGood && value <= maxGood) return GREEN;
    if (value >= minYellow && value <= maxYellow) return YELLOW;
    if (value >= minOrange && value <= maxOrange) return ORANGE;
    return RED;
}

// Overloaded function to get status color for boolean values
uint16_t getStatusColor(bool status) {
    return status ? GREEN : RED;
}
