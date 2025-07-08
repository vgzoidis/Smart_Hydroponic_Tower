#include <Arduino.h>
#include <Arduino_GFX_Library.h>

// Pins for the Display - Updated to match your actual wiring
#define TFT_CS     25  // CS pin
#define TFT_RST    32  // RST pin  
#define TFT_DC     33  // DC pin
#define TFT_MOSI   27  // DIN pin
#define TFT_SCLK   26  // CLK pin
// BL connected to 3.3V (always on)

// Initialize display using Arduino_GFX_Library with your pin configuration
Arduino_DataBus *bus = new Arduino_ESP32SPI(TFT_DC, TFT_CS, TFT_SCLK, TFT_MOSI, -1 /* MISO not used */);
Arduino_GFX *gfx = new Arduino_ST7789(bus, TFT_RST, 0 /* rotation */, true /* IPS */, 240, 320);

// Color definitions
#define BROWN     0x8400  // Brown color (RGB565)

// Initialize with mock sensor values (replace with real sensor readings)
bool waterLevel = false;      // Water level OK/LOW status
float co2Level = 450.0;       // CO2 ppm
float waterPH = 7.3;          // pH value
float waterTemp = 22.5;       // Water temperature °C
float envTemp = 25.0;         // Environment temperature °C
float envHumidity = 75.0;     // Environment humidity %
float lightLevel = 850.0;    // Light level lux
bool pumpStatus = true;       // Pump ON/OFF status

// Previous values for clearing old text
bool prevWaterLevel = false;
float prevCo2Level = 450.0;
float prevWaterPH = 7.3;
float prevWaterTemp = 22.5;
float prevEnvTemp = 25.0;
float prevEnvHumidity = 75.0;
float prevLightLevel = 850.0;
bool prevPumpStatus = true;

// Function to get status color based on value ranges with yellow and orange zones
uint16_t getStatusColor(float value, float minGood, float maxGood, float minYellow, float maxYellow, float minOrange = -999, float maxOrange = -999) {
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

// Function to get status color for boolean values (water level)
uint16_t getStatusColorBool(bool status) {
  return status ? GREEN : RED;  // true = OK (green), false = LOW (red)
}

// Function declarations
void drawHydroponicTower();
void drawSensorStatus();

void setup() {
  Serial.begin(115200);
  gfx->begin();
  gfx->fillScreen(BLACK);
  
  // Stylized title with background and border
  gfx->fillRect(5, 0, 230, 32, 0x0320);        // Dark green background (moved to top)
  gfx->drawRect(5, 0, 230, 32, GREEN);         // Green border (moved to top)
  gfx->drawRect(6, 1, 228, 30, WHITE);         // White inner border (adjusted)
  
  // Main title text
  gfx->setTextColor(WHITE);
  gfx->setTextSize(2);
  gfx->setCursor(15, 9);                       // Adjusted for top positioning
  gfx->print(" HYDROPONIC TOWER");
  
  // Draw the hydroponic tower once in setup
  drawHydroponicTower();
  
  // Draw sensor status indicators
  drawSensorStatus();
}

void drawHydroponicTower() {
  // Tower base (water reservoir) - moved to bottom of screen
  gfx->fillRect(80, 290, 80, 30, BLUE);        // Water reservoir (bottom edge at Y=320)
  gfx->drawRect(80, 290, 80, 30, WHITE);       // Reservoir outline
  
  // Tower main structure (PVC pipe) - adjusted to connect to new reservoir position
  gfx->fillRect(110, 90, 20, 200, DARKGREY);   // Main tower pipe (extends to Y=290)
  gfx->drawRect(110, 90, 20, 200, WHITE);      // Pipe outline
  
  // Growing levels (plant sites) - from bottom to top (all moved down 10px)
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
  
  // Water flow lines (showing nutrient flow) - adjusted for new tower position
  gfx->drawLine(120, 95, 120, 285, CYAN);      // Water flow down
  gfx->drawLine(115, 100, 115, 285, CYAN);     // Water flow down
  
  // Pump (in reservoir) - adjusted for new reservoir position
  gfx->fillRect(145, 295, 10, 10, RED);        // Pump
  gfx->drawRect(145, 295, 10, 10, WHITE);      // Pump outline
}

void drawSensorStatus() {
  // Set larger text size for better readability
  gfx->setTextSize(1);
  
  // Clear previous values by drawing them in black first
  // Use the exact same positioning logic as the drawing code
  
  // Clear previous Water Temperature value
  gfx->setTextColor(BLACK);  
  gfx->setCursor(15, 290);
  gfx->print("H2O: ");  // Move cursor to correct position
  gfx->printf("%.1fC", prevWaterTemp);
  
  // Clear previous Water pH value
  gfx->setTextColor(BLACK);  
  gfx->setCursor(15, 300);
  gfx->print("pH: ");  // Move cursor to correct position
  gfx->printf("%.1f", prevWaterPH);
  
  // Clear previous Water Level value
  gfx->setTextColor(BLACK);  
  gfx->setCursor(15, 310);
  gfx->print("Level: ");  // Move cursor to correct position
  gfx->print(prevWaterLevel ? "OK" : "LOW");
  
  // Clear previous Pump Status value
  gfx->setTextColor(BLACK);  
  gfx->setCursor(170, 295);
  gfx->print("Pump: ");  // Move cursor to correct position
  gfx->print(prevPumpStatus ? "ON" : "OFF");
  
  // Clear previous Environment Temperature value
  gfx->setTextColor(BLACK);  
  gfx->setCursor(172, 98);
  gfx->print("Temp: ");  // Move cursor to correct position
  gfx->printf("%.1fC", prevEnvTemp);
  
  // Clear previous Environment Humidity value
  gfx->setTextColor(BLACK);  
  gfx->setCursor(172, 113);
  gfx->print("Hum: ");  // Move cursor to correct position
  gfx->printf("%.0f%%", prevEnvHumidity);
  
  // Clear previous Light Level value
  gfx->setTextColor(BLACK);  
  gfx->setCursor(87, 73);
  gfx->print("Light: ");  // Move cursor to correct position
  gfx->printf("%.0f", prevLightLevel);
  
  // Clear previous CO2 Level value
  gfx->setTextColor(BLACK);  
  gfx->setCursor(172, 183);
  gfx->print("CO2: ");  // Move cursor to correct position
  gfx->printf("%.0f", prevCo2Level);
  
  // Now draw the labels and new values
  // Water Temperature (in reservoir area - first line)
  uint16_t waterTempColor = getStatusColor(waterTemp, 18, 24, 15, 28, 12, 32);
  gfx->setTextColor(WHITE);
  gfx->setCursor(15, 290);
  gfx->print("H2O: ");
  gfx->setTextColor(waterTempColor);
  gfx->printf("%.1fC", waterTemp);
  
  // Water pH Sensor (in reservoir area - second line)
  uint16_t phColor = getStatusColor(waterPH, 5.8, 6.5, 5.5, 7.0, 5.0, 7.5);
  gfx->setTextColor(WHITE);
  gfx->setCursor(15, 300);
  gfx->print("pH: ");
  gfx->setTextColor(phColor);
  gfx->printf("%.1f", waterPH);
  
  // Water Level Sensor (in reservoir area - third line)
  uint16_t waterLevelColor = getStatusColorBool(waterLevel);
  gfx->setTextColor(WHITE);
  gfx->setCursor(15, 310);
  gfx->print("Level: ");
  gfx->setTextColor(waterLevelColor);
  gfx->print(waterLevel ? "OK" : "LOW");
  
  // Pump Status (where pump text was)
  gfx->setTextColor(WHITE);
  gfx->setCursor(170, 295);
  gfx->print("Pump: ");
  gfx->setTextColor(pumpStatus ? GREEN : RED);
  gfx->print(pumpStatus ? "ON" : "OFF");
  
  // Environment Temperature (top right) - moved down
  uint16_t envTempColor = getStatusColor(envTemp, 20, 26, 18, 30, 15, 35);
  gfx->setTextColor(WHITE);
  gfx->setCursor(172, 98);
  gfx->print("Temp: ");
  gfx->setTextColor(envTempColor);
  gfx->printf("%.1fC", envTemp);
  
  // Environment Humidity (top right) - moved down
  uint16_t humidityColor = getStatusColor(envHumidity, 50, 70, 40, 80, 30, 90);
  gfx->setTextColor(WHITE);
  gfx->setCursor(172, 113);
  gfx->print("Hum: ");
  gfx->setTextColor(humidityColor);
  gfx->printf("%.0f%%", envHumidity);
  
  // Light Level (top center) - moved down
  uint16_t lightColor = getStatusColor(lightLevel, 800, 1200, 600, 1500, 400, 1800);
  gfx->setTextColor(WHITE);
  gfx->setCursor(87, 73);
  gfx->print("Light: ");
  gfx->setTextColor(lightColor);
  gfx->printf("%.0f", lightLevel);
  
  // CO2 Level (middle right) - moved down
  uint16_t co2Color = getStatusColor(co2Level, 400, 800, 300, 1000, 200, 1200);
  gfx->setTextColor(WHITE);
  gfx->setCursor(172, 183);
  gfx->print("CO2: ");
  gfx->setTextColor(co2Color);
  gfx->printf("%.0f", co2Level);
  
  // Update previous values for next clearing cycle
  prevWaterLevel = waterLevel;
  prevCo2Level = co2Level;
  prevWaterPH = waterPH;
  prevWaterTemp = waterTemp;
  prevEnvTemp = envTemp;
  prevEnvHumidity = envHumidity;
  prevLightLevel = lightLevel;
  prevPumpStatus = pumpStatus;
  
  // System Status (top left)
  gfx->fillCircle(15, 50, 8, GREEN);           // Larger status circle (8px radius)
  gfx->setTextColor(WHITE);
  gfx->setTextSize(2);                         // Ensure text size is set
  gfx->setCursor(32, 44);                      // Adjusted position for larger circle
  gfx->print("System OK");
}

void loop() {
  // Redraw sensor status with updated values
  drawSensorStatus();
  
  // Update sensor values (simulate real sensor readings)
  waterLevel = true;    // Mock boolean value - replace with real sensor (true = OK, false = LOW)
  co2Level = 450.0;
  waterPH = 6.2;
  waterTemp = 22.5;
  envTemp = 24.0;
  envHumidity = 65.0;
  lightLevel = 850.0;
  pumpStatus = true;    // Mock pump status - replace with real pump state
  
  
  
  delay(5000);  // Update every 5 seconds
}