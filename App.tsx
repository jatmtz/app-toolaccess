import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOAuth } from './oauth/useOAuth';

// Configuración global de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Configura Axios
const api = axios.create({
  baseURL: 'https://oauth.toolaccess.tech',
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default function NotificationSetup() {
  const { isAuthenticated, user } = useOAuth();

  const savePushToken = async (userId: string, token: string) => {
    try {
      await api.put(`/oauth/update-push-token/${userId}`, {
        expo_push_token: token
      });
    } catch (error) {
      console.error('Error guardando token:', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user?.sub) return;

    const setupPushNotifications = async () => {
      if (!Device.isDevice) return;

      // Configuración especial para iOS en primer plano
      if (Platform.OS === 'ios') {
        Notifications.addNotificationReceivedListener(notification => {
          Notifications.presentNotificationAsync({
            title: notification.request.content.title,
            body: notification.request.content.body,
            data: notification.request.content.data,
          });
        });
      }

      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return;

        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        if (!projectId) return;

        const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        await savePushToken(user.sub.toString(), token);

      } catch (error) {
        console.error('Error configurando notificaciones:', error);
      }
    };

    setupPushNotifications();

    // Configura listeners de notificaciones
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificación recibida:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Usuario interactuó con notificación:', response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [isAuthenticated, user?.sub]);

  return null;
}