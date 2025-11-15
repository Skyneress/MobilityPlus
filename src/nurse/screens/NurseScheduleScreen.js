import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 

const PRIMARY_COLOR = "#3A86FF"; 
const TEXT_DARK = "#1F2937";
const GRAY_ACCENT = "#E5E7EB";

// Datos de ejemplo para las citas programadas
const mockSchedule = [
  { id: 1, date: 'Hoy', time: '10:00 AM', type: 'Curación de Heridas', patient: 'Sra. Elena P.', location: 'Calle Falsa 123' },
  { id: 2, date: 'Hoy', time: '02:30 PM', type: 'Aplicación de Vacuna', patient: 'Sr. Carlos M.', location: 'Av. Siempre Viva 742' },
  { id: 3, date: 'Mañana', time: '09:00 AM', type: 'Monitoreo Glicemia', patient: 'Joven David R.', location: 'Elm St. 5' },
  { id: 4, date: 'Mañana', time: '04:00 PM', type: 'Terapia de Movilidad', patient: 'Sr. Pedro L.', location: 'Ruta 66, Km 45' },
];

// Función auxiliar para renderizar el encabezado de la sección
const ScheduleHeader = ({ date }) => (
  <View className="px-4 py-2 mt-4 mb-2 bg-gris-acento rounded-lg">
    <Text className="text-sm font-bold text-texto-oscuro">{date}</Text>
  </View>
);

// Componente para una cita individual
const AppointmentCard = ({ appointment }) => (
  <TouchableOpacity 
    className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-gris-acento/50"
    onPress={() => Alert.alert('Detalle Cita', `Ver detalles de ${appointment.patient}`)}
  >
    <View className="flex-row justify-between items-center mb-2 border-b border-gris-acento/50 pb-2">
      <Text className="text-lg font-bold text-az-primario">{appointment.time}</Text>
      <View className="flex-row items-center bg-az-primario/10 px-3 py-1 rounded-full">
        <Ionicons name="bandage-outline" size={14} color={PRIMARY_COLOR} />
        <Text className="text-xs text-az-primario ml-1">{appointment.type}</Text>
      </View>
    </View>
    
    <Text className="text-base font-semibold text-texto-oscuro mt-1">{appointment.patient}</Text>
    <View className="flex-row items-center mt-1">
      <Ionicons name="location-outline" size={14} color="#6B7280" />
      <Text className="text-sm text-gray-600 ml-1">{appointment.location}</Text>
    </View>
  </TouchableOpacity>
);


const NurseScheduleScreen = ({ navigation }) => {
  // Simular la agrupación de citas
  const todayAppointments = mockSchedule.filter(a => a.date === 'Hoy');
  const tomorrowAppointments = mockSchedule.filter(a => a.date === 'Mañana');

  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
      
      {/* 🧭 Encabezado Superior (Header) */}
      <View className="flex-row justify-between items-center px-4 py-5 bg-az-primario rounded-b-lg shadow-md">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text className="text-xl font-bold text-texto-claro">Mi Agenda de Citas</Text>
        
        <TouchableOpacity onPress={() => Alert.alert('Filtro', 'Aplicando filtro de citas')}>
          <Ionicons name="filter-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Citas de Hoy */}
        <ScheduleHeader date="Citas de Hoy" />
        {todayAppointments.map(appointment => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}

        {/* Citas de Mañana */}
        <ScheduleHeader date="Citas de Mañana" />
        {tomorrowAppointments.map(appointment => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}

        {tomorrowAppointments.length === 0 && (
          <View className="p-4 bg-white rounded-lg items-center">
            <Text className="text-gray-500">No hay citas programadas.</Text>
          </View>
        )}
      </ScrollView>

      {/* Barra de Navegación Inferior (Tab Bar) - Mantenemos el mismo color de activación */}
<View className="flex-row justify-around items-center bg-white border-t border-gris-acento pt-2 pb-4 shadow-xl">
  <TouchableOpacity className="items-center" onPress={() => navigation.navigate('NurseHome')}>
    <Ionicons name="home" size={24} color="#9ca3af" />
    <Text className="text-gray-400 text-xs font-semibold">Panel</Text>
  </TouchableOpacity>
  
  <TouchableOpacity className="items-center" onPress={() => navigation.navigate('NurseSchedule')}>
    <Ionicons name="calendar-outline" size={24} color={PRIMARY_COLOR} />
    <Text className="text-az-primario text-xs font-semibold">Agenda</Text>
  </TouchableOpacity>
  
  <TouchableOpacity 
            className="items-center" 
            onPress={() => navigation.navigate('Chat', { contactName: 'Paciente Activo', contactRole: 'Paciente' })} 
  >
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

export default NurseScheduleScreen;