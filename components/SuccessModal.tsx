import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  message?: string;
}

export default function SuccessModal({ visible, onClose, message }: SuccessModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Buenas noticias!</Text>

          <Image
            source={require('@/assets/icons/check-circle.png')}
            style={styles.errorIcon}
          />

          <Text style={styles.message}>
            {message || 'Tu solicitud fue realizada con éxito'}
          </Text>
          
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: width * 0.8,
    borderRadius: 20,
    padding: width * 0.06,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },
  closeText: {
    fontSize: height * 0.025,
    fontWeight: 'bold',
    color: '#03346E',
  },
  title: {
    fontSize: height * 0.025,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    color: '#03346E',
    marginTop: height * 0.05,
    textAlign: 'center',
  },
 errorIcon: {
    width: width * 0.4,
    height: width * 0.4,
    resizeMode: 'contain',
    marginVertical: height * 0.04,
  },
  message: {
    textAlign: 'center',
    fontSize: height * 0.018,
    color: '#333',
    marginBottom: height * 0.03,
  },
});
