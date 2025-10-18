import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Alert } from 'react-native';

const PatientHomeScreen = ({ navigation }) => {
  const handleRequestService = () => {
    // Aquí iría la lógica para iniciar el flujo de solicitud (selección de servicio, detalles, etc.)
    Alert.alert(
      'Solicitar Enfermero',
      '¿Quieres iniciar la búsqueda de un enfermero en tu ubicación actual?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: () => Alert.alert('Búsqueda iniciada', 'Buscando al profesional de salud más cercano...'),
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
      
      {/* 🧭 Encabezado Superior (Header) */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-gris-acento">
        <TouchableOpacity 
          onPress={() => Alert.alert('Menú', 'Abriendo la configuración del Perfil')}
          className="p-2"
        >
          {/* Ícono de Perfil o Menú */}
          <Text className="text-3xl text-az-primario">👤</Text>
        </TouchableOpacity>
        
        <Text className="text-xl font-bold text-texto-oscuro">Mobility PLUS</Text>
        
        <TouchableOpacity 
          onPress={() => Alert.alert('Historial', 'Abriendo el historial de servicios')}
          className="p-2"
        >
          {/* Ícono de Historial */}
          <Text className="text-3xl text-az-primario">📅</Text>
        </TouchableOpacity>
      </View>

      {/* 🗺️ Área del Mapa (Principal) */}
      <View className="flex-1 items-center justify-center bg-gris-acento">
        <View className="p-4 bg-white rounded-lg shadow-md">
            <Text className="text-gray-500 text-lg font-semibold">
              [Aquí se mostrará el Mapa]
            </Text>
            <Text className="text-sm text-gray-400 mt-1">
              Tu ubicación actual: C/ Falsa, 123
            </Text>
        </View>
      </View>

      {/* 🚀 Botón de Solicitud Flotante */}
      <View className="p-6">
        <TouchableOpacity
          className="bg-az-primario rounded-full py-5 shadow-xl items-center"
          onPress={handleRequestService}
        >
          <Text className="text-texto-claro text-xl font-bold">
            Solicitar Enfermero Ahora
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PatientHomeScreen;