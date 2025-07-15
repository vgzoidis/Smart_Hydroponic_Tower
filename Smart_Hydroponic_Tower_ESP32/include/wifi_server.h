#ifndef WIFI_SERVER_H
#define WIFI_SERVER_H

#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>

// WiFi credentials
extern const char* ssid;
extern const char* password;

// Function declarations
void initWiFi();
void handleWebServer();
String getSensorDataJSON();

#endif