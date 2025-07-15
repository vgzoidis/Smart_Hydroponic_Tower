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

  printSystemStatus(BLUE, "Start up"); // Initial status message

  gfx->setTextSize(1); // Labels
  gfx->setCursor(15, 290); gfx->print("H2O: ");
  gfx->setCursor(15, 300); gfx->print("pH: ");
  gfx->setCursor(15, 310); gfx->print("Level: ");
  gfx->setCursor(170, 295); gfx->print("Pump: ");
  gfx->setCursor(162, 105); gfx->print("Temp: ");
  gfx->setCursor(162, 120); gfx->print("Hum: ");
  gfx->setCursor(85, 72);   gfx->print("Light: ");
  gfx->setCursor(162, 167); gfx->print("CO2: ");

  // Draw hydroponic tower structure
  gfx->fillRect(80, 290, 80, 30, BLUE);        // Water reservoir (bottom edge at Y=320)
  gfx->drawRect(80, 290, 80, 30, WHITE);       // Reservoir outline
  gfx->fillRect(110, 90, 20, 200, DARKGREY);   // Main tower pipe (extends to Y=290)
  gfx->drawRect(110, 90, 20, 200, WHITE);      // Pipe outline
  int platX[] = {100, 140}; int plantY[] = {260, 220, 180, 140, 100}; // Plant positions
  for (int i = 0; i < 5; i++) {
    for (int j = 0; j < 2; j++) {
      gfx->fillCircle(platX[j], plantY[i], 15, BROWN);  // Growing cup
      gfx->fillCircle(platX[j], plantY[i], 8, GREEN);   // Plant
    }
  }
  gfx->drawLine(120, 95, 120, 285, CYAN);      // Water flow line
  gfx->drawLine(115, 100, 115, 285, CYAN);     // Water flow line
  gfx->fillRect(145, 295, 10, 10, RED);        // Pump (in reservoir)
  gfx->drawRect(145, 295, 10, 10, WHITE);      // Pump outline
}

void drawSensorStatus() {
  // Get all status colors at the start (EDIT THESE FOR YOUR SENSOR RANGES)
  uint16_t waterTempColor  = getStatusColor(currentSensors.waterTemp, 18, 22, 25, 15, 28, 12);
  uint16_t phColor         = getStatusColor(currentSensors.waterPH, 5.5, 6.5, 5, 7, 4, 8);
  uint16_t waterLevelColor = getStatusColor(currentSensors.waterLevel);
  uint16_t pumpStatusColor = getStatusColor(currentSensors.pumpStatus);
  uint16_t envTempColor    = getStatusColor(currentSensors.envTemp, 15, 25, 13, 30, 10, 33);
  uint16_t humidityColor   = getStatusColor(currentSensors.envHumidity, 50, 70, 35, 85, 25, 95);
  uint16_t lightColor      = getStatusColor(currentSensors.lightLevel, 10, 40000, 5, 50000, 2, 90000);
  uint16_t co2Color        = getStatusColor(currentSensors.co2Level, 400, 1500, 200, 1800, 100, 2200);

  // Clear previous values (draw in BLACK)
  gfx->setTextSize(1);
  gfx->setTextColor(BLACK);
  gfx->setCursor(45, 290);  gfx->printf("%.1fC", previousSensors.waterTemp);
  gfx->setCursor(39, 300);  gfx->printf("%.1f", previousSensors.waterPH);
  gfx->setCursor(57, 310);  gfx->printf("%s", previousSensors.waterLevel ? "OK" : "LOW");
  gfx->setCursor(206, 295); gfx->printf("%s", previousSensors.pumpStatus ? "ON" : "OFF");
  gfx->setCursor(198, 105); gfx->printf("%.1fC", previousSensors.envTemp);
  gfx->setCursor(192, 120); gfx->printf("%.0f%%", previousSensors.envHumidity);
  gfx->setCursor(134, 72);  gfx->printf("%.0f lx", previousSensors.lightLevel);
  gfx->setCursor(192, 167); gfx->printf("%.0fppm", previousSensors.co2Level);

  // Draw current values (draw label in WHITE, then value in color)
  gfx->setCursor(45, 290); gfx->setTextColor(waterTempColor);  gfx->printf("%.1fC", currentSensors.waterTemp);
  gfx->setCursor(39, 300); gfx->setTextColor(phColor);         gfx->printf("%.1f", currentSensors.waterPH);
  gfx->setCursor(57, 310); gfx->setTextColor(waterLevelColor); gfx->print(currentSensors.waterLevel ? "OK" : "LOW");
  gfx->setCursor(206, 295);gfx->setTextColor(pumpStatusColor); gfx->print(currentSensors.pumpStatus ? "ON" : "OFF");
  gfx->setCursor(198, 105);gfx->setTextColor(envTempColor);    gfx->printf("%.1fC", currentSensors.envTemp);
  gfx->setCursor(192, 120);gfx->setTextColor(humidityColor);   gfx->printf("%.0f%%", currentSensors.envHumidity);
  gfx->setCursor(134, 72); gfx->setTextColor(lightColor);      gfx->printf("%.0f lx", currentSensors.lightLevel);
  gfx->setCursor(192, 167);gfx->setTextColor(co2Color);        gfx->printf("%.0fppm", currentSensors.co2Level);
  
  // Clear previous system status text with a black rectangle
  gfx->fillRect(32, 44, 120, 16, BLACK); // Clear text area (width: 120px, height: 16px for size 2 text)
  
  // Calculate overall system status based on worst sensor (excluding pump)
  uint16_t sensorColors[] = {waterTempColor, phColor, waterLevelColor, envTempColor, humidityColor, lightColor, co2Color};
  uint16_t systemStatusColor = GREEN; // Start with best status
  const char* systemStatusText = "System OK";
  
  // Check all sensor colors and find the worst one
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
  printSystemStatus(systemStatusColor, systemStatusText); // Print overall system status
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

void printSystemStatus(uint16_t color, const char* text) {
    // Draw status circle
    gfx->fillCircle(15, 50, 8, color);
    // Draw status text
    gfx->setTextColor(WHITE);
    gfx->setTextSize(2);
    gfx->setCursor(32, 44);
    gfx->print(text);
}
