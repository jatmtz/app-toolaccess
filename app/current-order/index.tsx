/**
 * CurrentOrderScreen.tsx
 * 
 * Pantalla para gestionar y enviar órdenes de préstamo de herramientas.
 * Permite al usuario revisar su orden actual, ajustar cantidades, 
 * proporcionar justificación y tiempo solicitado.
 * 
 * Cumple con:
 * - ES6+ standards
 * - React Native best practices
 * - TypeScript typing
 * - Clean Code principles
 * - ISO/IEC 25010 (Maintainability, Reliability)
 */

// Importaciones organizadas por tipo y agrupadas lógicamente
// 1. Componentes de React y React Native
import axios from 'axios';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { checkAuth, refreshToken } from '../../auth-utils';

// 2. Componentes personalizados
import BottomTabBar from '@/components/BottomTabBar';
import ErrorModal from '@/components/ErrorModal';
import SuccessModal from '@/components/SuccessModal';
import TopBar from '@/components/TopBar';
import WarningModal from '@/components/WarningModal';

// 3. Librerías de terceros
import AsyncStorage from '@react-native-async-storage/async-storage';


// 4. Configuración y assets
import { API_GENERAL_URL } from '../../env';

// Constantes globales
const { width, height } = Dimensions.get('window');
const IMAGE_PLACEHOLDER = require('@/assets/images/image.png');
const COMMENT_ICON = require('@/assets/icons/comment.png');

/**
 * Tipo que representa una herramienta en la orden de préstamo
 */
type Tool = {
  id: number;
  nombre: string;
  descripcion: string;
  foto_url: string | null;
  cantidad: number;
};

/**
 * Tipo que define la estructura del payload para enviar una orden
 */
type LoanOrderPayload = {
  usuario_id: number;
  herramientas: Array<{
    id: number;
    cantidad: number;
  }>;
  tiempo_solicitado: number;
  justificacion: string;
};

/**
 * Construye la URL completa para una imagen a partir de su path relativo
 * @param path - Ruta relativa de la imagen o null
 * @returns URL completa de la imagen o null si no hay path
 */
const buildImageUrl = (path: string | null): string | null => {
  if (!path) return null;
  return `${API_GENERAL_URL}uploads/${path}`;
};

/**
 * Pantalla principal para gestionar la orden de préstamo actual
 */
const CurrentOrderScreen: React.FC = () => {
  
  const router = useRouter();
  // Estados del componente
  const [justification, setJustification] = useState<string>('');
  const [timeRequested, setTimeRequested] = useState<string>('');
  const [tools, setTools] = useState<Tool[]>([]);
  const [warningVisible, setWarningVisible] = useState<boolean>(false);
  const [successVisible, setSuccessVisible] = useState<boolean>(false);
  const [errorVisible, setErrorVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  /**
   * Efecto que verifica la autenticación del usuario al enfocar la pantalla
   * y refresca el token si es necesario.
   */
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
   * Efecto que carga la orden almacenada al enfocar la pantalla
   */
  useFocusEffect(
    React.useCallback(() => {
      const fetchOrder = async (): Promise<void> => {
        try {
          const data = await AsyncStorage.getItem('loan_order');
          if (data) {
            setTools(JSON.parse(data));
          } else {
            setTools([]);
          }
        } catch (error) {
          console.error('Error cargando la orden:', error);
        }
      };

      fetchOrder();
    }, [])
  );

  /**
   * Envía la orden de préstamo al servidor
   * @throws {Error} Cuando hay problemas con la solicitud
   */
  const enviarOrden = async (): Promise<void> => {
    try {
      setLoading(true);

      // Obtener credenciales del usuario
      const [token, userId] = await Promise.all([
        AsyncStorage.getItem('access_token'),
        AsyncStorage.getItem('user_id'),
      ]);

      if (!token) {
        throw new Error('Token no disponible');
      }

      // Preparar payload de la solicitud
      const payload: LoanOrderPayload = {
        usuario_id: Number(userId),
        herramientas: tools.map(tool => ({
          id: tool.id,
          cantidad: tool.cantidad,
        })),
        tiempo_solicitado: parseInt(timeRequested) || 0,
        justificacion: justification.trim(),
      };

      // Validaciones del payload
      validatePayload(payload);

      // Enviar solicitud al servidor
      const response = await axios.post(
        `${API_GENERAL_URL}api/loan-orders`, 
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      handleResponse(response.data);
    } catch (error: any) {
      handleError(error);
    } finally {
      setLoading(false);
      setWarningVisible(false);
    }
  };

  /**
   * Valida que el payload cumpla con los requisitos mínimos
   * @param payload - Datos de la orden a validar
   * @throws {Error} Cuando la validación falla
   */
  const validatePayload = (payload: LoanOrderPayload): void => {
    if (payload.herramientas.length === 0) {
      throw new Error('No hay herramientas en la orden');
    }

    if (!payload.justificacion) {
      throw new Error('La justificación es requerida');
    }

    if (payload.tiempo_solicitado <= 0) {
      throw new Error('El tiempo solicitado debe ser mayor a 0');
    }
  };

  /**
   * Maneja la respuesta exitosa del servidor
   * @param responseData - Datos de la respuesta
   */
  const handleResponse = async (responseData: any): Promise<void> => {
    if (responseData.success) {
      await Promise.all([
        AsyncStorage.removeItem('loan_order'),
        setTools([]),
        setJustification(''),
        setTimeRequested(''),
      ]);
      
      setSuccessMessage(responseData.message || 'Orden enviada con éxito');
      setSuccessVisible(true);
    } else {
      setErrorMessage(responseData.message || 'Ocurrió un error al procesar la solicitud');
      setErrorVisible(true);
    }
  };

  /**
   * Maneja errores durante el proceso de envío
   * @param error - Error capturado
   */
  const handleError = (error: any): void => {
    console.error('Error al enviar la orden:', error);
    const message = error.response?.data?.message || 
                    error.message || 
                    'Ocurrió un error inesperado';
    setErrorMessage(message);
    setErrorVisible(true);
  };

  /**
   * Actualiza la cantidad de una herramienta en la orden
   * @param index - Índice de la herramienta en el array
   * @param delta - Valor a sumar (puede ser negativo)
   */
  const updateQuantity = (index: number, delta: number): void => {
    const newTools = [...tools];
    newTools[index].cantidad = Math.max(0, newTools[index].cantidad + delta);
    
    // Filtrar herramientas con cantidad > 0
    const filteredTools = newTools.filter(tool => tool.cantidad > 0);
    
    setTools(filteredTools);
    AsyncStorage.setItem('loan_order', JSON.stringify(filteredTools));
  };

  return (
    <View style={styles.container}>
      <TopBar />

      {/* Encabezado de la pantalla */}
      <View style={styles.header}>
        <Text style={styles.title}>Orden de préstamo</Text>
      </View>

      {/* Contenido principal */}
      <ScrollView 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Lista de herramientas */}
        {tools.length === 0 ? (
          <Text style={styles.emptyOrderText}>
            Tu orden de préstamo está vacía.
          </Text>
        ) : (
          tools.map((tool, index) => (
            <View key={`tool-${tool.id}`} style={styles.item}>
              <Image
                source={tool.foto_url ? 
                  { uri: buildImageUrl(tool.foto_url) } : 
                  IMAGE_PLACEHOLDER
                }
                style={styles.toolImage}
                onError={(e) => console.log('Error loading image:', e.nativeEvent.error)}
                accessibilityLabel={`Imagen de ${tool.nombre}`}
              />
              
              <View style={styles.toolInfo}>
                <Text style={styles.toolName}>{tool.nombre}</Text>
                <Text 
                  style={styles.toolDescription}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {tool.descripcion}
                </Text>
              </View>
              
              <View style={styles.counter}>
                <TouchableOpacity 
                  onPress={() => updateQuantity(index, -1)}
                  accessibilityLabel="Reducir cantidad"
                >
                  <Text style={styles.circle}>-</Text>
                </TouchableOpacity>
                
                <Text style={styles.counterValue}>{tool.cantidad}</Text>
                
                <TouchableOpacity 
                  onPress={() => updateQuantity(index, 1)}
                  accessibilityLabel="Aumentar cantidad"
                >
                  <Text style={styles.circle}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Campo de justificación */}
        <View style={styles.justificationHeader}>
          <Image
            source={COMMENT_ICON}
            style={styles.commentIcon}
            resizeMode="contain"
            accessibilityLabel="Icono de comentario"
          />
          <Text style={styles.label}>Justificación</Text>
        </View>
        
        <TextInput
          style={styles.textArea}
          placeholder="Escribe aquí..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          value={justification}
          onChangeText={setJustification}
          accessibilityLabel="Campo para justificación del préstamo"
        />

        {/* Campo de tiempo solicitado */}
        <Text style={styles.label}>Tiempo solicitado:</Text>
        
        <View style={styles.timeRow}>
          <TextInput
            style={styles.timeInput}
            placeholder="0"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={timeRequested}
            onChangeText={setTimeRequested}
            accessibilityLabel="Tiempo solicitado en minutos"
          />
          <Text style={styles.minutesLabel}>minutos</Text>
        </View>

        {/* Botón de enviar orden */}
        <TouchableOpacity
          style={[
            styles.orderButton, 
            tools.length === 0 && styles.disabledButton
          ]}
          onPress={() => tools.length > 0 && setWarningVisible(true)}
          disabled={tools.length === 0 || loading}
          accessibilityLabel="Enviar orden de préstamo"
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.orderButtonText}>Ordenar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modales de estado */}
      <WarningModal
        visible={warningVisible}
        onClose={() => setWarningVisible(false)}
        onConfirm={enviarOrden}
      />

      <SuccessModal
        visible={successVisible}
        onClose={() => {
          setSuccessVisible(false);
          setSuccessMessage('');
        }}
        message={successMessage}
      />

      <ErrorModal
        visible={errorVisible}
        onClose={() => {
          setErrorVisible(false);
          setErrorMessage('');
        }}
        message={errorMessage}
      />

      <BottomTabBar />
    </View>
  );
};

// Estilos del componente
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
  title: {
    fontSize: height * 0.03,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    color: '#03346E',
  },
  emptyOrderText: {
    textAlign: 'center',
    marginVertical: height * 0.05,
    fontSize: height * 0.02,
    color: '#999',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
    padding: width * 0.03,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  toolImage: {
    width: width * 0.2,
    height: width * 0.2,
    resizeMode: 'contain',
    marginRight: width * 0.04,
    borderRadius: 4,
  },
  toolInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  toolName: {
    fontSize: height * 0.02,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: height * 0.016,
    color: '#666',
    lineHeight: height * 0.02,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.02,
  },
  circle: {
    backgroundColor: '#eee',
    borderRadius: width * 0.05,
    width: width * 0.08,
    height: width * 0.08,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: 'bold',
    fontSize: height * 0.02,
    paddingTop: height * 0.005,
    color: '#03346E',
  },
  counterValue: {
    fontSize: height * 0.02,
    minWidth: width * 0.05,
    textAlign: 'center',
    color: '#03346E',
  },
  justificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.03,
    marginBottom: height * 0.01,
  },
  label: {
    fontSize: height * 0.022,
    marginTop: height * 0.03,
    marginBottom: height * 0.01,
    fontFamily: 'Georgia',
    color: '#03346E',
    fontWeight: 'bold',
  },
  textArea: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: width * 0.04,
    fontSize: height * 0.018,
    minHeight: height * 0.15,
    textAlignVertical: 'top',
    color: '#333',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  timeInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: width * 0.03,
    width: width * 0.2,
    fontSize: height * 0.018,
    marginRight: width * 0.02,
    textAlign: 'center',
    color: '#03346E',
  },
  minutesLabel: {
    fontSize: height * 0.018,
    color: '#666',
  },
  orderButton: {
    backgroundColor: '#03346E',
    paddingVertical: height * 0.02,
    borderRadius: width * 0.02,
    alignItems: 'center',
    marginTop: height * 0.02,
    shadowColor: '#03346E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    shadowColor: 'transparent',
  },
  orderButtonText: {
    color: '#fff',
    fontSize: height * 0.018,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  commentIcon: {
    width: width * 0.08,
    height: width * 0.08,
    marginRight: width * 0.02,
    tintColor: '#03346E',
  },
});

export default CurrentOrderScreen;