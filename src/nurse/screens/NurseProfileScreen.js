import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const PRIMARY_COLOR = "#3A86FF"; 
const TEXT_DARK = "#1F2937";
const GRAY_ACCENT = "#E5E7EB";

// Componente para una fila de información editable
const InfoRow = ({ icon, label, value, onPressEdit }) => (
  <View className="flex-row items-center justify-between py-3 border-b border-gris-acento/70">
    <View className="flex-row items-center flex-1">
      <Ionicons name={icon} size={20} color={PRIMARY_COLOR} />
      <View className="ml-4">
        <Text className="text-xs text-gray-500">{label}</Text>
        <Text className="text-base font-medium text-texto-oscuro">{value}</Text>
      </View>
    </View>
    <TouchableOpacity onPress={onPressEdit}>
      <Ionicons name="create-outline" size={24} color="#6B7280" />
    </TouchableOpacity>
  </View>
);

const NurseProfileScreen = ({ navigation }) => {
  const handleEdit = (field) => {
    Alert.alert("Editar", `Abriendo modal para editar: ${field}`);
    // Lógica real: Abrir un modal o navegar a una pantalla de edición
  };

  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
      
      {/* 🧭 Encabezado Superior (Header) */}
      <View className="flex-row items-center px-4 py-5 bg-az-primario rounded-b-lg shadow-md">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-texto-claro ml-4">Mi Perfil Profesional</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        
        {/* Sección de Foto y Nombre */}
        <View className="items-center py-6 bg-white rounded-xl shadow-md mb-6 border border-gris-acento">
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1579621970588-a35d0e7ab93b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }}
            className="w-24 h-24 rounded-full border-4 border-az-primario shadow-lg"
          />
          <Text className="text-2xl font-bold text-texto-oscuro mt-3">Dr. Carlos Smith</Text>
          <Text className="text-base text-gray-500">Enfermero Registrado (RN)</Text>
          
          {/* Calificación */}
          <View className="flex-row items-center mt-2">
            <FontAwesome name="star" size={18} color="#FFD700" />
            <Text className="text-lg font-semibold text-texto-oscuro ml-2">4.9</Text>
            <Text className="text-sm text-gray-500 ml-1">(120 Reviews)</Text>
          </View>
          
        </View>

        {/* 📚 Sección de Información Profesional */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-lg font-bold text-az-primario mb-3">Información Profesional</Text>
          <InfoRow 
            icon="card-outline" 
            label="Número de Licencia" 
            value="RN-897534"
            onPressEdit={() => handleEdit('Licencia')}
          />
          <InfoRow 
            icon="briefcase-outline" 
            label="Especialidad" 
            value="Cuidado Geriátrico Avanzado"
            onPressEdit={() => handleEdit('Especialidad')}
          />
           <InfoRow 
            icon="cash-outline" 
            label="Tarifa por Visita" 
            value="$45 USD / hora"
            onPressEdit={() => handleEdit('Tarifa')}
          />
        </View>

        {/* 📞 Sección de Contacto */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-lg font-bold text-az-primario mb-3">Datos de Contacto</Text>
          <InfoRow 
            icon="mail-outline" 
            label="Correo Electrónico" 
            value="carlos.smith@mobilityplus.com"
            onPressEdit={() => handleEdit('Correo')}
          />
          <InfoRow 
            icon="call-outline" 
            label="Teléfono" 
            value="+56 9 9876 5432"
            onPressEdit={() => handleEdit('Teléfono')}
          />
        </View>

        {/* Botón de Cerrar Sesión */}
        <TouchableOpacity 
          className="bg-error-rojo/10 rounded-full py-4 mt-4 mb-10 items-center border border-error-rojo"
          onPress={() => Alert.alert('Cerrar Sesión', '¿Estás seguro que quieres cerrar sesión?')}
        >
          <Text className="text-error-rojo text-lg font-semibold">Cerrar Sesión</Text>
        </TouchableOpacity>
        
      </ScrollView>

      {/* Barra de Navegación Inferior (Tab Bar) */}
      <View className="flex-row justify-around items-center bg-white border-t border-gris-acento pt-2 pb-4 shadow-xl">
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('NurseHome')}>
          <Ionicons name="home-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Panel</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('NurseSchedule')}>
          <Ionicons name="calendar-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Agenda</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Ionicons name="chatbubbles-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Mensajes</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Ionicons name="person" size={24} color={PRIMARY_COLOR} />
          <Text className="text-az-primario text-xs font-semibold">Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default NurseProfileScreen;