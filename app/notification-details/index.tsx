/**
 * NotificationDetailsScreen.tsx
 * 
 * Pantalla que muestra los detalles de una notificación específica
 * 
 * Características:
 * - Muestra título, fecha y mensaje de la notificación
 * - Contenido específico según el tipo de notificación
 * - Formateo de fechas localizado
 * - Manejo de estados de carga y error
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
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

// Config
import { API_GENERAL_URL } from '../../env';

// Constants
const { width, height } = Dimensions.get('window');

/**
 * Tipos de notificación soportados
 */
type NotificationType = 
  | 'prestamo_aprobado' 
  | 'multa_aplicada'
  | 'prestamo_rechazado'
  | 'prestamo_vencido'
  | 'recordatorio';

/**
 * Interfaz que representa una notificación
 */
interface Notification {
  id: number;
  titulo: string;
  mensaje: string;
  fecha_creacion: string;
  tipo: NotificationType;
  leida: boolean;
}

/**
 * Formatea una fecha en formato legible en español
 * @param dateString - Cadena de fecha ISO
 * @returns Fecha formateada
 */
const formatNotificationDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), "dd 'de' MMMM yyyy 'a las' hh:mm a", { 
      locale: es 
    });
  } catch {
    return dateString;
  }
};

/**
 * Componente principal de detalles de notificación
 */
const NotificationDetailsScreen: React.FC = () => {
  
  const router = useRouter();
  const { notificationId } = useLocalSearchParams<{ notificationId: string }>();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      const isValid = await checkAuth();
      if (!isValid) {
        const refreshed = await refreshToken();
        if (!refreshed) router.replace('/');
      }
    };
    verifyToken();
  }, []);

  /**
   * Obtiene los detalles de la notificación desde la API
   */
  const fetchNotificationDetails = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await AsyncStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await axios.get(
        `${API_GENERAL_URL}api/notifications/${notificationId}`, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setNotification(response.data.data);
      } else {
        throw new Error(response.data.message || 'No se pudo cargar la notificación');
      }
    } catch (err: any) {
      console.error('Error al obtener detalles:', err);
      setError(err.message || 'Error al cargar la notificación');
    } finally {
      setLoading(false);
    }
  }, [notificationId]);

  // Efecto para cargar los detalles al montar el componente
  useEffect(() => {
    fetchNotificationDetails();
  }, [fetchNotificationDetails]);

  /**
   * Renderiza contenido específico según el tipo de notificación
   */
  const renderNotificationDetails = (): React.ReactNode => {
    if (!notification) return null;

    switch (notification.tipo) {
      case 'prestamo_aprobado':
        return (
          <View style={[styles.detailsContainer, styles.successContainer]}>
            <Text style={styles.detailTitle}>✅ Detalles del préstamo:</Text>
            <Text style={styles.detailText}>
              • Estado: Aprobado
            </Text>
            <Text style={styles.detailText}>
              • Fecha: {formatNotificationDate(notification.fecha_creacion)}
            </Text>
          </View>
        );
      
      case 'multa_aplicada':
        return (
          <View style={[styles.detailsContainer, styles.warningContainer]}>
            <Text style={styles.detailTitle}>⚠️ Detalles de la multa:</Text>
            <Text style={styles.detailText}>
              • Motivo: Retraso en devolución
            </Text>
          </View>
        );
      
      case 'prestamo_rechazado':
        return (
          <View style={[styles.detailsContainer, styles.errorContainer]}>
            <Text style={styles.detailTitle}>❌ Préstamo rechazado:</Text>
            <Text style={styles.detailText}>
              • Estado: Rechazado
            </Text>
          </View>
        );
      
      case 'prestamo_vencido':
        return (
          <View style={[styles.detailsContainer, styles.warningContainer]}>
            <Text style={styles.detailTitle}>⏰ Préstamo vencido:</Text>
            <Text style={styles.detailText}>
              • Por favor devuelve las herramientas
            </Text>
          </View>
        );
      
      case 'recordatorio':
        return (
          <View style={[styles.detailsContainer, styles.infoContainer]}>
            <Text style={styles.detailTitle}>ℹ️ Recordatorio:</Text>
            <Text style={styles.detailText}>
              • Tienes un préstamo activo
            </Text>
          </View>
        );
      
      default:
        return null;
    }
  };

  /**
   * Renderiza el contenido principal según el estado
   */
  const renderContent = (): React.ReactNode => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#03346E" />
          <Text style={styles.loadingText}>Cargando notificación...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchNotificationDetails}
            accessibilityLabel="Reintentar carga de notificación"
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!notification) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Notificación no encontrada</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchNotificationDetails}
            accessibilityLabel="Reintentar carga de notificación"
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{notification.mensaje}</Text>
          
          {/* Detalles específicos de la notificación */}
          {renderNotificationDetails()}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <TopBar />

      {/* Encabezado */}
      {notification && (
        <View style={styles.header}>
          <Text style={styles.title} accessibilityLabel={`Título: ${notification.titulo}`}>
            {notification.titulo}
          </Text>
          <Text style={styles.date} accessibilityLabel={`Fecha: ${formatNotificationDate(notification.fecha_creacion)}`}>
            {formatNotificationDate(notification.fecha_creacion)}
          </Text>
        </View>
      )}

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
    marginTop: height * 0.02,
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: height * 0.03,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    color: '#03346E',
    textAlign: 'center',
    marginBottom: height * 0.01,
  },
  date: {
    fontSize: height * 0.016,
    color: '#888',
    fontStyle: 'italic',
  },
  content: {
    flexGrow: 1,
    padding: width * 0.07,
    paddingBottom: height * 0.08,
    backgroundColor: '#F9F9F9',
    marginHorizontal: width * 0.05,
    marginTop: height * 0.02,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
  messageContainer: {
    marginTop: height * 0.01,
  },
  messageText: {
    fontSize: height * 0.021,
    lineHeight: height * 0.03,
    fontFamily: 'Arial',
    color: '#333',
    textAlign: 'justify',
  },
  detailsContainer: {
    marginTop: height * 0.03,
    padding: width * 0.04,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  warningContainer: {
    backgroundColor: '#FFF8E1',
    borderLeftColor: '#FFC107',
  },
  successContainer: {
    backgroundColor: '#E8F5E9',
    borderLeftColor: '#4CAF50',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderLeftColor: '#F44336',
  },
  infoContainer: {
    backgroundColor: '#E3F2FD',
    borderLeftColor: '#2196F3',
  },
  detailTitle: {
    fontSize: height * 0.02,
    fontWeight: 'bold',
    marginBottom: height * 0.01,
    color: '#03346E',
  },
  detailText: {
    fontSize: height * 0.018,
    marginBottom: height * 0.005,
    lineHeight: height * 0.025,
    color: '#333',
  },
  errorText: {
    fontSize: height * 0.02,
    color: '#FF0404',
    textAlign: 'center',
    marginBottom: height * 0.03,
  },
  retryButton: {
    backgroundColor: '#03346E',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.06,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default NotificationDetailsScreen;