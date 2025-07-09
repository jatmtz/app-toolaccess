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
        Registrate para poder usar <Text style={styles.brand}>ToolAccess.</Text>
      </Text>

      {/* Nombres */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#000" style={styles.icon} />
        <TextInput
          placeholder="Nombres"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Ap Paterno */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#000" style={styles.icon} />
        <TextInput
          placeholder="Apellido Paterno"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Ap Materno */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#000" style={styles.icon} />
        <TextInput
          placeholder="Apellido Materno"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

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

      {/* Conf Contraseña */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#000" style={styles.icon} />
        <TextInput
          placeholder="Confirmar Contraseña"
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
      <TouchableOpacity style={styles.registerButton}>
        <Text style={styles.registerButtonText}>Registrarse</Text>
      </TouchableOpacity>

      {/* Texto inferior */}
      <Text style={styles.footerText}>
        ¿Ya tienes una cuenta?{' '}
        <Text
          style={styles.registerText}
          onPress={() => router.push('/login')} // Asegúrate de tener esta pantalla
        >
          Inicia sesión.
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: width * 0.06, // 24 aprox en pantallas estándar
  },
  backButton: {
    marginTop: height * 0.05,     // ≈ 40
    marginBottom: height * 0.04, // ≈ 20
  },
  title: {
    fontSize: height * 0.035,     // ≈ 22
    fontWeight: '600',
    color: '#000',
    marginBottom: height * 0.04, // ≈ 20
    fontFamily: 'Georgia',
    textAlign: 'center', 
  },
  brand: {
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  inputContainer: {
    alignSelf: 'center',
    width: width * 0.8,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: width * 0.02,       // ≈ 8
    paddingHorizontal: width * 0.025, // ≈ 10
    marginBottom: height * 0.02,      // ≈ 16
  },
  icon: {
    marginRight: width * 0.02, // ≈ 8
  },
  eyeIcon: {
    marginLeft: 'auto',
  },
  input: {
    flex: 1,
    height: height * 0.06,     // ≈ 48
    fontSize: height * 0.02,   // ≈ 16
  },
  registerButton: {
    alignSelf: 'center',
    width: width * 0.8,
    backgroundColor: '#03346E',
    paddingVertical: height * 0.018, // ≈ 14
    borderRadius: width * 0.02,      // ≈ 8
    alignItems: 'center',
    marginTop: height * 0.03,       // ≈ 10
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: height * 0.022, // ≈ 16
    fontFamily: 'Arial',
  },
  footerText: {
    textAlign: 'center',
    marginTop: height * 0.05, // ≈ 20
    fontSize: height * 0.018,  // ≈ 14
  },
  registerText: {
    color: '#4A90E2',
    fontWeight: '500',
  },
});
