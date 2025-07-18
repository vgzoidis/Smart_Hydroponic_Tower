import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors} from '../constants/Colors';

export const SettingsScreen: React.FC = () => (
  <View style={styles.tabContent}>
    <Text style={styles.tabTitle}>Settings</Text>
    <Text style={styles.tabDescription}>
      Configure your hydroponic system parameters
    </Text>
    <View style={styles.settingsItem}>
      <Text style={styles.settingsLabel}>Water Temperature Range:</Text>
      <Text style={styles.settingsValue}>18°C - 25°C</Text>
    </View>
    <View style={styles.settingsItem}>
      <Text style={styles.settingsLabel}>pH Range:</Text>
      <Text style={styles.settingsValue}>5.5 - 7.0</Text>
    </View>
    <View style={styles.settingsItem}>
      <Text style={styles.settingsLabel}>Light Duration:</Text>
      <Text style={styles.settingsValue}>16 hours/day</Text>
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
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginBottom: 10,
  },
  settingsLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  settingsValue: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: 'bold',
  },
});
