import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
// Importamos funciones de Firestore
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

const PRIMARY_COLOR = "#3A86FF"; 

const PatientHomeScreen = ({ navigation }) => {
  // Estados para manejar los datos y la carga
  const [loading, setLoading] = useState(true);
  const [professionals, setProfessionals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // useEffect para cargar los profesionales al montar la pantalla
  useEffect(() => {
    const fetchProfessionals = async () => {
      setLoading(true);
      try {
        // Consultamos la colección "profesionales"
        const professionalsRef = collection(db, "profesionales");
        
        // Filtramos solo los que están verificados y disponibles
        const q = query(
          professionalsRef, 
          where("estadoVerificacion", "==", "verificado"),
          where("disponibilidad", "==", true),
          orderBy("calificacion", "desc") // Ordenamos por mejor calificación
        );

        const querySnapshot = await getDocs(q);
        const professionalsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProfessionals(professionalsList);
        
      } catch (error) {
        console.error("Error al cargar profesionales: ", error);
        Alert.alert("Error", "No se pudo cargar la lista de profesionales.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionals();
  }, []); // El array vacío asegura que se ejecute solo una vez

  const handleSearch = (text) => {
    setSearchQuery(text);
    // Aquí se podría implementar una búsqueda en tiempo real si se desea
  };

  // Filtramos los profesionales basados en la búsqueda (simple, por nombre)
  const filteredProfessionals = professionals.filter(prof => 
    prof.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prof.apellido.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-blue-100"> 
      {/* Header - Barra Superior */}
      <View className="flex-row justify-between items-center px-4 py-5 bg-az-primario/90 rounded-b-2xl shadow-md">
        <TouchableOpacity onPress={() => navigation.navigate('PatientProfile')}>
          <Ionicons name="person-circle-outline" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text className="text-xl font-bold text-texto-claro">Mobility PLUS</Text>
        
        <TouchableOpacity onPress={() => Alert.alert('Menú', 'Abriendo el menú lateral')}>
          <Ionicons name="menu" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Contenido Principal con Tarjeta Flotante */}
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
              onChangeText={handleSearch}
            />
          </View>

          {/* Profesionales con mejor calificación */}
          <Text className="text-xl font-bold text-texto-oscuro mt-8 mb-4">
            Profesionales Disponibles
          </Text>
          
          {loading ? (
            <ActivityIndicator size="large" color={PRIMARY_COLOR} className="my-10" />
          ) : (
            <View className="flex-row flex-wrap justify-between">
              
              {filteredProfessionals.length === 0 ? (
                <Text className="text-gray-500 text-center w-full">No se encontraron profesionales disponibles.</Text>
              ) : (
                filteredProfessionals.map(prof => (
                  <TouchableOpacity 
                    key={prof.id}
                    className="w-[48%] mb-4 bg-white rounded-lg shadow-md overflow-hidden border border-gris-acento/50"
                    // 💡 NAVEGACIÓN: Al presionar, vamos al detalle del profesional
                    onPress={() => navigation.navigate('ProfessionalDetail', { professionalId: prof.id })}
                  >
                    <Image 
                      // Usamos la foto de perfil de Firebase o un placeholder
                      source={{ uri: prof.fotoPerfil || 'https://via.placeholder.com/150' }} 
                      className="w-full h-32 object-cover" 
                    />
                    <View className="p-3">
                      <Text className="text-texto-oscuro font-semibold">{prof.nombre} {prof.apellido}</Text>
                      <View className="flex-row items-center mt-1">
                         <FontAwesome name="star" size={14} color="#FFD700" />
                         <Text className="text-sm text-gray-500 ml-1">{prof.calificacion || 0} ({prof.reviews || 0})</Text>
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
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('Chat', { contactName: 'Soporte', contactRole: 'Soporte' })}>
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