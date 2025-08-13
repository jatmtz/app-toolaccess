/**
 * HomeScreen.tsx
 * 
 * Pantalla principal de búsqueda de herramientas
 * Permite buscar herramientas por nombre o por subcategoría
 * 
 * Características:
 * - Búsqueda por nombre de herramienta
 * - Búsqueda por categoría/subcategoría
 * - Vista de resultados en grid
 * - Integración con API
 * 
 * Cumple con:
 * - ES6+ standards
 * - React Native best practices
 * - TypeScript typing
 * - Clean Code principles
 * - ISO/IEC 25010 (Maintainability, Reliability)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl
} from 'react-native';
import { checkAuth, refreshToken } from '../../auth-utils';

// Components
import BottomTabBar from '@/components/BottomTabBar';
import TopBar from '@/components/TopBar';

// Config
import { API_GENERAL_URL } from '../../env';

// Assets
const TOOL_PLACEHOLDER_IMAGE = require('@/assets/images/tool1.png');

// Constants
const { width, height } = Dimensions.get('window');
const SEARCH_DEBOUNCE_TIME = 300; // ms

/**
 * Tipos de búsqueda disponibles
 */
type SearchType = 'nombre' | 'subcategoria';

interface SearchTypeOption {
  key: SearchType;
  label: string;
}

interface Tool {
  id: number;
  nombre: string;
  descripcion: string;
  foto_url: string | null;
}

interface Category {
  id: number;
  nombre: string;
}

interface Subcategory {
  id: number;
  nombre: string;
}

const SEARCH_TYPES: SearchTypeOption[] = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'subcategoria', label: 'Subcategoría' },
];

/**
 * Construye la URL completa para una imagen
 * @param path - Ruta relativa de la imagen
 * @returns URL completa o null si no hay path
 */
const buildImageUrl = (path: string | null): string | null => {
  return path ? `${API_GENERAL_URL}uploads/${path}` : null;
};

/**
 * Componente principal de búsqueda de herramientas
 */
const HomeScreen: React.FC = () => {
  
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [searchType, setSearchType] = useState<SearchType>('nombre');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState<boolean>(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const router = useRouter();

useFocusEffect(
  React.useCallback(() => {
    let isActive = true;

    const verifyToken = async () => {
      const isValid = await checkAuth();
      if (!isActive) return;
      
      if (!isValid) {
        const refreshed = await refreshToken();
        if (!refreshed && isActive) {
          router.replace('/');
        }
      }
    };

    verifyToken();

    return () => {
      isActive = false;
    };
  }, [router])
);

  /**
   * Maneja la acción de pull-to-refresh
   */
  const handleRefresh = (): void => {
    setRefreshing(true);
    fetchTools();
  };


  /**
   * Obtiene las categorías disponibles
   */
  const fetchCategories = useCallback(async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return;

      const response = await axios.get(`${API_GENERAL_URL}api/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  /**
   * Obtiene las subcategorías según la categoría seleccionada
   */
  const fetchSubcategories = useCallback(async (categoryId: string): Promise<void> => {
    if (!categoryId) {
      setSubcategories([]);
      setSelectedSubcategory('');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return;

      const response = await axios.get(
        `${API_GENERAL_URL}api/categories/${categoryId}/subcategories`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSubcategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  }, []);

  /**
   * Obtiene las herramientas según los criterios de búsqueda
   */
  const fetchTools = useCallback(async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return;

      let fetchedTools: Tool[] = [];

      if (searchType === 'subcategoria' && selectedSubcategory) {
        const response = await axios.get(
          `${API_GENERAL_URL}api/subcategories/${selectedSubcategory}/tools`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchedTools = response.data.success ? response.data.data : [];
      } else {
        const response = await axios.get(`${API_GENERAL_URL}api/tools`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.data.success) {
          fetchedTools = response.data.data;
          
          if (searchType === 'nombre' && searchText) {
            fetchedTools = fetchedTools.filter(tool =>
              tool.nombre.toLowerCase().includes(searchText.toLowerCase())
            );
          }
        }
      }

      setTools(fetchedTools);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchText, selectedCategory, selectedSubcategory, searchType]);

  /**
   * Limpia los filtros al cambiar el tipo de búsqueda
   */
  const resetSearchFilters = useCallback((): void => {
    setSearchText('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setTools([]);
    setShowCategoryDropdown(false);
    setShowSubcategoryDropdown(false);
  }, []);

  // Efectos secundarios
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchSubcategories(selectedCategory);
  }, [selectedCategory, fetchSubcategories]);

  useEffect(() => {
    const timer = setTimeout(fetchTools, SEARCH_DEBOUNCE_TIME);
    return () => clearTimeout(timer);
  }, [fetchTools]);

  useEffect(() => {
    resetSearchFilters();
  }, [searchType, resetSearchFilters]);

  /**
   * Maneja la selección de categoría
   */
  const handleCategorySelect = (categoryId: string): void => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory('');
    setShowCategoryDropdown(false);
  };

  /**
   * Maneja la selección de subcategoría
   */
  const handleSubcategorySelect = (subcategoryId: string): void => {
    setSelectedSubcategory(subcategoryId);
    setShowSubcategoryDropdown(false);
  };

  /**
   * Navega a los detalles de la herramienta
   */
  const navigateToToolDetails = (toolId: number): void => {
    router.push({ pathname: '/tool-details', params: { id: toolId } });
  };

  return (
    <View style={styles.container}>
      <TopBar />

      {/* Sección de búsqueda */}
      <View style={styles.searchSection}>
        <Text style={styles.searchLabel}>Buscar por:</Text>
        
        {/* Selector de tipo de búsqueda */}
        <View style={styles.searchTypeRow}>
          {SEARCH_TYPES.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.searchTypeButton,
                searchType === type.key && styles.searchTypeButtonActive,
              ]}
              onPress={() => setSearchType(type.key)}
              accessibilityLabel={`Buscar por ${type.label}`}
              accessibilityRole="button"
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

        {/* Búsqueda por nombre */}
        {searchType === 'nombre' && (
          <>
            <Text style={styles.searchLabel}>Nombre de herramienta:</Text>
            <TextInput
              placeholder="Nombre de herramienta"
              placeholderTextColor="#999"
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              accessibilityLabel="Campo de búsqueda por nombre"
            />
          </>
        )}

        {/* Búsqueda por categoría/subcategoría */}
        {searchType === 'subcategoria' && (
          <>
            <Text style={styles.searchLabel}>Categoría:</Text>
            <View style={styles.select}>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => {
                  setShowCategoryDropdown(!showCategoryDropdown);
                  setSubcategories([]);
                  setSelectedSubcategory('');
                }}
                accessibilityLabel="Seleccionar categoría"
              >
                <Text style={styles.selectText}>
                  {selectedCategory
                    ? categories.find(c => c.id === Number(selectedCategory))?.nombre
                    : 'Selecciona una categoría'}
                </Text>
              </TouchableOpacity>
              
              {showCategoryDropdown && (
                <View style={styles.selectDropdown}>
                  <FlatList
                    data={categories}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.selectOption}
                        onPress={() => handleCategorySelect(item.id.toString())}
                        accessibilityLabel={`Categoría ${item.nombre}`}
                      >
                        <Text>{item.nombre}</Text>
                      </TouchableOpacity>
                    )}
                    nestedScrollEnabled
                  />
                </View>
              )}
            </View>

            {/* Selector de subcategoría */}
            {subcategories.length > 0 && (
              <>
                <Text style={styles.searchLabel}>Subcategoría:</Text>
                <View style={styles.select}>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => setShowSubcategoryDropdown(!showSubcategoryDropdown)}
                    accessibilityLabel="Seleccionar subcategoría"
                  >
                    <Text style={styles.selectText}>
                      {selectedSubcategory
                        ? subcategories.find(s => s.id === Number(selectedSubcategory))?.nombre
                        : 'Selecciona una subcategoría'}
                    </Text>
                  </TouchableOpacity>
                  
                  {showSubcategoryDropdown && (
                    <View style={styles.selectDropdown}>
                      <FlatList
                        data={subcategories}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.selectOption}
                            onPress={() => handleSubcategorySelect(item.id.toString())}
                            accessibilityLabel={`Subcategoría ${item.nombre}`}
                          >
                            <Text>{item.nombre}</Text>
                          </TouchableOpacity>
                        )}
                        nestedScrollEnabled
                      />
                    </View>
                  )}
                </View>
              </>
            )}
          </>
        )}
      </View>

      {/* Resultados de búsqueda */}
      {searchType === 'nombre' || (searchType === 'subcategoria' && selectedSubcategory) ? (
        <>
          <Text style={styles.results}>
            {tools.length} {tools.length === 1 ? 'resultado' : 'resultados'}
          </Text>
          
          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#1976D2" />
              <Text style={styles.loadingText}>Cargando herramientas...</Text>
            </View>
          ) : (
            <FlatList
              data={tools}
              keyExtractor={(item) => item.id.toString()}
              numColumns={3}
              contentContainerStyle={styles.resultsContainer}
              refreshControl={
                        <RefreshControl
                          refreshing={refreshing}
                          onRefresh={handleRefresh}
                          colors={['#03346E']}
                          tintColor="#03346E"
                          titleColor="#03346E"
                        />
                      }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => navigateToToolDetails(item.id)}
                  accessibilityLabel={`Herramienta ${item.nombre}`}
                >
                  <Image
                    source={
                      item.foto_url 
                        ? { uri: buildImageUrl(item.foto_url) } 
                        : TOOL_PLACEHOLDER_IMAGE
                    }
                    style={styles.toolImage}
                    resizeMode="cover"
                    onError={(e) => console.log('Error loading image:', e.nativeEvent.error)}
                    accessibilityLabel={`Imagen de ${item.nombre}`}
                  />
                  <Text 
                    style={styles.itemName} 
                    numberOfLines={2} 
                    ellipsizeMode="tail"
                  >
                    {item.nombre}
                  </Text>
                  <Text 
                    style={styles.itemDesc} 
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {item.descripcion}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.centered}>
                  <Text style={styles.noResultsText}>
                    No se encontraron herramientas
                  </Text>
                </View>
              }
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
};

// Estilos del componente
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  searchSection: { 
    padding: width * 0.04 
  },
  searchLabel: { 
    fontSize: height * 0.017, 
    marginBottom: height * 0.005,
    color: '#333',
    fontWeight: '500'
  },
  searchTypeRow: { 
    flexDirection: 'row', 
    marginBottom: height * 0.015, 
    gap: width * 0.02 
  },
  searchTypeButton: {
    backgroundColor: '#eee', 
    paddingVertical: height * 0.008,
    paddingHorizontal: width * 0.03, 
    borderRadius: width * 0.015,
    minWidth: width * 0.2,
    alignItems: 'center'
  },
  searchTypeButtonActive: {
    backgroundColor: '#E6F0FF', 
    borderColor: '#1976D2', 
    borderWidth: 1
  },
  searchTypeText: { 
    color: '#222', 
    fontWeight: 'normal' 
  },
  searchTypeTextActive: { 
    color: '#1976D2', 
    fontWeight: 'bold' 
  },
  searchInput: {
    borderWidth: 1, 
    borderColor: '#ccc',
    paddingVertical: height * 0.012, 
    paddingHorizontal: width * 0.03,
    borderRadius: width * 0.02, 
    marginBottom: height * 0.015,
    backgroundColor: '#fff',
    color: '#333'
  },
  select: { 
    marginBottom: height * 0.015, 
    position: 'relative',
    zIndex: 1
  },
  selectButton: {
    borderWidth: 1, 
    borderColor: '#ccc',
    paddingVertical: height * 0.012, 
    paddingHorizontal: width * 0.03,
    borderRadius: width * 0.02, 
    backgroundColor: '#fff'
  },
  selectText: { 
    color: '#222' 
  },
  selectDropdown: {
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#eee',
    borderRadius: width * 0.02, 
    marginTop: 2,
    position: 'absolute', 
    zIndex: 10, 
    width: '100%', 
    left: 0, 
    top: '100%',
    maxHeight: height * 0.3
  },
  selectOption: { 
    paddingVertical: height * 0.012, 
    paddingHorizontal: width * 0.03,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  results: {
    paddingHorizontal: width * 0.075,
    fontSize: height * 0.015,
    marginBottom: height * 0.01,
    color: '#666', 
    textAlign: 'right'
  },
  resultsContainer: {
    paddingBottom: height * 0.1,
    paddingHorizontal: width * 0.02
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: {
    marginTop: height * 0.02,
    color: '#666'
  },
  noResultsText: {
    color: '#888',
    fontSize: height * 0.018
  },
  noSelectMsg: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
    fontSize: height * 0.016
  },
  item: {
    width: width * 0.28,
    alignItems: 'center',
    marginBottom: height * 0.03,
    marginHorizontal: width * 0.025,
    backgroundColor: '#F4F4F4',
    padding: width * 0.02,
    borderRadius: width * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1
  },
  toolImage: {
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
    marginBottom: 4,
    fontSize: 12,
    color: '#222'
  },
  itemDesc: {
    fontSize: 10,
    textAlign: 'center',
    color: '#555'
  }
});

export default HomeScreen;