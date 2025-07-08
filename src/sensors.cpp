#include "sensors.h"
#include <Wire.h>
#include <BH1750.h>
#include "MHZ19.h"
#include <OneWire.h>
#include <DallasTemperature.h>
#include "DHT.h"

//-----DHT------
#define DHTPIN 4 
#define DHTTYPE DHT22 

DHT dht(DHTPIN, DHTTYPE); // Initialize DHT sensor.

// Pin definitions for sensors
const int waterTempPin = 13;  // GPIO where the DS18B20 water temp sensor is connected to
const int waterLevelPin = 14; // GPIO pin for water level sensor (with voltage divider)

OneWire oneWire(waterTempPin); // Setup a oneWire instance to communicate with any OneWire devices
DallasTemperature sensors(&oneWire); // Pass our oneWire reference to Dallas Temperature sensor 

//pH meter definitions
#define SensorPin 36 //Analog output to VP Pin
#define Offset -1.3 //deviation compensate
#define samplingInterval 20
#define printInterval 800
#define ArrayLenth  40    //times of collection

int pHArray[ArrayLenth];   //Store the average value of the sensor feedback
int pHArrayIndex=0;
double avergearray(int* arr, int number);
float measurePH();

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
  .co2Level = 450.0,
  .waterPH = 7.3,
  .waterTemp = 22.5,
  .envTemp = 25.0,
  .envHumidity = 75.0,
  .lightLevel = 850.0,
  .pumpStatus = true
};

// Previous values for clearing old text
PreviousValues previousSensors = {
  .waterLevel = false,
  .co2Level = 450.0,
  .waterPH = 7.3,
  .waterTemp = 22.5,
  .envTemp = 25.0,
  .envHumidity = 75.0,
  .lightLevel = 850.0,
  .pumpStatus = true
};

void initSensors() {
  // Initialize sensor pins
  pinMode(waterLevelPin, INPUT);

  // Start the DS18B20 sensor
  sensors.begin();

  // Initialize the light sensor
  Wire.begin(); // Initialize the I2C bus (BH1750 library doesn't do this automatically)
  lightMeter.begin();

  // Initialize the MH-Z19 CO2 sensor
  mySerial.begin(BAUDRATE); // (Uno example) device to MH-Z19 serial start
  myMHZ19.begin(mySerial); // *Serial(Stream) reference must be passed to library begin().
  myMHZ19.autoCalibration(); // Turn auto calibration ON (OFF autoCalibration(false))

  // Initialize any other sensor hardware here
  Serial.println("Sensors initialized");
}

void updateSensorValues() {
  // Simulate real sensor readings - replace with actual sensor code
  currentSensors.waterLevel = !digitalRead(waterLevelPin); // The water level  sensor reads LOW when water is present and HIGH there isn't
  currentSensors.co2Level = myMHZ19.getCO2(); // Request CO2 (as ppm)
  
  currentSensors.waterPH = measurePH(); // Measure pH value from the pH sensor
  sensors.requestTemperatures(); // Request temperature from DS18B20 water temperature sensor
  currentSensors.waterTemp = sensors.getTempCByIndex(0); // water temperature in Celsius
  currentSensors.envTemp = 24.0;
  currentSensors.envHumidity = 65.0;
  currentSensors.lightLevel = lightMeter.readLightLevel(); // measured in lux
  currentSensors.pumpStatus = false;    // Mock pump status
  
  // TODO: Replace above with actual sensor readings:
  // currentSensors.waterLevel = readWaterLevelSensor();
  // currentSensors.co2Level = readCO2Sensor();
  // currentSensors.waterPH = readPHSensor();
  // currentSensors.waterTemp = readWaterTempSensor();
  // currentSensors.envTemp = readEnvTempSensor();
  // currentSensors.envHumidity = readHumiditySensor();
  // currentSensors.lightLevel = readLightSensor();
  // currentSensors.pumpStatus = getPumpStatus();
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

double avergearray(int* arr, int number){
  int i;
  int max,min;
  double avg;
  long amount=0;
  if(number<=0){
    Serial.println("Error number for the array to avraging!/n");
    return 0;
  }
  if(number<5){   //less than 5, calculated directly statistics
    for(i=0;i<number;i++){
      amount+=arr[i];
    }
    avg = amount/number;
    return avg;
  }else{
    if(arr[0]<arr[1]){
      min = arr[0];max=arr[1];
    }
    else{
      min=arr[1];max=arr[0];
    }
    for(i=2;i<number;i++){
      if(arr[i]<min){
        amount+=min;        //arr<min
        min=arr[i];
      }else {
        if(arr[i]>max){
          amount+=max;    //arr>max
          max=arr[i];
        }else{
          amount+=arr[i]; //min<=arr<=max
        }
      }//if
    }//for
    avg = (double)amount/(number-2);
  }//if
  return avg;
}

float measurePH(){
    static float pHValue,voltage;
    voltage = analogRead(SensorPin)*5*1.5/4096.0; //Convert the analog value to voltage (*1.5 due to voltage divider);
    pHValue = 3.5*voltage+Offset;
    return pHValue;
}
