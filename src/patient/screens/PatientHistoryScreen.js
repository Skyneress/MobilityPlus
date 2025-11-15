import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 

const PRIMARY_COLOR = "#3A86FF"; 
const TEXT_DARK = "#1F2937";
const GRAY_ACCENT = "#E5E7EB";
const SUCCESS_COLOR = "#4CAF50";
const ERROR_COLOR = "#EF4444";

// Datos de ejemplo para las citas
const mockAppointments = [
  { id: 1, date: 'Hoy, 14:30 PM', service: 'Curación de Heridas', professional: 'Dr. Carlos Smith', status: 'Pendiente' },
  { id: 2, date: 'Mañana, 09:00 AM', service: 'Fisioterapia Post-Accidente', professional: 'Lic. Ana García', status: 'Pendiente' },
  { id: 3, date: '05 Nov 2025', service: 'Monitoreo de Glicemia', professional: 'Enf. Juan Pérez', status: 'Completado' },
  { id: 4, date: '01 Nov 2025', service: 'Inyección Antigripal', professional: 'Dr. Smith', status: 'Cancelado' },
];

// Componente para una tarjeta de cita
const AppointmentCard = ({ appointment, onCancel, onReview }) => {
  const isPending = appointment.status === 'Pendiente';
  const isCompleted = appointment.status === 'Completado';
  const statusColor = isPending ? 'text-advertencia-naranja' : isCompleted ? 'text-exito-verde' : 'text-error-rojo';

  return (
    <View className="bg-white p-4 rounded-xl shadow-md mb-3 border border-gris-acento">
      <View className="flex-row justify-between items-start mb-3 border-b border-gris-acento/50 pb-2">
        <View>
          <Text className="text-sm text-gray-500">{appointment.date}</Text>
          <Text className="text-lg font-bold text-texto-oscuro mt-1">{appointment.service}</Text>
        </View>
        <Text className={`text-sm font-semibold ${statusColor}`}>{appointment.status}</Text>
      </View>
      
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-sm text-gray-600">Profesional:</Text>
          <Text className="text-base font-semibold text-az-primario">{appointment.professional}</Text>
        </View>
        
        {/* Botones de Acción */}
        <View className="flex-row space-x-2">
          {isPending && (
            <TouchableOpacity 
              className="bg-error-rojo/10 px-3 py-2 rounded-full border border-error-rojo"
              onPress={() => onCancel(appointment.id)}
            >
              <Text className="text-error-rojo text-xs font-semibold">Cancelar</Text>
            </TouchableOpacity>
          )}
          {isCompleted && (
            <TouchableOpacity 
              className="bg-az-primario/10 px-3 py-2 rounded-full border border-az-primario/20"
              onPress={() => onReview(appointment.id)}
            >
              <Text className="text-az-primario text-xs font-semibold">Dejar Review</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const PatientHistoryScreen = ({ navigation }) => {
  const [tab, setTab] = useState('pending'); // 'pending' o 'completed'

  const pendingAppointments = mockAppointments.filter(a => a.status === 'Pendiente');
  const completedAppointments = mockAppointments.filter(a => a.status !== 'Pendiente');

  const handleCancel = (id) => {
    Alert.alert("Confirmar", `¿Estás seguro de cancelar la cita #${id}?`, [
      { text: "No", style: "cancel" },
      { text: "Sí", onPress: () => Alert.alert("Cancelado", "Cita cancelada.") }
    ]);
  };

  const handleReview = (id) => {
    Alert.alert("Review", `Abriendo pantalla para calificar la cita #${id}.`);
  };

  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
      
      {/* 🧭 Encabezado Superior (Header) */}
      <View className="flex-row items-center px-4 py-5 bg-az-primario rounded-b-lg shadow-md">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-texto-claro ml-4">Mis Citas y Historial</Text>
      </View>
      
      {/* Selector de Pestañas */}
      <View className="flex-row mx-4 mt-4 bg-white rounded-xl p-1 shadow-sm border border-gris-acento">
        <TouchableOpacity 
          className={`flex-1 items-center py-2 rounded-lg ${tab === 'pending' ? 'bg-az-primario' : 'bg-white'}`}
          onPress={() => setTab('pending')}
        >
          <Text className={`font-semibold ${tab === 'pending' ? 'text-texto-claro' : 'text-texto-oscuro'}`}>
            Pendientes ({pendingAppointments.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 items-center py-2 rounded-lg ${tab === 'completed' ? 'bg-az-primario' : 'bg-white'}`}
          onPress={() => setTab('completed')}
        >
          <Text className={`font-semibold ${tab === 'completed' ? 'text-texto-claro' : 'text-texto-oscuro'}`}>
            Historial ({completedAppointments.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4 pt-0">
        <View className="mt-4">
          {tab === 'pending' && pendingAppointments.map(app => (
            <AppointmentCard key={app.id} appointment={app} onCancel={handleCancel} />
          ))}

          {tab === 'completed' && completedAppointments.map(app => (
            <AppointmentCard key={app.id} appointment={app} onReview={handleReview} />
          ))}

          {/* Mensaje si no hay citas */}
          {(tab === 'pending' && pendingAppointments.length === 0) && (
            <Text className="text-center text-gray-500 mt-10">
              ¡Genial! No tienes citas pendientes.
            </Text>
          )}
          {(tab === 'completed' && completedAppointments.length === 0) && (
            <Text className="text-center text-gray-500 mt-10">
              Aún no tienes historial de citas completadas.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Barra de Navegación Inferior (Tab Bar) */}
      <View className="flex-row justify-around items-center bg-white border-t border-gris-acento pt-2 pb-4 shadow-xl">
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('PatientHome')}>
          <Ionicons name="home-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Ionicons name="calendar" size={24} color={PRIMARY_COLOR} />
          <Text className="text-az-primario text-xs font-semibold">Citas</Text>
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

export default PatientHistoryScreen;