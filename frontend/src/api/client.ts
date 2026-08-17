import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// In Expo, local testing on a physical device requires your computer's IP address, not localhost.
// EXPO_PUBLIC_API_URL should be set in a .env file.
const baseURL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401s and Token Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
        
        await SecureStore.setItemAsync('accessToken', data.data.accessToken);
        await SecureStore.setItemAsync('refreshToken', data.data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, log the user out
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        // We will trigger a state wipe via Zustand in the UI layer
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
