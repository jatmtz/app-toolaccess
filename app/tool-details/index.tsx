/**
 * @file Pantalla de detalles de herramienta
 * @module ToolDetailsScreen
 * @description Muestra los detalles completos de una herramienta específica
 */
import BottomTabBar from '@/components/BottomTabBar';
import SuccessModal from '@/components/SuccessModal';
import TopBar from '@/components/TopBar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_GENERAL_URL } from '../../env';

const { width, height } = Dimensions.get('window');

export default function ToolDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [successVisible, setSuccessVisible] = useState(false);
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subcategory, setSubcategory] = useState(null);

  // Obtener detalles de la herramienta
  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const response = await axios.get(`${API_GENERAL_URL}api/tools/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setTool(response.data.data);
          // Obtener detalles de la subcategoría
          fetchSubcategoryDetails(response.data.data.subcategoria_id, token);
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

    const fetchSubcategoryDetails = async (subcategoryId, token) => {
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

  const handleAddToOrder = async () => {
  try {
    const existingOrder = await AsyncStorage.getItem('loan_order');
    let order = existingOrder ? JSON.parse(existingOrder) : [];

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
          source={tool.foto_url ? { uri: tool.foto_url } : require('@/assets/images/image.png')}
          style={styles.toolImage}
          resizeMode="contain"
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
          style={styles.button} 
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