/**
 * ToolDetailsScreen.tsx
 * 
 * Pantalla que muestra los detalles completos de una herramienta específica
 * 
 * Características:
 * - Muestra imagen, nombre, descripción y detalles técnicos
 * - Permite agregar la herramienta a una orden de préstamo
 * - Maneja estados de carga y error
 * - Valida disponibilidad de stock
 * 
 * Cumple con:
 * - ES6+ standards
 * - React Native best practices
 * - TypeScript typing
 * - Clean Code principles
 * - ISO/IEC 25010 (Maintainability, Reliability)
 * 
 * Versión: 1.1.0
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { checkAuth, refreshToken } from '../../auth-utils';

// Components
import BottomTabBar from '@/components/BottomTabBar';
import SuccessModal from '@/components/SuccessModal';
import TopBar from '@/components/TopBar';

// Config
import { API_GENERAL_URL } from '../../env';

// Constants
const { width, height } = Dimensions.get('window');
const TOOL_PLACEHOLDER_IMAGE = require('@/assets/images/image.png');

/**
 * Interfaz que representa una herramienta
 */
interface Tool {
  id: number;
  nombre: string;
  descripcion: string;
  foto_url: string | null;
  folio: string;
  stock: number;
  valor_reposicion: number;
  subcategoria_id: number;
}

/**
 * Interfaz que representa una subcategoría
 */
interface Subcategory {
  id: number;
  nombre: string;
}

/**
 * Interfaz que representa un ítem en una orden de préstamo
 */
interface OrderItem {
  id: number;
  nombre: string;
  descripcion: string;
  foto_url: string | null;
  cantidad: number;
}

/**
 * Construye la URL completa para una imagen
 * @param path - Ruta relativa de la imagen
 * @returns URL completa o null si no hay path
 */
const buildImageUrl = (path: string | null): string | null => {
  return path ? `${API_GENERAL_URL}uploads/${path}` : null;
};

/**
 * Componente principal de detalles de herramienta
 */
export default function ToolDetailsScreen() {
  
  const router = useRouter();
  const params = useLocalSearchParams();
  const [successVisible, setSuccessVisible] = useState(false);
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);

useFocusEffect(
  React.useCallback(() => {
    let isActive = true;

    const verifyToken = async () => {
      const isValid = await checkAuth();
      if (!isActive) return;
      
      if (!isValid) {
        const refreshed = await refreshToken();
        if (!refreshed && isActive) {
          router.replace('/');
        }
      }
    };

    verifyToken();

    return () => {
      isActive = false;
    };
  }, [router])
);

  /**
   * Obtiene los detalles de la herramienta desde la API
   */
  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const response = await axios.get(`${API_GENERAL_URL}api/tools/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setTool(response.data.data);
          
          fetchSubcategoryDetails(response.data.data.subcategoria_id, token || '');
        } else {
          setError('No se pudo obtener la información de la herramienta');
        }
      } catch (err) {
        console.error('Error fetching tool details:', err);
        setError('Error al cargar los detalles de la herramienta');
      } finally {
        setLoading(false);
      }
    };

    const fetchSubcategoryDetails = async (subcategoryId: number, token: string) => {
      try {
        const response = await axios.get(`${API_GENERAL_URL}api/subcategories/${subcategoryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setSubcategory(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching subcategory details:', err);
      }
    };

    fetchToolDetails();
  }, [params.id]);

  /**
   * Agrega la herramienta a la orden de préstamo
   */
  const handleAddToOrder = async () => {
    if (!tool) return;
    
    try {
      const existingOrder = await AsyncStorage.getItem('loan_order');
      let order: OrderItem[] = existingOrder ? JSON.parse(existingOrder) : [];

      // Verifica si la herramienta ya está en la orden
      const index = order.findIndex((item) => item.id === tool.id);
      if (index !== -1) {
        // Si ya está, aumenta el contador
        order[index].cantidad += 1;
      } else {
        // Si no está, agrega con cantidad inicial 1
        order.push({
          id: tool.id,
          nombre: tool.nombre,
          descripcion: tool.descripcion,
          foto_url: tool.foto_url,
          cantidad: 1,
        });
      }

      await AsyncStorage.setItem('loan_order', JSON.stringify(order));
      setSuccessVisible(true);
    } catch (err) {
      console.error('Error al agregar a la orden:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <TopBar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#03346E" />
          <Text style={styles.loadingText}>Cargando detalles de la herramienta...</Text>
        </View>
        <BottomTabBar />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <TopBar />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
        <BottomTabBar />
      </View>
    );
  }

  if (!tool) {
    return (
      <View style={styles.container}>
        <TopBar />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Herramienta no encontrada</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
        <BottomTabBar />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />

      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={
            tool.foto_url 
              ? { uri: buildImageUrl(tool.foto_url) } 
              : require('@/assets/images/image.png')
          }
          style={styles.toolImage}
          resizeMode="contain"
          onError={(e) => console.log('Error loading image:', e.nativeEvent.error)}
        />

        <Text style={styles.toolName}>{tool.nombre}</Text>
        <Text style={styles.toolDescription}>{tool.descripcion}</Text>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Folio:</Text>
          <Text style={styles.value}>{tool.folio || 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Subcategoría:</Text>
          <Text style={styles.value}>{subcategory?.nombre || 'No especificada'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Disponibles:</Text>
          <Text style={styles.value}>{tool.stock}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Valor de reposición:</Text>
          <Text style={styles.value}>${tool.valor_reposicion}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, tool.stock <= 0 && styles.buttonDisabled]} 
          onPress={handleAddToOrder}
          disabled={tool.stock <= 0}
        >
          <Text style={styles.buttonText}>
            {tool.stock > 0 ? 'Agregar a la orden de préstamo' : 'No disponible'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <SuccessModal
        visible={successVisible}
        onClose={() => setSuccessVisible(false)}
        message="Herramienta agregada a la orden de préstamo"
      />

      <BottomTabBar />
    </View>
  );
}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    color: '#03346E',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#d9534f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#03346E',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  toolImage: {
    width: '100%',
    height: height * 0.25,
    marginBottom: height * 0.03,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  toolName: {
    fontSize: height * 0.028,
    fontWeight: 'bold',
    color: '#03346E',
    marginBottom: height * 0.01,
  },
  toolDescription: {
    fontSize: height * 0.018,
    color: '#666',
    marginBottom: height * 0.03,
    lineHeight: 24,
  },
  detailRow: {
    marginBottom: height * 0.02,
  },
  label: {
    fontSize: height * 0.018,
    fontWeight: '600',
    color: '#03346E',
    marginBottom: 2,
  },
  value: {
    fontSize: height * 0.018,
    color: '#333',
  },
  button: {
    backgroundColor: '#03346E',
    paddingVertical: height * 0.018,
    borderRadius: width * 0.02,
    alignItems: 'center',
    marginTop: height * 0.05,
    opacity: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: height * 0.018,
    fontWeight: 'bold',
  },
});