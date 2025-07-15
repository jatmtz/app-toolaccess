import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, ScrollView, Dimensions, TouchableOpacity, Image } from 'react-native';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import { useRouter } from 'expo-router'; // <-- Agrega esta línea

const { width, height } = Dimensions.get('window');

const filterOptions = ['Nombre', 'Categoría', 'Subcategoría'];

export default function HomeScreen() {
  const [activeFilter, setActiveFilter] = useState('Nombre');
  const router = useRouter(); // <-- Inicializa el router

  const images = [
    require('@/assets/images/tool1.png'),
    require('@/assets/images/tool2.png'),
    require('@/assets/images/tool3.png'),
  ];

  return (
    <View style={styles.container}>
      <TopBar />

      <View style={styles.searchSection}>
        <Text style={styles.searchLabel}>Buscar por:</Text>
        <View style={styles.filters}>
          {filterOptions.map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.filterButton,
                activeFilter === option && styles.activeFilterButton,
              ]}
              onPress={() => setActiveFilter(option)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  activeFilter === option && styles.activeFilterButtonText,
                ]}
              >
                {activeFilter === option ? '✓ ' : ''}
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput placeholder={activeFilter} style={styles.searchInput} />
      </View>

      <Text style={styles.results}>100 resultados</Text>

      <ScrollView contentContainerStyle={styles.grid}>
        {[...Array(9)].map((_, i) => (
          <TouchableOpacity
            key={i}
            style={styles.item}
            onPress={() => router.push('/tool-details')}
          >
            <Image
              source={images[i % images.length]}
              style={styles.placeholderImage}
              resizeMode="cover"
            />
            <Text>Herramienta {i + 1}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchSection: {
    padding: width * 0.04,
  },
  searchLabel: {
    fontSize: height * 0.017,
    marginBottom: height * 0.005,
  },
  filters: {
    flexDirection: 'row',
    gap: width * 0.025,
    marginBottom: height * 0.015,
  },
  filterButton: {
    backgroundColor: '#eee',
    paddingVertical: height * 0.008,
    paddingHorizontal: width * 0.03,
    borderRadius: width * 0.015,
  },
  activeFilterButton: {
    backgroundColor: '#E6F0FF',
    borderColor: '#1976D2',
    borderWidth: 1,
  },
  filterButtonText: {
    color: '#222',
    fontWeight: 'normal',
  },
  activeFilterButtonText: {
    color: '#1976D2',
    fontWeight: 'bold',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: height * 0.012,
    paddingHorizontal: width * 0.03,
    borderRadius: width * 0.02,
  },
  results: {
    paddingHorizontal: width * 0.075,
    fontSize: height * 0.015,
    marginBottom: height * 0.01,
    color: '#666',
    textAlign: 'right',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingBottom: height * 0.1,
  },
  item: {
    width: '30%',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  placeholderImage: {
    width: width * 0.15,
    height: width * 0.15,
    backgroundColor: '#ddd',
    marginBottom: height * 0.01,
    borderRadius: width * 0.015,
  },
});