/**
 * MyOrdersScreen.tsx
 * 
 * Pantalla que muestra el historial de órdenes de préstamo del usuario
 * 
 * Características:
 * - Lista de órdenes con folio, estado y fecha
 * - Colores de estado según el estado de la orden
 * - Formateo de fechas legible
 * - Navegación a detalles de orden
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
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { checkAuth, refreshToken } from '../../auth-utils';

// Components
import BottomTabBar from '@/components/BottomTabBar';
import TopBar from '@/components/TopBar';

// Config
import { API_GENERAL_URL } from '@/env';

// Constants
const { width, height } = Dimensions.get('window');

/**
 * Estado de una orden de préstamo
 */
type OrderStatus = 'pendiente' | 'aprobado' | 'rechazado' | 'terminado' | 'vencido';

/**
 * Interfaz que representa una orden de préstamo
 */
interface LoanOrder {
  id: number;
  folio: string;
  estado: OrderStatus;
  fecha_solicitud: string;
}

/**
 * Asigna un color según el estado de la orden
 * @param status - Estado de la orden
 * @returns Color hexadecimal correspondiente al estado
 */
const getStatusColor = (status: OrderStatus): string => {
  const statusColors: Record<OrderStatus, string> = {
    pendiente: '#E6D712',
    aprobado: '#20E544',
    rechazado: '#E86E16',
    terminado: '#3321D2',
    vencido: '#FF0404',
  };

  return statusColors[status] || '#555';
};

/**
 * Formatea una fecha en un formato legible
 * @param dateString - Cadena de fecha ISO
 * @returns Fecha formateada en formato local
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Capitaliza la primera letra de un texto
 * @param text - Texto a capitalizar
 * @returns Texto con la primera letra en mayúscula
 */
const capitalizeFirstLetter = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Componente principal de historial de órdenes
 */
const MyOrdersScreen: React.FC = () => {
  
  const router = useRouter();
  const [orders, setOrders] = useState<LoanOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

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
   * Obtiene las órdenes del usuario desde la API
   */
  const fetchOrders = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError('');
    
    try {
      const token = await AsyncStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No se encontró el token de acceso');
      }

      const response = await axios.get(`${API_GENERAL_URL}api/loan-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        throw new Error(response.data.message || 'Error al obtener las órdenes');
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Efecto para cargar las órdenes al montar el componente
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /**
   * Maneja la navegación a los detalles de una orden
   * @param orderId - ID de la orden seleccionada
   */
  const navigateToOrderDetails = (orderId: number): void => {
    router.push(`/order-details?id=${orderId}`);
  };

  /**
   * Renderiza el contenido principal según el estado
   */
  const renderContent = (): React.ReactNode => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#03346E" />
          <Text style={styles.loadingText}>Cargando tus órdenes...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchOrders}
            accessibilityLabel="Reintentar carga de órdenes"
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (orders.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tienes órdenes registradas</Text>
        </View>
      );
    }

    return (
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {orders.map(order => (
          <TouchableOpacity
            key={`order-${order.id}`}
            style={styles.orderItem}
            onPress={() => navigateToOrderDetails(order.id)}
            activeOpacity={0.7}
            accessibilityLabel={`Orden ${order.folio} - ${order.estado}`}
            accessibilityRole="button"
          >
            <Text style={styles.orderTitle}>{order.folio}</Text>
            <Text 
              style={[
                styles.orderDescription, 
                { color: getStatusColor(order.estado) }
              ]}
            >
              {capitalizeFirstLetter(order.estado)}
            </Text>
            <Text style={styles.orderDate}>
              {formatDate(order.fecha_solicitud)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <TopBar />

      {/* Encabezado de la pantalla */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis órdenes</Text>
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
    marginTop: height * 0.02,
    alignItems: 'center',
    paddingVertical: height * 0.01,
  },
  title: {
    fontSize: height * 0.03,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    color: '#03346E',
  },
  content: {
    padding: width * 0.05,
    paddingBottom: height * 0.1,
  },
  orderItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: width * 0.05,
    marginBottom: height * 0.025,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  orderTitle: {
    fontSize: height * 0.022,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 4,
    fontFamily: 'Georgia',
  },
  orderDescription: {
    fontSize: height * 0.018,
    marginBottom: 4,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: height * 0.016,
    color: '#888',
    textAlign: 'right',
    fontStyle: 'italic',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: width * 0.05,
    paddingBottom: height * 0.1,
  },
  errorText: {
    color: '#FF0404',
    fontSize: height * 0.02,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: height * 0.1,
  },
  emptyText: {
    fontSize: height * 0.02,
    color: '#666',
    textAlign: 'center',
  },
});

export default MyOrdersScreen;