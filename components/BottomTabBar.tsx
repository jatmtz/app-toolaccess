import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function BottomTabBar() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push('/tools')}>
        <Text style={styles.label}>🛠️ Herramienta</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/current-order')}>
        <Text style={styles.label}>📋 Orden actual</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/my-orders')}>
        <Text style={styles.label}>📄 Mis órdenes</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/profile')}>
        <Text style={styles.label}>👤 Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
  },
});
