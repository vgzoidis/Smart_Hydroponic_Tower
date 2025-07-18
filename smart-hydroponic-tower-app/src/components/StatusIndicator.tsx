import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors} from '../constants/Colors';
import {getStatusColor} from '../utils/sensorUtils';

interface StatusIndicatorProps {
  status: string;
  label: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
}) => (
  <View style={styles.statusIndicator}>
    <View
      style={[styles.statusDot, {backgroundColor: getStatusColor(status)}]}
    />
    <Text style={styles.statusText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  statusText: {
    fontSize: 22,
    color: Colors.text,
    fontWeight: '600',
  },
});
