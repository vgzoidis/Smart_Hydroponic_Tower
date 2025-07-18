export const getSensorStatus = (value: number, min: number, max: number) => {
  if (value >= min && value <= max) {
    return 'good';
  }
  if (value < min * 0.8 || value > max * 1.2) {
    return 'critical';
  }
  return 'warning';
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
