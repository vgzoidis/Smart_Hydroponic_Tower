import React from 'react';
import {TowerVisualization} from '../components/TowerVisualization';
import {WaterValuesPanel} from '../components/WaterValuesPanel';

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

interface DashboardScreenProps {
  sensorData: SensorData;
  waterTempStatus: string;
  phStatus: string;
  ecStatus: string;
  tempStatus: string;
  humidityStatus: string;
  lightStatus: string;
  co2Status: string;
  onTogglePump: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  sensorData,
  waterTempStatus,
  phStatus,
  ecStatus,
  tempStatus,
  humidityStatus,
  lightStatus,
  co2Status,
  onTogglePump,
}) => (
  <>
    <TowerVisualization
      sensorData={sensorData}
      lightStatus={lightStatus}
      co2Status={co2Status}
      tempStatus={tempStatus}
      humidityStatus={humidityStatus}
      onTogglePump={onTogglePump}
    />
    <WaterValuesPanel
      sensorData={sensorData}
      waterTempStatus={waterTempStatus}
      phStatus={phStatus}
      ecStatus={ecStatus}
    />
  </>
);
