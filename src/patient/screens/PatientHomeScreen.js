import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, SafeAreaView, Alert } from 'react-native';
// 💡 Importamos los componentes de íconos (FontAwesome y Ionicons)
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons'; 

// Definimos el color primario aquí, fuera del componente, para usarlo en el prop 'color' de Ionicons.
// Usaremos el valor de tu az-primario, que típicamente es un azul fuerte.
// NOTA: Si este valor cambia en tailwind.config.js, debe actualizarse aquí.
const PRIMARY_COLOR = "#3A86FF"; 

const PatientHomeScreen = ({ navigation }) => {
  const handleSearch = (specialty) => {
    Alert.alert('Búsqueda', `Buscando especialistas en: ${specialty}`);
    // Aquí iría la lógica real de búsqueda
  };

  const handleProfessionalPress = (name) => {
    Alert.alert('Profesional', `Has seleccionado a ${name}.`);
    // Aquí iría la navegación al perfil del profesional
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-100"> 
      {/* Header - Barra Superior */}
      <View className="flex-row justify-between items-center px-4 py-5 bg-az-primario/90 rounded-b-2xl shadow-md">
        {/* 👤 Ícono de Perfil */}
        <TouchableOpacity onPress={() => Alert.alert('Perfil', 'Abriendo la configuración del Perfil')}>
          <Ionicons name="person-circle-outline" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text className="text-xl font-bold text-texto-claro">Mobility PLUS</Text>
        
        {/* ☰ Ícono de Menú/Opciones */}
        <TouchableOpacity onPress={() => Alert.alert('Menú', 'Abriendo el menú lateral')}>
          <Ionicons name="menu" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Contenido Principal con Tarjeta Flotante */}
      {/* Usamos el offset negativo para el efecto visual que simula la imagen que enviaste */}
      <ScrollView className="flex-1 p-4 -mt-8 z-10"> 
        <View className="bg-white p-6 rounded-2xl shadow-lg mb-6">
          <Text className="text-3xl font-bold text-texto-oscuro mb-2">
            Hola <Text className="text-az-primario">Viviana</Text>
          </Text>
          <Text className="text-lg text-gray-600 mb-4">¿Buscas un profesional?</Text>
          
          {/* Campo de Búsqueda */}
          <View className="flex-row items-center w-full border border-gris-acento rounded-full px-5 py-3 text-texto-oscuro bg-fondo-claro shadow-sm">
            <Ionicons name="search" size={20} color="#9ca3af" className="mr-3" />
            <TextInput
              className="flex-1 text-base text-texto-oscuro ml-2"
              placeholder="Buscar un especialista..."
              placeholderTextColor="#9ca3af"
              onSubmitEditing={(event) => handleSearch(event.nativeEvent.text)}
            />
          </View>

          {/* Profesionales con mejor calificación */}
          <Text className="text-xl font-bold text-texto-oscuro mt-8 mb-4">
            Profesionales mejor valorados
          </Text>
          <View className="flex-row flex-wrap justify-between">
            
            {/* Tarjeta de Profesional 1 (Dr. Smith) */}
            <TouchableOpacity 
              className="w-[48%] mb-4 bg-white rounded-lg shadow-md overflow-hidden border border-gris-acento/50"
              onPress={() => handleProfessionalPress('Dr. Smith')}
            >
              <Image 
                source={{ uri: 'https://img.imageboss.me/fourweekmba/cdn/p/wp-content/uploads/2023/11/what-is-a-professional.jpg' }} 
                className="w-full h-32 object-cover" 
              />
              <View className="p-3">
                <Text className="text-texto-oscuro font-semibold">Dr. Smith</Text>
                <View className="flex-row items-center mt-1">
                   <FontAwesome name="star" size={14} color="#FFD700" />
                   <Text className="text-sm text-gray-500 ml-1">4.9 (120)</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Tarjeta de Profesional 2 (Enf. García) */}
            <TouchableOpacity 
              className="w-[48%] mb-4 bg-white rounded-lg shadow-md overflow-hidden border border-gris-acento/50"
              onPress={() => handleProfessionalPress('Enf. García')}
            >
              <Image 
                source={{ uri: 'https://www.shutterstock.com/image-photo/confident-caucasian-female-nurse-blue-260nw-2195033785.jpg' }} 
                className="w-full h-32 object-cover" 
              />
              <View className="p-3">
                <Text className="text-texto-oscuro font-semibold">Enf. García</Text>
                 <View className="flex-row items-center mt-1">
                   <FontAwesome name="star" size={14} color="#FFD700" />
                   <Text className="text-sm text-gray-500 ml-1">4.8 (85)</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Categorías Principales */}
          <Text className="text-xl font-bold text-texto-oscuro mt-8 mb-4">
            Explora por Categoría
          </Text>
          <View className="flex-row flex-wrap justify-between">
            
            {/* Botón de Especialidad: Enfermería */}
            <TouchableOpacity 
              className="w-[48%] mb-4 bg-az-primario/10 rounded-xl p-4 items-center border border-az-primario/20"
              onPress={() => handleSearch('Enfermería')}
            >
              {/* Uso del color fijo (PRIMARY_COLOR) en el prop 'color' */}
              <Ionicons name="medkit-outline" size={40} color={PRIMARY_COLOR} />
              <Text className="mt-2 text-texto-oscuro font-semibold">Enfermería</Text>
            </TouchableOpacity>

            {/* Botón de Especialidad: Fisioterapia */}
            <TouchableOpacity 
              className="w-[48%] mb-4 bg-az-primario/10 rounded-xl p-4 items-center border border-az-primario/20"
              onPress={() => handleSearch('Fisioterapia')}
            >
              {/* Uso del color fijo (PRIMARY_COLOR) en el prop 'color' */}
              <Ionicons name="accessibility-outline" size={40} color={PRIMARY_COLOR} />
              <Text className="mt-2 text-texto-oscuro font-semibold">Fisioterapia</Text>
            </TouchableOpacity>

            {/* Botón de Especialidad: Terapia */}
            <TouchableOpacity 
              className="w-[48%] mb-4 bg-az-primario/10 rounded-xl p-4 items-center border border-az-primario/20"
              onPress={() => handleSearch('Terapia')}
            >
              {/* Uso del color fijo (PRIMARY_COLOR) en el prop 'color' */}
              <Ionicons name="chatbubbles-outline" size={40} color={PRIMARY_COLOR} />
              <Text className="mt-2 text-texto-oscuro font-semibold">Terapia</Text>
            </TouchableOpacity>

            {/* Botón de Especialidad: Nutrición */}
            <TouchableOpacity 
              className="w-[48%] mb-4 bg-az-primario/10 rounded-xl p-4 items-center border border-az-primario/20"
              onPress={() => handleSearch('Nutrición')}
            >
              {/* Uso del color fijo (PRIMARY_COLOR) en el prop 'color' */}
              <Ionicons name="nutrition-outline" size={40} color={PRIMARY_COLOR} />
              <Text className="mt-2 text-texto-oscuro font-semibold">Nutrición</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      {/* Barra de Navegación Inferior (Tab Bar) */}
      <View className="flex-row justify-around items-center bg-white border-t border-gris-acento pt-2 pb-4 shadow-xl">
        <TouchableOpacity className="items-center">
          {/* Usamos el color fijo (PRIMARY_COLOR) en el prop 'color' y la clase de texto */}
          <Ionicons name="home" size={24} color={PRIMARY_COLOR} />
          <Text className="text-az-primario text-xs font-semibold">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('PatientHistory')}>
          <Ionicons name="calendar-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Citas</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            className="items-center" 
            onPress={() => navigation.navigate('Chat', { contactName: 'Soporte', contactRole: 'Soporte' })} // Navega a la pantalla de Chat
          >
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