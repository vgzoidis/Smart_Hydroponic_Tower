import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { HorizontalChart } from '../components/HorizontalChart';

// Import safe Supabase functions
import { testConnection, fetchSensorData, type SensorDataRecord, type TimeRange } from '../utils/supabaseConfig';

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
  ];

  // Time range options
  const timeRangeOptions: { key: TimeRange; label: string }[] = [
    { key: 'day', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ];

  // Initialize with safe defaults and auto-connect
  useEffect(() => {
    console.log('PlottingScreen mounted successfully');
    // Auto-connect when component mounts
    handleTestConnection();
  }, []);

  // Load data when sensor or time range changes
  useEffect(() => {
    if (connectionStatus === 'Connected') {
      loadSensorData();
    }
  }, [selectedTimeRange, selectedSensor, connectionStatus]);

  const handleTestConnection = async () => {
    try {
      setConnectionStatus('Testing...');
      setError('');
      setIsLoading(true);

      const result = await testConnection();
      
      if (result.success) {
        setConnectionStatus('Connected');
        setError('');
        // Automatically load data after successful connection
        loadSensorData();
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

  const loadSensorData = async () => {
    try {
      setIsLoading(true);
      setError('');

      console.log(`Loading ${selectedSensor} data for ${selectedTimeRange}...`);
      
      // Add a small delay to see if the crash happens immediately
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = await fetchSensorData(selectedTimeRange);
      
      console.log('Fetch result:', { 
        hasError: !!result.error, 
        dataLength: result.data?.length || 0,
        error: result.error 
      });
      
      if (result.error) {
        setError(`Data fetch error: ${result.error}`);
        setSensorData([]);
        setDataPointsCount(0);
      } else {
        // Filter out records where the selected sensor value is null, undefined, or invalid
        const validData = result.data.filter(record => {
          const value = record[selectedSensor as keyof SensorDataRecord];
          
          // Handle different sensor types differently
          if (selectedSensor === 'ec_level') {
            // For EC level, treat values > 0 as valid (0 might be a placeholder)
            return value !== null && value !== undefined && typeof value === 'number' && value > 0;
          } else {
            // For other sensors, any non-null numeric value is valid
            return value !== null && value !== undefined && typeof value === 'number';
          }
        });
        
        console.log(`Filtered ${validData.length} valid records from ${result.data.length} total`);
        console.log(`Selected sensor: ${selectedSensor}`);
        
        // Debug: Log detailed info about the filtering
        if (result.data.length > 0) {
          const sampleRecord = result.data[0];
          console.log(`Sample record for ${selectedSensor}:`, sampleRecord[selectedSensor as keyof SensorDataRecord]);
          console.log('Available fields in record:', Object.keys(sampleRecord));
          
          // Count how many records have different value types for this sensor
          const nullCount = result.data.filter(record => {
            const value = record[selectedSensor as keyof SensorDataRecord];
            return value === null || value === undefined;
          }).length;
          
          const zeroCount = result.data.filter(record => {
            const value = record[selectedSensor as keyof SensorDataRecord];
            return value === 0;
          }).length;
          
          const validCount = result.data.filter(record => {
            const value = record[selectedSensor as keyof SensorDataRecord];
            return value !== null && value !== undefined && typeof value === 'number' && value > 0;
          }).length;
          
          console.log(`${selectedSensor} - Null/undefined: ${nullCount}, Zero values: ${zeroCount}, Valid (>0): ${validCount}, Total: ${result.data.length}`);
        }
        
        setSensorData(validData);
        setDataPointsCount(validData.length);
        setError('');
        console.log(`Successfully loaded ${validData.length} valid data points`);
      }
    } catch (error) {
      console.error('Load data error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to load data: ${errorMessage}`);
      setSensorData([]);
      setDataPointsCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedSensorOption = sensorOptions.find(option => option.key === selectedSensor);

  // Helper function to get decimal places for different sensors
  const getDecimalPlaces = (sensorType: string): number => {
    switch (sensorType) {
      case 'ph_level':
      case 'ec_level':
        return 2;
      case 'light_level':
      case 'co2_level':
        return 0;
      default:
        return 1;
    }
  };

  // Calculate statistics for the data info panel
  const calculateStatistics = useMemo(() => {
    if (sensorData.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0, unit: '' };
    }

    const values = sensorData.map(record => {
      const value = record[selectedSensor as keyof SensorDataRecord];
      return typeof value === 'number' ? value : 0;
    }).filter(value => value !== null && value !== undefined);

    if (values.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0, unit: '' };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;

    // Get unit based on sensor type
    let unit = '';
    switch (selectedSensor) {
      case 'water_temp':
      case 'env_temp':
        unit = '°C';
        break;
      case 'ph_level':
        unit = 'pH';
        break;
      case 'ec_level':
        unit = 'mS/cm';
        break;
      case 'humidity':
        unit = '%';
        break;
      case 'light_level':
        unit = 'lux';
        break;
      case 'co2_level':
        unit = 'ppm';
        break;
      default:
        unit = '';
    }

    return { count: values.length, average, min, max, unit };
  }, [sensorData, selectedSensor]);

  const prepareChartData = useMemo((): ChartData => {
    if (sensorData.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }],
      };
    }

    // Sample data points for performance (max 10 points for bar chart)
    const maxPoints = 10;
    const step = Math.ceil(sensorData.length / maxPoints);
    const sampledData = sensorData.filter((_, index) => index % step === 0);

    const labels = sampledData.map(record => {
      const date = new Date(record.created_at);
      if (selectedTimeRange === 'day') {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      } else if (selectedTimeRange === 'week') {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    });

    const values = sampledData.map(record => {
      const value = record[selectedSensor as keyof SensorDataRecord];
      return typeof value === 'number' ? value : 0;
    });

    const selectedColor = selectedSensorOption?.color || Colors.primary;

    return {
      labels,
      datasets: [{
        data: values,
        color: (opacity = 1) => selectedColor,
        strokeWidth: 2,
      }],
    };
  }, [sensorData, selectedTimeRange, selectedSensor, selectedSensorOption]);

  const chartData = prepareChartData;

  return (
    <View style={styles.container}>
      <View style={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Sensor Data Visualization</Text>
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

        {/* Chart Section */}
        <View style={styles.chartContainer}>
          {sensorData.length > 0 && !isLoading ? (
            <View>
              {/* Custom chart using React Native Views */}
              <HorizontalChart 
                data={chartData} 
                selectedSensorOption={selectedSensorOption}
                selectedTimeRange={selectedTimeRange}
                timeRangeOptions={timeRangeOptions}
                selectedSensor={selectedSensor}
              />
            </View>
          ) : sensorData.length === 0 && !isLoading ? (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>- No Data Available -</Text>
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.noDataText}>Loading Data...</Text>
            </View>
          )}
        </View>
      </View>

      {/* Data Info Panel - Fixed at bottom */}
      <View style={styles.dataInfoFixed}>
        <Text style={styles.dataInfoText}>
          {calculateStatistics.count > 0 
            ? `Average: ${calculateStatistics.average.toFixed(getDecimalPlaces(selectedSensor))}${calculateStatistics.unit} | Range: ${calculateStatistics.min.toFixed(getDecimalPlaces(selectedSensor))}-${calculateStatistics.max.toFixed(getDecimalPlaces(selectedSensor))} | ${calculateStatistics.count} data points`
            : `${calculateStatistics.count} data points`
          }
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flex: 1,
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
    marginBottom: 0,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  dataInfoText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  connectionStatus: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginLeft: 10,
  },
  dataInfoFixed: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 5,
    backgroundColor: 'transparent',
  },
  dataInfoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dataPointsText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  debugInfo: {
    marginHorizontal: 20,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,165,0,0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,165,0,0.3)',
  },
  debugText: {
    color: '#FFA500',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
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
    flex: 1, // Take up remaining space
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  noDataContainer: {
    width: screenWidth - 40,
    height: 200, // Reduced to match chart container
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
  controlsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 180,
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: Colors.primary,
  },
  loadDataButton: {
    backgroundColor: Colors.good,
  },
  actionButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  dataPreview: {
    fontSize: 16,
    color: Colors.warning,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '600',
  },
  dataList: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 15,
    width: screenWidth - 40,
  },
  dataListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  dataRow: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  customChart: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    width: screenWidth - 40,
  },
  yAxisContainer: {
    position: 'absolute',
    left: 5,
    top: 40,
    height: 140,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: 30,
  },
  yAxisLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  chartArea: {
    marginLeft: 35,
    marginTop: 10,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    paddingHorizontal: 10,
  },
  barColumn: {
    alignItems: 'center',
    marginHorizontal: 8,
    minWidth: 40,
  },
  bar: {
    width: 20,
    borderRadius: 2,
    marginBottom: 5,
  },
  barLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 5,
    transform: [{ rotate: '-45deg' }],
  },
  barValue: {
    fontSize: 10,
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
});