#ifndef DISPLAY_H
#define DISPLAY_H

#include <Arduino.h>
#include <Arduino_GFX_Library.h>

// Display pin definitions
#define TFT_CS     25  // CS pin
#define TFT_RST    32  // RST pin  
#define TFT_DC     33  // DC pin
#define TFT_MOSI   27  // DIN pin
#define TFT_SCLK   26  // CLK pin

// Color definitions
#define BROWN     0x8400  // Brown color (RGB565)

// External display object
extern Arduino_GFX *gfx;

// Function declarations
void initDisplay();
void drawHydroponicTower();
void drawSensorStatus();
uint16_t getStatusColor(float value, float minGood, float maxGood, float minYellow, float maxYellow, float minOrange = -999, float maxOrange = -999);
uint16_t getStatusColorBool(bool status);

#endif
