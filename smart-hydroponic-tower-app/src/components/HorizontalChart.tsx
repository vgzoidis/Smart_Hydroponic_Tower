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
}

export const HorizontalChart: React.FC<HorizontalChartProps> = React.memo(({
  data,
  selectedSensorOption,
  selectedTimeRange,
  timeRangeOptions
}) => {
  const chartWidth = screenWidth - 60;
  const chartHeight = 200; // Slightly increased to accommodate labels
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
            const barHeight = ((item.value - minValue) / range) * (chartHeight - 100); // Better ratio for bar height
            return (
              <View style={styles.barColumn}>
                {/* Value on top of bar */}
                <Text style={styles.barValue}>{item.value.toFixed(1)}</Text>
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
    paddingBottom: 10, // Reduced bottom padding
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
    top: 45, // Adjusted back to original position
    height: 100, // Smaller to match bars
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
    height: 140, // Back to reasonable height
    paddingHorizontal: 10, // Normal padding
    paddingTop: 20, // Reasonable top padding
    paddingBottom: 10, // Reduced bottom padding
  },
  barColumn: {
    alignItems: 'center',
    marginHorizontal: 8, // Normal spacing
    minWidth: 40, // Normal width
    height: '100%',
    justifyContent: 'flex-end', // Align bars to bottom
  },
  bar: {
    width: 20, // Normal bar width
    borderRadius: 2,
    marginVertical: 3, // Small margin
  },
  barLabel: {
    fontSize: 9, // Normal font size
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8, // More margin to push labels down
    transform: [{ rotate: '-45deg' }], // Back to normal rotation
    height: 25, // More height for rotated text
    width: 40, // More width for rotated text
    overflow: 'visible', // Ensure text isn't clipped
  },
  barValue: {
    fontSize: 10, // Normal font size
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    height: 16,
    minWidth: 30,
  },
});
