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

interface PHConfig {
  autoMode: boolean;
  target: number; // target pH value
  tolerance: number; // tolerance range
}

interface PHStatus {
  phStatus: boolean; // pH UP pump status
  phDownStatus: boolean; // pH DOWN pump status
  statusText: string;
  autoMode: boolean;
  target: number;
  tolerance: number;
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

// Custom Decimal Number Selector Component for pH values
const DecimalSelector: React.FC<{
  value: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
  label: string;
  min: number;
  max: number;
  step: number;
  decimalPlaces: number;
  quickSelectValues: number[];
}> = ({ value, onValueChange, disabled = false, label, min, max, step, decimalPlaces, quickSelectValues }) => {
  const handleDecrease = () => {
    const multiplier = Math.pow(10, decimalPlaces);
    const newValue = Math.max(min, (Math.round(value * multiplier) - Math.round(step * multiplier)) / multiplier);
    onValueChange(Math.round(newValue * multiplier) / multiplier);
  };

  const handleIncrease = () => {
    const multiplier = Math.pow(10, decimalPlaces);
    const currentValueRounded = Math.round(value * multiplier) / multiplier;
    const newValue = Math.min(max, (Math.round(currentValueRounded * multiplier) + Math.round(step * multiplier)) / multiplier);
    const finalValue = Math.round(newValue * multiplier) / multiplier;
    
    onValueChange(finalValue);
  };

  return (
    <View style={styles.numberSelectorContainer}>
      <Text style={styles.pickerLabel}>{label}</Text>
      
      {/* Current Value Display */}
      <View style={styles.currentValueContainer}>
        <TouchableOpacity 
          style={[styles.adjustButton, disabled && styles.buttonDisabled]} 
          onPress={handleDecrease}
          disabled={disabled || value <= min + 0.001}
        >
          <Text style={styles.adjustButtonText}>-</Text>
        </TouchableOpacity>
        
        <View style={styles.currentValueDisplay}>
          <Text style={styles.currentValueText}>{value.toFixed(decimalPlaces)}</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.adjustButton, disabled && styles.buttonDisabled]} 
          onPress={handleIncrease}
          disabled={disabled || value >= max - 0.001}
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
              Math.abs(value - quickValue) < 0.01 && styles.quickSelectButtonActive,
              disabled && styles.buttonDisabled,
            ]}
            onPress={() => onValueChange(quickValue)}
            disabled={disabled}
          >
            <Text style={[
              styles.quickSelectButtonText,
              Math.abs(value - quickValue) < 0.01 && styles.quickSelectButtonTextActive,
            ]}>
              {quickValue.toFixed(decimalPlaces)}
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

  // pH Control State
  const [phConfig, setPHConfig] = useState<PHConfig>({
    autoMode: false,
    target: 6.0,
    tolerance: 0.5,
  });
  const [phStatus, setPHStatus] = useState<PHStatus>({
    phStatus: false,
    phDownStatus: false,
    statusText: 'Loading...',
    autoMode: false,
    target: 6.0,
    tolerance: 0.5,
  });
  const [isLoadingPH, setIsLoadingPH] = useState(false);

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

  // Handle manual pump toggle
  const handlePumpToggle = async () => {
    try {
      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.PUMP_TOGGLE),
        getCommonFetchOptions('POST')
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Pump toggle response:', data);
      
      // Refresh pump status to get the latest state
      await fetchPumpStatus();
      
    } catch (error) {
      console.error('Error toggling pump:', error);
      setErrorMessage('Failed to toggle pump. Please try again.');
    }
  };

  // === pH CONTROL FUNCTIONS ===
  
  // Fetch current pH status and configuration
  const fetchPHStatus = async () => {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.PH_STATUS));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      setPHStatus(data);
      setPHConfig({
        autoMode: data.autoMode,
        target: data.target,
        tolerance: data.tolerance,
      });
      
    } catch (error) {
      console.error('Error fetching pH status:', error);
      setErrorMessage('Failed to fetch pH status. Please check connection.');
    }
  };

  // Update pH configuration
  const updatePHConfig = async (config: Partial<PHConfig>) => {
    setIsLoadingPH(true);
    setErrorMessage('');
    
    try {
      const params: Record<string, string> = {};
      if (config.autoMode !== undefined) {
        params.autoMode = config.autoMode.toString();
      }
      if (config.target !== undefined && config.tolerance !== undefined) {
        params.target = config.target.toString();
        params.tolerance = config.tolerance.toString();
      }

      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.PH_CONFIG, params),
        getCommonFetchOptions('PUT')
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setPHConfig({
        autoMode: data.autoMode,
        target: data.target,
        tolerance: data.tolerance,
      });
      
      await fetchPHStatus();
      
    } catch (error) {
      console.error('Error updating pH config:', error);
      setErrorMessage('Failed to update pH configuration. Please try again.');
    } finally {
      setIsLoadingPH(false);
    }
  };

  // Handle pH auto mode toggle
  const handlePHAutoModeToggle = (value: boolean) => {
    updatePHConfig({ autoMode: value });
  };

  // Handle pH target/tolerance change
  const handlePHConfigChange = (field: 'target' | 'tolerance', value: number) => {
    const newConfig = { ...phConfig, [field]: value };
    setPHConfig(newConfig);
    
    if (phConfig.autoMode) {
      updatePHConfig({
        target: newConfig.target,
        tolerance: newConfig.tolerance,
      });
    }
  };

  // Manual pH control functions
  const handlePHUp = async () => {
    try {
      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.PH_UP),
        getCommonFetchOptions('POST')
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await fetchPHStatus();
    } catch (error) {
      console.error('Error controlling pH UP pump:', error);
      setErrorMessage('Failed to control pH UP pump.');
    }
  };

  const handlePHDown = async () => {
    try {
      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.PH_DOWN),
        getCommonFetchOptions('POST')
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await fetchPHStatus();
    } catch (error) {
      console.error('Error controlling pH DOWN pump:', error);
      setErrorMessage('Failed to control pH DOWN pump.');
    }
  };

  const handlePHStop = async () => {
    try {
      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.PH_STOP),
        getCommonFetchOptions('POST')
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await fetchPHStatus();
    } catch (error) {
      console.error('Error stopping pH pumps:', error);
      setErrorMessage('Failed to stop pH pumps.');
    }
  };

  // Fetch status on component mount and set up interval
  useEffect(() => {
    fetchPumpStatus();
    fetchPHStatus();
    const interval = setInterval(() => {
      fetchPumpStatus();
      fetchPHStatus();
    }, 2000); // Update every 2 seconds
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
          <View style={styles.statusTextContainer}>
            {pumpStatus.statusText.split('<br>').map((line, index) => (
              <Text 
                key={index}
                style={[
                  styles.statusText,
                  { color: pumpStatus.pumpStatus ? Colors.good : Colors.textSecondary }
                ]}
              >
                {line}
              </Text>
            ))}
          </View>
        </View>

        {/* Auto Mode Toggle */}
        <View style={styles.toggleItem}>
          <Text style={styles.settingsLabel}>Auto Mode:</Text>
          <Switch
            value={pumpConfig.autoMode}
            onValueChange={handleAutoModeToggle}
            trackColor={{ false: Colors.surfaceLight, true: Colors.primary }}
            thumbColor={pumpConfig.autoMode ? Colors.accent : Colors.textSecondary}
            disabled={isLoading}
          />
        </View>

        {/* Manual Pump Control (only show when auto mode is off) */}
        {!pumpConfig.autoMode && (
          <View style={styles.manualControlContainer}>
            <Text style={styles.manualControlTitle}>Manual Pump Control:</Text>
            <View style={styles.singleButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.manualControlButton,
                  styles.pumpToggleButton,
                  pumpStatus.pumpStatus && styles.activePumpButton
                ]}
                onPress={handlePumpToggle}
                disabled={isLoading}
              >
                <Text style={styles.manualControlButtonText}>
                  {pumpStatus.pumpStatus ? 'STOP PUMP' : 'START PUMP'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Timing Configuration */}
        <View style={styles.timingContainer}>
          {/* Helper message when auto mode is off */}
          {!pumpConfig.autoMode && (
            <View style={styles.helperMessageContainer}>
              <Text style={styles.helperMessage}>
                Enable Auto Mode to configure pump timing
              </Text>
            </View>
          )}
          
          {/* Timing Controls (only show when auto mode is on) */}
          {pumpConfig.autoMode && (
            <>
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
            </>
          )}
        </View>
      </View>

      {/* pH Configuration Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>pH Configuration</Text>
        
        {/* Current pH Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <View style={styles.statusTextContainer}>
            {phStatus.statusText.split('<br>').map((line, index) => (
              <Text 
                key={index}
                style={[
                  styles.statusText,
                  { color: (phStatus.phStatus || phStatus.phDownStatus) ? Colors.good : Colors.textSecondary }
                ]}
              >
                {line}
              </Text>
            ))}
          </View>
        </View>

        {/* pH Auto Mode Toggle */}
        <View style={styles.toggleItem}>
          <Text style={styles.settingsLabel}>pH Auto Mode:</Text>
          <Switch
            value={phConfig.autoMode}
            onValueChange={handlePHAutoModeToggle}
            trackColor={{ false: Colors.surfaceLight, true: Colors.primary }}
            thumbColor={phConfig.autoMode ? Colors.accent : Colors.textSecondary}
            disabled={isLoadingPH}
          />
        </View>

        {/* Manual pH Control Buttons (only show when auto mode is off) */}
        {!phConfig.autoMode && (
          <View style={styles.manualControlContainer}>
            <Text style={styles.manualControlTitle}>Manual pH Control:</Text>
            <View style={styles.manualButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.manualControlButton,
                  styles.phDownButton,
                  phStatus.phDownStatus && styles.activePhDownButton
                ]}
                onPress={handlePHDown}
                disabled={isLoadingPH}
              >
                <Text style={styles.manualControlButtonText}>pH DOWN</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.manualControlButton,
                  styles.phUpButton,
                  phStatus.phStatus && styles.activePhUpButton
                ]}
                onPress={handlePHUp}
                disabled={isLoadingPH}
              >
                <Text style={styles.manualControlButtonText}>pH UP</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* pH Configuration (only show when auto mode is on) */}
        {phConfig.autoMode && (
          <View style={styles.timingContainer}>
            <DecimalSelector
              value={phConfig.target}
              onValueChange={(value) => handlePHConfigChange('target', value)}
              disabled={isLoadingPH}
              label="Target pH:"
              min={4.0}
              max={8.0}
              step={0.1}
              decimalPlaces={1}
              quickSelectValues={[5.0, 5.5, 6.0, 6.5]}
            />

            <DecimalSelector
              value={phConfig.tolerance}
              onValueChange={(value) => handlePHConfigChange('tolerance', value)}
              disabled={isLoadingPH}
              label="Tolerance (±):"
              min={0.1}
              max={1.0}
              step={0.1}
              decimalPlaces={1}
              quickSelectValues={[0.2, 0.5, 0.7, 1.0]}
            />
          </View>
        )}

        {/* Helper message when auto mode is off */}
        {!phConfig.autoMode && (
          <View style={styles.helperMessageContainer}>
            <Text style={styles.helperMessage}>
              Enable Auto Mode to configure target pH and tolerance
            </Text>
          </View>
        )}
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
    marginBottom: 15,
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
  statusTextContainer: {
    flex: 1,
    alignItems: 'flex-end',
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
    marginBottom: 15,
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    marginBottom: 5,
  },
  settingsLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  timingContainer: {
    marginTop: 15,
  },
  helperMessageContainer: {
    backgroundColor: 'rgba(255,165,0,0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
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
  // pH Control styles
  manualControlContainer: {
    marginTop: 15,
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 15,
  },
  manualControlTitle: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  manualButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 20,
  },
  singleButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  manualControlButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surfaceLight,
  },
  manualControlButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  phUpButton: {
    borderColor: Colors.good,
  },
  phDownButton: {
    borderColor: Colors.critical,
  },
  phStopButton: {
    borderColor: Colors.warning,
  },
  activeButton: {
    backgroundColor: 'rgba(56,178,172,0.3)',
  },
  activePhUpButton: {
    backgroundColor: Colors.good,
    borderColor: Colors.good,
  },
  activePhDownButton: {
    backgroundColor: Colors.critical,
    borderColor: Colors.critical,
  },
  pumpToggleButton: {
    borderColor: Colors.primary,
  },
  activePumpButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
});
