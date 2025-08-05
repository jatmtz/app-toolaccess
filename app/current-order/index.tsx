import BottomTabBar from '@/components/BottomTabBar';
import ErrorModal from '@/components/ErrorModal';
import SuccessModal from '@/components/SuccessModal';
import TopBar from '@/components/TopBar';
import WarningModal from '@/components/WarningModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_GENERAL_URL } from '../../env';

const { width, height } = Dimensions.get('window');

export default function CurrentOrderScreen() {
  const [justification, setJustification] = useState('');
  const [timeRequested, setTimeRequested] = useState('');
  const [tools, setTools] = useState([]);
  const [warningVisible, setWarningVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
const [errorVisible, setErrorVisible] = useState(false);
const [loading, setLoading] = useState(false);

    useFocusEffect(
    React.useCallback(() => {
      const fetchOrder = async () => {
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

  const enviarOrden = async () => {
  try {
    setLoading(true);

    const token = await AsyncStorage.getItem('access_token');
    const userId = await AsyncStorage.getItem('user_id');

    if (!token) throw new Error('Token no disponible');

    const herramientasFormateadas = tools.map(t => ({
      id: t.id,
      cantidad: t.cantidad,
    }));

    const payload = {
      usuario_id: Number(userId), // solo si tu backend lo requiere explícitamente
      herramientas: herramientasFormateadas,
      tiempo_solicitado: parseInt(timeRequested),
      justificacion: justification.trim(),
    };

    const response = await axios.post(`${API_GENERAL_URL}api/loan-orders`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      // Limpiar orden en storage
      await AsyncStorage.removeItem('loan_order');

      setTools([]);
      setJustification('');
      setTimeRequested('');
      setSuccessVisible(true);
    } else {
      console.log('Error del servidor:', response.data);
      setErrorVisible(true);
    }

  } catch (error) {
    console.error('Error al enviar la orden:', error);
    setErrorVisible(true);
  } finally {
    setLoading(false);
    setWarningVisible(false);
  }
};


  const updateQuantity = (index: number, delta: number) => {
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

      <View style={styles.header}>
      <Text style={styles.title}>Orden de préstamo</Text>
    </View>

      <ScrollView contentContainerStyle={styles.content}>

        {tools.length === 0 ? (
          <Text style={{ textAlign: 'center', marginVertical: height * 0.05, fontSize: height * 0.02, color: '#999' }}>
            Tu orden de préstamo está vacía.
          </Text>
        ) : (
          tools.map((tool, index) => (
            <View key={tool.id} style={styles.item}>
              <Image
                source={tool.foto_url ? { uri: tool.foto_url } : require('@/assets/images/tool1.png')}
                style={styles.toolImage}
              />
              <View style={styles.toolInfo}>
                <Text style={styles.toolName}>{tool.nombre}</Text>
                <Text style={styles.toolDescription}>{tool.descripcion}</Text>
              </View>
              <View style={styles.counter}>
                <TouchableOpacity onPress={() => updateQuantity(index, -1)}>
                  <Text style={styles.circle}>-</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{tool.cantidad}</Text>
                <TouchableOpacity onPress={() => updateQuantity(index, 1)}>
                  <Text style={styles.circle}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        {/* Justificación */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: height * 0.03, marginBottom: height * 0.01 }}>
        <Image
            source={require('@/assets/icons/comment.png')}
            style={ styles.commentIcon}
            resizeMode="contain"
        />
        <Text style={styles.label}>Justificación</Text>
        
        </View>
        <TextInput
        style={styles.textArea}
        placeholder="Escribe aquí..."
        multiline
        numberOfLines={4}
        value={justification}
        onChangeText={setJustification}
        />

        {/* Tiempo solicitado */}
        <Text style={styles.label}>Tiempo solicitado:</Text>
        <View style={styles.timeRow}>
          <TextInput
            style={styles.timeInput}
            placeholder="0"
            keyboardType="numeric"
            value={timeRequested}
            onChangeText={setTimeRequested}
          />
          <Text style={styles.minutesLabel}>minutos</Text>
        </View>

        {/* Botón */}
        <TouchableOpacity
          style={styles.orderButton}
          onPress={() => setWarningVisible(true)} // 3. Mostrar modal al presionar
        >
          <Text style={styles.orderButtonText}>Ordenar</Text>
        </TouchableOpacity>
      </ScrollView>

      <WarningModal
        visible={warningVisible}
        onClose={() => setWarningVisible(false)}
        onConfirm={enviarOrden}
      />

      <SuccessModal
        visible={successVisible}
        onClose={() => setSuccessVisible(false)}
        message="Orden enviada correctamente al almacén."
      />

      <ErrorModal
        visible={errorVisible}
        onClose={() => setErrorVisible(false)}
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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  toolImage: {
    width: width * 0.2,
    height: width * 0.2,
    resizeMode: 'contain',
    marginRight: width * 0.04,
  },
  toolInfo: {
    flex: 1,
  },
  toolName: {
    fontSize: height * 0.02,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
  },
  toolDescription: {
    fontSize: height * 0.016,
    color: '#666',
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
  },
  counterValue: {
    fontSize: height * 0.02,
  },
  label: {
    fontSize: height * 0.022,
    marginTop: height * 0.03,
    marginBottom: height * 0.01,
    fontFamily: 'Georgia',
    color: '#03346E',
  },
  textArea: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: width * 0.04,
    fontSize: height * 0.018,
    minHeight: height * 0.15,
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
  },
  minutesLabel: {
    fontSize: height * 0.018,
  },
  orderButton: {
    backgroundColor: '#03346E',
    paddingVertical: height * 0.02,
    borderRadius: width * 0.02,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#fff',
    fontSize: height * 0.018,
    fontWeight: 'bold',
  },
  commentIcon: {
    width: width * 0.08,
    height: width * 0.08,
    marginRight: width * 0.02,
    marginTop: height * 0.015,
  },
});
