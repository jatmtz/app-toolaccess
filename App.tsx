import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useOAuth } from './oauth/useOAuth';

/**
 * Configuración global del manejador de notificaciones.
 * Cumple con:
 *   - ISO/IEC 25010: Mantenibilidad, Confiabilidad
 *   - Patrones de diseño: Strategy Pattern para manejo de notificaciones
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,     // Mostrar banner en primer plano
    shouldPlaySound: true,       // Reproducir sonido
    shouldSetBadge: true,        // Actualizar badge en icono
    shouldShowList: true,        // Mostrar en lista de notificaciones
  }),
});

/**
 * Instancia de axios configurada para comunicación con API OAuth.
 * Cumple con:
 *   - ISO/IEC 25010: Seguridad, Compatibilidad
 *   - Interceptor para inyección automática de token
 */
const api = axios.create({
  baseURL: 'https://oauth.toolaccess.tech',
});

// Interceptor para agregar token de acceso a las solicitudes
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // RFC 6750
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Componente para configuración de notificaciones push.
 * Responsabilidades:
 *   - Registro de tokens push en servidor
 *   - Configuración de permisos
 *   - Manejo de interacciones con notificaciones
 * 
 * Cumple con:
 *   - ISO/IEC 25010: Portabilidad, Compatibilidad
 *   - React Hooks Pattern
 *   - Principios SOLID (Single Responsibility)
 * 
 * @returns {null} Componente no renderiza UI
 */
export default function NotificationSetup() {
  const { isAuthenticated, user } = useOAuth();

  /**
   * Guarda el token push en el servidor asociado al usuario.
   * Cumple con estándar OAuth 2.0 (RFC 6750)
   * 
   * @param {string} userId - ID del usuario (sub claim de JWT)
   * @param {string} token - Token push de Expo
   */
  const savePushToken = async (userId: string, token: string) => {
    try {
      await api.put(`/oauth/update-push-token/${userId}`, {
        expo_push_token: token,
      });
    } catch (error) {
      console.error('Error al guardar token push:', error);
    }
  };

  useEffect(() => {
    // Salir si no hay usuario autenticado
    if (!isAuthenticated || !user?.sub) return;

    /**
     * Configuración principal de notificaciones push.
     * Cumple con:
     *   - Especificaciones FCM (Firebase Cloud Messaging)
     *   - Guías de Apple Push Notification Service (APNS)
     */
    const setupPushNotifications = async () => {
      // Verificar si es dispositivo físico
      if (!Device.isDevice) {
        console.warn('Las notificaciones no funcionan en emuladores');
        return;
      }

      /**
       * Configuración especial para iOS:
       * - Presenta notificaciones cuando la app está en primer plano
       * - Requerido por políticas de Apple (Human Interface Guidelines)
       */
      if (Platform.OS === 'ios') {
        Notifications.addNotificationReceivedListener((notification) => {
          Notifications.presentNotificationAsync({
            title: notification.request.content.title,
            body: notification.request.content.body,
            data: notification.request.content.data,
          });
        });
      }

      try {
        // Solicitar permisos (requerido por Google Play Store y App Store)
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });

        if (status !== 'granted') {
          console.warn('Permisos para notificaciones no otorgados');
          return;
        }

        // Obtener ID del proyecto EAS (Expo Application Services)
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        if (!projectId) {
          throw new Error('Project ID no configurado en expo.extra.eas');
        }

        // Obtener token push
        const pushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        await savePushToken(user.sub.toString(), pushToken);

      } catch (error) {
        console.error('Error en configuración de notificaciones:', error);
      }
    };

    // Ejecutar configuración
    setupPushNotifications();

    /**
     * Listeners para interacciones con notificaciones:
     *   - NotificationReceivedListener: Cuando llega la notificación
     *   - NotificationResponseReceivedListener: Cuando el usuario interactúa
     * 
     * Cumple con:
     *   - Patrón Observer
     *   - Guías de engagement de notificaciones (Material Design, Apple HIG)
     */
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notificación recibida:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Interacción con notificación:', response);
    });

    // Cleanup: Remover listeners al desmontar componente
    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [isAuthenticated, user?.sub]); // Dependencias del efecto

  // Componente no renderiza interfaz visual
  return null;
}