/**
 * @file Pantalla de Perfil de Usuario
 * @module ProfileScreen
 * @description 
 *    Muestra la información del usuario autenticado y estadísticas de uso.
 *    Cumple con los estándares ISO/IEC 25010 para calidad de software:
 *    - Funcionalidad: Completa y correcta
 *    - Usabilidad: Interfaz intuitiva
 *    - Mantenibilidad: Código bien estructurado y documentado
 * @version 1.1.0
 * @requires react,react-native
 */

import BottomTabBar from '@/components/BottomTabBar';
import TopBar from '@/components/TopBar';
import { API_GENERAL_URL } from '@/env';
import { useOAuth } from '@/oauth/useOAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { checkAuth, refreshToken } from '../../auth-utils';

const { width, height } = Dimensions.get('window');

/**
 * @interface UserProfile
 * @description Define la estructura de datos del perfil de usuario
 * @property {string} sub - ID único del usuario (subject)
 * @property {string} name - Nombre completo del usuario
 * @property {string} apellido_paterno - Apellido paterno
 * @property {string} email - Correo electrónico
 * @property {number} rol_id - ID del rol del usuario
 */
interface UserProfile {
  sub: string;
  name: string;
  apellido_paterno: string;
  email: string;
  rol_id?: number;
}

/**
 * @interface OrderCountResponse
 * @description Estructura de la respuesta de la API para el conteo de órdenes
 * @property {number} total_ordenes - Total de órdenes realizadas
 */
interface OrderCountResponse {
  data: number;
}

/**
 * @component ProfileScreen
 * @description Pantalla principal de perfil de usuario
 * @prop {UserProfile} user - Datos del usuario autenticado
 * @prop {Function} logout - Función para cerrar sesión
 */
export default function ProfileScreen() {
  
  // Hooks y estados
  const { user, logout } = useOAuth();
  const router = useRouter();
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUserReady, setIsUserReady] = useState<boolean>(false);

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
   * @effect useEffect - Efecto para verificar cuando user está realmente listo
   * @description Valida que el usuario tenga datos completos antes de hacer peticiones
   * @deps user, isUserReady
   */
  useEffect(() => {
    if (user?.sub && !isUserReady) {
      setIsUserReady(true);
    }
  }, [user]);

  /**
   * @effect useEffect - Efecto para cargar estadísticas del usuario
   * @description Obtiene el conteo de órdenes del usuario cuando los datos están listos
   * @deps isUserReady
   */
  useEffect(() => {
    if (!isUserReady) return;

    /**
     * @function fetchOrdersCount
     * @async
     * @description Obtiene el número total de órdenes del usuario desde la API
     */
    const fetchOrdersCount = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) throw new Error('Token de acceso no disponible');

        const response = await axios.get<OrderCountResponse>(
          `${API_GENERAL_URL}api/loan-orders/order-count/${user?.sub}`,
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

  /**
   * @function handleLogout
   * @async
   * @description Maneja el proceso de cierre de sesión
   * @returns {Promise<void>}
   */
  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      router.replace('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <View style={styles.container} testID="profile-screen">
      {/* Componente de barra superior */}
      <TopBar />
      
      {/* Encabezado del perfil */}
      <View style={styles.header}>
        <Text style={styles.title}>Mi Perfil</Text>
        <Image
          source={require('@/assets/icons/person-azul.png')}
          style={styles.profileIcon}
          accessibilityLabel="Icono de perfil"
        />
        <Text style={styles.role}>{user?.rol_id ? 'Administrador' : 'Operador'}</Text>
      </View>
      
      {/* Contenido principal */}
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Estadísticas */}
        <View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Órdenes realizadas en total</Text>
            {loading ? (
              <ActivityIndicator 
                size="small" 
                color="#03346E" 
                testID="loading-indicator"
              />
            ) : (
              <Text style={styles.statValue} testID="orders-count">
                {ordersCount}
              </Text>
            )}
          </View>
          
          {/* Información del usuario */}
          <Text style={styles.label}>Nombre:</Text>
          <Text style={styles.value} testID="user-name">
            {user?.name || 'No disponible'}
          </Text>
          
          <Text style={styles.label}>Apellido paterno:</Text>
          <Text style={styles.value} testID="user-lastname">
            {user?.apellido_paterno || 'No disponible'}
          </Text>
          
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value} testID="user-email">
            {user?.email || 'No disponible'}
          </Text>
        </View>
        
        {/* Botón de cierre de sesión */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          accessibilityLabel="Cerrar sesión"
          accessibilityRole="button"
          testID="logout-button"
        >
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Componente de barra inferior */}
      <BottomTabBar />
    </View>
  );
}

/**
 * @object styles
 * @description Estilos para la pantalla de perfil
 * @property {Object} container - Estilo del contenedor principal
 * @property {Object} header - Estilo del encabezado
 * @property {Object} content - Estilo del contenido
 * @property {Object} title - Estilo del título
 * @property {Object} profileIcon - Estilo del icono de perfil
 * @property {Object} role - Estilo del texto de rol
 * @property {Object} statBox - Estilo del contenedor de estadísticas
 * @property {Object} statLabel - Estilo de la etiqueta de estadística
 * @property {Object} statValue - Estilo del valor de estadística
 * @property {Object} label - Estilo de las etiquetas de información
 * @property {Object} value - Estilo de los valores de información
 * @property {Object} logoutButton - Estilo del botón de cierre de sesión
 * @property {Object} logoutButtonText - Estilo del texto del botón de cierre de sesión
 */
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