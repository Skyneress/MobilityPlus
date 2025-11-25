import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";

const PRIMARY_COLOR = "#3A86FF";
// Asumiendo que az-primario, texto-claro, gris-acento, etc., son clases definidas.

const PatientHomeScreen = ({ navigation }) => {
  // 💡 OBTENER LAS ZONAS SEGURAS DEL DISPOSITIVO
  const insets = useSafeAreaInsets();

  const [loadingProfessionals, setLoadingProfessionals] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [professionals, setProfessionals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState(""); // 🚨 CORRECCIÓN: Manejar el unsubscribe de categorías directamente en el useEffect

  useEffect(() => {
    setLoadingCategories(true);
    const categoriesRef = collection(db, "Especialidades");
    const q = query(categoriesRef, orderBy("orden", "asc")); // onSnapshot devuelve directamente la función de limpieza (unsubscribe)
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const categoriesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories([{ id: "all", nombre: "Todos" }, ...categoriesList]);
        setLoadingCategories(false);
      },
      (error) => {
        console.error("Error al cargar categorías: ", error);
        Alert.alert("Error", "No se pudo cargar la lista de especialidades.");
        setLoadingCategories(false);
      }
    ); // 💡 Devolvemos directamente el unsubscribe. Ya no hay Promesas que manejar.
    return unsubscribe;
  }, []); // useEffect para Cargar los Profesionales (sin cambios en la lógica del oyente)

  useEffect(() => {
    setLoadingProfessionals(true);
    try {
      const professionalsRef = collection(db, "profesionales");
      let qBase = query(
        professionalsRef,
        where("estadoVerificacion", "==", "verificado"),
        where("disponibilidad", "==", true)
      );

      if (selectedCategory && selectedCategory !== "all") {
        qBase = query(qBase, where("especialidad", "==", selectedCategory));
      }

      const qFinal = query(qBase, orderBy("calificacion", "desc"));

      const unsubscribe = onSnapshot(
        qFinal,
        (querySnapshot) => {
          const professionalsList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setProfessionals(professionalsList);
          setLoadingProfessionals(false);
        },
        (error) => {
          console.error(
            "Error al cargar profesionales (revisar índice): ",
            error
          );
          setLoadingProfessionals(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("Error al construir la consulta: ", error);
      setLoadingProfessionals(false);
    }
    return () => {};
  }, [selectedCategory]); // Filtro local por texto (sin cambios)

  const filteredProfessionals = professionals.filter(
    (prof) =>
      prof.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.apellido.toLowerCase().includes(searchQuery.toLowerCase())
  ); // ------------------------- RENDERIZADO CORREGIDO -------------------------

  return (
    <View style={{ flex: 1, backgroundColor: "#f0f0f0" }}>
            {/* 2. HEADER */}     
      <View
        className="flex-row justify-between items-center px-4 py-3 bg-az-primario/90 rounded-b-2xl shadow-md"
        style={{ paddingTop: insets.top, paddingBottom: 15 }}
      >
               
        <TouchableOpacity onPress={() => navigation.navigate("PatientProfile")}>
                   
          <Ionicons name="person-circle-outline" size={30} color="#FFFFFF" /> 
               
        </TouchableOpacity>
               
        <Text className="text-xl font-bold text-texto-claro">
          Mobility PLUS
        </Text>
               
        <TouchableOpacity
          onPress={() => Alert.alert("Menú", "Abriendo el menú lateral")}
        >
                    <Ionicons name="menu" size={30} color="#FFFFFF" />
                 
        </TouchableOpacity>
             
      </View>
            {/* 3. SCROLLVIEW: Contenido Principal */}     
      <ScrollView
        className="flex-1 p-4 z-10"
        style={{ backgroundColor: "#f0f0f0" }}
      >
               
        <View className="bg-white p-6 rounded-2xl shadow-lg mb-6 -mt-8">
                   
          <Text className="text-3xl font-bold text-texto-oscuro mb-2">
                        Hola
            <Text className="text-az-primario">Paciente</Text>        
            
          </Text>
                   
          <Text className="text-lg text-gray-600 mb-4">
            ¿Buscas un profesional?
          </Text>
                             
          {/* Campo de Búsqueda y Categorías (sin cambios) */}        
          
          <View className="flex-row items-center w-full border border-gris-acento rounded-full px-5 py-3 text-texto-oscuro bg-fondo-claro shadow-sm">
                       
            <Ionicons
              name="search"
              size={20}
              color="#9ca3af"
              className="mr-3"
            />
                       
            <TextInput
              className="flex-1 text-base text-texto-oscuro ml-2"
              placeholder="Buscar un especialista..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
                     
          </View>
                   
          {/* Scroll Horizontal de Categorías (sin cambios) */}        
          
          <View className="mt-8">
                       
            <Text className="text-xl font-bold text-texto-oscuro mb-4">
              Categorías
            </Text>
                       
            {loadingCategories ? (
              <ActivityIndicator color={PRIMARY_COLOR} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                               
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    className={`py-2 px-5 rounded-full mr-3 border ${selectedCategory === cat.id ? "bg-az-primario border-az-primario" : "bg-fondo-claro border-gris-acento"}`}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                                       
                    <Text
                      className={`font-semibold ${selectedCategory === cat.id ? "text-texto-claro" : "text-texto-oscuro"}`}
                    >
                      {cat.nombre}
                    </Text>
                                     
                  </TouchableOpacity>
                ))}
                             
              </ScrollView>
            )}
                     
          </View>
                    {/* Profesionales Disponibles (sin cambios) */} 
                 
          <Text className="text-xl font-bold text-texto-oscuro mt-8 mb-4">
            Profesionales Disponibles
          </Text>
                             
          {loadingProfessionals ? (
            <ActivityIndicator
              size="large"
              color={PRIMARY_COLOR}
              className="my-10"
            />
          ) : (
            <View className="flex-row flex-wrap justify-between">
                           
              {filteredProfessionals.length === 0 ? (
                <Text className="text-gray-500 text-center w-full">
                  No se encontraron profesionales para esta categoría.
                </Text>
              ) : (
                filteredProfessionals.map((prof) => (
                  <TouchableOpacity
                    key={prof.id}
                    className="w-[48%] mb-4 bg-white rounded-lg shadow-md overflow-hidden border border-gris-acento/50"
                    onPress={() =>
                      navigation.navigate("ProfessionalDetail", {
                        professionalId: prof.id,
                      })
                    }
                  >
                                       
                    <Image
                      source={{
                        uri:
                          prof.fotoPerfil ||
                          `https://placehold.co/150x150/EBF8FF/3A86FF?text=${prof.nombre.charAt(0)}`,
                      }}
                      className="w-full h-32 object-cover"
                    />
                                       
                    <View className="p-3">
                                           
                      <Text className="text-texto-oscuro font-semibold">
                        {prof.nombre} {prof.apellido}
                      </Text>
                                           
                      <Text className="text-xs text-az-primario">
                        {prof.especialidadNombre}
                      </Text>
                                           
                      <View className="flex-row items-center mt-1">
                        <FontAwesome name="star" size={14} color="#FFD700" />
                        <Text className="text-sm text-gray-500 ml-1">
                          {prof.calificacion || 0}
                        </Text>
                      </View>
                                         
                    </View>
                                   
                  </TouchableOpacity>
                ))
              )}
                         
            </View>
          )}
                 
        </View>
             
      </ScrollView>
            {/* 4. BARRA DE NAVEGACIÓN INFERIOR (TAB BAR) */}     
      <View
        className="flex-row justify-around items-center bg-white border-t border-gris-acento pt-2 pb-4 shadow-xl"
        style={{ paddingBottom: insets.bottom }}
      >
               
        <TouchableOpacity
          className="items-center"
          onPress={() => navigation.navigate("PatientHome")}
        >
                   
          <Ionicons name="home" size={24} color={PRIMARY_COLOR} />      
            
          <Text className="text-az-primario text-xs font-semibold">Home</Text>
                
        </TouchableOpacity>
               
        <TouchableOpacity
          className="items-center"
          onPress={() => navigation.navigate("PatientHistory")}
        >
                   
          <Ionicons name="calendar-outline" size={24} color="#9ca3af" />   
                <Text className="text-gray-400 text-xs">Citas</Text>  
              
        </TouchableOpacity>
               
        <TouchableOpacity
          className="items-center"
          onPress={() => navigation.navigate("ChatList")}
        >
                   
          <Ionicons name="chatbubbles-outline" size={24} color="#9ca3af" />  
                 <Text className="text-gray-400 text-xs">Mensajes</Text>
                
        </TouchableOpacity>
               
        <TouchableOpacity
          className="items-center"
          onPress={() => navigation.navigate("PatientProfile")}
        >
                   
          <Ionicons name="person-outline" size={24} color="#9ca3af" />    
               <Text className="text-gray-400 text-xs">Perfil</Text>   
             
        </TouchableOpacity>
             
      </View>
         
    </View>
  );
};

export default PatientHomeScreen;
