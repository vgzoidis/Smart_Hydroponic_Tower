import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '../constants/Colors';

// Import Supabase functions with safer approach - MINIMAL VERSION
import { type SensorDataRecord, type TimeRange } from '../utils/supabaseConfig';

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
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');

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

  // Load data when component mounts or time range/sensor changes - DISABLED FOR DEBUGGING
  useEffect(() => {
    try {
      // loadSensorData();
      console.log('PlottingScreen mounted, data loading disabled for debugging');
    } catch (error) {
      console.error('Error in useEffect loadSensorData:', error);
      setError('Failed to initialize data loading');
    }
  }, [selectedTimeRange]);

  // Test connection on mount - RE-ENABLED WITH BETTER ERROR HANDLING
  useEffect(() => {
    const initializeConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        setConnectionStatus('� Testing...');
        
        // Add a small delay to ensure component is mounted
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const isConnected = await testSupabaseConnection();
        setConnectionStatus(isConnected ? '✅ Connected' : '❌ Disconnected');
        
        if (!isConnected) {
          setError('Database connection failed. Data plotting may not work.');
        }
      } catch (error) {
        console.error('Connection test error:', error);
        setConnectionStatus('❌ Connection Error');
        setError(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    
    initializeConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus('🔄 Testing...');
      setError('');
      
      // Test network first
      console.log('Testing network connectivity...');
      const hasNetwork = await testNetworkConnectivity();
      if (!hasNetwork) {
        setConnectionStatus('❌ No Network');
        setError('No internet connection detected. Please check your network settings.');
        return;
      }
      
      // Test Supabase connection
      console.log('Testing Supabase connection...');
      const isConnected = await testSupabaseConnection();
      if (isConnected) {
        setConnectionStatus('✅ Connected');
        setError('');
      } else {
        setConnectionStatus('❌ DB Failed');
        setError('Database connection failed. Please check if your Supabase instance is running.');
      }
    } catch (error) {
      setConnectionStatus('❌ Error');
      setError(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Connection test error:', error);
    }
  };

  const loadSensorData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // DISABLE SUPABASE CALLS FOR DEBUGGING
      /*
      // Load data and count separately to handle partial failures
      let data: SensorDataRecord[] = [];
      let count: number = 0;

      try {
        data = await getSensorData(selectedTimeRange);
      } catch (dataError) {
        console.error('Error loading sensor data:', dataError);
        setError('Failed to load sensor data. Please check your internet connection.');
        return;
      }

      try {
        count = await getDataPointsCount(selectedTimeRange);
      } catch (countError) {
        console.warn('Error loading data count:', countError);
        // Continue with count = 0, this is not critical
      }
      
      setSensorData(data);
      setDataPointsCount(count);
      */
      
      // Mock data for testing
      setSensorData([]);
      setDataPointsCount(0);
      setError('Supabase disabled for debugging');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load sensor data';
      setError(errorMessage);
      console.error('Error loading sensor data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const prepareChartData = (): ChartData => {
    try {
      if (sensorData.length === 0) {
        return {
          labels: ['No Data'],
          datasets: [{ data: [0] }],
        };
      }

      // Filter out null values and prepare data
      const validData = sensorData
        .map(record => {
          let value: number | null = null;
          
          // Safely access the sensor value
          try {
            const sensorValue = record[selectedSensor as keyof SensorDataRecord];
            if (typeof sensorValue === 'number') {
              value = sensorValue;
            } else if (typeof sensorValue === 'boolean') {
              value = sensorValue ? 1 : 0; // Convert boolean to number for water_level
            }
          } catch (error) {
            console.warn('Error accessing sensor value:', error);
          }
          
          return {
            time: new Date(record.created_at),
            value: value,
          };
        })
        .filter(item => item.value !== null && item.value !== undefined);

      if (validData.length === 0) {
        return {
          labels: ['No Data'],
          datasets: [{ data: [0] }],
        };
      }

      // Create labels based on time range
      const labels = validData.map(item => {
        const time = item.time;
        if (selectedTimeRange === 'day') {
          return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (selectedTimeRange === 'week') {
          return time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else {
          return time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
      });

      const selectedSensorOption = sensorOptions.find(option => option.key === selectedSensor);
      const sensorColor = selectedSensorOption?.color || Colors.primary;

      return {
        labels,
        datasets: [{
          data: validData.map(item => item.value as number),
          color: (opacity = 1) => sensorColor,
          strokeWidth: 2,
        }],
      };
    } catch (error) {
      console.error('Error preparing chart data:', error);
      return {
        labels: ['Error'],
        datasets: [{ data: [0] }],
      };
    }
  };

  const chartData = prepareChartData();
  const selectedSensorOption = sensorOptions.find(option => option.key === selectedSensor);

  // Add crash protection
  try {
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
          📊 {dataPointsCount} data points • {selectedSensorOption?.label || 'Unknown Sensor'}
        </Text>
        <View style={styles.connectionContainer}>
          <Text style={styles.connectionStatus}>{connectionStatus}</Text>
          <TouchableOpacity style={styles.testButton} onPress={testConnection}>
            <Text style={styles.testButtonText}>Test</Text>
          </TouchableOpacity>
        </View>
        {isLoading && <ActivityIndicator size="small" color={Colors.primary} />}
      </View>        {/* Error Display */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={testConnection}>
              <Text style={styles.retryButtonText}>Test Connection</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Chart Display - TEMPORARILY DISABLED FOR DEBUGGING */}
        {!isLoading && !error && (
          <View style={styles.chartContainer}>
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>📊 Chart Temporarily Disabled</Text>
              <Text style={styles.noDataSubtext}>
                Testing without LineChart component - Data Points: {chartData.datasets[0].data.length}
              </Text>
              <Text style={styles.noDataSubtext}>
                Valid Data: {chartData.datasets[0].data.some(d => d > 0) ? 'Yes' : 'No'}
              </Text>
            </View>
          </View>
        )}

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading sensor data...</Text>
          </View>
        )}
      </ScrollView>
    );
  } catch (renderError) {
    console.error('Render error in PlottingScreen:', renderError);
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ App Error: {renderError instanceof Error ? renderError.message : 'Unknown error'}</Text>
          <Text style={styles.errorText}>Please restart the app</Text>
        </View>
      </View>
    );
  }
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
  connectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testButton: {
    marginLeft: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
  },
  testButtonText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
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
  retryButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,69,58,0.2)',
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FF453A',
    fontSize: 12,
    fontWeight: '600',
  },
  chartContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
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
});
