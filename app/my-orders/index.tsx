import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Función para asignar color según status
function getStatusColor(status: string) {
  switch (status) {
    case 'Pendiente':
      return '#E6D712';
    case 'Aprobado':
      return '#20E544';
    case 'Rechazado':
      return '#E86E16';
    case 'Terminado':
      return '#3321D2';
    case 'Vencido':
      return '#FF0404';
    default:
      return '#555';
  }
}

export default function MyOrdersScreen() {
  const router = useRouter();

  // Ejemplo de órdenes
  const orders = [
    { id: 1, title: 'Orden 1', status: 'Pendiente', date: '14 Mar 2025, 08:45 AM' },
    { id: 2, title: 'Orden 2', status: 'Aprobado', date: '14 Mar 2025, 08:45 AM' },
    { id: 3, title: 'Orden 3', status: 'Rechazado', date: '14 Mar 2025, 08:45 AM' },
    { id: 4, title: 'Orden 4', status: 'Terminado', date: '14 Mar 2025, 08:45 AM' },
    { id: 5, title: 'Orden 5', status: 'Vencido', date: '14 Mar 2025, 08:45 AM' },
  ];

  return (
    <View style={styles.container}>
      <TopBar />

      <View style={styles.header}>
        <Text style={styles.title}>Mis ordenes</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {orders.map(order => (
          <TouchableOpacity
            key={order.id}
            style={styles.orderItem}
            onPress={() => router.push('/order-details')}
            activeOpacity={0.7}
          >
            <Text style={styles.orderTitle}>{order.title}</Text>
            <Text style={[styles.orderDescription, { color: getStatusColor(order.status) }]}>
              {order.status}
            </Text>
            <Text style={styles.orderDate}>{order.date}</Text>
          </TouchableOpacity>
        ))}
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
    paddingBottom: height * 0.1,
  },
  orderItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: width * 0.05,
    marginBottom: height * 0.025,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderTitle: {
    fontSize: height * 0.022,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 4,
    fontFamily: 'Georgia',
  },
  orderDescription: {
    fontSize: height * 0.018,
    color: '#555',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: height * 0.016,
    color: '#888',
    textAlign: 'right',
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