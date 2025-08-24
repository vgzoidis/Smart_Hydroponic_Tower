import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import {Colors} from '../constants/Colors';
import {API_CONFIG, getApiUrl, getCommonFetchOptions} from '../utils/apiConfig';

interface PumpConfig {
  autoMode: boolean;
  onTime: number; // in minutes
  offTime: number; // in minutes
}

interface PumpStatus {
  pumpStatus: boolean;
  statusText: string;
  autoMode: boolean;
  onTime: number;
  offTime: number;
}

// Generate array of numbers from 1 to 180 for the picker
const generateTimeOptions = () => {
  const options = [];
  for (let i = 1; i <= 180; i++) {
    options.push(i);
  }
  return options;
};

const timeOptions = generateTimeOptions();

// Custom Number Selector Component
const NumberSelector: React.FC<{
  value: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
  label: string;
}> = ({ value, onValueChange, disabled = false, label }) => {
  const handleDecrease = () => {
    if (value > 1) {
      onValueChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < 180) {
      onValueChange(value + 1);
    }
  };

  // Quick select buttons for common values
  const quickSelectValues = [5, 10, 15, 30, 45, 60, 90, 120, 180];

  return (
    <View style={styles.numberSelectorContainer}>
      <Text style={styles.pickerLabel}>{label}</Text>
      
      {/* Current Value Display */}
      <View style={styles.currentValueContainer}>
        <TouchableOpacity 
          style={[styles.adjustButton, disabled && styles.buttonDisabled]} 
          onPress={handleDecrease}
          disabled={disabled || value <= 1}
        >
          <Text style={styles.adjustButtonText}>-</Text>
        </TouchableOpacity>
        
        <View style={styles.currentValueDisplay}>
          <Text style={styles.currentValueText}>{value} min</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.adjustButton, disabled && styles.buttonDisabled]} 
          onPress={handleIncrease}
          disabled={disabled || value >= 180}
        >
          <Text style={styles.adjustButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Select Buttons */}
      <View style={styles.quickSelectContainer}>
        {quickSelectValues.map((quickValue) => (
          <TouchableOpacity
            key={quickValue}
            style={[
              styles.quickSelectButton,
              value === quickValue && styles.quickSelectButtonActive,
              disabled && styles.buttonDisabled,
            ]}
            onPress={() => onValueChange(quickValue)}
            disabled={disabled}
          >
            <Text style={[
              styles.quickSelectButtonText,
              value === quickValue && styles.quickSelectButtonTextActive,
            ]}>
              {quickValue}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export const SettingsScreen: React.FC = () => {
  const [pumpConfig, setPumpConfig] = useState<PumpConfig>({
    autoMode: false,
    onTime: 1,
    offTime: 5,
  });
  const [pumpStatus, setPumpStatus] = useState<PumpStatus>({
    pumpStatus: false,
    statusText: 'Loading...',
    autoMode: false,
    onTime: 1,
    offTime: 5,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Clear messages after a delay
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch current pump status and configuration
  const fetchPumpStatus = async () => {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.PUMP_STATUS));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Check if auto mode has been changed externally (e.g., via dashboard)
      const previousAutoMode = pumpConfig.autoMode;
      let newAutoMode = data.autoMode;
      
      // Also parse the status text to determine mode (e.g., "OFF(Manual)" or "ON(Auto)")
      const statusText = data.statusText || '';
      if (statusText.toLowerCase().includes('manual')) {
        newAutoMode = false;
      } else if (statusText.toLowerCase().includes('auto')) {
        newAutoMode = true;
      }
      
      setPumpStatus(data);
      setPumpConfig({
        autoMode: newAutoMode,
        onTime: data.onTime,
        offTime: data.offTime,
      });
      
      // Show a brief message if auto mode was changed externally
      if (previousAutoMode !== newAutoMode && pumpStatus.autoMode !== undefined) {
        if (newAutoMode) {
          // Clear any existing error messages when auto mode is enabled
          setErrorMessage('');
        } else {
          // Show brief notification when switched to manual mode externally
          //setErrorMessage('Pump switched to Manual Mode');
          //setTimeout(() => setErrorMessage(''), 2000);
        }
      } else {
        // Clear error messages for normal status updates
        setErrorMessage('');
      }
    } catch (error) {
      console.error('Error fetching pump status:', error);
      setErrorMessage('Failed to fetch pump status. Please check connection.');
    }
  };

  // Update pump configuration
  const updatePumpConfig = async (config: Partial<PumpConfig>) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const params: Record<string, string> = {};
      if (config.autoMode !== undefined) {
        params.autoMode = config.autoMode.toString();
      }
      if (config.onTime !== undefined && config.offTime !== undefined) {
        params.onTime = config.onTime.toString();
        params.offTime = config.offTime.toString();
      }

      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.PUMP_CONFIG, params),
        getCommonFetchOptions('PUT')
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update local state with server response
      setPumpConfig({
        autoMode: data.autoMode,
        onTime: data.onTime,
        offTime: data.offTime,
      });
      
      // Refresh status to get the latest status text
      await fetchPumpStatus();
      
      // Don't show success message for automatic updates
    } catch (error) {
      console.error('Error updating pump config:', error);
      setErrorMessage('Failed to update pump configuration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle auto mode toggle
  const handleAutoModeToggle = (value: boolean) => {
    updatePumpConfig({ autoMode: value });
  };

  // Handle timing change with automatic update when auto mode is on
  const handleTimingChange = (field: 'onTime' | 'offTime', value: number) => {
    const newConfig = { ...pumpConfig, [field]: value };
    setPumpConfig(newConfig);
    
    // If auto mode is on, update immediately
    if (pumpConfig.autoMode) {
      updatePumpConfig({
        onTime: newConfig.onTime,
        offTime: newConfig.offTime,
      });
    }
  };

  // Fetch status on component mount and set up interval
  useEffect(() => {
    fetchPumpStatus();
    const interval = setInterval(fetchPumpStatus, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.tabContent}>

      {/* Error/Success Messages */}
      {errorMessage ? (
        <View style={styles.messageContainer}>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        </View>
      ) : null}
      
      {successMessage ? (
        <View style={styles.messageContainer}>
          <Text style={styles.successMessage}>{successMessage}</Text>
        </View>
      ) : null}

      {/* Pump Configuration Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Pump Configuration</Text>
        
        {/* Current Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={[
            styles.statusText,
            { color: pumpStatus.pumpStatus ? Colors.good : Colors.textSecondary }
          ]}>
            {pumpStatus.statusText}
          </Text>
        </View>

        {/* Auto Mode Toggle */}
        <View style={styles.settingsItem}>
          <Text style={styles.settingsLabel}>Auto Mode:</Text>
          <Switch
            value={pumpConfig.autoMode}
            onValueChange={handleAutoModeToggle}
            trackColor={{ false: Colors.surfaceLight, true: Colors.primary }}
            thumbColor={pumpConfig.autoMode ? Colors.accent : Colors.textSecondary}
            disabled={isLoading}
          />
        </View>

        {/* Timing Configuration */}
        <View style={styles.timingContainer}>
          {/* Helper message when auto mode is off */}
          {!pumpConfig.autoMode && (
            <View style={styles.helperMessageContainer}>
              <Text style={styles.helperMessage}>
                Enable Auto Mode to make timing changes
              </Text>
            </View>
          )}
          
          <NumberSelector
            value={pumpConfig.onTime}
            onValueChange={(value) => handleTimingChange('onTime', value)}
            disabled={isLoading}
            label="On Time (minutes):"
          />

          <NumberSelector
            value={pumpConfig.offTime}
            onValueChange={(value) => handleTimingChange('offTime', value)}
            disabled={isLoading}
            label="Off Time (minutes):"
          />
        </View>
      </View>

      {/* Sensor Configuration Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Sensor Optimal Ranges</Text>
        
        <View style={styles.sensorRangeItem}>
          <Text style={styles.sensorLabel}>Environment Temperature:</Text>
          <Text style={styles.sensorRange}>20°C - 26°C</Text>
        </View>

        <View style={styles.sensorRangeItem}>
          <Text style={styles.sensorLabel}>Humidity:</Text>
          <Text style={styles.sensorRange}>40% - 60%</Text>
        </View>

        <View style={styles.sensorRangeItem}>
          <Text style={styles.sensorLabel}>Light Level:</Text>
          <Text style={styles.sensorRange}>150 - 300 lux</Text>
        </View>

        <View style={styles.sensorRangeItem}>
          <Text style={styles.sensorLabel}>CO₂ Level:</Text>
          <Text style={styles.sensorRange}>400 - 1000 ppm</Text>
        </View>

        <View style={styles.sensorRangeItem}>
          <Text style={styles.sensorLabel}>Water Temperature:</Text>
          <Text style={styles.sensorRange}>18°C - 25°C</Text>
        </View>

        <View style={styles.sensorRangeItem}>
          <Text style={styles.sensorLabel}>pH Level:</Text>
          <Text style={styles.sensorRange}>5.5 - 7.0</Text>
        </View>

        <View style={styles.sensorRangeItem}>
          <Text style={styles.sensorLabel}>EC Level:</Text>
          <Text style={styles.sensorRange}>1.2 - 2.0 mS/cm</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  messageContainer: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  errorMessage: {
    color: Colors.critical,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  successMessage: {
    color: Colors.good,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    marginBottom: 10,
  },
  settingsLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  timingContainer: {
    marginTop: 10,
  },
  helperMessageContainer: {
    backgroundColor: 'rgba(255,165,0,0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  helperMessage: {
    color: Colors.warning,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  // NumberSelector styles
  numberSelectorContainer: {
    marginBottom: 25,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 15,
  },
  pickerLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  currentValueContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  adjustButton: {
    backgroundColor: Colors.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustButtonText: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  currentValueDisplay: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 25,
    paddingVertical: 15,
    marginHorizontal: 20,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  currentValueText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  quickSelectButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  quickSelectButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  quickSelectButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  quickSelectButtonTextActive: {
    color: Colors.text,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  // Sensor Configuration styles
  sensorRangeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    marginBottom: 8,
  },
  sensorLabel: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
  },
  sensorRange: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: 'bold',
    textAlign: 'right',
  },
});
