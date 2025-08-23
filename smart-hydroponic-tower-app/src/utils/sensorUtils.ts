export const getSensorStatus = (value: number, min: number, max: number) => {
  if (value >= min && value <= max) {
    return 'good';
  }
  if (value < min * 0.8 || value > max * 1.2) {
    return 'critical';
  }
  return 'warning';
};

export const getECStatus = (value: number) => {
  // Good range: 1.2 - 2.0
  if (value >= 1.2 && value <= 2.0) {
    return 'good';
  }
  // Warning range: 0.8 - 2.5 (excluding good range)
  if (value >= 0.8 && value <= 2.5) {
    return 'warning';
  }
  // Critical range: 0.5 - 3.0 (excluding warning range) or outside all ranges
  if ((value >= 0.5 && value < 0.8) || (value > 2.5 && value <= 3.0) || value < 0.5 || value > 3.0) {
    return 'critical';
  }
  return 'critical';
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'good':
      return '#4CAF50';
    case 'warning':
      return '#FF9800';
    case 'critical':
      return '#F44336';
    default:
      return '#9E9E9E';
  }
};
