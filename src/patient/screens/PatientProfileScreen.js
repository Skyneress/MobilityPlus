import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import FontAwesome from 'react-native-vector-icons/FontAwesome';
// 💡 1. Importar el servicio de Auth y la función signOut
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';

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

const PatientProfileScreen = ({ navigation }) => {
  const handleEdit = (field) => {
    Alert.alert("Editar", `Abriendo modal para editar: ${field}`);
  };

  // 💡 2. Función de Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // El AuthContext detectará esto automáticamente y
      // el RootNavigator nos enviará al AuthStack (Login).
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Alert.alert("Error", "No se pudo cerrar la sesión.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
      
      {/* Encabezado Superior (Header) */}
      <View className="flex-row items-center px-4 py-5 bg-az-primario rounded-b-lg shadow-md">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-texto-claro ml-4">Mi Perfil</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        
        {/* Sección de Foto y Nombre */}
        <View className="items-center py-6 bg-white rounded-xl shadow-md mb-6 border border-gris-acento">
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }}
            className="w-24 h-24 rounded-full border-4 border-az-primario shadow-lg"
          />
          <Text className="text-2xl font-bold text-texto-oscuro mt-3">Viviana López</Text>
          <Text className="text-base text-gray-500">Paciente</Text>
        </View>

        {/* 🩺 --- ¡NUEVA SECCIÓN DE BITÁCORA! --- 🩺 */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <TouchableOpacity 
            className="flex-row items-center justify-between py-2"
            onPress={() => navigation.navigate('PatientLog')} // <-- NAVEGACIÓN
          >
            <View className="flex-row items-center">
              <Ionicons name="receipt-outline" size={24} color={PRIMARY_COLOR} />
              <Text className="text-lg font-semibold text-texto-oscuro ml-4">Ver Mi Bitácora Clínica</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        {/* 🩺 --- FIN DE LA NUEVA SECCIÓN --- 🩺 */}


        {/* 📍 Sección de Dirección y Contacto */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-lg font-bold text-az-primario mb-3">Información de Servicio</Text>
          <InfoRow 
            icon="location-outline" 
            label="Dirección Principal" 
            value="Calle Falsa 123, Depto. 4B"
            onPressEdit={() => handleEdit('Dirección')}
          />
          <InfoRow 
            icon="alert-circle-outline" 
            label="Contacto de Emergencia" 
            value="Juan Pérez (+56 9 9876 5432)"
            onPressEdit={() => handleEdit('Emergencia')}
          />
           <InfoRow 
            icon="bandage-outline" 
            label="Condición Médica Relevante" 
            value="Movilidad Reducida / Diabetes"
            onPressEdit={() => handleEdit('Condición')}
          />
        </View>

        {/* 📞 Sección de Contacto Personal */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-lg font-bold text-az-primario mb-3">Datos Personales</Text>
          <InfoRow 
            icon="mail-outline" 
            label="Correo Electrónico" 
            value="viviana.lopez@gmail.com"
            onPressEdit={() => handleEdit('Correo')}
          />
          <InfoRow 
            icon="call-outline" 
            label="Teléfono" 
            value="+56 9 1234 5678"
            onPressEdit={() => handleEdit('Teléfono')}
          />
        </View>

        {/* Botón de Cerrar Sesión */}
        <TouchableOpacity 
          className="bg-error-rojo/10 rounded-full py-4 mt-4 mb-10 items-center border border-error-rojo"
          onPress={handleLogout} // Conectado a la función de logout
        >
          <Text className="text-error-rojo text-lg font-semibold">Cerrar Sesión</Text>
        </TouchableOpacity>
        
      </ScrollView>

      {/* Barra de Navegación Inferior (Tab Bar) */}
      <View className="flex-row justify-around items-center bg-white border-t border-gris-acento pt-2 pb-4 shadow-xl">
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('PatientHome')}>
          <Ionicons name="home-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('PatientHistory')}>
          <Ionicons name="calendar-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Citas</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('Chat', { contactName: 'Soporte', contactRole: 'Soporte' })}>
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

export default PatientProfileScreen;