/**
 * OrderDetailsScreen.tsx
 * 
 * Pantalla que muestra los detalles completos de una orden de préstamo
 * 
 * Características:
 * - Detalles de la orden (folio, estado, fechas)
 * - Lista de herramientas solicitadas con imágenes
 * - Tiempos y fechas relevantes
 * - Justificación y comentarios
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
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
const TOOL_PLACEHOLDER_IMAGE = require('@/assets/images/image.png');

/**
 * Estado de la orden con colores asociados
 */
type OrderStatus = 
  | 'pendiente' 
  | 'aprobado' 
  | 'rechazado' 
  | 'terminado' 
  | 'vencido';

type StatusColor = '#E6D712' | '#20E544' | '#E86E16' | '#3321D2' | '#FF0404';

/**
 * Representa una herramienta dentro de una orden
 */
interface ToolInOrder {
  herramienta_id: number;
  cantidad: number;
  herramienta?: {
    nombre: string;
    imagen_url?: string | null;
  };
}

/**
 * Detalles completos de una orden de préstamo
 */
interface OrderDetail {
  id: number;
  folio: string;
  estado: OrderStatus;
  tiempo_solicitado: number;
  tiempo_aprobado: number | null;
  fecha_solicitud: string;
  fecha_aprobacion: string | null;
  fecha_devolucion_estimada: string | null;
  fecha_devolucion_real: string | null;
  justificacion: string;
  comentarios_aprobacion: string | null;
  herramientas: ToolInOrder[];
}

/**
 * Construye la URL completa para una imagen
 * @param path - Ruta relativa de la imagen
 * @returns URL completa o null si no hay path
 */
const buildImageUrl = (path: string | null | undefined): string | null => {
  return path ? `${API_GENERAL_URL}uploads/${path}` : null;
};

/**
 * Asigna un color según el estado de la orden
 * @param status - Estado de la orden
 * @returns Color hexadecimal correspondiente
 */
const getStatusColor = (status: OrderStatus): StatusColor => {
  const statusColors: Record<OrderStatus, StatusColor> = {
    pendiente: '#E6D712',
    aprobado: '#20E544',
    rechazado: '#E86E16',
    terminado: '#3321D2',
    vencido: '#FF0404',
  };
  
  return statusColors[status] || '#E6D712'; // Default to pendiente color
};

/**
 * Capitaliza la primera letra de un texto
 * @param text - Texto a capitalizar
 * @returns Texto capitalizado
 */
const capitalizeFirstLetter = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Formatea una fecha en formato legible
 * @param dateString - Cadena de fecha ISO
 * @returns Fecha formateada o mensaje de error
 */
const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Dato no disponible';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha inválida';
  }
};

/**
 * Componente principal de detalles de orden
 */
const OrderDetailsScreen: React.FC = () => {
  
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
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
   * Obtiene los detalles de la orden desde la API
   */
  const fetchOrderDetails = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError('');
    
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) throw new Error('No se encontró el token de acceso');

      // 1. Obtener la orden principal
      const orderResponse = await axios.get(
        `${API_GENERAL_URL}api/loan-orders/${id}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || 'Error al obtener la orden');
      }

      const orderData: OrderDetail = orderResponse.data.data;

      // 2. Enriquecer cada herramienta con sus detalles
      const enrichedTools = await Promise.all(
        orderData.herramientas.map(async (tool) => {
          try {
            const toolResponse = await axios.get(
              `${API_GENERAL_URL}api/tools/${tool.herramienta_id}`, 
              { headers: { Authorization: `Bearer ${token}` } }
            );

            return {
              ...tool,
              herramienta: {
                nombre: toolResponse.data.data.nombre,
                imagen_url: toolResponse.data.data.foto_url || null,
              },
            };
          } catch (error) {
            console.warn(`Error al cargar herramienta ${tool.herramienta_id}:`, error);
            return tool; // Mantener la herramienta aunque falle la carga de detalles
          }
        })
      );

      setOrder({
        ...orderData,
        herramientas: enrichedTools,
      });

    } catch (err: any) {
      console.error('Error en fetchOrderDetails:', err);
      setError(err.message || 'Error desconocido al cargar la orden');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Efecto para cargar los detalles al montar el componente
  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  /**
   * Renderiza el contenido principal según el estado
   */
  const renderContent = (): React.ReactNode => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#03346E" />
          <Text style={styles.loadingText}>Cargando detalles de la orden...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>Por favor, inténtalo de nuevo más tarde.</Text>
        </View>
      );
    }

    if (!order) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se encontraron detalles para esta orden</Text>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.content}>
        {/* Encabezado con folio y estado */}
        <View style={styles.header}>
          <Text style={styles.title}>{order.folio}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.estado) }]}>
            <Text style={styles.statusText}>{capitalizeFirstLetter(order.estado)}</Text>
          </View>
        </View>

        {/* Lista de herramientas */}
        <Text style={styles.sectionTitle}>Herramientas solicitadas</Text>
        <View style={styles.toolList}>
          {order.herramientas.map((herramienta) => (
            <View 
              key={`${herramienta.herramienta_id}-${herramienta.cantidad}`} 
              style={styles.toolItem}
              accessibilityLabel={`Herramienta: ${herramienta.herramienta?.nombre || `ID ${herramienta.herramienta_id}`}`}
            >
              <Image
                source={
                  herramienta.herramienta?.imagen_url
                    ? { uri: buildImageUrl(herramienta.herramienta.imagen_url) }
                    : TOOL_PLACEHOLDER_IMAGE
                }
                style={styles.toolImage}
                onError={(e) => console.log('Error loading image:', e.nativeEvent.error)}
                accessibilityLabel={`Imagen de ${herramienta.herramienta?.nombre || 'herramienta'}`}
              />
              <View style={styles.toolInfo}>
                <Text style={styles.toolName}>
                  {herramienta.herramienta?.nombre || `Herramienta #${herramienta.herramienta_id}`}
                </Text>
                <Text style={styles.toolQuantity}>Cantidad: {herramienta.cantidad}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Detalles de tiempo */}
        <Text style={styles.sectionTitle}>Tiempos y fechas</Text>
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Solicitado</Text>
            <Text style={styles.detailValue}>{order.tiempo_solicitado} min</Text>
            <Text style={styles.detailDate}>{formatDate(order.fecha_solicitud)}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Aprobado</Text>
            <Text style={styles.detailValue}>
              {order.tiempo_aprobado ? `${order.tiempo_aprobado} min` : 'Dato no disponible'}
            </Text>
            <Text style={styles.detailDate}>{formatDate(order.fecha_aprobacion)}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Dev. Estimada</Text>
            <Text style={styles.detailDate}>{formatDate(order.fecha_devolucion_estimada)}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Dev. Real</Text>
            <Text style={styles.detailDate}>{formatDate(order.fecha_devolucion_real)}</Text>
          </View>
        </View>

        {/* Justificación */}
        <Text style={styles.sectionTitle}>Justificación</Text>
        <View style={styles.textBox}>
          <Text style={styles.textBoxContent}>
            {order.justificacion || 'No proporcionada'}
          </Text>
        </View>

        {/* Comentarios */}
        {order.comentarios_aprobacion && (
          <>
            <Text style={styles.sectionTitle}>Comentarios</Text>
            <View style={styles.textBox}>
              <Text style={styles.textBoxContent}>
                {order.comentarios_aprobacion}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <TopBar />

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
  content: {
    padding: width * 0.05,
    paddingBottom: height * 0.1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.03,
    paddingBottom: height * 0.01,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: height * 0.028,
    fontWeight: 'bold',
    color: '#002B5B',
    flex: 1,
    fontFamily: 'Georgia',
  },
  statusBadge: {
    paddingVertical: height * 0.005,
    paddingHorizontal: width * 0.04,
    borderRadius: 15,
    marginLeft: width * 0.03,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: height * 0.016,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: height * 0.022,
    fontWeight: 'bold',
    color: '#03346E',
    marginBottom: height * 0.015,
    marginTop: height * 0.02,
    fontFamily: 'Georgia',
  },
  toolList: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: width * 0.04,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.015,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: width * 0.03,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  toolImage: {
    width: width * 0.15,
    height: width * 0.15,
    resizeMode: 'contain',
    marginRight: width * 0.04,
    borderRadius: 4,
    backgroundColor: '#ffffffff',
  },
  toolInfo: {
    flex: 1,
  },
  toolName: {
    fontSize: height * 0.018,
    fontWeight: '600',
    color: '#333',
    marginBottom: height * 0.005,
    fontFamily: 'Arial',
  },
  toolQuantity: {
    fontSize: height * 0.016,
    color: '#666',
    fontFamily: 'Arial',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: height * 0.02,
  },
  detailItem: {
    width: width * 0.43,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: width * 0.04,
    marginBottom: height * 0.015,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  detailLabel: {
    fontSize: height * 0.016,
    color: '#666',
    marginBottom: height * 0.005,
    fontFamily: 'Arial',
  },
  detailValue: {
    fontSize: height * 0.02,
    fontWeight: 'bold',
    color: '#002B5B',
    marginBottom: height * 0.005,
    fontFamily: 'Arial',
  },
  detailDate: {
    fontSize: height * 0.015,
    color: '#555',
    fontFamily: 'Arial',
  },
  textBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: width * 0.04,
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  textBoxContent: {
    fontSize: height * 0.017,
    lineHeight: height * 0.025,
    color: '#333',
    fontFamily: 'Arial',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: width * 0.1,
  },
  loadingText: {
    marginTop: height * 0.02,
    color: '#03346E',
    fontSize: height * 0.018,
    fontFamily: 'Arial',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: width * 0.1,
  },
  errorText: {
    color: '#E86E16',
    fontSize: height * 0.02,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: height * 0.01,
    fontFamily: 'Arial',
  },
  errorSubtext: {
    color: '#666',
    fontSize: height * 0.016,
    textAlign: 'center',
    fontFamily: 'Arial',
  },
});

export default OrderDetailsScreen;