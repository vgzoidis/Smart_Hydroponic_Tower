#include "wifi_server.h"
#include "sensors.h"
#include "web_page.h"
#include "pump_control.h"

// WiFi credentials - UPDATE THESE FOR DIFFERENT NETWORKS!
const char* ssid = "WLAN-ITI4";
const char* password = "Iti.Wireless3";

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
  // GET pH control status
  server.on("/ph/status", HTTP_GET, [](AsyncWebServerRequest *request){
    String statusText = getPHControlStatus();
    String json = "{\"status\":\"" + statusText + "\"}";
    AsyncWebServerResponse *response = request->beginResponse(200, "application/json", json);
    response->addHeader("Access-Control-Allow-Origin", "*");
    request->send(response);
  });

  // POST to manually activate pH UP pump
  server.on("/ph/up", HTTP_POST, [](AsyncWebServerRequest *request){
    activatePHUp();
    String json = "{\"message\":\"pH UP pump activated\",\"status\":\"" + getPHControlStatus() + "\"}";
    AsyncWebServerResponse *response = request->beginResponse(200, "application/json", json);
    response->addHeader("Access-Control-Allow-Origin", "*");
    request->send(response);
  });

  // POST to manually activate pH DOWN pump
  server.on("/ph/down", HTTP_POST, [](AsyncWebServerRequest *request){
    activatePHDown();
    String json = "{\"message\":\"pH DOWN pump activated\",\"status\":\"" + getPHControlStatus() + "\"}";
    AsyncWebServerResponse *response = request->beginResponse(200, "application/json", json);
    response->addHeader("Access-Control-Allow-Origin", "*");
    request->send(response);
  });

  // POST to stop pH pumps
  server.on("/ph/stop", HTTP_POST, [](AsyncWebServerRequest *request){
    stopPHPumps();
    String json = "{\"message\":\"pH pumps stopped\",\"status\":\"" + getPHControlStatus() + "\"}";
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