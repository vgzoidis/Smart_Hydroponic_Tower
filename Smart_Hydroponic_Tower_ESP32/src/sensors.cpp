#include "sensors.h"
#include <Wire.h>
#include <BH1750.h>
#include "MHZ19.h"
#include <OneWire.h>
#include <DallasTemperature.h>
#include "DHT.h"
#include "pump_control.h"
#include "DFRobot_ESP_EC.h"

// Pin definitions for sensors
#define waterTempPin 13  // GPIO where the DS18B20 water temp sensor is connected to
#define waterLevelPin 14 // GPIO pin for water level sensor (with voltage divider)
#define waterPHPin 36    // GPIO pin for pH meter Analog output
#define waterECPin 34    // GPIO pin for EC meter Analog output
#define DHTPIN 4         // GPIO pin for DHT22 sensor

#define phOffset 0.6    // ph sensor deviation compensate

// Moving average parameters for pH sensor
#define PH_SAMPLES 10    // Number of samples to average (adjust as needed)
float phReadings[PH_SAMPLES];  // Array to store pH readings
int phIndex = 0;              // Current index in the array
float phSum = 0.0;            // Sum of all readings
bool phBufferFilled = false;  // Flag to check if buffer is full

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
DFRobot_ESP_EC ec; // EC sensor object


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

  // Initialize pH moving average buffer
  for (int i = 0; i < PH_SAMPLES; i++) {
    phReadings[i] = 0.0;
  }
  phIndex = 0;
  phSum = 0.0;
  phBufferFilled = false;

  dht.begin(); // Initialize the DHT22 sensor
  sensors.begin(); // Initialize the DS18B20 sensor

  Wire.begin(); // Initialize the I2C bus (BH1750 library doesn't do this automatically)
  lightMeter.begin(); // Initialize the light sensor

  // Initialize the MH-Z19 CO2 sensor
  mySerial.begin(BAUDRATE); // (Uno example) device to MH-Z19 serial start
  myMHZ19.begin(mySerial); // *Serial(Stream) reference must be passed to library begin().
  myMHZ19.autoCalibration(); // Turn auto calibration ON (OFF autoCalibration(false))
  ec.begin(); // Initialize the EC sensor
  
  //Serial.println("Sensors initialized");
}

// Function to calculate moving average for pH
float calculatePHMovingAverage(float newReading) {
  // Remove the oldest reading from the sum
  phSum -= phReadings[phIndex];
  
  // Add the new reading
  phReadings[phIndex] = newReading;
  phSum += newReading;
  
  // Move to the next index (circular buffer)
  phIndex = (phIndex + 1) % PH_SAMPLES;
  
  // Check if we've filled the buffer at least once
  if (!phBufferFilled && phIndex == 0) {
    phBufferFilled = true;
  }
  
  // Calculate and return the average
  int samplesCount = phBufferFilled ? PH_SAMPLES : phIndex;
  return samplesCount > 0 ? phSum / samplesCount : newReading;
}

void updateSensorValues() {
  currentSensors.waterLevel = !digitalRead(waterLevelPin); // The water level  sensor reads LOW when water is present and HIGH there isn't
  currentSensors.co2Level = myMHZ19.getCO2(); // Request CO2 (as ppm)
  float rawPH = 3.5*(analogRead(waterPHPin)*5/4096.0)+phOffset; // Read raw pH value
  currentSensors.waterPH = calculatePHMovingAverage(rawPH); // apply moving average
  sensors.requestTemperatures(); // Request temperature from DS18B20 water temperature sensor
  currentSensors.waterTemp = sensors.getTempCByIndex(0); // water temperature in Celsius
  currentSensors.waterEC = ec.readEC(analogRead(waterECPin), currentSensors.waterTemp); // Read EC value from the sensor
  currentSensors.envTemp = dht.readTemperature(); // Read temperature from DHT22 sensor
  currentSensors.envHumidity = dht.readHumidity(); // Read humidity from DHT22 sensor
  currentSensors.lightLevel = lightMeter.readLightLevel(); // measured in lux
  currentSensors.pumpStatus = getPumpState();    // pump status
}

void updatePreviousValues() {
  previousSensors.waterLevel = currentSensors.waterLevel;
  previousSensors.co2Level = currentSensors.co2Level;
  previousSensors.waterPH = currentSensors.waterPH;
  previousSensors.waterEC = currentSensors.waterEC;
  previousSensors.waterTemp = currentSensors.waterTemp;
  previousSensors.envTemp = currentSensors.envTemp;
  previousSensors.envHumidity = currentSensors.envHumidity;
  previousSensors.lightLevel = currentSensors.lightLevel;
  previousSensors.pumpStatus = currentSensors.pumpStatus;
}
