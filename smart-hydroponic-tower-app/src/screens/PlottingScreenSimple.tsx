import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Colors } from '../constants/Colors';

export const PlottingScreenSimple: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sensor Data Plotting</Text>
        <Text style={styles.subtitle}>Testing basic component render</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Test</Text>
        <Text style={styles.text}>If you can see this, the component renders successfully.</Text>
        <Text style={styles.text}>The crash is likely in the Supabase integration or chart library.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 10,
  },
});
