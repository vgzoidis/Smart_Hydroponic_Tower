import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {PlantLevel} from './PlantLevel';
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

interface TowerVisualizationProps {
  sensorData: SensorData;
  lightStatus: string;
  co2Status: string;
  tempStatus: string;
  humidityStatus: string;
}

export const TowerVisualization: React.FC<TowerVisualizationProps> = ({
  sensorData,
  lightStatus,
  co2Status,
  tempStatus,
  humidityStatus,
}) => (
  <View style={styles.dashboardContainer}>
    {/* Left Side - Light and CO2 */}
    <View style={styles.sensorColumn}>
      <View style={styles.sensorItem}>
        <Text style={styles.sensorGridLabel}>Light:</Text>
        <Text
          style={[
            styles.sensorGridValue,
            {color: getStatusColor(lightStatus)},
          ]}>
          {sensorData.lightLevel} lx
        </Text>
      </View>
      <View style={styles.sensorItem}>
        <Text style={styles.sensorGridLabel}>CO2:</Text>
        <Text
          style={[styles.sensorGridValue, {color: getStatusColor(co2Status)}]}>
          {sensorData.co2Level} ppm
        </Text>
      </View>
    </View>

    {/* Center - Tower */}
    <View style={styles.towerContainer}>
      <View style={styles.tower}>
        <View style={styles.mainTowerSegment} />
        {[...Array(6)].map((_, index) => (
          <View key={index} style={styles.towerLevel}>
            <PlantLevel active={true} />
            <View style={styles.towerLevelSpacer} />
            <PlantLevel active={true} />
          </View>
        ))}
      </View>
    </View>

    {/* Right Side - Temperature and Humidity */}
    <View style={styles.sensorColumn}>
      <View style={styles.sensorItem}>
        <Text style={styles.sensorGridLabel}>Temp:</Text>
        <Text
          style={[styles.sensorGridValue, {color: getStatusColor(tempStatus)}]}>
          {sensorData.envTemp}°C
        </Text>
      </View>
      <View style={styles.sensorItem}>
        <Text style={styles.sensorGridLabel}>Humidity:</Text>
        <Text
          style={[
            styles.sensorGridValue,
            {color: getStatusColor(humidityStatus)},
          ]}>
          {sensorData.humidity}%
        </Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  dashboardContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 5,
    alignItems: 'center',
  },
  sensorColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  sensorItem: {
    alignItems: 'center',
    marginVertical: 30,
    paddingHorizontal: 0,
    width: '100%',
  },
  sensorGridLabel: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  sensorGridValue: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
    flexShrink: 0,
  },
  towerContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    minHeight: 350,
  },
  tower: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  mainTowerSegment: {
    position: 'absolute',
    width: 50,
    height: 440,
    backgroundColor: Colors.tower,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 1,
    top: 20,
  },
  towerLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    zIndex: 2,
  },
  towerLevelSpacer: {
    width: 20,
    height: 50,
    marginHorizontal: 10,
  },
});
