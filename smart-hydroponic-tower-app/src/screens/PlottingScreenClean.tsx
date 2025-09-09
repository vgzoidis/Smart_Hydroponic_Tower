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
import { testConnection, fetchSensorData, type SensorDataRecord, type TimeRange } from '../utils/supabaseConfigSafe';

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
    setConnectionStatus('Ready');
    setError('Select time range and sensor type, then click "Load Data"');
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
        // Filter out records where the selected sensor value is null
        const validData = result.data.filter(record => {
          const value = record[selectedSensor as keyof SensorDataRecord];
          return value !== null && value !== undefined;
        });
        
        console.log(`Filtered ${validData.length} valid records from ${result.data.length} total`);
        
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

  const prepareChartData = (): ChartData => {
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
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } else if (selectedTimeRange === 'week') {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    });

    const values = sampledData.map(record => {
      const value = record[selectedSensor as keyof SensorDataRecord];
      
      // Handle water_level boolean
      if (selectedSensor === 'water_level') {
        return value ? 1 : 0;
      }
      
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
  };

  // Custom chart component using React Native Views
  const CustomChart = ({ data }: { data: ChartData }) => {
    const chartWidth = screenWidth - 60;
    const chartHeight = 180;
    const values = data.datasets[0].data;
    const labels = data.labels;
    
    if (values.length === 0 || values.every(v => v === 0)) {
      return (
        <View style={[styles.customChart, { height: chartHeight }]}>
          <Text style={styles.noDataText}>No chart data available</Text>
        </View>
      );
    }

    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue || 1;
    
    return (
      <View style={styles.customChart}>
        <Text style={styles.chartTitle}>
          {selectedSensorOption?.label} - {timeRangeOptions.find(opt => opt.key === selectedTimeRange)?.label}
        </Text>
        
        {/* Y-axis labels */}
        <View style={styles.yAxisContainer}>
          <Text style={styles.yAxisLabel}>{maxValue.toFixed(1)}</Text>
          <Text style={styles.yAxisLabel}>{((maxValue + minValue) / 2).toFixed(1)}</Text>
          <Text style={styles.yAxisLabel}>{minValue.toFixed(1)}</Text>
        </View>
        
        {/* Chart area */}
        <View style={styles.chartArea}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.barsContainer}>
              {values.map((value, index) => {
                const barHeight = ((value - minValue) / range) * (chartHeight - 60);
                return (
                  <View key={index} style={styles.barColumn}>
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          height: Math.max(barHeight, 2),
                          backgroundColor: selectedSensorOption?.color || Colors.primary 
                        }
                      ]} 
                    />
                    <Text style={styles.barLabel}>{labels[index]}</Text>
                    <Text style={styles.barValue}>{value.toFixed(1)}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    );
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

      {/* Controls Section */}
      <View style={styles.controlsSection}>
        <TouchableOpacity 
          style={[
            styles.actionButton,
            connectionStatus === 'Connected' ? styles.loadDataButton : styles.connectButton
          ]} 
          onPress={connectionStatus === 'Connected' ? loadSensorData : handleTestConnection}
          disabled={isLoading}
        >
          <Text style={styles.actionButtonText}>
            {isLoading ? 'Loading...' : 
             connectionStatus === 'Connected' ? 'Refresh Data' : 'Connect & Load Data'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chart Section */}
      <View style={styles.chartContainer}>
        {connectionStatus === 'Connected' && sensorData.length > 0 && !isLoading ? (
          <View>
            {/* Custom chart using React Native Views */}
            <CustomChart data={chartData} />
            
            {/* Keep data preview below chart */}
            <View style={styles.dataList}>
              <Text style={styles.dataListTitle}>Recent Data (Last 5 readings):</Text>
              {sensorData.slice(-5).map((record, index) => (
                <Text key={index} style={styles.dataRow}>
                  {new Date(record.created_at).toLocaleString()}: {
                    selectedSensor === 'water_level' 
                      ? (record[selectedSensor as keyof SensorDataRecord] ? 'High' : 'Low')
                      : record[selectedSensor as keyof SensorDataRecord]
                  }
                </Text>
              ))}
            </View>
          </View>
        ) : sensorData.length === 0 && connectionStatus === 'Connected' && !isLoading ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No Data Available</Text>
            <Text style={styles.noDataSubtext}>
              No {selectedSensorOption?.label.toLowerCase()} data found for the selected time range
            </Text>
          </View>
        ) : connectionStatus !== 'Connected' ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Database Not Connected</Text>
            <Text style={styles.noDataSubtext}>
              Click "Connect & Load Data" to fetch sensor data from Supabase
            </Text>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.noDataText}>Loading Data...</Text>
          </View>
        )}
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
