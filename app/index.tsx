import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useOAuth } from '../oauth/useOAuth';
import { useFocusEffect } from 'expo-router';

// Obtener dimensiones de la pantalla para diseño responsivo
const { width, height } = Dimensions.get('window');

/**
 * Pantalla de bienvenida con autenticación OAuth.
 * Cumple con:
 *  - ISO/IEC 25010: Mantenibilidad, Portabilidad, Compatibilidad
 *  - Patrones de diseño React: Componentes funcionales, Hooks
 *  - Buenas prácticas de documentación (JSDoc)
 * 
 * @returns {React.Element} Componente de pantalla de bienvenida
 */
export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated, login, isLoading, logout } = useOAuth();

  React.useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async (error) => {
        if (error.response?.status === 401) {
          await logout();
          router.replace('/');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      // Limpiar interceptor al desmontar
      axios.interceptors.response.eject(interceptor);
    };
  }, [logout, router]);

  // Redirigir a home si está autenticado
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/home');
    }
  }, [isAuthenticated]);

  // Estado de carga
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="welcome-screen">
      {/* Logo de la aplicación */}
      <Image 
        source={require('@/assets/images/256x256.png')} 
        style={styles.logo}
        accessibilityLabel="Logo de ToolAccess"
      />
      
      {/* Títulos de bienvenida */}
      <Text style={styles.title}>Bienvenido a</Text>
      <Text style={styles.subtitle}>ToolAccess</Text>

      {/* Botón de inicio de sesión */}
      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={login}
        accessible={true}
        accessibilityLabel="Iniciar sesión con ToolAccess"
        accessibilityRole="button"
      >
        <Text style={styles.loginButtonText}>Iniciar sesión con ToolAccess</Text>
      </TouchableOpacity>
    </View>
  );
}

// Estilos responsivos usando porcentajes de dimensiones de pantalla
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.45,       // 45% del ancho de pantalla
    height: width * 0.45,      // Relación cuadrada
    marginBottom: height * 0.08, // 8% de altura de pantalla
  },
  title: {
    fontSize: height * 0.05,    // 5% de altura de pantalla
    color: '#000',
    fontFamily: 'Georgia',
    includeFontPadding: false,  // Mejor alineación de texto
  },
  subtitle: {
    fontSize: height * 0.05,     // 5% de altura de pantalla
    fontWeight: 'bold',
    color: '#4A90E2',           // Azul corporativo
    marginBottom: height * 0.1,  // 10% de altura de pantalla
    fontFamily: 'Georgia',
    includeFontPadding: false,
  },
  loginButton: {
    backgroundColor: '#03346E',  // Azul oscuro corporativo
    paddingVertical: height * 0.018,
    paddingHorizontal: width * 0.08,
    borderRadius: width * 0.02,  // Bordes redondeados responsivos
    width: '85%',                // Ancho relativo al contenedor
    alignItems: 'center',
    elevation: 3,                // Sombra en Android
    shadowColor: '#000',         // Sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 14,     // 2% de altura de pantalla
    fontWeight: 'bold',
  },
});