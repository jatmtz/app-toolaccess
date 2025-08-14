import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  Platform // 1. Importa Platform
} from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function TopBar() {
  const router = useRouter(); // 2. Mueve useRouter dentro del componente

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push('/home')}>
        <Image source={require('@/assets/images/256x256_blanco.png')} style={styles.icon} />
      </TouchableOpacity>
      <Text style={styles.title}>ToolAccess</Text>
      <TouchableOpacity onPress={() => router.push('/notifications')}>
        <Image source={require('@/assets/icons/notification.png')} style={styles.icon_not} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#03346E',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // 3. Aplica margen condicional
    marginTop: Platform.OS === 'ios' ? height * 0.05 : 0,
  },
  title: {
    color: '#fff',
    fontSize: height * 0.037,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
  },
  icon_not: {
    width: width * 0.08,
    height: width * 0.08,
  },
  icon: {
    width: width * 0.1,
    height: width * 0.1,
  },
});