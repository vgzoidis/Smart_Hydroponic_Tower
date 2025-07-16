import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { height, width } = Dimensions.get('window');

const Colors = {
  primary: '#4CAF50',
  secondary: '#2E7D32',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
};

function App(): JSX.Element {
  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      <View style={styles.header}>
        <Text style={styles.headerText}>🌱 Smart Hydroponic Tower</Text>
        <Text style={styles.headerSubtext}>Control & Monitor Your Garden</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Your Garden</Text>
          <Text style={styles.subtitle}>
            Monitor and control your hydroponic garden system
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>📊 Dashboard</Text>
              <Text style={styles.buttonSubtext}>View sensor data</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>💧 Water System</Text>
              <Text style={styles.buttonSubtext}>Monitor water & nutrients</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>💡 Lighting</Text>
              <Text style={styles.buttonSubtext}>Control grow lights</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>🌡️ Environment</Text>
              <Text style={styles.buttonSubtext}>Temperature & humidity</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>System Status</Text>
            <Text style={styles.statusText}>🟢 All systems operational</Text>
            <Text style={styles.statusText}>💧 Water level: Normal</Text>
            <Text style={styles.statusText}>🌡️ Temperature: 24°C</Text>
            <Text style={styles.statusText}>💡 Lights: Auto schedule</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 30,
    paddingTop: 50,
    alignItems: 'center',
    minHeight: 120,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtext: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: Colors.secondary,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: Colors.textSecondary,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
    marginBottom: 30,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  buttonSubtext: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  statusCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 15,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
});

export default App;
