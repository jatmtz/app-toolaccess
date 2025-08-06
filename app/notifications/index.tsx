import BottomTabBar from '@/components/BottomTabBar';
import TopBar from '@/components/TopBar';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { API_GENERAL_URL } from '../../env';

const { width, height } = Dimensions.get('window');

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Función para obtener notificaciones
  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await axios.get(`${API_GENERAL_URL}api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setNotifications(response.data.data.notificaciones);
      }
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Función para manejar el refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "dd MMM yyyy, hh:mm a", { locale: es });
  };

  // Función para eliminar una notificación
  /*const handleDeleteNotification = async (id) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      await axios.delete(`${API_GENERAL_URL}api/notificaciones/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Actualizar el estado local eliminando la notificación
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  };*/

  if (loading) {
    return (
      <View style={styles.container}>
        <TopBar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#03346E" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />

      <View style={styles.header}>
        <Text style={styles.title}>Mis notificaciones</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#03346E']}
            tintColor="#03346E"
          />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image
              source={require('@/assets/icons/notification.png')}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>No tienes notificaciones</Text>
          </View>
        ) : (
          notifications.map(notification => (
            <View key={notification.id} style={styles.notificacionItem}>
              {/* Botón para eliminar 
              <TouchableOpacity 
                style={styles.closeIconContainer}
                onPress={() => handleDeleteNotification(notification.id)}
              >
                <Image
                  source={require('@/assets/icons/close.png')}
                  style={styles.closeIcon}
                />
              </TouchableOpacity>*/}
      
              <TouchableOpacity
                style={styles.notificacionRow}
                onPress={() => router.push({
                  pathname: '/notification-details',
                  params: { notificationId: notification.id }
                })}
                activeOpacity={0.7}
              >
                {/* Icono según tipo de notificación */}
                <Image
                  source={getNotificationIcon(notification.tipo)}
                  style={styles.notificacionIcon}
                />
                
                <View style={{ flex: 1 }}>
                  <Text style={styles.notificacionTitle}>{notification.titulo}</Text>
                  <Text 
                    style={styles.notificacionDescription}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {notification.mensaje}
                  </Text>
                  <Text style={styles.notificacionDate}>
                    {formatDate(notification.fecha)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <BottomTabBar />
    </View>
  );
}

// Función para obtener el icono según el tipo de notificación
const getNotificationIcon = (tipo) => {
  switch(tipo) {
    case 'prestamo_aprobado':
      return require('@/assets/icons/notification_azul.png');
    case 'recordatorio_devolucion':
      return require('@/assets/icons/notification_azul.png');
    case 'multa_aplicada':
      return require('@/assets/icons/notification_azul.png');
    case 'sistema':
      return require('@/assets/icons/notification_azul.png');
    default:
      return require('@/assets/icons/notification_azul.png');
  }
};

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.2,
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
  },
  notificacionItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: width * 0.04,
    marginBottom: height * 0.025,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
    minHeight: height * 0.12,
  },
  notificacionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificacionIcon: {
    width: width * 0.08,
    height: width * 0.09,
    marginRight: width * 0.04,
  },
  closeIconContainer: {
    position: 'absolute',
    top: width * 0.025,
    right: width * 0.025,
    zIndex: 1,
    padding: 4,
  },
  closeIcon: {
    width: width * 0.05,
    height: width * 0.05,
    tintColor: '#888',
  },
  notificacionTitle: {
    fontSize: height * 0.02,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Georgia',
    color: '#03346E',
  },
  notificacionDescription: {
    fontSize: height * 0.016,
    color: '#555',
    marginBottom: 4,
  },
  notificacionDate: {
    fontSize: height * 0.014,
    color: '#888',
    textAlign: 'right',
  },
  title: {
    fontSize: height * 0.03,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    color: '#03346E',
  },
});