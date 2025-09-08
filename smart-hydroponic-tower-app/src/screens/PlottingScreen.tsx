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
import { getSensorData, getDataPointsCount, SensorDataRecord, TimeRange } from '../utils/supabaseConfig';

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

  // Load data when component mounts or time range/sensor changes
  useEffect(() => {
    loadSensorData();
  }, [selectedTimeRange]);

  const loadSensorData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const [data, count] = await Promise.all([
        getSensorData(selectedTimeRange),
        getDataPointsCount(selectedTimeRange)
      ]);
      
      setSensorData(data);
      setDataPointsCount(count);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load sensor data';
      setError(errorMessage);
      console.error('Error loading sensor data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to prepare chart data for the selected sensor
  const prepareChartData = (): ChartData => {
    if (sensorData.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }],
      };
    }

    // Filter out null values and prepare data
    const validData = sensorData
      .map(record => ({
        time: new Date(record.created_at),
        value: record[selectedSensor as keyof SensorDataRecord] as number | null,
      }))
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
          📊 {dataPointsCount} data points • {selectedSensorOption?.label || 'Unknown Sensor'}
        </Text>
        {isLoading && <ActivityIndicator size="small" color={Colors.primary} />}
      </View>

      {/* Error Display */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSensorData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Chart Display */}
      {!isLoading && !error && (
        <View style={styles.chartContainer}>
          {chartData.datasets[0].data.length > 1 && chartData.datasets[0].data.some(d => d > 0) ? (
            <LineChart
              data={chartData}
              width={screenWidth - 40}
              height={220}
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: 'transparent',
                backgroundGradientTo: 'transparent',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.8})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: selectedSensorOption?.color || Colors.primary,
                },
              }}
              bezier
              style={styles.chart}
              withHorizontalLabels={true}
              withVerticalLabels={true}
              withDots={true}
              withShadow={false}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>📊 No data available</Text>
              <Text style={styles.noDataSubtext}>
                {dataPointsCount === 0 
                  ? 'No sensor data found for this time range' 
                  : 'Selected sensor has no valid readings'}
              </Text>
            </View>
          )}
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
