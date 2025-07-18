import React, {useState} from 'react';
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
import {getSensorStatus} from './src/utils/sensorUtils';
import {StatusIndicator} from './src/components/StatusIndicator';
import {DashboardScreen} from './src/screens/DashboardScreen';
import {PlottingScreen} from './src/screens/PlottingScreen';
import {SettingsScreen} from './src/screens/SettingsScreen';

function App(): JSX.Element {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Sensor data simulation
  const [sensorData] = useState({
    waterTemp: 25.4,
    waterPH: 7.6,
    waterLevel: true,
    pumpStatus: false,
    envTemp: 25.3,
    humidity: 49,
    lightLevel: 181,
    co2Level: 1627,
  });

  // Calculate statuses
  const waterTempStatus = getSensorStatus(sensorData.waterTemp, 18, 25);
  const phStatus = getSensorStatus(sensorData.waterPH, 5.5, 7.0);
  const tempStatus = getSensorStatus(sensorData.envTemp, 20, 26);
  const humidityStatus = getSensorStatus(sensorData.humidity, 40, 60);
  const lightStatus = getSensorStatus(sensorData.lightLevel, 150, 300);
  const co2Status = getSensorStatus(sensorData.co2Level, 400, 1000);

  // Overall system status
  const allStatuses = [
    waterTempStatus,
    phStatus,
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
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {activeTab === 'dashboard' && (
          <DashboardScreen
            sensorData={sensorData}
            waterTempStatus={waterTempStatus}
            phStatus={phStatus}
            tempStatus={tempStatus}
            humidityStatus={humidityStatus}
            lightStatus={lightStatus}
            co2Status={co2Status}
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
});

export default App;
