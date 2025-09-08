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

  // Sensor options for plotting
  const sensorOptions = [
    { key: 'water_temp', label: 'Water Temp (°C)', color: Colors.primary },
    { key: 'water_ph', label: 'pH Level', color: Colors.good },
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

  // Fetch sensor data when time range changes
  useEffect(() => {
    fetchData();
  }, [selectedTimeRange]);

  const fetchData = async () => {
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
      console.error('Error fetching data:', err);
      setError('Failed to load sensor data. Please check your Supabase configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format data for chart
  const formatChartData = (): ChartData => {
    if (!sensorData.length) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }]
      };
    }

    // Sample data points based on time range to avoid overcrowding
    let sampledData = sensorData;
    const maxPoints = 20;
    
    if (sensorData.length > maxPoints) {
      const step = Math.ceil(sensorData.length / maxPoints);
      sampledData = sensorData.filter((_, index) => index % step === 0);
    }

    const labels = sampledData.map(record => {
      const date = new Date(record.created_at);
      switch (selectedTimeRange) {
        case 'day':
          return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        case 'week':
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        case 'month':
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        default:
          return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      }
    });

    const currentSensor = sensorOptions.find(s => s.key === selectedSensor);
    const data = sampledData.map(record => {
      const value = record[selectedSensor as keyof SensorDataRecord];
      return typeof value === 'number' ? value : 0;
    });

    return {
      labels,
      datasets: [{
        data,
        color: (opacity = 1) => currentSensor?.color || Colors.primary,
        strokeWidth: 3,
      }]
    };
  };

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'rgba(255,255,255,0.1)',
    backgroundGradientTo: 'rgba(255,255,255,0.05)',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: Colors.primary,
    },
  };

  const TimeRangeToggle = () => (
    <View style={styles.toggleContainer}>
      <Text style={styles.sectionTitle}>Time Range</Text>
      <View style={styles.toggleRow}>
        {timeRangeOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.toggleButton,
              selectedTimeRange === option.key && styles.activeToggleButton,
            ]}
            onPress={() => setSelectedTimeRange(option.key)}
          >
            <Text
              style={[
                styles.toggleButtonText,
                selectedTimeRange === option.key && styles.activeToggleButtonText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const SensorSelector = () => (
    <View style={styles.toggleContainer}>
      <Text style={styles.sectionTitle}>Select Sensor</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sensorScrollView}>
        {sensorOptions.map((sensor) => (
          <TouchableOpacity
            key={sensor.key}
            style={[
              styles.sensorButton,
              selectedSensor === sensor.key && styles.activeSensorButton,
              { borderColor: sensor.color }
            ]}
            onPress={() => setSelectedSensor(sensor.key)}
          >
            <Text
              style={[
                styles.sensorButtonText,
                selectedSensor === sensor.key && styles.activeSensorButtonText,
              ]}
            >
              {sensor.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.tabContent}>
      <Text style={styles.tabTitle}>Sensor Data Plotting</Text>
      
      <TimeRangeToggle />
      <SensorSelector />

      {/* Data Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Data Points: {dataPointsCount} | Showing: {sensorData.length} points
        </Text>
      </View>

      {/* Error Message */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Loading Indicator */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading sensor data...</Text>
        </View>
      ) : null}

      {/* Chart */}
      {!isLoading && !error && sensorData.length > 0 ? (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>
            {sensorOptions.find(s => s.key === selectedSensor)?.label} - {timeRangeOptions.find(t => t.key === selectedTimeRange)?.label}
          </Text>
          <LineChart
            data={formatChartData()}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withDots={true}
            withShadow={false}
            withScrollableDot={true}
          />
        </View>
      ) : !isLoading && !error ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available for the selected time range</Text>
        </View>
      ) : null}

      {/* Configuration Note */}
      <View style={styles.configNote}>
        <Text style={styles.configNoteText}>
          � Note: Update the Supabase configuration in src/utils/supabaseConfig.ts with your project URL and API key.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
    alignItems: 'center',
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  toggleContainer: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  activeToggleButton: {
    backgroundColor: Colors.primary,
  },
  toggleButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  activeToggleButtonText: {
    color: Colors.text,
  },
  sensorScrollView: {
    flexDirection: 'row',
  },
  sensorButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.surfaceLight,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 10,
    alignItems: 'center',
  },
  activeSensorButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  sensorButtonText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  activeSensorButtonText: {
    color: Colors.text,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  errorContainer: {
    width: '100%',
    backgroundColor: 'rgba(244,67,54,0.1)',
    borderColor: Colors.critical,
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  errorText: {
    color: Colors.critical,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: Colors.critical,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 10,
  },
  chartContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 15,
  },
  chart: {
    borderRadius: 8,
  },
  noDataContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  noDataText: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  configNote: {
    width: '100%',
    backgroundColor: 'rgba(255,165,0,0.1)',
    borderColor: Colors.warning,
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
  },
  configNoteText: {
    color: Colors.warning,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
