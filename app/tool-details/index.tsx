import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, ScrollView } from 'react-native';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import { router } from 'expo-router';
import { useRouter } from 'expo-router';
import SuccessModal from '@/components/SuccessModal';

const { width, height } = Dimensions.get('window');

export default function ToolDetailsScreen() {

  const router = useRouter();
  const [successVisible, setSuccessVisible] = React.useState(false);

  return (
    <View style={styles.container}>
      <TopBar />

      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={require('@/assets/images/tools/laminero.png')}
          style={styles.toolImage}
        />

        <Text style={styles.toolName}>Martillo para laminero</Text>
        <Text style={styles.toolDescription}>
          Martillo para Laminero Desabollador{'\n'}
          Punta Larga, Mango de Fibra de Vidrio (11 Oz)
        </Text>

        <Text style={styles.label}>
          Subcategoría: 
        </Text>

        <Text style={styles.value}>Martillos especializados</Text>

        <Text style={styles.label}>
          Valor de la reposición en caso de perdida:{' '}
        </Text>

        <Text style={styles.value}>$1000</Text>

        <TouchableOpacity style={styles.button} onPress={() => setSuccessVisible(true)}>
          <Text style={styles.buttonText}>Agregar a la orden de préstamo</Text>
        </TouchableOpacity>
      </ScrollView>

      <SuccessModal
        visible={successVisible}
        onClose={() => setSuccessVisible(false)}
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
  toolImage: {
    width: '100%',
    height: height * 0.25,
    resizeMode: 'contain',
    marginBottom: height * 0.03,
  },
  toolName: {
    fontSize: height * 0.028,
    fontWeight: 'bold',
    color: '#03346E',
    fontFamily: 'Georgia',
    marginBottom: height * 0.01,
  },
  toolDescription: {
    fontSize: height * 0.018,
    color: '#666',
    marginBottom: height * 0.05,
  },
  label: {
    fontSize: height * 0.018,
    fontWeight: '600',
    color: '#03346E',
    fontFamily: 'Georgia',
    marginBottom: height * 0.01,
  },
  value: {
    fontWeight: 'normal',
    color: '#333',
    fontFamily: 'Arial',
    marginBottom: height * 0.05,
  },
  button: {
    backgroundColor: '#03346E',
    paddingVertical: height * 0.018,
    borderRadius: width * 0.02,
    alignItems: 'center',
    marginTop: height * 0.03,
  },
  buttonText: {
    color: '#fff',
    fontSize: height * 0.018,
    fontWeight: 'bold',
  },
});
