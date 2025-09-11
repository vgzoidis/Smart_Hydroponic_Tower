import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '../constants/Colors';
import {getStatusColor} from '../utils/sensorUtils';

interface SensorData {
  waterTemp: number;
  waterPH: number;
  ecLevel: number;
  waterLevel: boolean;
  pumpStatus: boolean;
  envTemp: number;
  humidity: number;
  lightLevel: number;
  co2Level: number;
}

interface WaterValuesPanelProps {
  sensorData: SensorData;
  waterTempStatus: string;
  phStatus: string;
  ecStatus: string;
}

export const WaterValuesPanel: React.FC<WaterValuesPanelProps> = ({
  sensorData,
  waterTempStatus,
  phStatus,
  ecStatus,
}) => (
  <LinearGradient
    colors={['#08206cff', '#0c6a96ff', '#0e4db4ff']}
    style={[styles.waterValuesPanel, styles.gradientBackground]} // Keep same size always
    start={{x: 0, y: 0}}
    end={{x: 1, y: 1}}>
    
    {/* Visual water level indicator */}
    <View 
      style={[
        styles.waterLevelIndicator,
        sensorData.waterLevel ? styles.normalLevel : styles.lowLevel
      ]}
    />
    
    <View style={styles.gridContainer}>
      <View style={styles.gridRow}>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>pH:</Text>
          <Text style={[styles.gridValue, {color: getStatusColor(phStatus)}]}>
            {sensorData.waterPH}
          </Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>EC:</Text>
          <Text style={[styles.gridValue, {color: getStatusColor(ecStatus)}]}>
            {sensorData.ecLevel}
          </Text>
        </View>
      </View>

      <View style={styles.gridRow}>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>H2O:</Text>
          <Text
            style={[
              styles.gridValue,
              {color: getStatusColor(waterTempStatus)},
            ]}>
            {sensorData.waterTemp}°C
          </Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Level:</Text>
          <Text 
            style={[
              styles.gridValue, 
              {
                color: sensorData.waterLevel ? Colors.good : Colors.critical,
              },
            ]}>
            {sensorData.waterLevel ? 'OK' : 'LOW'}
          </Text>
        </View>
      </View>
    </View>
  </LinearGradient>
);

const styles = StyleSheet.create({
  waterValuesPanel: {
    marginHorizontal: 100,
    marginTop: -10, // Slight overlap with extended tower shaft to eliminate black line
    borderRadius: 8,
    padding: 8,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 74, // 5% taller than before
    height: 'auto',
    overflow: 'hidden', // Ensure no gaps at corners
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
    paddingHorizontal: 1,
    width: '100%',
  },
  gridItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
    minWidth: 70,
    maxWidth: 90,
  },
  gridLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 1,
    textAlign: 'center',
  },
  gridValue: {
    fontSize: 20,
    color: Colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  waterLevelIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 242, 255, 0.2)',
    borderRadius: 0,
  },
  normalLevel: {
    height: '85%', // Normal water level
  },
  lowLevel: {
    height: '35%', // Low water level visual
    backgroundColor: 'rgba(0, 242, 255, 0.2)',
  },
});
