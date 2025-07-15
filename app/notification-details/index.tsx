import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';

const { width, height } = Dimensions.get('window');

export default function NotificationDetailsScreen() {

  return (
    <View style={styles.container}>
      <TopBar />

      <View style={styles.header}>
      <Text style={styles.title}>Notificación 1</Text>
    </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View>
            <Text style={styles.label}>
                      {`¡Buen día, [Nombre del Operador]!
Recuerda que la herramienta de a la orden de préstamo #1334 debe ser devuelta antes de:

📅 14 Mar 2025, 08:45 AM (faltan 20 minutos).

⚠️ Si no se realiza la devolución a tiempo, se aplicará una multa por retraso según el reglamento.

¡Gracias por tu atención y cumplimiento!`}
                </Text>
        </View>
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
    padding: width * 0.07,
    paddingBottom: height * 0.08,
    backgroundColor: '#F0F0F0',
    marginStart: width * 0.05,
    marginEnd: width * 0.05,
    marginTop: height * 0.02,
    borderRadius: 5,
  },
  title: {
    fontSize: height * 0.03,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    color: '#03346E',
  },
  label: {
    fontSize: height * 0.021,
    marginTop: height * 0.015,
    fontFamily: 'Arial',
  },
});
