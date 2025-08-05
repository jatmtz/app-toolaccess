import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_GENERAL_URL } from '@/env';

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

// Tipo para las órdenes
interface Order {
  id: number;
  folio: string;
  estado: string;
  fecha_solicitud: string;
}

export default function MyOrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        
        if (!token) {
          throw new Error('No se encontró el token de acceso');
        }

        const response = await axios.get(`${API_GENERAL_URL}api/loan-orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setOrders(response.data.data);
        } else {
          throw new Error(response.data.message || 'Error al obtener las órdenes');
        }
      } catch (err) {
        setError(err.message || 'Ocurrió un error al cargar las órdenes');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
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

  return (
    <View style={styles.container}>
      <TopBar />

      <View style={styles.header}>
        <Text style={styles.title}>Mis órdenes</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {orders.map(order => (
          <TouchableOpacity
            key={order.id}
            style={styles.orderItem}
            onPress={() => router.push(`/order-details?id=${order.id}`)}
            activeOpacity={0.7}
          >
            <Text style={styles.orderTitle}>{order.folio}</Text>
            <Text style={[styles.orderDescription, { color: getStatusColor(order.estado) }]}>
              {capitalizeStatus(order.estado)}
            </Text>
            <Text style={styles.orderDate}>{formatDate(order.fecha_solicitud)}</Text>
          </TouchableOpacity>
        ))}
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
  header: {
    marginTop: height * 0.02,
    alignItems: 'center',
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
    color: '#555',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: height * 0.016,
    color: '#888',
    textAlign: 'right',
  },
  title: {
    fontSize: height * 0.03,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    color: '#03346E',
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