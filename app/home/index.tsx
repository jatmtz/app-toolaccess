import React from 'react';
import { View, StyleSheet, Text, TextInput, ScrollView } from 'react-native';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <TopBar />

      <View style={styles.searchSection}>
        <Text style={styles.searchLabel}>Buscar por:</Text>
        <View style={styles.filters}>
          <Text style={styles.activeFilter}>✓ Nombre</Text>
          <Text style={styles.filter}>Categoría</Text>
          <Text style={styles.filter}>Subcategoría</Text>
        </View>
        <TextInput placeholder="🔍 Nombre" style={styles.searchInput} />
      </View>

      <Text style={styles.results}>100 resultados</Text>

      <ScrollView contentContainerStyle={styles.grid}>
        {[...Array(9)].map((_, i) => (
          <View key={i} style={styles.item}>
            <View style={styles.placeholderImage} />
            <Text>Herramienta {i + 1}</Text>
          </View>
        ))}
      </ScrollView>

      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchSection: { padding: 16 },
  searchLabel: { fontSize: 14, marginBottom: 4 },
  filters: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  activeFilter: {
    backgroundColor: '#E6F0FF',
    color: '#002B5B',
    padding: 6,
    borderRadius: 6,
    fontWeight: 'bold',
  },
  filter: {
    backgroundColor: '#eee',
    padding: 6,
    borderRadius: 6,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
  },
  results: {
    paddingHorizontal: 16,
    fontSize: 12,
    marginBottom: 8,
    color: '#666',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingBottom: 80,
  },
  item: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    backgroundColor: '#ddd',
    marginBottom: 8,
    borderRadius: 6,
  },
});
