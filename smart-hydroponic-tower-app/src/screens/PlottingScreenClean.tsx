import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../constants/Colors';

// Import safe Supabase functions
import { testConnection, type SensorDataRecord, type TimeRange } from '../utils/supabaseConfigSafe';

const screenWidth = Dimensions.get('window').width;

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
}

export const PlottingScreen: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('day');
  const [selectedSensor, setSelectedSensor] = useState<string>('water_temp');
  const [sensorData, setSensorData] = useState<SensorDataRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [dataPointsCount, setDataPointsCount] = useState<number>(0);
  const [connectionStatus, setConnectionStatus] = useState<string>('Not Connected');

  // Sensor options for plotting (matching your database schema)
  const sensorOptions = [
    { key: 'water_temp', label: 'Water Temp (°C)', color: Colors.primary },
    { key: 'ph_level', label: 'pH Level', color: Colors.good },
    { key: 'ec_level', label: 'EC Level (mS/cm)', color: Colors.warning },
    { key: 'env_temp', label: 'Env Temp (°C)', color: Colors.accent },
    { key: 'humidity', label: 'Humidity (%)', color: Colors.critical },
    { key: 'light_level', label: 'Light Level (lux)', color: '#FFD700' },
    { key: 'co2_level', label: 'CO₂ Level (ppm)', color: '#FF6B6B' },
    { key: 'water_level', label: 'Water Level', color: '#00CED1' },
  ];

  // Time range options
  const timeRangeOptions: { key: TimeRange; label: string }[] = [
    { key: 'day', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ];

  // Initialize with safe defaults
  useEffect(() => {
    console.log('PlottingScreen mounted successfully');
    setConnectionStatus('Ready to test');
    setError('Click "Test Connection" to check database connectivity');
  }, []);

  const handleTestConnection = async () => {
    try {
      setConnectionStatus('Testing...');
      setError('');
      setIsLoading(true);

      const result = await testConnection();
      
      if (result.success) {
        setConnectionStatus('Connected');
        setError('');
      } else {
        setConnectionStatus('Failed');
        setError(result.message);
      }
    } catch (error) {
      setConnectionStatus('Error');
      setError(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const prepareChartData = (): ChartData => {
    return {
      labels: ['No Data'],
      datasets: [{ data: [0] }],
    };
  };

  const chartData = prepareChartData();
  const selectedSensorOption = sensorOptions.find(option => option.key === selectedSensor);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sensor Data Plotting</Text>
        <Text style={styles.subtitle}>Historical data visualization</Text>
      </View>

      {/* Time Range Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Time Range</Text>
        <View style={styles.buttonRow}>
          {timeRangeOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.toggleButton,
                selectedTimeRange === option.key && styles.toggleButtonActive,
              ]}
              onPress={() => setSelectedTimeRange(option.key)}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  selectedTimeRange === option.key && styles.toggleButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sensor Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sensor Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.sensorRow}>
            {sensorOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.sensorButton,
                  selectedSensor === option.key && { backgroundColor: option.color },
                ]}
                onPress={() => setSelectedSensor(option.key)}
              >
                <Text
                  style={[
                    styles.sensorButtonText,
                    selectedSensor === option.key && styles.sensorButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Data Info */}
      <View style={styles.dataInfo}>
        <Text style={styles.dataInfoText}>
          {dataPointsCount} data points • {selectedSensorOption?.label || 'Unknown Sensor'}
        </Text>
        <Text style={styles.connectionStatus}>{connectionStatus}</Text>
        {isLoading && <ActivityIndicator size="small" color={Colors.primary} />}
      </View>

      {/* Error Display */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      ) : null}

      {/* Test Connection Button */}
      <View style={styles.testSection}>
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={handleTestConnection}
          disabled={isLoading}
        >
          <Text style={styles.testButtonText}>
            {isLoading ? 'Testing...' : 'Test Connection'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chart Placeholder */}
      <View style={styles.chartContainer}>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Chart Temporarily Disabled</Text>
          <Text style={styles.noDataSubtext}>
            Testing component stability before enabling Supabase integration
          </Text>
        </View>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading sensor data...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  toggleButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    color: Colors.text,
    fontWeight: '600',
  },
  sensorRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 20,
  },
  sensorButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 100,
  },
  sensorButtonText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  sensorButtonTextActive: {
    color: Colors.text,
    fontWeight: '600',
  },
  dataInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  dataInfoText: {
    color: Colors.textSecondary,
    fontSize: 14,
    flex: 1,
  },
  connectionStatus: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginLeft: 10,
  },
  errorContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(255,69,58,0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,69,58,0.3)',
  },
  errorText: {
    color: '#FF453A',
    fontSize: 14,
    marginBottom: 10,
  },
  chartContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  noDataContainer: {
    width: screenWidth - 40,
    height: 220,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  noDataText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    opacity: 0.7,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: 10,
  },
  testSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  testButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  testButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
