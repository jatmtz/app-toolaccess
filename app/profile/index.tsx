import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import { useOAuth } from '@/oauth/useOAuth';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { API_GENERAL_URL } from '@/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, logout } = useOAuth();
  const router = useRouter();
  const [ordersCount, setOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isUserReady, setIsUserReady] = useState(false);

    // Efecto para verificar cuando user está realmente listo
  useEffect(() => {
    if (user?.sub && !isUserReady) {
      setIsUserReady(true);
    }
  }, [user]);

  useEffect(() => {
    if (!isUserReady) return;

    const fetchOrdersCount = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const response = await axios.get(
          `${API_GENERAL_URL}api/loan-orders/order-count/${user.sub}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setOrdersCount(response.data.data.total_ordenes || 0);
      } catch (error) {
        console.error('Error fetching orders count:', error);
        setOrdersCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersCount();
  }, [isUserReady]);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.header}>
        <Text style={styles.title}>Mi Perfil</Text>
        <Image
          source={require('@/assets/icons/person-azul.png')}
          style={styles.profileIcon}
        />
        <Text style={styles.role}>{user?.rol_id || 'Operador'}</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Órdenes realizadas en total</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#03346E" />
            ) : (
              <Text style={styles.statValue}>{ordersCount}</Text>
            )}
          </View>
          
          <Text style={styles.label}>Nombre:</Text>
          <Text style={styles.value}>{user?.name || ''}</Text>
          
          <Text style={styles.label}>Apellido paterno:</Text>
          <Text style={styles.value}>{user?.apellido_paterno || ''}</Text>
          
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user?.email || ''}</Text>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
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
    paddingTop: height * -0.1,
    margin: width * 0.05,
  },
  title: {
    fontSize: height * 0.03,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    color: '#03346E',
  },
  profileIcon: {
    width: width * 0.25,
    height: width * 0.25,
    marginVertical: height * 0.03,
    resizeMode: 'contain',
  },
  role: {
    fontSize: height * 0.03,
    fontWeight: '300',
    color: '#03346E',
    fontFamily: 'Georgia',
  },
  statBox: {
    backgroundColor: '#F4F4F4',
    width: '100%',
    borderRadius: 12,
    padding: width * 0.04,
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  statLabel: {
    fontSize: height * 0.018,
    marginBottom: height * 0.01,
    color: '#888',
    fontFamily: 'Georgia',
  },
  statValue: {
    fontSize: height * 0.04,
    fontWeight: 'bold',
    color: '#333',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: height * 0.022,
    color: '#03346E',
    marginTop: height * 0.015,
    fontFamily: 'Georgia',
  },
  value: {
    alignSelf: 'flex-start',
    fontSize: height * 0.018,
    marginBottom: height * 0.01,
    marginTop: height * 0.005,
    color: '#333',
  },
    logoutButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: height * 0.018,
    paddingHorizontal: width * 0.08,
    borderRadius: width * 0.02,
    marginVertical: height * 0.02,
    width: '80%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: height * 0.020,
    fontWeight: 'bold',
  },
});
