import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import storage from '../utils/storage';

// Automatically resolve host IP dynamically for Web, Android emulator, iOS simulator, and Physical devices via Expo Go
const getBaseUrl = () => {
  // 1. Web browser: use current hostname
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.hostname) {
      return `http://${window.location.hostname}:5050/api/v1`;
    }
    return 'http://localhost:5050/api/v1';
  }

  // 2. Expo hostUri: dynamically extracts the computer's LAN IP when scanning QR code via Expo Go
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoClient?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:5050/api/v1`;
    }
  }

  // 3. Fallback to computer LAN IP
  return 'http://192.168.31.70:5050/api/v1';
};

export const API_URL = getBaseUrl();

export const mobileApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 12000
});

mobileApi.interceptors.request.use(async (config) => {
  try {
    const token = await storage.getItem('user_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

mobileApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        await storage.removeItem('user_token');
        await storage.removeItem('user_profile');
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);
