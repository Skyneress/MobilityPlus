import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useAuth } from '../../context/AuthContext';

const PRIMARY_COLOR = "#3A86FF"; 
const TEXT_DARK = "#1F2937";
const GRAY_ACCENT = "#E5E7EB";

// 💡 1. CORRECCIÓN: Añadida la variable 'isAccepted'
const AppointmentCard = ({ appointment, onCancel, onReview, onChat }) => {
  const isPending = appointment.status === 'pendiente'; // <-- Ajustado (solo pendiente)
  const isAccepted = appointment.status === 'aceptada'; // <-- ¡LA LÍNEA QUE FALTABA!
  const isCompleted = appointment.status === 'completada';
  const isCanceled = appointment.status === 'cancelada';
  const isRated = appointment.status === 'calificada'; 

  let statusText = 'Pendiente';
  let statusColor = 'text-advertencia-naranja';
  if (isCompleted) {
    statusText = 'Completado';
    statusColor = 'text-exito-verde';
  } else if (isCanceled) {
    statusText = 'Cancelado';
    statusColor = 'text-error-rojo';
  } else if (isAccepted) {
    statusText = 'Aceptada';
    statusColor = 'text-blue-500';
  } else if (isRated) {
    statusText = 'Calificada';
    statusColor = 'text-gray-500';
  }


  return (
    <View className="bg-white p-4 rounded-xl shadow-md mb-3 border border-gris-acento">
      <View className="flex-row justify-between items-start mb-3 border-b border-gris-acento/50 pb-2">
        <View>
          <Text className="text-sm text-gray-500">{appointment.requestedDate}</Text>
          <Text className="text-lg font-bold text-texto-oscuro mt-1">{appointment.serviceType}</Text>
        </View>
        <Text className={`text-sm font-semibold ${statusColor}`}>{statusText}</Text>
      </View>
      
      <View className="flex-row justify-between items-center">
        <TouchableOpacity onPress={() => onChat(appointment)}>
          <Text className="text-sm text-gray-600">Profesional:</Text>
          <View className="flex-row items-center">
            <Text className="text-base font-semibold text-az-primario">{appointment.nurseName}</Text>
            <Ionicons name="chatbubble-ellipses-outline" size={16} color={PRIMARY_COLOR} className="ml-2" />
          </View>
        </TouchableOpacity>
        
        {/* Botones de Acción */}
        <View className="flex-row space-x-2">
          {/* Mostramos Cancelar si está pendiente O aceptada */}
          {(isPending || isAccepted) && (
            <TouchableOpacity 
              className="bg-error-rojo/10 px-3 py-2 rounded-full border border-error-rojo"
              onPress={() => onCancel(appointment.id)}
            >
              <Text className="text-error-rojo text-xs font-semibold">Cancelar</Text>
            </TouchableOpacity>
          )}
          {/* Mostramos Review solo si está completada (y no calificada) */}
          {isCompleted && (
            <TouchableOpacity 
              className="bg-az-primario/10 px-3 py-2 rounded-full border border-az-primario/20"
              onPress={() => onReview(appointment)} // Pasamos la cita completa
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
  const { userId } = useAuth(); 
  const [tab, setTab] = useState('pending'); 
  const [loading, setLoading] = useState(true);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [completedAppointments, setCompletedAppointments] = useState([]);

  // useEffect para escuchar las citas en tiempo real
  useEffect(() => {
    if (!userId) return; 
    setLoading(true);
    
    // Consulta para citas PENDIENTES o ACEPTADAS
    const qPending = query(
      collection(db, "citas"),
      where("patientUid", "==", userId), 
      where("status", "in", ["pendiente", "aceptada"]), 
      orderBy("createdAt", "desc")
    );
    
    // Consulta para citas COMPLETADAS, CANCELADAS o CALIFICADAS (Historial)
    const qHistory = query(
      collection(db, "citas"),
      where("patientUid", "==", userId), 
      where("status", "in", ["completada", "cancelada", "calificada"]), 
      orderBy("createdAt", "desc")
    );

    // Oyente para pendientes
    const unsubscribePending = onSnapshot(qPending, (querySnapshot) => {
      const appointments = [];
      querySnapshot.forEach((doc) => {
        appointments.push({ id: doc.id, ...doc.data() });
      });
      setPendingAppointments(appointments);
      setLoading(false); 
    }, (error) => {
      console.error("Error al cargar citas pendientes: ", error);
    });

    // Oyente para historial
    const unsubscribeHistory = onSnapshot(qHistory, (querySnapshot) => {
      const appointments = [];
      querySnapshot.forEach((doc) => {
        appointments.push({ id: doc.id, ...doc.data() });
      });
      setCompletedAppointments(appointments);
    }, (error) => {
      console.error("Error al cargar historial: ", error);
    });

    return () => {
      unsubscribePending();
      unsubscribeHistory();
    };
  }, [userId]); 

  // Lógica de Cancelación (ya funciona en web y nativo)
  const handleCancel = (id) => {
    
    const cancelInFirebase = async () => {
      try {
        const appointmentRef = doc(db, "citas", id);
        await updateDoc(appointmentRef, { status: 'cancelada' });
        Alert.alert("Éxito", "Tu cita ha sido cancelada.");
      } catch (error) {
        console.error("Error al cancelar la cita: ", error);
        Alert.alert("Error", "No se pudo cancelar la cita. Intenta de nuevo.");
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm("¿Estás seguro de que quieres cancelar esta cita?")) {
        cancelInFirebase();
      }
    } else {
      Alert.alert(
        "Confirmar Cancelación", 
        "¿Estás seguro de que quieres cancelar esta cita?", 
        [
          { text: "No", style: "cancel" },
          { text: "Sí, Cancelar", style: "destructive", onPress: cancelInFirebase }
        ]
      );
    }
  };
  
  // 💡 Lógica de Review ACTUALIZADA
  const handleReview = (appointment) => {
    // Navegamos a la pantalla de Rating que ya creaste
    navigation.navigate('Rating', {
      appointmentId: appointment.id,
      professionalId: appointment.nurseUid,
      professionalName: appointment.nurseName
    });
  };

  // 💡 Lógica de Chat (Añadida)
  const handleChat = (appointment) => {
    navigation.navigate('Chat', {
      chatWithUser: {
        id: appointment.nurseUid, // El ID del enfermero
        name: appointment.nurseName,
        role: 'Profesional' 
      }
    });
  };

  // ------------------------- RENDERIZADO -------------------------
  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
      
      {/* Encabezado */}
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
          
          {loading ? (
             <ActivityIndicator size="large" color={PRIMARY_COLOR} className="mt-10" />
          ) : (
            <>
              {tab === 'pending' && (
                <>
                  {pendingAppointments.length === 0 ? (
                    <Text className="text-center text-gray-500 mt-10">¡Genial! No tienes citas pendientes.</Text>
                  ) : (
                    pendingAppointments.map(app => (
                      <AppointmentCard 
                        key={app.id} 
                        appointment={app} 
                        onCancel={handleCancel}
                        onChat={handleChat} 
                      />
                    ))
                  )}
                </>
              )}

              {tab === 'completed' && (
                <>
                  {completedAppointments.length === 0 ? (
                    <Text className="text-center text-gray-500 mt-10">Aún no tienes historial de citas.</Text>
                  ) : (
                    completedAppointments.map(app => (
                      <AppointmentCard 
                        key={app.id} 
                        appointment={app} 
                        onReview={handleReview} 
                        onChat={handleChat}
                      />
                    ))
                  )}
                </>
              )}
            </>
          )}

        </View>
      </ScrollView>

      {/* Barra de Navegación Inferior (Tab Bar) */}
      <View className="flex-row justify-around items-center bg-white border-t border-gris-acento pt-2 pb-4 shadow-xl">
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('PatientHome')}>
          <Ionicons name="home-outline" size={24} color="#9ca3af" />
          <Text className="text-gray-400 text-xs">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate('PatientHistory')}>
          <Ionicons name="calendar" size={24} color={PRIMARY_COLOR} />
          <Text className="text-az-primario text-xs font-semibold">Citas</Text>
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

export default PatientHistoryScreen;