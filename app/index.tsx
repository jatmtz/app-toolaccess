import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';import { Dimensions } from 'react-native';


const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/256x256.png')} style={styles.logo} />
      <Text style={styles.title}>Bienvenido a</Text>
      <Text style={styles.subtitle}>ToolAccess</Text>

      <TouchableOpacity style={styles.loginButton} onPress={() => router.replace('/home')}>
        <Text style={styles.loginButtonText}>Iniciar sesión con ToolAccess</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: width * 0.45,
    height: width * 0.45,
    marginBottom: height * 0.08,
  },
  title: {
    fontSize: height * 0.050,
    color: '#000',
    fontFamily: 'Georgia',
  },
  subtitle: {
    fontSize: height * 0.050,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: height * 0.1,
    fontFamily: 'Georgia',
  },
  loginButton: {
    backgroundColor: '#03346E',
    paddingVertical: height * 0.018,
    paddingHorizontal: width * 0.08,
    borderRadius: width * 0.02,
    marginBottom: height * 0.02,
    width: '80%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: height * 0.020,
    fontWeight: 'bold',
  },
});
