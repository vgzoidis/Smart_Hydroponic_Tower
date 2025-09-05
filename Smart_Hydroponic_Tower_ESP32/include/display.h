#ifndef DISPLAY_H
#define DISPLAY_H

#include <Arduino.h>
#include <Arduino_GFX_Library.h>

// Display pin definitions
#define TFT_CS     33  // CS pin
#define TFT_RST    5  // RST pin  
#define TFT_DC     32  // DC pin
#define TFT_MOSI   26  // DIN pin
#define TFT_SCLK   25  // CLK pin

// Color definitions
#define BROWN     0x8400  // Brown color (RGB565)

// External display object
extern Arduino_GFX *gfx;

// Function declarations
void initDisplay();
void drawSensorStatus();
uint16_t getStatusColor(float value, float minGood, float maxGood, float minYellow, float maxYellow, float minOrange = -999, float maxOrange = -999);
uint16_t getStatusColor(bool status);
void printSystemStatus(uint16_t color, const char* text);

#endif
