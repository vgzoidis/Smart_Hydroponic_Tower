import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors} from '../constants/Colors';

export const PlottingScreen: React.FC = () => (
  <View style={styles.tabContent}>
    <Text style={styles.tabTitle}>Data Plotting</Text>
    <Text style={styles.tabDescription}>
      Coming soon: Real-time sensor data charts and historical trends
    </Text>
    <View style={styles.placeholderChart}>
      <Text style={styles.placeholderText}>📊 Chart Placeholder</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  tabDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  placeholderChart: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
