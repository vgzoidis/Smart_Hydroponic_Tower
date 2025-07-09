#include "sensors.h"
#include <Wire.h>
#include <BH1750.h>
#include "MHZ19.h"
#include <OneWire.h>
#include <DallasTemperature.h>
#include "DHT.h"

// Pin definitions for sensors
#define waterTempPin 13  // GPIO where the DS18B20 water temp sensor is connected to
#define waterLevelPin 14 // GPIO pin for water level sensor (with voltage divider)
#define waterPhPin 36    // GPIO pin for pH meter Analog output
#define DHTPIN 4         // GPIO pin for DHT22 sensor

#define phOffset -1.3    // ph sensor deviation compensate

#define DHTTYPE DHT22 
DHT dht(DHTPIN, DHTTYPE); // Initialize DHT sensor.

OneWire oneWire(waterTempPin); // Setup a oneWire instance to communicate with any OneWire devices
DallasTemperature sensors(&oneWire); // Pass our oneWire reference to Dallas Temperature sensor 

//CO2 sensor definitions
#define RX_PIN 16 // Rx pin which the MHZ19 Tx pin is attached to
#define TX_PIN 17 // Tx pin which the MHZ19 Rx pin is attached to
#define BAUDRATE 9600 // Device to MH-Z19 Serial baudrate (should not be changed)

MHZ19 myMHZ19; // CO2 sensor object
HardwareSerial mySerial(2); // On ESP32 we have 2 USARTS available


BH1750 lightMeter; //Light sensor object


// Global sensor data
SensorData currentSensors = {
  .waterLevel = false,
  .co2Level = 0,
  .waterPH = 0.0,
  .waterTemp = 0.0,
  .envTemp = 0.0,
  .envHumidity = 0.0,
  .lightLevel = 0.0,
  .pumpStatus = false
};

// Previous values for clearing old text
PreviousValues previousSensors = {
  .waterLevel = false,
  .co2Level = 0,
  .waterPH = 0.0,
  .waterTemp = 0.0,
  .envTemp = 0.0,
  .envHumidity = 0.0,
  .lightLevel = 0.0,
  .pumpStatus = false
};

void initSensors() {
  // Initialize sensor pins
  pinMode(waterLevelPin, INPUT);

  dht.begin(); // Initialize the DHT22 sensor
  sensors.begin(); // Initialize the DS18B20 sensor

  Wire.begin(); // Initialize the I2C bus (BH1750 library doesn't do this automatically)
  lightMeter.begin(); // Initialize the light sensor

  // Initialize the MH-Z19 CO2 sensor
  mySerial.begin(BAUDRATE); // (Uno example) device to MH-Z19 serial start
  myMHZ19.begin(mySerial); // *Serial(Stream) reference must be passed to library begin().
  myMHZ19.autoCalibration(); // Turn auto calibration ON (OFF autoCalibration(false))

  // Initialize any other sensor hardware here
  Serial.println("Sensors initialized");
}

void updateSensorValues() {
  currentSensors.waterLevel = !digitalRead(waterLevelPin); // The water level  sensor reads LOW when water is present and HIGH there isn't
  currentSensors.co2Level = myMHZ19.getCO2(); // Request CO2 (as ppm)
  currentSensors.waterPH = 3.5*(analogRead(waterPhPin)*5*1.5/4096.)+phOffset; // Convert the analog value to pH (*1.5 because of the voltage divider)
  sensors.requestTemperatures(); // Request temperature from DS18B20 water temperature sensor
  currentSensors.waterTemp = sensors.getTempCByIndex(0); // water temperature in Celsius
  currentSensors.envTemp = dht.readTemperature(); // Read temperature from DHT22 sensor
  currentSensors.envHumidity = dht.readHumidity(); // Read humidity from DHT22 sensor
  currentSensors.lightLevel = lightMeter.readLightLevel(); // measured in lux
  currentSensors.pumpStatus = false;    // Mock pump status
}

void updatePreviousValues() {
  previousSensors.waterLevel = currentSensors.waterLevel;
  previousSensors.co2Level = currentSensors.co2Level;
  previousSensors.waterPH = currentSensors.waterPH;
  previousSensors.waterTemp = currentSensors.waterTemp;
  previousSensors.envTemp = currentSensors.envTemp;
  previousSensors.envHumidity = currentSensors.envHumidity;
  previousSensors.lightLevel = currentSensors.lightLevel;
  previousSensors.pumpStatus = currentSensors.pumpStatus;
}
