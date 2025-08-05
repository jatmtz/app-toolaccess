/**
 * @file Pantalla principal de búsqueda de herramientas
 * @module HomeScreen
 * @description Pantalla que permite buscar herramientas por nombre o subcategoría
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, Dimensions, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_GENERAL_URL } from '../../env';

const { width, height } = Dimensions.get('window');

const searchTypes = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'subcategoria', label: 'Subcategoría' },
];

export default function HomeScreen() {
  const [tools, setTools] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [searchType, setSearchType] = useState('nombre');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const response = await axios.get(`${API_GENERAL_URL}api/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setSubcategories([]);
      setSelectedSubcategory('');
      return;
    }
    const fetchSubcategories = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const response = await axios.get(
          `${API_GENERAL_URL}api/categories/${selectedCategory}/subcategories`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          setSubcategories(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching subcategories:', err);
      }
    };
    fetchSubcategories();
  }, [selectedCategory]);

  useEffect(() => {
    const fetchTools = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('access_token');
        let fetchedTools = [];

        if (searchType === 'subcategoria' && selectedSubcategory) {
          const response = await axios.get(
            `${API_GENERAL_URL}api/subcategories/${selectedSubcategory}/tools`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (response.data.success) {
            fetchedTools = response.data.data;
          }
        } else {
          const response = await axios.get(`${API_GENERAL_URL}api/tools`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data.success) {
            fetchedTools = response.data.data;
            if (searchType === 'nombre' && searchText) {
              fetchedTools = fetchedTools.filter(t =>
                t.nombre.toLowerCase().includes(searchText.toLowerCase())
              );
            }
          }
        }
        setTools(fetchedTools);
      } catch (err) {
        console.error('Error fetching tools:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchTools, 300);
    return () => clearTimeout(timer);
  }, [searchText, selectedCategory, selectedSubcategory, searchType]);

  useEffect(() => {
    setSearchText('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setTools([]);
    setShowCategoryDropdown(false);
    setShowSubcategoryDropdown(false);
  }, [searchType]);

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.searchSection}>
        <Text style={styles.searchLabel}>Buscar por:</Text>
        <View style={styles.searchTypeRow}>
          {searchTypes.map(type => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.searchTypeButton,
                searchType === type.key && styles.searchTypeButtonActive,
              ]}
              onPress={() => setSearchType(type.key)}
            >
              <Text
                style={[
                  styles.searchTypeText,
                  searchType === type.key && styles.searchTypeTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {searchType === 'nombre' && (
          <>
            <Text style={styles.searchLabel}>Nombre de herramienta:</Text>
            <TextInput
              placeholder="Nombre de herramienta"
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
            />
          </>
        )}

        {searchType === 'subcategoria' && (
          <>
            <Text style={styles.searchLabel}>Categoría:</Text>
            <View style={styles.select}>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <Text style={styles.selectText}>
                  {selectedCategory
                    ? categories.find(c => c.id === Number(selectedCategory))?.nombre
                    : 'Selecciona una categoría'}
                </Text>
              </TouchableOpacity>
              {showCategoryDropdown && (
                <View style={styles.selectDropdown}>
                  {categories.map(cat => (
                    <TouchableOpacity
                      key={cat.id}
                      style={styles.selectOption}
                      onPress={() => {
                        setSelectedCategory(cat.id.toString());
                        setSelectedSubcategory('');
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <Text>{cat.nombre}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {subcategories.length > 0 && (
              <>
                <Text style={styles.searchLabel}>Subcategoría:</Text>
                <View style={styles.select}>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => setShowSubcategoryDropdown(!showSubcategoryDropdown)}
                  >
                    <Text style={styles.selectText}>
                      {selectedSubcategory
                        ? subcategories.find(s => s.id === Number(selectedSubcategory))?.nombre
                        : 'Selecciona una subcategoría'}
                    </Text>
                  </TouchableOpacity>
                  {showSubcategoryDropdown && (
                    <View style={styles.selectDropdown}>
                      {subcategories.map(sub => (
                        <TouchableOpacity
                          key={sub.id}
                          style={styles.selectOption}
                          onPress={() => {
                            setSelectedSubcategory(sub.id.toString());
                            setShowSubcategoryDropdown(false);
                          }}
                        >
                          <Text>{sub.nombre}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </>
            )}
          </>
        )}
      </View>

      {/* Mostrar resultados solo si aplica */}
      {searchType === 'nombre' || (searchType === 'subcategoria' && selectedSubcategory) ? (
        <>
          <Text style={styles.results}>{tools.length} resultados</Text>
          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#1976D2" />
              <Text>Cargando herramientas...</Text>
            </View>
          ) : (
            <FlatList
              data={tools}
              keyExtractor={item => item.id.toString()}
              numColumns={3}
              contentContainerStyle={{ paddingBottom: height * 0.1 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() =>
                    router.push({ pathname: '/tool-details', params: { id: item.id } })
                  }
                >
                  <Image
                    source={item.foto_url ? { uri: item.foto_url } : require('@/assets/images/tool1.png')}
                    style={styles.placeholderImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.itemName} numberOfLines={2} ellipsizeMode="tail">
                    {item.nombre}
                  </Text>
                  <Text style={styles.itemDesc} numberOfLines={2}>
                    {item.descripcion}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </>
      ) : searchType === 'subcategoria' && !selectedSubcategory ? (
        <View style={styles.centered}>
        <Text style={styles.noSelectMsg}>
          Selecciona una subcategoría para ver herramientas
        </Text>
        </View>
      ) : null}

      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchSection: { padding: width * 0.04 },
  searchLabel: { fontSize: height * 0.017, marginBottom: height * 0.005 },
  searchTypeRow: { flexDirection: 'row', marginBottom: height * 0.015, gap: width * 0.02 },
  searchTypeButton: {
    backgroundColor: '#eee', paddingVertical: height * 0.008,
    paddingHorizontal: width * 0.03, borderRadius: width * 0.015
  },
  searchTypeButtonActive: {
    backgroundColor: '#E6F0FF', borderColor: '#1976D2', borderWidth: 1
  },
  searchTypeText: { color: '#222', fontWeight: 'normal' },
  searchTypeTextActive: { color: '#1976D2', fontWeight: 'bold' },
  searchInput: {
    borderWidth: 1, borderColor: '#ccc',
    paddingVertical: height * 0.012, paddingHorizontal: width * 0.03,
    borderRadius: width * 0.02, marginBottom: height * 0.015
  },
  select: { marginBottom: height * 0.015 },
  selectButton: {
    borderWidth: 1, borderColor: '#ccc',
    paddingVertical: height * 0.012, paddingHorizontal: width * 0.03,
    borderRadius: width * 0.02, backgroundColor: '#fff'
  },
  selectText: { color: '#222' },
  selectDropdown: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee',
    borderRadius: width * 0.02, marginTop: 2,
    position: 'absolute', zIndex: 10, width: '100%', left: 0, top: '100%'
  },
  selectOption: { paddingVertical: height * 0.012, paddingHorizontal: width * 0.03 },
  results: {
    paddingHorizontal: width * 0.075,
    fontSize: height * 0.015,
    marginBottom: height * 0.01,
    color: '#666', textAlign: 'right'
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noSelectMsg: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
    fontSize: height * 0.016
  },
  item: {
    width: width * 0.28,
    alignItems: 'center',
    marginBottom: height * 0.05,
    marginHorizontal: width * 0.025,
    backgroundColor: '#F4F4F4',
    padding: width * 0.02,
    borderRadius: width * 0.02
  },
  placeholderImage: {
    width: width * 0.20,
    height: width * 0.20,
    backgroundColor: '#ddd',
    marginBottom: height * 0.01,
    borderRadius: width * 0.015,
    alignSelf: 'center'
  },
  itemName: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4
  },
  itemDesc: {
    fontSize: 12,
    textAlign: 'center',
    color: '#555'
  }
});
