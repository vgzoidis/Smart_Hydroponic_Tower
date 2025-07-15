#include "wifi_server.h"
#include "sensors.h"
#include "web_page.h"

// WiFi credentials - UPDATE THESE FOR DIFFERENT NETWORKS!
const char* ssid = "WLAN-ITI4";
const char* password = "Iti.Wireless3";

// Static IP configuration
IPAddress staticIP(160, 40, 48, 23); // ESP32 static IP
IPAddress gateway(160, 40, 50, 1);    // IP Address of your network gateway (router)
IPAddress subnet(255, 255, 248, 0);   // Subnet mask
IPAddress primaryDNS(160, 40, 50, 4); // Primary DNS (optional)
IPAddress secondaryDNS(160, 40, 50, 1);   // Secondary DNS (optional)

// Create AsyncWebServer object on port 80
AsyncWebServer server(80);

String getSensorDataJSON() {
  StaticJsonDocument<300> doc;

  // Add sensor data to JSON with rounded values
  doc["lightLevel"] = round(currentSensors.lightLevel * 1);            // 0 decimal places
  doc["envTemp"] = round(currentSensors.envTemp * 100) / 100.0;        // 2 decimal place
  doc["envHum"] = round(currentSensors.envHumidity * 1);               // 0 decimal place
  doc["CO2"] = currentSensors.co2Level;                                // Keep as integer
  doc["waterTemp"] = round(currentSensors.waterTemp * 100) / 100.0;    // 2 decimal place
  doc["phLevel"] = round(currentSensors.waterPH * 100) / 100.0;        // 2 decimal places
  doc["waterLevel"] = currentSensors.waterLevel;                       // Keep as boolean
  
  String jsonString;
  serializeJson(doc, jsonString);
  return jsonString;
}

void initWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi connected!");

  // Configuring static IP
  if(!WiFi.config(staticIP, gateway, subnet, primaryDNS, secondaryDNS)) {
    Serial.println("Failed to configure Static IP");
  } else {
    Serial.println("Static IP configured: ");
    Serial.println(WiFi.localIP());
  }

  /*Serial.println("Network Information:");
  Serial.print("Current ESP32 IP: ");
  Serial.println(WiFi.localIP());
  Serial.print("Gateway (router) IP: ");
  Serial.println(WiFi.gatewayIP());
  Serial.print("Subnet Mask: " );
  Serial.println(WiFi.subnetMask());
  Serial.print("Primary DNS: ");
  Serial.println(WiFi.dnsIP(0));
  Serial.print("Secondary DNS: ");
  Serial.println(WiFi.dnsIP(1));*/

  
  // Setup web server routes
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/html", index_html);
  });
  
  server.on("/sensors", HTTP_GET, [](AsyncWebServerRequest *request){
    String json = getSensorDataJSON();
    AsyncWebServerResponse *response = request->beginResponse(200, "application/json", json);
    response->addHeader("Access-Control-Allow-Origin", "*");
    response->addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response->addHeader("Access-Control-Allow-Headers", "Content-Type");
    request->send(response);
  });
  
  // Handle preflight OPTIONS requests
  server.on("/", HTTP_OPTIONS, [](AsyncWebServerRequest *request){
    AsyncWebServerResponse *response = request->beginResponse(200);
    response->addHeader("Access-Control-Allow-Origin", "*");
    response->addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response->addHeader("Access-Control-Allow-Headers", "Content-Type");
    request->send(response);
  });
  
  server.on("/sensors", HTTP_OPTIONS, [](AsyncWebServerRequest *request){
    AsyncWebServerResponse *response = request->beginResponse(200);
    response->addHeader("Access-Control-Allow-Origin", "*");
    response->addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response->addHeader("Access-Control-Allow-Headers", "Content-Type");
    request->send(response);
  });
  
  server.begin();
  Serial.println("HTTP server started");
  Serial.println("Access your sensor data at: http://160.40.48.23/sensors");
}

void handleWebServer() {
  // This function can be used for any additional web server handling if needed
  // The AsyncWebServer handles requests automatically, so this might be empty
}