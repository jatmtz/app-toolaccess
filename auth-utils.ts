import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkAuth = async () => {
  const token = await AsyncStorage.getItem('access_token');
  return !!token; // Devuelve true si existe el token
};

export const refreshToken = async () => {
  const refreshToken = await AsyncStorage.getItem('refresh_token');
  if (!refreshToken) return false;

  try {
    const response = await fetch('https://oauth.toolaccess.tech/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: 'mobile-app-expo',
        client_secret: 'expo-secret-key-2025',
      }),
    });

    const data = await response.json();
    if (data.access_token) {
      await AsyncStorage.setItem('access_token', data.access_token);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};