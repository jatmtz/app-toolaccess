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

interface WarningModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function WarningModal({ visible, onClose, onConfirm }: WarningModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Confirmar orden de préstamo</Text>

          <Image
            source={require('@/assets/icons/alert-triangle.png')}
            style={styles.warningIcon}
          />

          <Text style={styles.message}>
            ¿Estás seguro de guardar y enviar esta orden al almacén?{"\n"}
            Una vez aprobada, no podrás modificarla.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
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
  warningIcon: {
    width: width * 0.4,
    height: width * 0.4,
    resizeMode: 'contain',
    marginVertical: height * 0.02,
  },
  message: {
    textAlign: 'center',
    fontSize: height * 0.018,
    color: '#333',
    marginBottom: height * 0.03,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: width * 0.05,
    marginTop: height * 0.04,
  },
  cancelButton: {
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.06,
    backgroundColor: '#F4F4F4',
    borderRadius: 8,
    borderColor: '#03346E',
    borderWidth: 1,
  },
  cancelText: {
    color: '#03346E',
    fontWeight: 'bold',
  },
  confirmButton: {
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.06,
    backgroundColor: '#03346E',
    borderRadius: 8,
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
