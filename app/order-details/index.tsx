import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';

const { width, height } = Dimensions.get('window');

export default function OrderDetailsScreen() {
  return (
    <View style={styles.container}>
      <TopBar />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Orden 1</Text>

        {/* Lista de herramientas */}
        <View style={styles.toolList}>
          <View style={styles.toolItem}>
            <Image
              source={require('@/assets/images/tool1.png')}
              style={styles.toolImage}
            />
            <Text style={styles.toolText}>Taladro</Text>
          </View>
          <View style={styles.toolItem}>
            <Image
              source={require('@/assets/images/tool1.png')}
              style={styles.toolImage}
            />
            <Text style={styles.toolText}>Lijadora Orbital</Text>
          </View>
          <View style={styles.toolItem}>
            <Image
              source={require('@/assets/images/tool1.png')}
              style={styles.toolImage}
            />
            <Text style={styles.toolText}>Martillo</Text>
          </View>
        </View>

        {/* Estado */}
        <Text style={styles.label}>Estado:</Text>
        <Text style={styles.status}>Aprobado</Text>

        {/* Información de tiempo y fechas */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Tiempo solicitado:</Text>
            <Text style={styles.value}>40 minutos</Text>

            <Text style={styles.label}>Fecha solicitud:</Text>
            <Text style={styles.value}>14 Mar 2025, 08:45 AM</Text>

            <Text style={styles.label}>Fecha devolución:</Text>
            <Text style={styles.value}>14 Mar 2025, 08:45 AM</Text>
          </View>

          <View style={styles.column}>
            <Text style={styles.label}>Tiempo aprobado:</Text>
            <Text style={styles.value}>30 minutos</Text>

            <Text style={styles.label}>Fecha aprobación:</Text>
            <Text style={styles.value}>14 Mar 2025, 08:45 AM</Text>

            <Text style={styles.label}>Fecha devolución real:</Text>
            <Text style={styles.value}>14 Mar 2025, 08:45 AM</Text>
          </View>
        </View>

        {/* Justificación y comentarios */}
        <Text style={styles.label}>Justificación:</Text>
        <Text style={styles.value}>Blablablabla</Text>

        <Text style={styles.label}>Comentarios:</Text>
        <Text style={styles.value}>Blablablabla</Text>
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
  content: {
    padding: width * 0.05,
    paddingBottom: height * 0.1,
  },
  title: {
    fontSize: height * 0.028,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    color: '#002B5B',
    marginBottom: height * 0.02,
    textAlign: 'center',
  },
  toolList: {
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    padding: width * 0.04,
    marginBottom: height * 0.03,
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.015,
  },
  toolImage: {
    width: width * 0.15,
    height: width * 0.15,
    resizeMode: 'contain',
    marginRight: width * 0.04,
  },
  toolText: {
    fontSize: height * 0.02,
    fontFamily: 'Georgia',
  },
  label: {
    fontSize: height * 0.02,
    marginTop: height * 0.015,
    fontFamily: 'Georgia',
    color: '#03346E',
  },
  status: {
    color: '#20E544',
    fontSize: height * 0.018,
    fontWeight: 'bold',
    marginBottom: height * 0.015,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: width * 0.05,
    marginBottom: height * 0.02,
  },
  column: {
    flex: 1,
  },
  value: {
    fontSize: height * 0.018,
    color: '#333',
    marginBottom: height * 0.01,
  },
});
