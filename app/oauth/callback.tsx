import { View, Text } from "react-native";
import { useOAuth } from '../../oauth/useOAuth';
import { useRouter } from 'expo-router';
import React from 'react';
import axios from 'axios';

export default function OAuthCallback() {
      const router = useRouter();
      const { isAuthenticated, logout } = useOAuth();

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
    else {
        // Si no está autenticado, redirigir a la pantalla de inicio
        router.replace('/');
    }
  }, [isAuthenticated]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Redirigiendo...</Text>
        </View>
    );
}