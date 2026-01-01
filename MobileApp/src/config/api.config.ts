import { Platform } from 'react-native';

/**
 * API Configuration
 * 
 * Change this based on your setup:
 * 
 * ANDROID EMULATOR: Use 10.0.2.2 (maps to host machine's localhost)
 * IOS SIMULATOR: Use localhost
 * PHYSICAL DEVICE: Use your computer's IP address (e.g., 192.168.1.100)
 * 
 * To find your IP:
 * - Windows: ipconfig (look for IPv4 Address)
 * - Mac/Linux: ifconfig or ip addr show
 */

// Set this to your computer's IP if using physical device
const PHYSICAL_DEVICE_IP = '192.168.1.100'; // Change this!

export const getApiUrl = () => {
  // Uncomment the line below if testing on a physical device
  // return `http://${PHYSICAL_DEVICE_IP}:5000/api`;
  
  if (Platform.OS === 'android') {
    // Android emulator
    return 'http://10.0.2.2:5000/api';
  }
  
  // iOS simulator or web
  return 'http://localhost:5000/api';
};

export const API_CONFIG = {
  baseURL: getApiUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Log API URL for debugging
console.log('🌐 API URL:', API_CONFIG.baseURL);
console.log('📱 Platform:', Platform.OS);
