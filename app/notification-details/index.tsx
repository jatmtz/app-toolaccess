import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { API_GENERAL_URL } from '../../env';

const { width, height } = Dimensions.get('window');

export default function NotificationDetailsScreen() {
  const { notificationId } = useLocalSearchParams();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotificationDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }

        const response = await axios.get(
          `${API_GENERAL_URL}api/notifications/${notificationId}`, 
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setNotification(response.data.data);
        } else {
          setError('No se pudo cargar la notificación');
        }
      } catch (err) {
        console.error('Error al obtener detalles:', err);
        setError('Error al cargar la notificación');
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationDetails();
  }, [notificationId]);

  const formatNotificationDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy 'a las' hh:mm a", { locale: es });
    } catch {
      return dateString;
    }
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
        <View style={styles.content}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
        <BottomTabBar />
      </View>
    );
  }

  if (!notification) {
    return (
      <View style={styles.container}>
        <TopBar />
        <View style={styles.content}>
          <Text style={styles.errorText}>Notificación no encontrada</Text>
        </View>
        <BottomTabBar />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />

      <View style={styles.header}>
        <Text style={styles.title}>{notification.titulo}</Text>
        <Text style={styles.date}>
          {formatNotificationDate(notification.fecha_creacion)}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{notification.mensaje}</Text>
          
          {/* Mostrar detalles específicos según el tipo de notificación */}
          {notification.tipo === 'prestamo_aprobado' && (
            <View style={styles.detailsContainer}>
              <Text style={styles.detailTitle}>Detalles del préstamo:</Text>
              <Text style={styles.detailText}>
                • Estado: Aprobado
              </Text>
              <Text style={styles.detailText}>
                • Fecha: {formatNotificationDate(notification.fecha_creacion)}
              </Text>
            </View>
          )}

          {notification.tipo === 'multa_aplicada' && (
            <View style={[styles.detailsContainer, styles.warningContainer]}>
              <Text style={styles.detailTitle}>⚠️ Detalles de la multa:</Text>
              <Text style={styles.detailText}>
                • Motivo: Retraso en devolución
              </Text>
            </View>
          )}
        </View>
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
    paddingHorizontal: width * 0.05,
  },
  content: {
    padding: width * 0.07,
    paddingBottom: height * 0.08,
    backgroundColor: '#F0F0F0',
    marginStart: width * 0.05,
    marginEnd: width * 0.05,
    marginTop: height * 0.02,
    borderRadius: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: height * 0.03,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    color: '#03346E',
    textAlign: 'center',
  },
  date: {
    fontSize: height * 0.016,
    color: '#888',
    marginTop: height * 0.01,
  },
  messageContainer: {
    marginTop: height * 0.01,
    height: height * 0.4,
  },
  messageText: {
    fontSize: height * 0.021,
    lineHeight: height * 0.03,
    fontFamily: 'Arial',
  },
  detailsContainer: {
    marginTop: height * 0.03,
    padding: width * 0.04,
    backgroundColor: '#e3e3e3',
    borderRadius: 8,
  },
  warningContainer: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  successContainer: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
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
  },
  errorText: {
    fontSize: height * 0.02,
    color: 'red',
    textAlign: 'center',
    marginTop: height * 0.3,
  },
});