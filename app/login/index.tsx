import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Pressable,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Flecha de regreso */}
      <TouchableOpacity onPress={() => router.push('./')} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      {/* Título */}
      <Text style={styles.title}>
        Inicia sesión para poder usar <Text style={styles.brand}>ToolAccess.</Text>
      </Text>

      {/* Logo */}
      <Image source={require('@/assets/images/256x256.png')} style={styles.logo} />

      {/* Correo */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#000" style={styles.icon} />
        <TextInput
          placeholder="Correo Electrónico"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Contraseña */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#000" style={styles.icon} />
        <TextInput
          placeholder="Contraseña"
          style={styles.input}
          secureTextEntry={!passwordVisible}
        />
        <TouchableOpacity
          onPress={() => setPasswordVisible(!passwordVisible)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#555"
          />
        </TouchableOpacity>
      </View>

      {/* Botón */}
      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      {/* Texto inferior */}
      <Text style={styles.footerText}>
        ¿Aún no tienes cuenta?{' '}
        <Text
          style={styles.registerText}
          onPress={() => router.push('/register')}
        >
          Regístrate.
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: width * 0.06,
  },
  backButton: {
    marginTop: height * 0.05,  // ≈ 40px
    marginBottom: height * 0.025, // ≈ 20px
  },
  title: {
    textAlign: 'center',
    fontSize: height * 0.035,  // ≈ 22px
    fontWeight: '600',
    color: '#000',
    marginBottom: height * 0.025,
    fontFamily: 'Georgia',
  },
  brand: {
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  logo: {
    width: width * 0.4,       // ≈ 100px
    height: width * 0.4,      // cuadrado proporcional
    alignSelf: 'center',
    marginBottom: height * 0.08,
  },
  inputContainer: {
    alignSelf: 'center',
    width: width * 0.8,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: width * 0.02, // ≈ 8px
    paddingHorizontal: width * 0.025, // ≈ 10px
    marginBottom: height * 0.02, // ≈ 16px
  },
  icon: {
    marginRight: width * 0.02, // ≈ 8px
  },
  eyeIcon: {
    marginLeft: 'auto',
  },
  input: {
    flex: 1,
    height: height * 0.06,  // ≈ 48px
    fontSize: height * 0.02, // ≈ 16px
  },
  loginButton: {
    alignSelf: 'center',
    width: width * 0.8,
    backgroundColor: '#03346E',
    paddingVertical: height * 0.018,  // ≈ 14px
    borderRadius: width * 0.02,       // ≈ 8px
    alignItems: 'center',
    marginTop: height * 0.08,        // ≈ 10px
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: height * 0.022, // ≈ 16px
  },
  footerText: {
    textAlign: 'center',
    marginTop: height * 0.05, // ≈ 20px
    fontSize: height * 0.018,  // ≈ 14px
  },
  registerText: {
    color: '#4A90E2',
    fontWeight: '500',
  },
});