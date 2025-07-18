import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '../constants/Colors';
import {getStatusColor} from '../utils/sensorUtils';

interface SensorData {
  waterTemp: number;
  waterPH: number;
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
}

export const WaterValuesPanel: React.FC<WaterValuesPanelProps> = ({
  sensorData,
  waterTempStatus,
  phStatus,
}) => (
  <LinearGradient
    colors={['#3B82F6', '#1E40AF', '#0EA5E9']}
    style={styles.waterValuesPanel}
    start={{x: 0, y: 0}}
    end={{x: 1, y: 1}}>
    <View style={styles.gridContainer}>
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
          <Text style={styles.gridLabel}>pH:</Text>
          <Text style={[styles.gridValue, {color: getStatusColor(phStatus)}]}>
            {sensorData.waterPH}
          </Text>
        </View>
      </View>

      <View style={styles.gridRow}>
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
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Pump:</Text>
          <Text
            style={[
              styles.gridValue,
              {
                color: sensorData.pumpStatus ? Colors.good : Colors.critical,
              },
            ]}>
            {sensorData.pumpStatus ? 'ON' : 'OFF'}
          </Text>
        </View>
      </View>
    </View>
  </LinearGradient>
);

const styles = StyleSheet.create({
  waterValuesPanel: {
    marginHorizontal: 100,
    marginTop: 5,
    borderRadius: 10,
    padding: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 70,
    height: 'auto',
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
});
