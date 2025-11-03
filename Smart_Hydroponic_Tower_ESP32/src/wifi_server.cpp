#include "wifi_server.h"
#include "sensors.h"
#include "web_page.h"
#include "pump_control.h"
#include "data_logger.h"

// WiFi credentials - UPDATE THESE FOR DIFFERENT NETWORKS!
const char* ssid = "WLAN-NAME";
const char* password = "WLAN-PASSWORD";

// Static IP configuration (change if setting up on a new network except last octet of static IP)
IPAddress staticIP(160, 40, 48, 23); // ESP32 static IP
IPAddress gateway(160, 40, 50, 1);    // IP Address of your network gateway (router)
IPAddress subnet(255, 255, 248, 0);   // Subnet mask
IPAddress primaryDNS(160, 40, 50, 4); // Primary DNS (optional)
IPAddress secondaryDNS(160, 40, 50, 1);   // Secondary DNS (optional)

// Create AsyncWebServer object on port 80
AsyncWebServer server(80);

String getSensorDataJSON() {
  StaticJsonDocument<350> doc;

  // Add sensor data to JSON with rounded values
  doc["lightLevel"] = round(currentSensors.lightLevel * 1);            // 0 decimal places
  doc["envTemp"] = round(currentSensors.envTemp * 100) / 100.0;        // 2 decimal place
  doc["envHum"] = round(currentSensors.envHumidity * 1);               // 0 decimal place
  doc["CO2"] = currentSensors.co2Level;                                // Keep as integer
  doc["waterTemp"] = round(currentSensors.waterTemp * 10) / 10.0;      // 1 decimal place
  doc["phLevel"] = round(currentSensors.waterPH * 100) / 100.0;        // 2 decimal places
  doc["ecLevel"] = round(currentSensors.waterEC * 100) / 100.0;        // 2 decimal places
  doc["waterLevel"] = currentSensors.waterLevel;                       // Keep as boolean
  doc["pumpStatus"] = currentSensors.pumpStatus;                       // Add pump status
  
  String jsonString;
  serializeJson(doc, jsonString);
  return jsonString;
}

void initWiFi() {

  //*/ Configuring static IP (comment if setting up on a new network)
  if(!WiFi.config(staticIP, gateway, subnet, primaryDNS, secondaryDNS)) {
    Serial.println("Failed to configure Static IP");
  } else {
    Serial.println("Static IP configured: ");
    Serial.println(WiFi.localIP());
  }//*/

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi connected!");

// USE TO CONFIGURE NEW STATIC IP
/*/ Delete this line while setting up on a new network
  Serial.println("Network Information:");
  Serial.print("Current ESP32 IP: ");
  Serial.println(WiFi.localIP());
  Serial.print("Gateway (router) IP: ");
  Serial.println(WiFi.gatewayIP());
  Serial.print("Subnet Mask: " );
  Serial.println(WiFi.subnetMask());
  Serial.print("Primary DNS: ");
  Serial.println(WiFi.dnsIP(0));
  Serial.print("Secondary DNS: ");
  Serial.println(WiFi.dnsIP(1));//*/

  
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

  // PUMP CONTROL ROUTES
  // GET for reading pump status
  server.on("/pump/status", HTTP_GET, [](AsyncWebServerRequest *request){
    PumpConfig config = getPumpConfig();
    String json = "{\"pumpStatus\":" + String(getPumpState() ? "true" : "false") + 
                  ",\"statusText\":\"" + getPumpStatusString() + "\"" +
                  ",\"autoMode\":" + String(config.autoMode ? "true" : "false") +
                  ",\"onTime\":" + String(config.onTime/60000) +
                  ",\"offTime\":" + String(config.offTime/60000) + "}";
    AsyncWebServerResponse *response = request->beginResponse(200, "application/json", json);
    response->addHeader("Access-Control-Allow-Origin", "*");
    request->send(response);
  });

  // POST for changing pump state
  server.on("/pump/toggle", HTTP_POST, [](AsyncWebServerRequest *request){
    togglePump();
    String json = "{\"pumpStatus\":" + String(getPumpState() ? "true" : "false") + 
                  ",\"statusText\":\"" + getPumpStatusString() + "\"}";
    AsyncWebServerResponse *response = request->beginResponse(200, "application/json", json);
    response->addHeader("Access-Control-Allow-Origin", "*");
    request->send(response);
  });

  // PUT for updating pump state
  server.on("/pump/state", HTTP_PUT, [](AsyncWebServerRequest *request){
    if (request->hasParam("state")) {
      String stateParam = request->getParam("state")->value();
      bool newState = (stateParam == "on" || stateParam == "1" || stateParam == "true");
      setPumpState(newState);
    }
    String json = "{\"pumpStatus\":" + String(getPumpState() ? "true" : "false") + 
                  ",\"statusText\":\"" + getPumpStatusString() + "\"}";
    AsyncWebServerResponse *response = request->beginResponse(200, "application/json", json);
    response->addHeader("Access-Control-Allow-Origin", "*");
    request->send(response);
  });

  // PUT for updating pump configuration
  server.on("/pump/config", HTTP_PUT, [](AsyncWebServerRequest *request){
    // Handle auto mode
    if (request->hasParam("autoMode")) {
      bool enable = request->getParam("autoMode")->value() == "true";
      enableAutoMode(enable);
    }
    
    // Handle timing
    if (request->hasParam("onTime") && request->hasParam("offTime")) {
      int onTime = request->getParam("onTime")->value().toInt();
      int offTime = request->getParam("offTime")->value().toInt();
      setPumpTiming(onTime, offTime);
    }
    
    PumpConfig config = getPumpConfig();
    String json = "{\"autoMode\":" + String(config.autoMode ? "true" : "false") + 
                  ",\"onTime\":" + String(config.onTime/60000) + 
                  ",\"offTime\":" + String(config.offTime/60000) + 
                  ",\"message\":\"Configuration updated\"}";
    AsyncWebServerResponse *response = request->beginResponse(200, "application/json", json);
    response->addHeader("Access-Control-Allow-Origin", "*");
    request->send(response);
  });

  // PH CONTROL ROUTES
  // GET pH control status and configuration
  server.on("/ph/status", HTTP_GET, [](AsyncWebServerRequest *request){
    PHConfig config = getPHConfig();
    String json = "{\"phStatus\":" + String(getPHUpState() ? "true" : "false") + 
                  ",\"phDownStatus\":" + String(getPHDownState() ? "true" : "false") +
                  ",\"statusText\":\"" + getPHControlStatus() + "\"" +
                  ",\"autoMode\":" + String(config.autoMode ? "true" : "false") +
                  ",\"target\":" + String(config.target, 1) +
                  ",\"tolerance\":" + String(config.tolerance, 1) + "}";
    AsyncWebServerResponse *response = request->beginResponse(200, "application/json", json);
    response->addHeader("Access-Control-Allow-Origin", "*");
    request->send(response);
  });

  // POST to toggle pH UP pump (manual mode)
  server.on("/ph/up", HTTP_POST, [](AsyncWebServerRequest *request){
    togglePHUp();
    String json = "{\"message\":\"pH UP pump toggled\",\"phUpStatus\":" + String(getPHUpState() ? "true" : "false") + 
                  ",\"status\":\"" + getPHControlStatus() + "\"}";
    AsyncWebServerResponse *response = request->beginResponse(200, "application/json", json);
    response->addHeader("Access-Control-Allow-Origin", "*");
    request->send(response);
  });

  // POST to toggle pH DOWN pump (manual mode)
  server.on("/ph/down", HTTP_POST, [](AsyncWebServerRequest *request){
    togglePHDown();
    String json = "{\"message\":\"pH DOWN pump toggled\",\"phDownStatus\":" + String(getPHDownState() ? "true" : "false") + 
                  ",\"status\":\"" + getPHControlStatus() + "\"}";
    AsyncWebServerResponse *response = request->beginResponse(200, "application/json", json);
    response->addHeader("Access-Control-Allow-Origin", "*");
    request->send(response);
  });

  // POST to stop pH pumps (manual mode)
  server.on("/ph/stop", HTTP_POST, [](AsyncWebServerRequest *request){
    stopPHPumps();
    String json = "{\"message\":\"pH pumps stopped\",\"status\":\"" + getPHControlStatus() + "\"}";
    AsyncWebServerResponse *response = request->beginResponse(200, "application/json", json);
    response->addHeader("Access-Control-Allow-Origin", "*");
    request->send(response);
  });

  // PUT for updating pH configuration
  server.on("/ph/config", HTTP_PUT, [](AsyncWebServerRequest *request){
    // Handle auto mode
    if (request->hasParam("autoMode")) {
      bool enable = request->getParam("autoMode")->value() == "true";
      enablePHAutoMode(enable);
    }
    
    // Handle target and tolerance
    if (request->hasParam("target") && request->hasParam("tolerance")) {
      float target = request->getParam("target")->value().toFloat();
      float tolerance = request->getParam("tolerance")->value().toFloat();
      setPHTarget(target, tolerance);
      enablePHAutoMode(true);  // Enable auto mode when updating configuration
    }
    
    PHConfig config = getPHConfig();
    String json = "{\"autoMode\":" + String(config.autoMode ? "true" : "false") + 
                  ",\"target\":" + String(config.target, 1) + 
                  ",\"tolerance\":" + String(config.tolerance, 1) + 
                  ",\"message\":\"pH configuration updated\"}";
    AsyncWebServerResponse *response = request->beginResponse(200, "application/json", json);
    response->addHeader("Access-Control-Allow-Origin", "*");
    request->send(response);
  });

  // Simple Data Logging Endpoints
  
  // Get logging status
  server.on("/logger/status", HTTP_GET, [](AsyncWebServerRequest *request){
    String json = "{\"enabled\":" + String(isDataLoggerEnabled() ? "true" : "false") + 
                  ",\"status\":\"" + getLoggerStatus() + "\"" +
                  ",\"failedUploads\":" + String(getFailedUploadCount()) + "}";
    AsyncWebServerResponse *response = request->beginResponse(200, "application/json", json);
    response->addHeader("Access-Control-Allow-Origin", "*");
    request->send(response);
  });

  // Toggle logger on/off
  server.on("/logger/toggle", HTTP_POST, [](AsyncWebServerRequest *request){
    enableDataLogger(!isDataLoggerEnabled());
    String json = "{\"enabled\":" + String(isDataLoggerEnabled() ? "true" : "false") + 
                  ",\"message\":\"Logger " + String(isDataLoggerEnabled() ? "enabled" : "disabled") + "\"}";
    AsyncWebServerResponse *response = request->beginResponse(200, "application/json", json);
    response->addHeader("Access-Control-Allow-Origin", "*");
    request->send(response);
  });

  // Manual log trigger
  server.on("/logger/log", HTTP_POST, [](AsyncWebServerRequest *request){
    triggerManualLog();
    String json = "{\"message\":\"Manual log triggered\",\"status\":\"" + getLoggerStatus() + "\"}";
    AsyncWebServerResponse *response = request->beginResponse(200, "application/json", json);
    response->addHeader("Access-Control-Allow-Origin", "*");
    request->send(response);
  });

  // API-style Data Logging Endpoints (for web interface compatibility)
  
  // Get logging status - /api/log/status
  server.on("/api/log/status", HTTP_GET, [](AsyncWebServerRequest *request){
    String json = "{\"enabled\":" + String(isDataLoggerEnabled() ? "true" : "false") + 
                  ",\"lastStatus\":\"" + getLoggerStatus() + "\"" +
                  ",\"successfulUploads\":" + String(getSuccessfulUploadCount()) +
                  ",\"failedUploads\":" + String(getFailedUploadCount()) + "}";
    AsyncWebServerResponse *response = request->beginResponse(200, "application/json", json);
    response->addHeader("Access-Control-Allow-Origin", "*");
    request->send(response);
  });

  // Enable/disable logger - /api/log/enable?enabled=true/false
  server.on("/api/log/enable", HTTP_PUT, [](AsyncWebServerRequest *request){
    bool enable = false;
    if (request->hasParam("enabled")) {
      String enableParam = request->getParam("enabled")->value();
      enable = (enableParam == "true");
    }
    enableDataLogger(enable);
    String json = "{\"enabled\":" + String(isDataLoggerEnabled() ? "true" : "false") + 
                  ",\"message\":\"Data logging " + String(isDataLoggerEnabled() ? "enabled" : "disabled") + "\"}";
    AsyncWebServerResponse *response = request->beginResponse(200, "application/json", json);
    response->addHeader("Access-Control-Allow-Origin", "*");
    request->send(response);
  });

  // Manual log trigger - /api/log/trigger
  server.on("/api/log/trigger", HTTP_POST, [](AsyncWebServerRequest *request){
    triggerManualLog();
    String json = "{\"message\":\"Manual upload triggered\",\"status\":\"" + getLoggerStatus() + "\"}";
    AsyncWebServerResponse *response = request->beginResponse(200, "application/json", json);
    response->addHeader("Access-Control-Allow-Origin", "*");
    request->send(response);
  });

  // Connection test - /api/log/test
  server.on("/api/log/test", HTTP_POST, [](AsyncWebServerRequest *request){
    // Simple connection test - just check WiFi status
    bool connected = (WiFi.status() == WL_CONNECTED);
    String json = "{\"success\":" + String(connected ? "true" : "false") + 
                  ",\"message\":\"" + String(connected ? "WiFi connected - ready to log" : "WiFi not connected") + "\"}";
    AsyncWebServerResponse *response = request->beginResponse(200, "application/json", json);
    response->addHeader("Access-Control-Allow-Origin", "*");
    request->send(response);
  });

  // Handle OPTIONS for CORS
  server.on("/pump/toggle", HTTP_OPTIONS, handleCORSOptions);
  server.on("/pump/state", HTTP_OPTIONS, handleCORSOptions);
  server.on("/pump/config", HTTP_OPTIONS, handleCORSOptions);
  server.on("/pump/status", HTTP_OPTIONS, handleCORSOptions);
  server.on("/ph/up", HTTP_OPTIONS, handleCORSOptions);
  server.on("/ph/down", HTTP_OPTIONS, handleCORSOptions);
  server.on("/ph/stop", HTTP_OPTIONS, handleCORSOptions);
  server.on("/ph/config", HTTP_OPTIONS, handleCORSOptions);
  server.on("/logger/status", HTTP_OPTIONS, handleCORSOptions);
  server.on("/logger/toggle", HTTP_OPTIONS, handleCORSOptions);
  server.on("/logger/log", HTTP_OPTIONS, handleCORSOptions);
  server.on("/api/log/status", HTTP_OPTIONS, handleCORSOptions);
  server.on("/api/log/enable", HTTP_OPTIONS, handleCORSOptions);
  server.on("/api/log/trigger", HTTP_OPTIONS, handleCORSOptions);
  server.on("/api/log/test", HTTP_OPTIONS, handleCORSOptions);
  
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
    Serial.print("Access a simple dashboard at: http://");
    Serial.println(WiFi.localIP());
}

void handleWebServer() {
  // This function can be used for any additional web server handling if needed
  // The AsyncWebServer handles requests automatically, so this might be empty
}

// Helper function for CORS
void handleCORSOptions(AsyncWebServerRequest *request) {
  AsyncWebServerResponse *response = request->beginResponse(200);
  response->addHeader("Access-Control-Allow-Origin", "*"); // For security, you can restrict this to specific origins
  //response->addHeader("Access-Control-Allow-Origin", "http://192.168.1.50"); // Only specific IP
  //response->addHeader("Access-Control-Allow-Origin", "https://myapp.com");   // Only specific domain
  response->addHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response->addHeader("Access-Control-Allow-Headers", "Content-Type");
  request->send(response);
}
