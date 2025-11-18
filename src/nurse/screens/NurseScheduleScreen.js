import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
// 💡 1. Importar funciones de Firestore y el hook de Auth
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useAuth } from '../../context/AuthContext';

const PRIMARY_COLOR = "#3A86FF"; 
const TEXT_DARK = "#1F2937";
const GRAY_ACCENT = "#E5E7EB";

// 💡 Eliminamos los datos mock

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
    onPress={() => Alert.alert('Detalle Cita', `Viendo cita con ${appointment.patientName}`)}
  >
    <View className="flex-row justify-between items-center mb-2 border-b border-gris-acento/50 pb-2">
      <Text className="text-lg font-bold text-az-primario">{appointment.requestedDate}</Text>
      <View className={`flex-row items-center px-3 py-1 rounded-full ${
          appointment.status === 'aceptada' ? 'bg-advertencia-naranja/10' : 'bg-exito-verde/10'
        }`}>
        <Ionicons 
          name={appointment.status === 'aceptada' ? 'time-outline' : 'checkmark-done-outline'} 
          size={14} 
          color={appointment.status === 'aceptada' ? '#FF9800' : '#4CAF50'} 
        />
        <Text className={`text-xs ml-1 ${
            appointment.status === 'aceptada' ? 'text-advertencia-naranja' : 'text-exito-verde'
          }`}>
          {appointment.status === 'aceptada' ? 'Aceptada' : 'Completada'}
        </Text>
      </View>
    </View>
    
    <Text className="text-base font-semibold text-texto-oscuro mt-1">{appointment.patientName}</Text>
    <View className="flex-row items-center mt-1">
      <Ionicons name="location-outline" size={14} color="#6B7280" />
      <Text className="text-sm text-gray-600 ml-1">{appointment.address}</Text>
    </View>
  </TouchableOpacity>
);


const NurseScheduleScreen = ({ navigation }) => {
  const { user } = useAuth(); // Obtenemos el enfermero logueado
  const [loading, setLoading] = useState(true);
  const [acceptedAppointments, setAcceptedAppointments] = useState([]);
  const [completedAppointments, setCompletedAppointments] = useState([]);

  // 💡 2. useEffect para escuchar las citas en tiempo real
  useEffect(() => {
    if (!user) return; 

    setLoading(true);
    
    // Consulta para citas ACEPTADAS (pendientes de hacer)
    const qAccepted = query(
      collection(db, "citas"),
      where("nurseUid", "==", user.uid), 
      where("status", "==", "aceptada"), 
      orderBy("createdAt", "desc")
    );
    
    // Consulta para citas COMPLETADAS (historial)
    const qCompleted = query(
      collection(db, "citas"),
      where("nurseUid", "==", user.uid), 
      where("status", "==", "completada"), 
      orderBy("createdAt", "desc")
    );

    const unsubscribeAccepted = onSnapshot(qAccepted, (querySnapshot) => {
      const appointments = [];
      querySnapshot.forEach((doc) => {
        appointments.push({ id: doc.id, ...doc.data() });
      });
      setAcceptedAppointments(appointments);
      setLoading(false);
    }, (error) => {
      console.error("Error al cargar citas aceptadas: ", error);
      Alert.alert("Error", "No se pudo cargar la agenda.");
    });

    const unsubscribeCompleted = onSnapshot(qCompleted, (querySnapshot) => {
      const appointments = [];
      querySnapshot.forEach((doc) => {
        appointments.push({ id: doc.id, ...doc.data() });
      });
      setCompletedAppointments(appointments);
    }, (error) => {
      console.error("Error al cargar citas completadas: ", error);
    });


    // Limpiamos los 'oyentes'
    return () => {
      unsubscribeAccepted();
      unsubscribeCompleted();
    };

  }, [user]); // Se ejecuta si el 'user' cambia

  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
      
      {/* Encabezado (sin cambios) */}
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
        
        {loading ? (
          <ActivityIndicator size="large" color={PRIMARY_COLOR} className="mt-10" />
        ) : (
          <>
            {/* Citas Aceptadas (Pendientes de Realizar) */}
            <ScheduleHeader date="Próximas Citas (Aceptadas)" />
            {acceptedAppointments.length > 0 ? (
              acceptedAppointments.map(appointment => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            ) : (
              <Text className="text-center text-gray-500 mt-4">No tienes citas aceptadas.</Text>
            )}

            {/* Citas Completadas (Historial) */}
            <ScheduleHeader date="Citas Completadas" />
            {completedAppointments.length > 0 ? (
              completedAppointments.map(appointment => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            ) : (
              <Text className="text-center text-gray-500 mt-4">No tienes historial de citas completadas.</Text>
            )}
          </>
        )}
      </ScrollView>

      {/* Barra de Navegación Inferior (Tab Bar) */}
      <View className="flex-row justify-around items-center bg-white border-t border-gris-acento pt-2 pb-4 shadow-xl">
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('NurseHome')}>
          <Ionicons name="home-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Panel</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('NurseSchedule')}>
          <Ionicons name="calendar" size={24} color={PRIMARY_COLOR} />
          <Text className="text-az-primario text-xs font-semibold">Agenda</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          onPress={() => navigation.navigate('ChatList')}
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