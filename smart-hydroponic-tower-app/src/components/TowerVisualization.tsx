import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated, TouchableOpacity} from 'react-native';
import {PlantLevel} from './PlantLevel';
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

interface TowerVisualizationProps {
  sensorData: SensorData;
  lightStatus: string;
  co2Status: string;
  tempStatus: string;
  humidityStatus: string;
  onTogglePump: () => void;
}

export const TowerVisualization: React.FC<TowerVisualizationProps> = ({
  sensorData,
  lightStatus,
  co2Status,
  tempStatus,
  humidityStatus,
  onTogglePump,
}) => {
  const waterFlowAnim = useRef(new Animated.Value(0)).current;
  const streamPositions = useRef([
    new Animated.Value(0), // Stream 1
    new Animated.Value(0), // Stream 2
    new Animated.Value(0), // Stream 3
  ]).current;

  useEffect(() => {
    let animationRefs: NodeJS.Timeout[] = [];

    if (sensorData.pumpStatus) {
      // Continuous water stream animation - multiple drops flowing downward from top to water tank
      const animateStream = (streamAnim: Animated.Value, delay: number) => {
        const animate = () => {
          streamAnim.setValue(0); // Start from top of tower
          Animated.timing(streamAnim, {
            toValue: 360, // Travel to the bottom to reach water panel
            duration: 2500,
            useNativeDriver: true,
          }).start(() => {
            if (sensorData.pumpStatus) {
              const timeoutId = setTimeout(animate, 200); // Shorter delay between cycles
              animationRefs.push(timeoutId);
            }
          });
        };
        
        const timeoutId = setTimeout(animate, delay);
        animationRefs.push(timeoutId);
      };

      // Start multiple streams with staggered delays
      animateStream(streamPositions[0], 400);
      animateStream(streamPositions[1], 0);
      animateStream(streamPositions[2], 800);
    } else {
      // Reset all streams to top position when pump stops
      streamPositions.forEach(stream => {
        stream.stopAnimation();
        stream.setValue(0);
      });
    }

    // Cleanup function to clear timeouts
    return () => {
      animationRefs.forEach(ref => clearTimeout(ref));
    };
  }, [sensorData.pumpStatus, streamPositions]);

  return (
  <View style={styles.dashboardContainer}>
    {/* Left Side - Light and CO2 */}
    <View style={[styles.sensorColumn, styles.leftColumn]}>
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
        <View style={styles.mainTowerSegment}>
          {/* Water Stream Animation placed inside the tower segment so it's clipped */}
          {sensorData.pumpStatus && streamPositions.map((streamPos, index) => (
            <Animated.View
              key={index}
              style={[
                styles.waterStreamInside,
                {
                  transform: [
                    {translateY: streamPos},
                    {translateX: (index - 1) * 10}, // offsets: -10, 0, 10
                  ],
                },
              ]}>
              <View style={styles.waterStreamSegment} />
              <View style={[styles.waterStreamSegment, {marginTop: 10}]} />
              <View style={[styles.waterStreamSegment, {marginTop: 20}]} />
              <View style={[styles.waterStreamSegment, {marginTop: 30}]} />
              <View style={[styles.waterStreamSegment, {marginTop: 40}]} />
              <View style={[styles.waterStreamSegment, {marginTop: 50}]} />
              <View style={[styles.waterStreamSegment, {marginTop: 60}]} />
            </Animated.View>
          ))}
        </View>
        
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
    <View style={[styles.sensorColumn, styles.rightColumn]}>
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
      
      {/* Pump Status Button */}
      <TouchableOpacity 
        style={[
          styles.pumpButton, 
          {backgroundColor: sensorData.pumpStatus ? Colors.good : Colors.critical}
        ]}
        onPress={onTogglePump}
      >
        <Text style={styles.pumpButtonLabel}>Pump</Text>
        <Text style={styles.pumpButtonText}>
          {sensorData.pumpStatus ? 'ON' : 'OFF'}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
  );
};

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
    minHeight: 400, // Increased to allow tower extension
  },
  tower: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
    // Removed overflow hidden to allow tower extension
  },
  mainTowerSegment: {
    position: 'absolute',
    width: 50,
    height: 520, // Extended height to reach water panel
    backgroundColor: Colors.tower,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 1,
    top: 20,
    overflow: 'hidden', // clip streams inside tower shape
  },
  waterStreamInside: {
    position: 'absolute',
    left: 0,
    top: 10,
    width: 50,
    alignItems: 'center',
    zIndex: 3,
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
  waterFlow: {
    position: 'absolute',
    left: 25,
    top: 50,
    alignItems: 'center',
    zIndex: 3,
  },
  waterDrop: {
    width: 8,
    height: 8,
    backgroundColor: '#4FC3F7',
    borderRadius: 4,
    shadowColor: '#2196F3',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
  },
  waterStream: {
    position: 'absolute',
    top: 30, // Start slightly lower to be inside the tower
    alignItems: 'center',
    zIndex: 3,
  },
  waterStreamSegment: {
    width: 4,
    height: 12,
    backgroundColor: '#4FC3F7',
    borderRadius: 2,
    shadowColor: '#2196F3',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.6,
    shadowRadius: 1,
    elevation: 2,
  },
  pumpButton: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  pumpButtonLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 2,
  },
  pumpButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  leftColumn: {
    paddingTop: 10, // Move left side indicators up closer to tower
  },
  rightColumn: {
    paddingTop: 60, // Move right side indicators down a bit less so they align with tower bottom
  },
});
