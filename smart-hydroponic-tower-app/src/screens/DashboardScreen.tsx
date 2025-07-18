import React from 'react';
import {TowerVisualization} from '../components/TowerVisualization';
import {WaterValuesPanel} from '../components/WaterValuesPanel';

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

interface DashboardScreenProps {
  sensorData: SensorData;
  waterTempStatus: string;
  phStatus: string;
  tempStatus: string;
  humidityStatus: string;
  lightStatus: string;
  co2Status: string;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  sensorData,
  waterTempStatus,
  phStatus,
  tempStatus,
  humidityStatus,
  lightStatus,
  co2Status,
}) => (
  <>
    <TowerVisualization
      sensorData={sensorData}
      lightStatus={lightStatus}
      co2Status={co2Status}
      tempStatus={tempStatus}
      humidityStatus={humidityStatus}
    />
    <WaterValuesPanel
      sensorData={sensorData}
      waterTempStatus={waterTempStatus}
      phStatus={phStatus}
    />
  </>
);
