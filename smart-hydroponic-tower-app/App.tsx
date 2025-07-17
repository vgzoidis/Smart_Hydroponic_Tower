import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { height, width } = Dimensions.get('window');

// Sensor data state and status calculation
const getSensorStatus = (value: number, min: number, max: number) => {
  if (value >= min && value <= max) return 'good';
  if (value < min * 0.8 || value > max * 1.2) return 'critical';
  return 'warning';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'good': return '#4CAF50';
    case 'warning': return '#FF9800';
    case 'critical': return '#F44336';
    default: return '#9E9E9E';
  }
};

const Colors = {
  primary: '#38b2ac',      // Teal primary
  secondary: '#2c7a7b',    // Darker teal
  background: '#0f172a',   // Dark blue background
  backgroundLight: '#1e293b',
  surface: 'rgba(255,255,255,0.1)',
  surfaceLight: 'rgba(255,255,255,0.2)',
  text: '#FFFFFF',
  textSecondary: '#B3E5FC',
  good: '#48bb78',         // Light green for plants
  warning: '#FF9800',
  critical: '#F44336',
  accent: '#00E676',
  tower: '#FFFFFF',        // White tower
  plantGreen: '#48bb78',   // Light green leaves
  gradientStart: '#38b2ac', // Beautiful teal - your original request
  gradientEnd: '#0f172a',   // Darker teal for elegant gradient
};

function App(): JSX.Element {
  // Sensor data simulation - values closer to your ESP32 display
  const [sensorData] = useState({
    waterTemp: 25.4,     // H2O temp from ESP32
    waterPH: 7.6,        // pH from ESP32
    waterLevel: true,
    pumpStatus: false,   // Pump OFF as shown
    envTemp: 25.3,       // Temp from ESP32
    humidity: 49,        // Hum from ESP32
    lightLevel: 181,     // Light from ESP32
    co2Level: 1627,      // CO2 from ESP32
  });

  // Calculate statuses
  const waterTempStatus = getSensorStatus(sensorData.waterTemp, 18, 25);
  const phStatus = getSensorStatus(sensorData.waterPH, 5.5, 7.0);
  const tempStatus = getSensorStatus(sensorData.envTemp, 20, 26);
  const humidityStatus = getSensorStatus(sensorData.humidity, 40, 60);
  const lightStatus = getSensorStatus(sensorData.lightLevel, 150, 300);
  const co2Status = getSensorStatus(sensorData.co2Level, 400, 1000);

  // Overall system status
  const allStatuses = [waterTempStatus, phStatus, tempStatus, humidityStatus, lightStatus, co2Status];
  const overallStatus = allStatuses.includes('critical') ? 'critical' : 
                       allStatuses.includes('warning') ? 'warning' : 'good';

  const StatusIndicator = ({ status, label }: { status: string; label: string }) => (
    <View style={styles.statusIndicator}>
      <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
      <Text style={styles.statusText}>{label}</Text>
    </View>
  );

  const SensorValue = ({ 
    label, 
    value, 
    unit, 
    status 
  }: { 
    label: string; 
    value: string | number; 
    unit: string; 
    status: string;
  }) => (
    <View style={styles.sensorValue}>
      <Text style={styles.sensorLabel}>{label}:</Text>
      <Text style={[styles.sensorNumber, { color: getStatusColor(status) }]}>
        {value}{unit}
      </Text>
    </View>
  );

  const PlantLevel = ({ active }: { active: boolean }) => (
    <View style={styles.plantLevel}>
      <View style={[styles.plantPot, { 
        backgroundColor: active ? Colors.plantGreen : Colors.surface,
        borderColor: active ? Colors.plantGreen : Colors.textSecondary,
      }]} />
    </View>
  );

  return (
    <LinearGradient 
      colors={[Colors.gradientStart, Colors.gradientEnd]} 
      style={styles.mainContainer}
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.gradientStart} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerFrame}>
          <Text style={styles.headerText}>HYDROPONIC TOWER</Text>
        </View>
        
        <StatusIndicator 
          status={overallStatus} 
          label={overallStatus === 'good' ? 'System OK' : 
                 overallStatus === 'warning' ? 'Warning' : 'Critical'} 
        />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Main Dashboard */}
        <View style={styles.dashboardContainer}>
          
          {/* Left Side - Light and CO2 in vertical column */}
          <View style={styles.sensorColumn}>
            <View style={styles.sensorItem}>
              <Text style={styles.sensorGridLabel}>Light:</Text>
              <Text style={[styles.sensorGridValue, { color: getStatusColor(lightStatus) }]}>
                {sensorData.lightLevel} lx
              </Text>
            </View>
            <View style={styles.sensorItem}>
              <Text style={styles.sensorGridLabel}>CO2:</Text>
              <Text style={[styles.sensorGridValue, { color: getStatusColor(co2Status) }]}>
                {sensorData.co2Level} ppm
              </Text>
            </View>
          </View>

          {/* Center - Tower Visualization */}
          <View style={styles.towerContainer}>
            <View style={styles.tower}>
              {/* Single tower segment for the whole length */}
              <View style={styles.mainTowerSegment} />
              
              {/* Tower levels with plants - 6 levels like ESP32 display */}
              {[...Array(6)].map((_, index) => (
                <View key={index} style={styles.towerLevel}>
                  <PlantLevel active={true} />
                  <View style={styles.towerLevelSpacer} />
                  <PlantLevel active={true} />
                </View>
              ))}
              
              {/* Water base - now just the visual part */}
              <View style={styles.waterBase}>
                <View style={styles.waterIndicator}>
                  <View style={[styles.waterFill, { backgroundColor: Colors.primary }]} />
                </View>
              </View>
            </View>
          </View>

          {/* Right Side - Temperature and Humidity in vertical column */}
          <View style={styles.sensorColumn}>
            <View style={styles.sensorItem}>
              <Text style={styles.sensorGridLabel}>Temp:</Text>
              <Text style={[styles.sensorGridValue, { color: getStatusColor(tempStatus) }]}>
                {sensorData.envTemp}°C
              </Text>
            </View>
            <View style={styles.sensorItem}>
              <Text style={styles.sensorGridLabel}>Humidity:</Text>
              <Text style={[styles.sensorGridValue, { color: getStatusColor(humidityStatus) }]}>
                {sensorData.humidity}%
              </Text>
            </View>
          </View>
        </View>

        {/* Water Values Panel */}
        <LinearGradient
          colors={['#3B82F6', '#1E40AF', '#0EA5E9']} // Beautiful blue water gradient
          style={styles.waterValuesPanel}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        >
          <View style={styles.gridContainer}>
            {/* First Row */}
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Water Temp:</Text>
                <Text style={[styles.gridValue, { color: getStatusColor(waterTempStatus) }]}>
                  {sensorData.waterTemp}°C
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Water Level:</Text>
                <Text style={[styles.gridValue, { color: Colors.good }]}>OK</Text>
              </View>
            </View>
            
            {/* Second Row */}
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>pH Level:</Text>
                <Text style={[styles.gridValue, { color: getStatusColor(phStatus) }]}>
                  {sensorData.waterPH}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Water Pump:</Text>
                <Text style={[styles.gridValue, { 
                  color: sensorData.pumpStatus ? Colors.good : Colors.critical 
                }]}>
                  {sensorData.pumpStatus ? 'ON' : 'OFF'}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  
  // Header Styles
  header: {
    backgroundColor: 'transparent',
    paddingTop: 20, // Reduced from 50 to move title up
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerFrame: {
    borderWidth: 2,
    borderColor: Colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 15,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8, // Added rounded corners
  },
  headerText: {
    fontSize: 20, // Slightly smaller to fit better in rounded frame
    fontWeight: 'bold',
    color: Colors.text,
    letterSpacing: 2,
  },
  
  // Status Indicator
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 16, // Bigger dot from 12 to 16
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  statusText: {
    fontSize: 22, // Bigger font from 18 to 22
    color: Colors.text,
    fontWeight: '600',
  },
  
  // Dashboard Layout
  dashboardContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  sensorColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  sensorItem: {
    alignItems: 'center',
    marginVertical: 30,
    paddingHorizontal: 0,
    width: '100%',
  },
  sensorGridLabel: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  sensorGridValue: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
    flexShrink: 0,
  },
  spacer: {
    height: 30,
  },
  
  // Sensor Values - White labels, bigger fonts
  sensorValue: {
    marginVertical: 5,
  },
  sensorLabel: {
    fontSize: 16, // Bigger font
    color: Colors.text, // White instead of secondary
    marginBottom: 4,
    fontWeight: '500',
  },
  sensorNumber: {
    fontSize: 20, // Bigger font
    fontWeight: 'bold',
  },
  
  // Tower Visualization - Much bigger and better looking
  towerContainer: {
    flex: 2, // Make it take more space
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    minHeight: 400, // Ensure minimum height
  },
  tower: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  mainTowerSegment: {
    position: 'absolute',
    width: 24, // Wider from 16 to 24
    height: 320, // Taller from 280 to 320
    backgroundColor: Colors.tower, // White tower
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1,
    top: 20, // Move it down by 20px
  },
  towerLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8, // More space between levels
    zIndex: 2,
  },
  towerLevelSpacer: {
    width: 16,
    height: 40,
    marginHorizontal: 8,
  },
  towerSegment: {
    width: 16, // Wider tower segment
    height: 40, // Taller tower segment
    backgroundColor: Colors.tower, // White tower
    marginHorizontal: 8,
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  plantLevel: {
    width: 32, // Bigger plant levels
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plantPot: {
    width: 24, // Bigger plant pots
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  
  // Water System
  waterBase: {
    marginTop: 15,
    alignItems: 'center',
  },
  waterIndicator: {
    width: 80, // Wider water indicator
    height: 30, // Taller water indicator
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.tower,
    justifyContent: 'center',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  waterFill: {
    height: '80%',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 2,
  },
  
  // Water Values Panel - Proper size and spacing
  waterValuesPanel: {
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 15,
    padding: 25,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)', // White tank outline
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    minHeight: 160,
    height: 'auto',
  },
  // Grid Layout Styles
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  gridItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 15,
    minWidth: 120,
  },
  gridLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  gridValue: {
    fontSize: 20,
    color: Colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default App;
