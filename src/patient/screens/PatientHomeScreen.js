import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
// 💡 1. Importamos 'onSnapshot' en lugar de 'getDocs'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

const PRIMARY_COLOR = "#3A86FF"; 

const PatientHomeScreen = ({ navigation }) => {
  // Estados (sin cambios)
  const [loadingProfessionals, setLoadingProfessionals] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [professionals, setProfessionals] = useState([]); 
  const [categories, setCategories] = useState([]); 
  const [selectedCategory, setSelectedCategory] = useState('all'); 
  const [searchQuery, setSearchQuery] = useState('');

  // useEffect para Cargar las Categorías (sin cambios)
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const categoriesRef = collection(db, "Especialidades");
        const q = query(categoriesRef, orderBy("orden", "asc"));
        
        // Usamos onSnapshot aquí también para que las categorías sean en tiempo real
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const categoriesList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCategories([{ id: 'all', nombre: 'Todos' }, ...categoriesList]);
          setLoadingCategories(false);
        });
        return unsubscribe; // Retornamos para limpiar el oyente

      } catch (error) {
        console.error("Error al cargar categorías: ", error);
        Alert.alert("Error", "No se pudo cargar la lista de especialidades.");
        setLoadingCategories(false);
      }
    };
    
    // (FIX: La función debe ser llamada)
    const unsubscribeCategories = fetchCategories();
    
    // Limpiamos el 'oyente' de categorías
    return () => {
        unsubscribeCategories.then(unsub => unsub && unsub());
    };
  }, []); 

  // 💡 2. useEffect para Cargar los Profesionales (ACTUALIZADO A TIEMPO REAL)
  useEffect(() => {
    setLoadingProfessionals(true);
    
    try {
      const professionalsRef = collection(db, "profesionales");
      
      let qBase = query(
        professionalsRef, 
        where("estadoVerificacion", "==", "verificado"),
        where("disponibilidad", "==", true) // <-- El filtro clave
      );

      if (selectedCategory && selectedCategory !== 'all') {
        qBase = query(qBase, where("especialidad", "==", selectedCategory));
      }

      const qFinal = query(qBase, orderBy("calificacion", "desc"));

      // 💡 3. Usamos 'onSnapshot' (oyente) en lugar de 'getDocs' (una sola vez)
      // Esto "escuchará" los cambios de disponibilidad en tiempo real
      const unsubscribe = onSnapshot(qFinal, (querySnapshot) => {
        const professionalsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProfessionals(professionalsList);
        setLoadingProfessionals(false);
      }, (error) => {
        console.error("Error al cargar profesionales (revisar índice): ", error);
        // Ya no mostramos alerta, solo log
        setLoadingProfessionals(false);
      });

      // Limpiamos el oyente cuando el filtro cambia o el componente se desmonta
      return () => unsubscribe(); 

    } catch (error) {
       console.error("Error al construir la consulta: ", error);
       setLoadingProfessionals(false);
    }
    
  }, [selectedCategory]); // Se vuelve a ejecutar CADA VEZ que 'selectedCategory' cambia

  
  // Filtro local por texto (sin cambios)
  const filteredProfessionals = professionals.filter(prof => 
    prof.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prof.apellido.toLowerCase().includes(searchQuery.toLowerCase())
  );


  // ------------------------- RENDERIZADO (Sin cambios) -------------------------
  return (
    <SafeAreaView className="flex-1 bg-blue-100"> 
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-5 bg-az-primario/90 rounded-b-2xl shadow-md">
        <TouchableOpacity onPress={() => navigation.navigate('PatientProfile')}>
          <Ionicons name="person-circle-outline" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-texto-claro">Mobility PLUS</Text>
        <TouchableOpacity onPress={() => Alert.alert('Menú', 'Abriendo el menú lateral')}>
          <Ionicons name="menu" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Contenido Principal */}
      <ScrollView className="flex-1 p-4 -mt-8 z-10"> 
        <View className="bg-white p-6 rounded-2xl shadow-lg mb-6">
          <Text className="text-3xl font-bold text-texto-oscuro mb-2">
            Hola <Text className="text-az-primario">Paciente</Text>
          </Text>
          <Text className="text-lg text-gray-600 mb-4">¿Buscas un profesional?</Text>
          
          {/* Campo de Búsqueda */}
          <View className="flex-row items-center w-full border border-gris-acento rounded-full px-5 py-3 text-texto-oscuro bg-fondo-claro shadow-sm">
            <Ionicons name="search" size={20} color="#9ca3af" className="mr-3" />
            <TextInput
              className="flex-1 text-base text-texto-oscuro ml-2"
              placeholder="Buscar un especialista..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Scroll Horizontal de Categorías */}
          <View className="mt-8">
            <Text className="text-xl font-bold text-texto-oscuro mb-4">
              Categorías
            </Text>
            {loadingCategories ? (
              <ActivityIndicator color={PRIMARY_COLOR} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map(cat => (
                  <TouchableOpacity 
                    key={cat.id}
                    className={`py-2 px-5 rounded-full mr-3 border ${
                      selectedCategory === cat.id 
                        ? 'bg-az-primario border-az-primario' 
                        : 'bg-fondo-claro border-gris-acento'
                    }`}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text className={`font-semibold ${
                      selectedCategory === cat.id 
                        ? 'text-texto-claro' 
                        : 'text-texto-oscuro'
                    }`}>
                      {cat.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>


          {/* Profesionales Disponibles */}
          <Text className="text-xl font-bold text-texto-oscuro mt-8 mb-4">
            Profesionales Disponibles
          </Text>
          
          {loadingProfessionals ? (
            <ActivityIndicator size="large" color={PRIMARY_COLOR} className="my-10" />
          ) : (
            <View className="flex-row flex-wrap justify-between">
              
              {filteredProfessionals.length === 0 ? (
                <Text className="text-gray-500 text-center w-full">
                  No se encontraron profesionales para esta categoría.
                </Text>
              ) : (
                filteredProfessionals.map(prof => (
                  <TouchableOpacity 
                    key={prof.id}
                    className="w-[48%] mb-4 bg-white rounded-lg shadow-md overflow-hidden border border-gris-acento/50"
                    onPress={() => navigation.navigate('ProfessionalDetail', { professionalId: prof.id })}
                  >
                    <Image 
                      source={{ uri: prof.fotoPerfil || `https://placehold.co/150x150/EBF8FF/3A86FF?text=${prof.nombre.charAt(0)}` }} 
                      className="w-full h-32 object-cover" 
                    />
                    <View className="p-3">
                      <Text className="text-texto-oscuro font-semibold">{prof.nombre} {prof.apellido}</Text>
                      <Text className="text-xs text-az-primario">{prof.especialidadNombre}</Text>
                      <View className="flex-row items-center mt-1">
                         <FontAwesome name="star" size={14} color="#FFD700" />
                         <Text className="text-sm text-gray-500 ml-1">{prof.calificacion || 0}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}

            </View>
          )}

        </View>
      </ScrollView>

      {/* Barra de Navegación Inferior (Tab Bar) */}
      <View className="flex-row justify-around items-center bg-white border-t border-gris-acento pt-2 pb-4 shadow-xl">
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('PatientHome')}>
          <Ionicons name="home" size={24} color={PRIMARY_COLOR} />
          <Text className="text-az-primario text-xs font-semibold">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('PatientHistory')}>
          <Ionicons name="calendar-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Citas</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('ChatList')}>
          <Ionicons name="chatbubbles-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Mensajes</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('PatientProfile')}>
          <Ionicons name="person-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PatientHomeScreen;
