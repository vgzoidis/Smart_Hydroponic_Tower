import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';

// Import organized components and utilities
import {Colors} from './src/constants/Colors';
import {getSensorStatus, getECStatus} from './src/utils/sensorUtils';
import {StatusIndicator} from './src/components/StatusIndicator';
import {DashboardScreen} from './src/screens/DashboardScreen';
import {PlottingScreen} from './src/screens/PlottingScreenClean';
import {SettingsScreen} from './src/screens/SettingsScreen';
import {API_CONFIG, getApiUrl, getCommonFetchOptions} from './src/utils/apiConfig';

function App(): JSX.Element {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  // Real-time sensor data from server
  const [sensorData, setSensorData] = useState({
    waterTemp: 0,
    waterPH: 0,
    ecLevel: 0,
    waterLevel: false,
    pumpStatus: false,
    envTemp: 0,
    humidity: 0,
    lightLevel: 0,
    co2Level: 0,
  });

  // Function to fetch sensor data from the server
  const fetchSensorData = async () => {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), API_CONFIG.TIMEOUT)
      );
      
      const fetchPromise = fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.SENSORS),
        getCommonFetchOptions('GET')
      );
      
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Map the server response to our app's data structure
      setSensorData({
        waterTemp: data.waterTemp || 0,
        waterPH: data.phLevel || 0,
        ecLevel: data.ecLevel || 0,
        waterLevel: data.waterLevel || false,
        pumpStatus: data.pumpStatus || false, // Now using server data
        envTemp: data.envTemp || 0,
        humidity: data.envHum || 0,
        lightLevel: data.lightLevel || 0,
        co2Level: data.CO2 || 0,
      });
      
      setConnectionError(false);
      setIsLoading(false);
      
      console.log('Sensor data updated successfully:', data);
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      
      // Type-safe error handling
      const errorDetails = error instanceof Error ? {
        message: error.message,
        type: error.constructor.name,
        stack: error.stack
      } : {
        message: String(error),
        type: 'Unknown',
        stack: 'N/A'
      };
      
      console.error('Error details:', errorDetails);
      
      // Show detailed error in console for debugging
      const errorMsg = `Failed to connect to ESP32 at ${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SENSORS}\n\nError: ${errorDetails.message}\nType: ${errorDetails.type}`;
      console.log('DETAILED ERROR:', errorMsg);
      
      setConnectionError(true);
      setIsLoading(false);
    }
  };

  // Function to toggle pump state
  const togglePump = async () => {
    try {
      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.PUMP_TOGGLE),
        getCommonFetchOptions('POST')
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Pump toggle response:', data);
      
      // Update local state immediately for better UX
      setSensorData(prev => ({
        ...prev,
        pumpStatus: data.pumpStatus
      }));
      
    } catch (error) {
      console.error('Error toggling pump:', error);
    }
  };

  // Set up interval to fetch data every second
  useEffect(() => {
    // Fetch data immediately on component mount
    fetchSensorData();
    
    // Set up interval to fetch data every second (1000ms)
    const interval = setInterval(fetchSensorData, 1000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []); // Empty dependency array to run only once on mount

  // Sensor data simulation (fallback - removed)

  // Calculate statuses
  const waterTempStatus = getSensorStatus(sensorData.waterTemp, 18, 25);
  const phStatus = getSensorStatus(sensorData.waterPH, 5.5, 7.0);
  const ecStatus = getECStatus(sensorData.ecLevel);
  const tempStatus = getSensorStatus(sensorData.envTemp, 20, 26);
  const humidityStatus = getSensorStatus(sensorData.humidity, 40, 60);
  const lightStatus = getSensorStatus(sensorData.lightLevel, 150, 300);
  const co2Status = getSensorStatus(sensorData.co2Level, 400, 1000);

  // Overall system status
  const allStatuses = [
    waterTempStatus,
    phStatus,
    ecStatus,
    tempStatus,
    humidityStatus,
    lightStatus,
    co2Status,
  ];
  const overallStatus = allStatuses.includes('critical')
    ? 'critical'
    : allStatuses.includes('warning')
    ? 'warning'
    : 'good';

  const TabButton = ({tab, iconName}: {tab: string; iconName: string}) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}>
      <Feather
        name={iconName}
        size={24}
        color={activeTab === tab ? '#FFFFFF' : 'rgba(255,255,255,0.7)'}
      />
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      style={styles.mainContainer}
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.gradientStart}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerFrame}>
          <Text style={styles.headerText}>HYDROPONIC TOWER</Text>
        </View>

        <View style={styles.statusRow}>
          <StatusIndicator
            status={overallStatus}
            label={
              overallStatus === 'good'
                ? 'System OK'
                : overallStatus === 'warning'
                ? 'Warning'
                : 'Critical'
            }
          />
          
          {/* Connection Status Indicator */}
          <View style={styles.connectionStatus}>
            <View
              style={[
                styles.connectionDot,
                {
                  backgroundColor: isLoading
                    ? '#FFA500'
                    : connectionError
                    ? '#FF4444'
                    : '#00FF00',
                },
              ]}
            />
            <Text style={styles.connectionText}>
              {isLoading ? 'Connecting...' : connectionError ? 'Offline' : 'Live'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {activeTab === 'dashboard' && (
          <DashboardScreen
            sensorData={sensorData}
            waterTempStatus={waterTempStatus}
            phStatus={phStatus}
            ecStatus={ecStatus}
            tempStatus={tempStatus}
            humidityStatus={humidityStatus}
            lightStatus={lightStatus}
            co2Status={co2Status}
            onTogglePump={togglePump}
          />
        )}
        {activeTab === 'plotting' && <PlottingScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </ScrollView>

      {/* Bottom Tab Navigation */}
      <View style={styles.tabBar}>
        <TabButton tab="dashboard" iconName="home" />
        <TabButton tab="plotting" iconName="activity" />
        <TabButton tab="settings" iconName="settings" />
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
  header: {
    backgroundColor: 'transparent',
    paddingTop: 5,
    paddingBottom: 10,
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
    borderRadius: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    letterSpacing: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingBottom: 20,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginHorizontal: 2,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: 'rgba(56,178,172,0.3)',
    borderRadius: 8,
    marginHorizontal: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectionText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default App;
