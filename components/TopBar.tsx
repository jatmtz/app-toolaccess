import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');
const router = useRouter();

export default function TopBar() {
  return (
    <View style={styles.container}>
        <Image source={require('@/assets/images/256x256_blanco.png')} style={styles.icon} />
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
    paddingHorizontal: width * 0.04,  // ≈ 16
    paddingVertical: height * 0.015,  // ≈ 12
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: height * 0.05,         // ≈ 40
  },
  title: {
    color: '#fff',
    fontSize: height * 0.037,         // ≈ 30
    fontWeight: 'bold',
    fontFamily: 'Georgia',
  },
  icon_not: {
    width: width * 0.08,               // ≈ 40
    height: width * 0.08,
  },
    icon: {
    width: width * 0.1,               // ≈ 40
    height: width * 0.1,
  },
});
