// API Configuration
// Change this IP address to match your ESP32's IP address on the network
export const API_CONFIG = {
  BASE_URL: 'http://160.40.48.23',
  TIMEOUT: 8000, // 8 seconds timeout
  
  // API Endpoints
  ENDPOINTS: {
    SENSORS: '/sensors',
    PUMP_TOGGLE: '/pump/toggle',
    PUMP_STATUS: '/pump/status',
    PUMP_CONFIG: '/pump/config',
    PUMP_STATE: '/pump/state',
    // pH Control Endpoints
    PH_STATUS: '/ph/status',
    PH_UP: '/ph/up',
    PH_DOWN: '/ph/down',
    PH_STOP: '/ph/stop',
    PH_CONFIG: '/ph/config',
  },
};

// Helper function to create API URLs
export const getApiUrl = (endpoint: string, params?: Record<string, string>) => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams}`;
  }
  
  return url;
};

// Common fetch options
export const getCommonFetchOptions = (method: 'GET' | 'POST' | 'PUT' = 'GET') => ({
  method,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});
