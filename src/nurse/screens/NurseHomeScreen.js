import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Switch, ScrollView, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 

// Color de éxito (verde) para el estado 'disponible'
const ONLINE_COLOR = "#4CAF50"; 
// Color primario para el branding
const PRIMARY_COLOR = "#3A86FF";

// Datos de ejemplo para las solicitudes de trabajo
const mockRequests = [
  { id: 1, type: 'Inyección Intravenosa', distance: '1.2 km', patient: 'Sra. Elena P.', time: 'Hace 5 min' },
  { id: 2, type: 'Curación de Heridas', distance: '3.5 km', patient: 'Sr. Carlos M.', time: 'Hace 10 min' },
  { id: 3, type: 'Monitoreo de Glicemia', distance: '0.8 km', patient: 'Joven David R.', time: 'Hace 15 min' },
];

const NurseHomeScreen = ({ navigation }) => {
  const [isAvailable, setIsAvailable] = useState(false);

  const toggleAvailability = () => {
    setIsAvailable(previousState => !previousState);
    Alert.alert(
      "Estado Actualizado", 
      isAvailable ? "Ahora estás DESCONECTADO y no recibirás trabajos." : "Ahora estás DISPONIBLE para recibir solicitudes."
    );
  };

  const handleAcceptJob = (jobId) => {
    /* Alert.alert("Trabajo Aceptado", `Has aceptado el trabajo #${jobId}.`); */
    // Lógica real: remover de la lista de pendientes, iniciar navegación.
    navigation.navigate('JobDetail', { jobId: jobId })
  };

  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
      
      {/* 🧭 Encabezado Superior (Header) */}
      <View className="flex-row justify-between items-center px-4 py-5 bg-az-primario/90 rounded-b-2xl shadow-md">
        <TouchableOpacity onPress={() => Alert.alert('Perfil', 'Abriendo la configuración del Perfil')}>
          <Ionicons name="settings-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text className="text-xl font-bold text-texto-claro">Panel de Enfermero</Text>
        
        <TouchableOpacity onPress={() => Alert.alert('Historial', 'Abriendo el historial de ganancias')}>
          <Ionicons name="wallet-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        
        {/* 🟢 Tarjeta de Disponibilidad */}
        <View className={`p-6 rounded-2xl shadow-lg mb-6 items-center ${isAvailable ? 'bg-exito-verde' : 'bg-error-rojo'}`}>
          <Text className="text-texto-claro text-2xl font-bold mb-2">
            {isAvailable ? "EN LÍNEA" : "FUERA DE SERVICIO"}
          </Text>
          <Text className="text-texto-claro text-sm mb-4">
            {isAvailable ? "Recibirás notificaciones de trabajo cercanas" : "Ponte en línea para aceptar solicitudes."}
          </Text>
          <Switch
            onValueChange={toggleAvailability}
            value={isAvailable}
            trackColor={{ false: "#FCA5A5", true: "#DCFCE7" }}
            thumbColor={isAvailable ? "#FFFFFF" : "#FFFFFF"}
          />
        </View>

        {/* 📊 Métricas Rápidas */}
        <View className="flex-row justify-between mb-6">
          <View className="w-[48%] bg-white p-4 rounded-xl shadow-md border border-gris-acento/50">
            <Text className="text-xl font-bold text-texto-oscuro">$1,250</Text>
            <Text className="text-sm text-gray-500">Ganancia Semanal</Text>
          </View>
          <View className="w-[48%] bg-white p-4 rounded-xl shadow-md border border-gris-acento/50">
            <Text className="text-xl font-bold text-texto-oscuro">18</Text>
            <Text className="text-sm text-gray-500">Servicios Hoy</Text>
          </View>
        </View>

        {/* 🚨 Solicitudes de Trabajo Pendientes */}
        <Text className="text-xl font-bold text-texto-oscuro mb-4">
          Solicitudes Cercanas ({mockRequests.length})
        </Text>
        
        {mockRequests.map(request => (
          <View 
            key={request.id} 
            className="bg-white p-4 rounded-xl shadow-md mb-3 border border-gris-acento/50 flex-row justify-between items-center"
          >
            <View className="flex-1 mr-3">
              <Text className="text-lg font-semibold text-texto-oscuro">{request.type}</Text>
              <Text className="text-sm text-gray-600 mt-1">Paciente: {request.patient}</Text>
              <View className="flex-row items-center mt-2">
                <Ionicons name="location-outline" size={14} color="#6B7280" />
                <Text className="text-sm text-gray-500 ml-1">{request.distance}</Text>
                <Text className="text-xs text-gray-400 ml-4">{request.time}</Text>
              </View>
            </View>
            <TouchableOpacity 
              className="bg-az-primario py-2 px-4 rounded-full shadow-sm"
              onPress={() => handleAcceptJob(request.id)}
            >
              <Text className="text-texto-claro font-bold text-sm">Aceptar</Text>
            </TouchableOpacity>
          </View>
        ))}

      </ScrollView>

      {/* Barra de Navegación Inferior (Tab Bar) */}
<View className="flex-row justify-around items-center bg-white border-t border-gris-acento pt-2 pb-4 shadow-xl">
  <TouchableOpacity className="items-center" onPress={() => navigation.navigate('NurseHome')}>
    <Ionicons name="home" size={24} color={PRIMARY_COLOR} />
    <Text className="text-az-primario text-xs font-semibold">Panel</Text>
  </TouchableOpacity>
  
  <TouchableOpacity className="items-center" onPress={() => navigation.navigate('NurseSchedule')}>
    <Ionicons name="calendar-outline" size={24} color="#9ca3af" />
    <Text className="text-gray-400 text-xs">Agenda</Text>
  </TouchableOpacity>
  
  <TouchableOpacity className="items-center" onPress={() => Alert.alert('Mensajes', 'Abriendo chat')}>
    <Ionicons name="chatbubbles-outline" size={24} color="#9ca3af" />
    <Text className="text-gray-400 text-xs">Mensajes</Text>
  </TouchableOpacity>
  
  <TouchableOpacity className="items-center" onPress={() => navigation.navigate('NurseProfile')}>
    <Ionicons name="person-outline" size={24} color="#9ca3af" />
    <Text className="text-gray-400 text-xs">Perfil</Text>
  </TouchableOpacity>
</View>
    </SafeAreaView>
  );
};

export default NurseHomeScreen;