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
  // Tab state
  const [activeTab, setActiveTab] = useState('dashboard');

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

  // Tab content components
  const DashboardContent = () => (
    <>
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
              <Text style={styles.gridLabel}>H2O:</Text>
              <Text style={[styles.gridValue, { color: getStatusColor(waterTempStatus) }]}>
                {sensorData.waterTemp}°C
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Level:</Text>
              <Text style={[styles.gridValue, { color: Colors.good }]}>OK</Text>
            </View>
          </View>
          
          {/* Second Row */}
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>pH:</Text>
              <Text style={[styles.gridValue, { color: getStatusColor(phStatus) }]}>
                {sensorData.waterPH}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Pump:</Text>
              <Text style={[styles.gridValue, { 
                color: sensorData.pumpStatus ? Colors.good : Colors.critical 
              }]}>
                {sensorData.pumpStatus ? 'ON' : 'OFF'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </>
  );

  const PlottingContent = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Data Plotting</Text>
      <Text style={styles.tabDescription}>Coming soon: Real-time sensor data charts and historical trends</Text>
      <View style={styles.placeholderChart}>
        <Text style={styles.placeholderText}>📊 Chart Placeholder</Text>
      </View>
    </View>
  );

  const SettingsContent = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Settings</Text>
      <Text style={styles.tabDescription}>Configure your hydroponic system parameters</Text>
      <View style={styles.settingsItem}>
        <Text style={styles.settingsLabel}>Water Temperature Range:</Text>
        <Text style={styles.settingsValue}>18°C - 25°C</Text>
      </View>
      <View style={styles.settingsItem}>
        <Text style={styles.settingsLabel}>pH Range:</Text>
        <Text style={styles.settingsValue}>5.5 - 7.0</Text>
      </View>
      <View style={styles.settingsItem}>
        <Text style={styles.settingsLabel}>Light Duration:</Text>
        <Text style={styles.settingsValue}>16 hours/day</Text>
      </View>
    </View>
  );

  const TabButton = ({ tab, label, icon }: { tab: string; label: string; icon: string }) => (
    <TouchableOpacity 
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabIcon, activeTab === tab && styles.activeTabIcon]}>{icon}</Text>
      <Text style={[styles.tabLabel, activeTab === tab && styles.activeTabLabel]}>{label}</Text>
    </TouchableOpacity>
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
        {activeTab === 'dashboard' && <DashboardContent />}
        {activeTab === 'plotting' && <PlottingContent />}
        {activeTab === 'settings' && <SettingsContent />}
      </ScrollView>
      
      {/* Bottom Tab Navigation */}
      <View style={styles.tabBar}>
        <TabButton tab="dashboard" label="Dashboard" icon="●" />
        <TabButton tab="plotting" label="Charts" icon="▲" />
        <TabButton tab="settings" label="Settings" icon="⚙" />
      </View>
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
    paddingTop: 10, // Reduced from 20 to 10 to move content up
    paddingBottom: 10, // Reduced from 20 to 10 to move content up
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
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 5, // Reduced from 20 to 5 to move dashboard up
    paddingBottom: 5, // Minimal bottom padding to bring water panel closer
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
    paddingVertical: 10, // Reduced from 20 to bring water panel closer
    minHeight: 350, // Reduced from 400 to make it more compact
  },
  tower: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  mainTowerSegment: {
    position: 'absolute',
    width: 32, // Scaled up from 24 to 32
    height: 400, // Scaled up from 320 to 400
    backgroundColor: Colors.tower, // White tower
    borderRadius: 3, // Slightly bigger border radius
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, // Bigger shadow
    shadowOpacity: 0.4, // More prominent shadow
    shadowRadius: 6, // Larger shadow radius
    elevation: 6, // Higher elevation
    zIndex: 1,
    top: 20, // Move it down by 20px
  },
  towerLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10, // More space between levels (scaled from 8 to 10)
    zIndex: 2,
  },
  towerLevelSpacer: {
    width: 20, // Scaled up from 16 to 20
    height: 50, // Scaled up from 40 to 50
    marginHorizontal: 10, // Scaled up from 8 to 10
  },
  towerSegment: {
    width: 20, // Scaled up from 16 to 20
    height: 50, // Scaled up from 40 to 50
    backgroundColor: Colors.tower, // White tower
    marginHorizontal: 10, // Scaled up from 8 to 10
    borderRadius: 3, // Slightly bigger border radius
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, // Bigger shadow
    shadowOpacity: 0.4, // More prominent shadow
    shadowRadius: 6, // Larger shadow radius
    elevation: 6, // Higher elevation
  },
  plantLevel: {
    width: 40, // Scaled up from 32 to 40
    height: 40, // Scaled up from 32 to 40
    justifyContent: 'center',
    alignItems: 'center',
  },
  plantPot: {
    width: 30, // Scaled up from 24 to 30
    height: 30, // Scaled up from 24 to 30
    borderRadius: 15, // Scaled up from 12 to 15
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, // Slightly bigger shadow
    shadowOpacity: 0.4, // More prominent shadow
    shadowRadius: 3, // Larger shadow radius
    elevation: 4, // Higher elevation
  },
  
  // 
  
  waterValuesPanel: {
    marginHorizontal: 100, // Much larger margins for very narrow panel
    marginTop: 5, // Very close to tower
    borderRadius: 6, // Smaller rounded corners
    padding: 6, // Much tighter padding for snug fit
    borderWidth: 1, // Keep thin border
    borderColor: 'rgba(255,255,255,0.6)', // White tank outline
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, // Minimal shadow
    shadowOpacity: 0.2,
    shadowRadius: 2, // Very tight shadow
    elevation: 2, // Minimal elevation
    minHeight: 70, // Even shorter panel
    height: 'auto',
  },
  // Grid Layout Styles
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // Center the grid content
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'center', // Center the row content
    marginBottom: 4, // Even tighter spacing between rows
    paddingHorizontal: 1, // Minimal horizontal padding
    width: '100%', // Full width of the container
  },
  gridItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2, // Very tight item spacing
    minWidth: 70, // Smaller minimum width
    maxWidth: 90, // Smaller maximum width for snug fit
  },
  gridLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 1, // Minimal spacing between label and value
    textAlign: 'center',
  },
  gridValue: {
    fontSize: 20,
    color: Colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Tab Navigation Styles
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'transparent', // Remove dark background to show gradient
    paddingVertical: 10,
    paddingBottom: 20, // Extra padding for safe area
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)', // More subtle border
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.2)', // Subtle background for buttons
    marginHorizontal: 2,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: 'rgba(56,178,172,0.3)', // Slightly more visible when active
    borderRadius: 8,
    marginHorizontal: 2,
  },
  tabIcon: {
    fontSize: 18, // Slightly smaller for minimalistic look
    marginBottom: 4,
    color: 'rgba(255,255,255,0.7)', // Monochromatic grey
  },
  activeTabIcon: {
    fontSize: 20, // Active size
    color: '#FFFFFF', // Pure white when active
  },
  tabLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: Colors.text,
    fontWeight: '600',
  },
  
  // Tab Content Styles
  tabContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  tabDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  
  // Plotting Tab Styles
  placeholderChart: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  
  // Settings Tab Styles
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginBottom: 10,
  },
  settingsLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  settingsValue: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: 'bold',
  },
});

export default App;
