import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import WarningModal from '@/components/WarningModal';

const { width, height } = Dimensions.get('window');

export default function CurrentOrderScreen() {
  const [justification, setJustification] = useState('');
  const [timeRequested, setTimeRequested] = useState('');

  const [count1, setCount1] = useState(1);
  const [count2, setCount2] = useState(1);

  const [warningVisible, setWarningVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TopBar />

      <View style={styles.header}>
      <Text style={styles.title}>Orden de préstamo</Text>
    </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Item 1 */}
        <View style={styles.item}>
          <Image
            source={require('@/assets/images/tool1.png')}
            style={styles.toolImage}
          />
          <View style={styles.toolInfo}>
            <Text style={styles.toolName}>Taladro</Text>
            <Text style={styles.toolDescription}>Descripción</Text>
          </View>
          <View style={styles.counter}>
            <TouchableOpacity onPress={() => setCount1(Math.max(0, count1 - 1))}>
              <Text style={styles.circle}>-</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{count1}</Text>
            <TouchableOpacity onPress={() => setCount1(count1 + 1)}>
              <Text style={styles.circle}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Item 2 */}
        <View style={styles.item}>
          <Image
            source={require('@/assets/images/tools/laminero.png')}
            style={styles.toolImage}
          />
          <View style={styles.toolInfo}>
            <Text style={styles.toolName}>Lijadora Orbital</Text>
            <Text style={styles.toolDescription}>Descripción</Text>
          </View>
          <View style={styles.counter}>
            <TouchableOpacity onPress={() => setCount2(Math.max(0, count2 - 1))}>
              <Text style={styles.circle}>-</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{count2}</Text>
            <TouchableOpacity onPress={() => setCount2(count2 + 1)}>
              <Text style={styles.circle}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Justificación */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: height * 0.03, marginBottom: height * 0.01 }}>
        <Image
            source={require('@/assets/icons/comment.png')}
            style={ styles.commentIcon}
            resizeMode="contain"
        />
        <Text style={styles.label}>Justificación</Text>
        
        </View>
        <TextInput
        style={styles.textArea}
        placeholder="Escribe aquí..."
        multiline
        numberOfLines={4}
        value={justification}
        onChangeText={setJustification}
        />

        {/* Tiempo solicitado */}
        <Text style={styles.label}>Tiempo solicitado:</Text>
        <View style={styles.timeRow}>
          <TextInput
            style={styles.timeInput}
            placeholder="0"
            keyboardType="numeric"
            value={timeRequested}
            onChangeText={setTimeRequested}
          />
          <Text style={styles.minutesLabel}>minutos</Text>
        </View>

        {/* Botón */}
        <TouchableOpacity
          style={styles.orderButton}
          onPress={() => setWarningVisible(true)} // 3. Mostrar modal al presionar
        >
          <Text style={styles.orderButtonText}>Ordenar</Text>
        </TouchableOpacity>
      </ScrollView>

      <WarningModal
        visible={warningVisible}
        onClose={() => setWarningVisible(false)}
        onConfirm={() => {
          setWarningVisible(false);
        }}
      />

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
    padding: width * 0.05,
    paddingBottom: height * 0.1,
  },
  title: {
    fontSize: height * 0.03,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    color: '#03346E',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  toolImage: {
    width: width * 0.2,
    height: width * 0.2,
    resizeMode: 'contain',
    marginRight: width * 0.04,
  },
  toolInfo: {
    flex: 1,
  },
  toolName: {
    fontSize: height * 0.02,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
  },
  toolDescription: {
    fontSize: height * 0.016,
    color: '#666',
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.02,
  },
  circle: {
    backgroundColor: '#eee',
    borderRadius: width * 0.05,
    width: width * 0.08,
    height: width * 0.08,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: 'bold',
    fontSize: height * 0.02,
    paddingTop: height * 0.005,
  },
  counterValue: {
    fontSize: height * 0.02,
  },
  label: {
    fontSize: height * 0.022,
    marginTop: height * 0.03,
    marginBottom: height * 0.01,
    fontFamily: 'Georgia',
    color: '#03346E',
  },
  textArea: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: width * 0.04,
    fontSize: height * 0.018,
    minHeight: height * 0.15,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  timeInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: width * 0.03,
    width: width * 0.2,
    fontSize: height * 0.018,
    marginRight: width * 0.02,
  },
  minutesLabel: {
    fontSize: height * 0.018,
  },
  orderButton: {
    backgroundColor: '#03346E',
    paddingVertical: height * 0.02,
    borderRadius: width * 0.02,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#fff',
    fontSize: height * 0.018,
    fontWeight: 'bold',
  },
  commentIcon: {
    width: width * 0.08,
    height: width * 0.08,
    marginRight: width * 0.02,
    marginTop: height * 0.015,
  },
});
