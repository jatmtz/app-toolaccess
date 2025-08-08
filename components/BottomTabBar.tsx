import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';

const { height, width } = Dimensions.get('window');

export default function BottomTabBar() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.tab} onPress={() => router.push('/home')}>
        <Image source={require('@/assets/icons/hammer-wrench.png')} style={styles.icon} />
        <Text style={styles.label}>Herramientas</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={() => router.push('/current-order')}>
        <Image source={require('@/assets/icons/receipt-text-plus.png')} style={styles.icon} />
        <Text style={styles.label}>Orden actual</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={() => router.push('/my-orders')}>
        <Image source={require('@/assets/icons/list.png')} style={styles.icon} />
        <Text style={styles.label}>Mis órdenes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={() => router.push('/profile')}>
        <Image source={require('@/assets/icons/person.png')} style={styles.icon} />
        <Text style={styles.label}>Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#03346E',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: height * 0.02,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingBottom: height * 0.04,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: width * 0.02, 
    height: height * 0.05, 
  },
  icon: {
    width: width * 0.06,
    height: width * 0.06,
    resizeMode: 'contain',
  },
  label: {
    fontSize: height * 0.012,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: height * 0.005,
    textAlign: 'center', // Asegura que el texto esté centrado
  },
});