import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { Colors } from '../constants/Colors';

const screenWidth = Dimensions.get('window').width;

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
}

interface HorizontalChartProps {
  data: ChartData;
  selectedSensorOption: any;
  selectedTimeRange: string;
  timeRangeOptions: any[];
  selectedSensor: string;
}

export const HorizontalChart: React.FC<HorizontalChartProps> = React.memo(({
  data,
  selectedSensorOption,
  selectedTimeRange,
  timeRangeOptions,
  selectedSensor
}) => {
  const chartWidth = screenWidth - 60;
  const chartHeight = 250; // Increased to accommodate better spacing
  const values = data.datasets[0].data;
  const labels = data.labels;
  
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

  const decimalPlaces = getDecimalPlaces(selectedSensor);
  
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
        <Text style={styles.yAxisLabel}>{maxValue.toFixed(decimalPlaces)}</Text>
        <Text style={styles.yAxisLabel}>{((maxValue + minValue) / 2).toFixed(decimalPlaces)}</Text>
        <Text style={styles.yAxisLabel}>{minValue.toFixed(decimalPlaces)}</Text>
      </View>
      
      {/* Chart area */}
      <View style={styles.chartArea}>
        <FlatList
          data={values.map((value, index) => ({ 
            value, 
            index, 
            label: labels[index],
            key: `${selectedTimeRange}-${index}-${value}` 
          }))}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            const barHeight = ((item.value - minValue) / range) * 150; // Increased bar scaling area
            return (
              <View style={styles.barColumn}>
                {/* Value on top of bar */}
                <Text style={styles.barValue}>{item.value.toFixed(decimalPlaces)}</Text>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: Math.max(barHeight, 2),
                      backgroundColor: selectedSensorOption?.color || Colors.primary 
                    }
                  ]} 
                />
                {/* Time label at bottom with more spacing */}
                <Text style={styles.barLabel}>{item.label}</Text>
              </View>
            );
          }}
          contentContainerStyle={styles.barsContainer}
          decelerationRate="normal"
          bounces={false}
          alwaysBounceHorizontal={false}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10
          }}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  customChart: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
    paddingBottom: 5, // Reduced bottom padding
    marginBottom: 15,
    width: screenWidth - 40,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 60,
  },
  yAxisContainer: {
    position: 'absolute',
    left: 5,
    top: 75, // Fine-tuned to align perfectly with bar area
    height: 170, // Match the bar height area exactly
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
    alignItems: 'flex-end',
    height: 220, // Much bigger container to fill screen
    paddingHorizontal: 5, // Reduced padding to bring bars closer
    paddingTop: 60, // More top padding for value labels to prevent cutoff
    paddingBottom: 20, // Bottom padding for time labels
  },
  barColumn: {
    alignItems: 'center',
    marginHorizontal: 3, // Much closer spacing
    minWidth: 30, // Narrower columns for closer bars
    height: '100%',
    justifyContent: 'flex-end', // Align bars to bottom
  },
  bar: {
    width: 20, // Normal bar width
    borderRadius: 2,
    marginVertical: 3, // Small margin
  },
  barLabel: {
    fontSize: 8, // Smaller font for closer spacing
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 5, // Less margin
    transform: [{ rotate: '-45deg' }], 
    height: 20, // Smaller height
    width: 30, // Narrower width for closer spacing
    overflow: 'visible',
  },
  barValue: {
    fontSize: 10, // Slightly larger for better visibility
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 0, // More space from bar
    height: 25, // Increased height for visibility to prevent cutoff
    minWidth: 25, // Smaller width for closer spacing
    overflow: 'visible', // Ensure text isn't clipped
    paddingTop: 2, // Small padding to center text vertically
  },
});