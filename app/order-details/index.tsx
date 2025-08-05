import BottomTabBar from '@/components/BottomTabBar';
import TopBar from '@/components/TopBar';
import { API_GENERAL_URL } from '@/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Función para asignar color según status
function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'pendiente':
      return '#E6D712';
    case 'aprobado':
      return '#20E544';
    case 'rechazado':
      return '#E86E16';
    case 'terminado':
      return '#3321D2';
    case 'vencido':
      return '#FF0404';
    default:
      return '#555';
  }
}

// Tipo para los detalles de la orden
interface OrderDetail {
  id: number;
  folio: string;
  estado: string;
  tiempo_solicitado: number;
  tiempo_aprobado: number | null;
  fecha_solicitud: string;
  fecha_aprobacion: string | null;
  fecha_devolucion_estimada: string | null;
  fecha_devolucion_real: string | null;
  justificacion: string;
  comentarios_aprobacion: string;
  herramientas: Array<{
    herramienta_id: number;
    cantidad: number;
    herramienta?: {
      nombre: string;
      imagen_url?: string;
    };
  }>;
}

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
  try {
    const token = await AsyncStorage.getItem('access_token');

    if (!token) {
      throw new Error('No se encontró el token de acceso');
    }

    // 1. Obtener la orden
    const response = await axios.get(`${API_GENERAL_URL}api/loan-orders/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener los detalles de la orden');
    }

    const orderData = response.data.data;

    // 2. Por cada herramienta, obtener el nombre desde la API
    const herramientasConNombre = await Promise.all(
      orderData.herramientas.map(async (h) => {
        try {
          const resTool = await axios.get(`${API_GENERAL_URL}api/tools/${h.herramienta_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const toolData = resTool.data.data;

          return {
            ...h,
            herramienta: {
              nombre: toolData.nombre,
              imagen_url: toolData.foto_url || null,
            },
          };
        } catch (err) {
          console.warn(`Error al cargar herramienta con ID ${h.herramienta_id}`, err);
          return h; // Devuelve el objeto original si falla
        }
      })
    );

    // 3. Guardar la orden con herramientas enriquecidas
    setOrder({
      ...orderData,
      herramientas: herramientasConNombre,
    });

  } catch (err) {
    setError(err.message || 'Ocurrió un error al cargar los detalles de la orden');
  } finally {
    setLoading(false);
  }
};


    fetchOrderDetails();
  }, [id]);

  // Función para formatear la fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para capitalizar el estado
  const capitalizeStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <TopBar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#03346E" />
        </View>
        <BottomTabBar />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <TopBar />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
        <BottomTabBar />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <TopBar />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>No se encontraron detalles para esta orden</Text>
        </View>
        <BottomTabBar />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{order.folio}</Text>

        {/* Lista de herramientas */}
        <View style={styles.toolList}>
          {order.herramientas.map((herramienta) => (
            <View key={herramienta.herramienta_id} style={styles.toolItem}>
              <Image
                source={herramienta.herramienta?.imagen_url 
                  ? { uri: herramienta.herramienta.imagen_url } 
                  : require('@/assets/images/tool1.png')}
                style={styles.toolImage}
              />
              <Text style={styles.toolText}>
                {herramienta.herramienta?.nombre || `Herramienta ${herramienta.herramienta_id}`}
                {herramienta.cantidad > 1 && ` (x${herramienta.cantidad})`}
              </Text>
            </View>
          ))}
        </View>

        {/* Estado */}
        <Text style={styles.label}>Estado:</Text>
        <Text style={[styles.status, { color: getStatusColor(order.estado) }]}>
          {capitalizeStatus(order.estado)}
        </Text>

        {/* Información de tiempo y fechas */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Tiempo solicitado:</Text>
            <Text style={styles.value}>{order.tiempo_solicitado} minutos</Text>

            <Text style={styles.label}>Fecha solicitud:</Text>
            <Text style={styles.value}>{formatDate(order.fecha_solicitud)}</Text>

            <Text style={styles.label}>Fecha devolución estimada:</Text>
            <Text style={styles.value}>{formatDate(order.fecha_devolucion_estimada)}</Text>
          </View>

          <View style={styles.column}>
            <Text style={styles.label}>Tiempo aprobado:</Text>
            <Text style={styles.value}>
              {order.tiempo_aprobado ? `${order.tiempo_aprobado} minutos` : 'N/A'}
            </Text>

            <Text style={styles.label}>Fecha aprobación:</Text>
            <Text style={styles.value}>{formatDate(order.fecha_aprobacion)}</Text>

            <Text style={styles.label}>Fecha devolución real:</Text>
            <Text style={styles.value}>{formatDate(order.fecha_devolucion_real)}</Text>
          </View>
        </View>

        {/* Justificación y comentarios */}
        <Text style={styles.label}>Justificación:</Text>
        <Text style={styles.value}>{order.justificacion || 'N/A'}</Text>

        <Text style={styles.label}>Comentarios:</Text>
        <Text style={styles.value}>{order.comentarios_aprobacion || 'N/A'}</Text>
      </ScrollView>

      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: width * 0.05,
    paddingBottom: height * 0.1,
  },
  title: {
    fontSize: height * 0.028,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    color: '#002B5B',
    marginBottom: height * 0.02,
    textAlign: 'center',
  },
  toolList: {
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    padding: width * 0.04,
    marginBottom: height * 0.03,
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.015,
  },
  toolImage: {
    width: width * 0.15,
    height: width * 0.15,
    resizeMode: 'contain',
    marginRight: width * 0.04,
  },
  toolText: {
  fontSize: height * 0.02,
  fontFamily: 'Georgia',
  flexShrink: 1,
  flexWrap: 'wrap',
  maxWidth: width * 0.7,
},
  label: {
    fontSize: height * 0.02,
    marginTop: height * 0.015,
    fontFamily: 'Georgia',
    color: '#03346E',
  },
  status: {
    fontSize: height * 0.018,
    fontWeight: 'bold',
    marginBottom: height * 0.015,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: width * 0.05,
    marginBottom: height * 0.02,
  },
  column: {
    flex: 1,
  },
  value: {
    fontSize: height * 0.018,
    color: '#333',
    marginBottom: height * 0.01,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF0404',
    fontSize: height * 0.02,
    textAlign: 'center',
    padding: width * 0.05,
  },
});