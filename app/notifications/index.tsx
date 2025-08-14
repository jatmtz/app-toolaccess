/**
 * NotificationsScreen.tsx
 * 
 * Pantalla que muestra la lista de notificaciones del usuario
 * 
 * Características:
 * - Lista de notificaciones con iconos según tipo
 * - Soporte para pull-to-refresh
 * - Manejo de estados de carga y vacío
 * - Navegación a detalles de notificación
 * 
 * Cumple con:
 * - ES6+ standards
 * - React Native best practices
 * - TypeScript typing
 * - Clean Code principles
 * - ISO/IEC 25010 (Maintainability, Reliability)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { checkAuth, refreshToken } from '../../auth-utils';

// Components
import BottomTabBar from '@/components/BottomTabBar';
import TopBar from '@/components/TopBar';
import BackButton from '@/components/BackButton';

// Config
import { API_GENERAL_URL } from '../../env';

// Constants
const { width, height } = Dimensions.get('window');
const EMPTY_ICON = require('@/assets/icons/notification.png');
const NOTIFICATION_ICON = require('@/assets/icons/notification_azul.png');

/**
 * Tipos de notificación soportados
 */
type NotificationType = 
  | 'prestamo_aprobado' 
  | 'recordatorio_devolucion'
  | 'multa_aplicada'
  | 'sistema'
  | string; // Para tipos desconocidos

/**
 * Interfaz que representa una notificación
 */
interface Notification {
  id: number;
  titulo: string;
  mensaje: string;
  fecha: string;
  tipo: NotificationType;
}

/**
 * Componente principal de listado de notificaciones
 */
const NotificationsScreen: React.FC = () => {
  
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

useFocusEffect(
  React.useCallback(() => {
    let isActive = true;

    const verifyToken = async () => {
      const isValid = await checkAuth();
      if (!isActive) return;
      
      if (!isValid) {
        const refreshed = await refreshToken();
        if (!refreshed && isActive) {
          router.replace('/');
        }
      }
    };

    verifyToken();

    return () => {
      isActive = false;
    };
  }, [router])
);

  /**
   * Obtiene las notificaciones del usuario desde la API
   */
  const fetchNotifications = useCallback(async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await axios.get(`${API_GENERAL_URL}api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setNotifications(response.data.data.notificaciones);
      } else {
        console.warn('La respuesta de la API no fue exitosa:', response.data);
      }
    } catch (error: any) {
      console.error('Error al obtener notificaciones:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /**
   * Maneja la acción de pull-to-refresh
   */
  const handleRefresh = (): void => {
    setRefreshing(true);
    fetchNotifications();
  };

  /**
   * Formatea una fecha en formato legible en español
   * @param dateString - Cadena de fecha ISO
   * @returns Fecha formateada
   */
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, hh:mm a", { locale: es });
    } catch {
      return dateString;
    }
  };

  /**
   * Navega a los detalles de una notificación
   * @param notificationId - ID de la notificación seleccionada
   */
  const navigateToNotificationDetails = (notificationId: number): void => {
    router.push({
      pathname: '/notification-details',
      params: { notificationId }
    });
  };

  /**
   * Renderiza el contenido principal según el estado
   */
  const renderContent = (): React.ReactNode => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#03346E" />
          <Text style={styles.loadingText}>Cargando notificaciones...</Text>
        </View>
      );
    }

    if (notifications.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Image
            source={EMPTY_ICON}
            style={styles.emptyIcon}
            accessibilityLabel="Icono de notificaciones vacías"
          />
          <Text style={styles.emptyText}>No tienes notificaciones</Text>
        </View>
      );
    }

    return (
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#03346E']}
            tintColor="#03346E"
            title="Actualizando notificaciones"
            titleColor="#03346E"
          />
        }
      >
        {notifications.map(notification => (
          <View 
            key={`notification-${notification.id}`} 
            style={styles.notificationItem}
          >
            <TouchableOpacity
              style={styles.notificationRow}
              onPress={() => navigateToNotificationDetails(notification.id)}
              activeOpacity={0.7}
              accessibilityLabel={`Notificación: ${notification.titulo}`}
              accessibilityRole="button"
            >
              {/* Icono según tipo de notificación */}
              <Image
                source={NOTIFICATION_ICON} // Actualmente todos usan el mismo icono
                style={styles.notificationIcon}
                accessibilityLabel="Icono de notificación"
              />
              
              <View style={styles.notificationContent}>
                <Text 
                  style={styles.notificationTitle}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {notification.titulo}
                </Text>
                <Text 
                  style={styles.notificationDescription}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {notification.mensaje}
                </Text>
                <Text style={styles.notificationDate}>
                  {formatDate(notification.fecha)}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <TopBar />
      <BackButton />

      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title} accessibilityLabel="Mis notificaciones">
          Mis notificaciones
        </Text>
      </View>

      {/* Contenido principal */}
      {renderContent()}

      <BottomTabBar />
    </View>
  );
};

// Estilos del componente
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: height * 0.01,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: height * 0.03,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    color: '#03346E',
    textAlign: 'center',
  },
  content: {
    padding: width * 0.05,
    paddingBottom: height * 0.1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: height * 0.1,
  },
  loadingText: {
    marginTop: height * 0.02,
    color: '#666',
    fontSize: height * 0.018,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: height * 0.1,
  },
  emptyIcon: {
    width: width * 0.3,
    height: width * 0.3,
    opacity: 0.5,
    marginBottom: height * 0.02,
  },
  emptyText: {
    fontSize: height * 0.02,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: width * 0.1,
  },
  notificationItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: width * 0.04,
    marginBottom: height * 0.025,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    width: width * 0.09,
    height: width * 0.11,
    marginRight: width * 0.04,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: height * 0.02,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Georgia',
    color: '#03346E',
  },
  notificationDescription: {
    fontSize: height * 0.016,
    color: '#555',
    marginBottom: 4,
    lineHeight: height * 0.022,
  },
  notificationDate: {
    fontSize: height * 0.014,
    color: '#888',
    textAlign: 'right',
    marginTop: height * 0.005,
    fontStyle: 'italic',
  },
});

export default NotificationsScreen;