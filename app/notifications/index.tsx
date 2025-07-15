import BottomTabBar from '@/components/BottomTabBar';
import TopBar from '@/components/TopBar';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function NotificationsScreen() {
  const router = useRouter();

  // Ejemplo de órdenes
  const notificacions = [
    { id: 1, title: 'Notificacion 1', description: 'Descripción', date: '14 Mar 2025, 08:45 AM' },
    { id: 2, title: 'Notificacion 2', description: 'Descripción', date: '14 Mar 2025, 08:45 AM' },
    { id: 3, title: 'Notificacion 3', description: 'Descripción', date: '14 Mar 2025, 08:45 AM' },
    { id: 4, title: 'Notificacion 4', description: 'Descripción', date: '14 Mar 2025, 08:45 AM' },
    { id: 5, title: 'Notificacion 5', description: 'Descripción', date: '14 Mar 2025, 08:45 AM' },
  ];

  return (
    <View style={styles.container}>
      <TopBar />

      <View style={styles.header}>
        <Text style={styles.title}>Mis notificaciones</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {notificacions.map(notificacion => (
          <TouchableOpacity key={notificacion.id} style={styles.notificacionItem}>
            {/* Tacha arriba a la derecha */}
            <TouchableOpacity style={styles.closeIconContainer}>
              <Image
                source={require('@/assets/icons/close.png')}
                style={styles.closeIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.notificacionRow}
              onPress={() => router.push('/notification-details')}
              activeOpacity={0.7}
            >
              {/* Icono de notificación a la izquierda */}
              <Image
                source={require('@/assets/icons/notification_azul.png')}
                style={styles.notificacionIcon}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.notificacionTitle}>{notificacion.title}</Text>
                <Text style={styles.notificacionDescription}>
                  {notificacion.description}
                </Text>
                <Text style={styles.notificacionDate}>{notificacion.date}</Text>
              </View>
            </TouchableOpacity>
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
  notificacionItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: width * 0.04,
    marginBottom: height * 0.025,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
    height: height * 0.10,
  },
    notificacionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificacionIcon: {
    width: width * 0.05,
    height: width * 0.06,
    marginRight: width * 0.03,
    marginTop: height * -0.04,
  },
  closeIconContainer: {
    position: 'absolute',
    top: width * 0.025,
    right: width * 0.025,
    zIndex: 1,
    padding: 4,
  },
  closeIcon: {
    width: width * 0.1,
    height: width * 0.1,
    tintColor: '#888',
    marginTop: height * -0.01,
  },
    notificacionTitle: {
    fontSize: height * 0.021,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Georgia',
  },
  notificacionDescription: {
    fontSize: height * 0.018,
    color: '#555',
    marginBottom: 4,
  },
  notificacionDate: {
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
  notificacionButton: {
    backgroundColor: '#03346E',
    paddingVertical: height * 0.02,
    borderRadius: width * 0.02,
    alignItems: 'center',
  },
  notificacionButtonText: {
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