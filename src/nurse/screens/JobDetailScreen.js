import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import FontAwesome from 'react-native-vector-icons/FontAwesome'; // Importamos FontAwesome para las estrellas
// 💡 1. Importar funciones de Firestore
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

const PRIMARY_COLOR = "#3A86FF"; 
const TEXT_DARK = "#1F2937";
// 💡 Añadimos el color de éxito para el nuevo botón
const SUCCESS_COLOR = "#4CAF50"; 

// Componente para una sección de información
const DetailSection = ({ title, children }) => (
  <View className="bg-white p-4 rounded-xl shadow-md mb-4 border border-gris-acento">
    <Text className="text-lg font-bold text-az-primario mb-3">{title}</Text>
    {children}
  </View>
);

const JobDetailScreen = ({ navigation, route }) => {
  // 💡 2. Obtener los parámetros de la ruta
  const { appointmentId, patientUid } = route.params;

  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null); // Estado para la cita real

  // 💡 3. useEffect para cargar los datos de la cita
  useEffect(() => {
    if (!appointmentId) return;

    const fetchAppointment = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "citas", appointmentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setAppointment({ id: docSnap.id, ...docSnap.data() });
        } else {
          Alert.alert("Error", "No se encontró la solicitud de cita.");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error al cargar la cita: ", error);
        Alert.alert("Error", "No se pudo cargar la información de la cita.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]); // Se ejecuta cada vez que el ID de la cita cambia

  // 💡 4. Lógica para Aceptar el trabajo e Iniciar el viaje
  const handleStartTrip = async () => {
    if (!appointment) return;

    Alert.alert(
      "Confirmar Inicio", 
      `¿Confirmas que aceptas el servicio para ${appointment.patientName} y comienzas el viaje?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Confirmar e Iniciar", 
          onPress: async () => {
            try {
              // Actualizamos el estado de la cita a 'aceptada'
              const appointmentRef = doc(db, "citas", appointment.id);
              await updateDoc(appointmentRef, {
                status: 'aceptada',
                updatedAt: serverTimestamp()
              });
              
              Alert.alert('Viaje Iniciado', 'La cita ha sido aceptada. El paciente será notificado.');
              // Actualizamos el estado local para que el botón cambie
              setAppointment(prev => ({ ...prev, status: 'aceptada' })); 
              
            } catch (error) {
              console.error("Error al aceptar la cita: ", error);
              Alert.alert("Error", "No se pudo actualizar el estado de la cita.");
            }
          }
        }
      ]
    );
  };

  // 💡 5. NUEVA FUNCIÓN: Navegar para completar el trabajo
  const handleGoToComplete = () => {
    // Navegamos a la pantalla de bitácora
    navigation.navigate('CompleteJob', {
      appointmentId: appointment.id,
      patientUid: appointment.patientUid,
      serviceType: appointment.serviceType,
      patientName: appointment.patientName
    });
  };


  // 💡 6. Pantalla de carga mientras se buscan los datos
  if (loading || !appointment) {
    return (
      <SafeAreaView className="flex-1 bg-fondo-claro justify-center items-center">
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text className="mt-4 text-texto-oscuro">Cargando detalles de la solicitud...</Text>
      </SafeAreaView>
    );
  }

  // 💡 7. Renderizado con datos reales
  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
      
      {/* Encabezado */}
      <View className="flex-row items-center px-4 py-5 bg-az-primario rounded-b-lg shadow-md">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-texto-claro ml-4">Solicitud #{appointment.id.substring(0, 6)}</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        
        {/* Ubicación del Servicio */}
        <DetailSection title="Ubicación del Servicio">
          <View className="flex-row items-center mb-2">
            <Ionicons name="location-outline" size={20} color={TEXT_DARK} />
            <Text className="text-base text-texto-oscuro ml-2 font-medium">{appointment.address}</Text>
          </View>
          
          <View className="w-full h-32 bg-gris-acento rounded-lg items-center justify-center mt-2">
             <Text className="text-gray-500 text-lg">Mapa de Ruta Aquí</Text>
          </View>
        </DetailSection>

        {/* Detalles del Paciente */}
        <DetailSection title="Detalles del Paciente">
          <InfoRow icon="person-outline" label="Nombre" value={appointment.patientName} />
          {/* <InfoRow icon="call-outline" label="Contacto" value={appointment.phone} onPress={() => Alert.alert("Llamar", `Llamando a ${appointment.patientName}`)} /> */}
          <InfoRow icon="cash-outline" label="Tarifa Estimada" value={`$${appointment.price} CLP`} />
        </DetailSection>
        
        {/* Detalles del Servicio */}
        <DetailSection title="Detalles del Servicio">
          <InfoRow icon="bandage-outline" label="Tipo de Servicio" value={appointment.serviceType} />
          <InfoRow icon="time-outline" label="Hora Programada" value={appointment.requestedDate} />
          
          <Text className="text-base font-semibold text-texto-oscuro mt-4 mb-2">Notas Médicas:</Text>
          <Text className="text-sm text-gray-600 border border-gris-acento p-3 rounded-lg bg-fondo-claro">
            {appointment.notes || "Sin notas adicionales."}
          </Text>
        </DetailSection>

        <View className="h-24" /> 
        
      </ScrollView>

      {/* 💡 8. BOTÓN DE ACCIÓN FLOTANTE (Lógica actualizada) */}
      <View className="absolute bottom-0 w-full p-4 bg-white border-t border-gris-acento shadow-xl">
        
        {/* Si el status es 'pendiente', mostramos el botón de Aceptar */}
        {appointment.status === 'pendiente' && (
          <TouchableOpacity
            className="rounded-full py-4 shadow-lg items-center bg-az-primario"
            onPress={handleStartTrip}
          >
            <Text className="text-texto-claro text-lg font-bold">
              <Ionicons name="navigate-circle-outline" size={20} color="#FFFFFF" /> 
              Aceptar e Iniciar Viaje
            </Text>
          </TouchableOpacity>
        )}

        {/* Si el status es 'aceptada', mostramos los botones de Finalizar y Chat */}
        {appointment.status === 'aceptada' && (
          <View className="flex-row justify-between items-center space-x-3">
            <TouchableOpacity
              className="bg-gray-200 p-4 rounded-full"
              onPress={() => navigation.navigate('Chat', { 
                  contactName: appointment.patientName, 
                  contactRole: 'Paciente' 
              })}
            >
              <Ionicons name="chatbubbles-outline" size={24} color={TEXT_DARK} />
            </TouchableOpacity>

            <TouchableOpacity
              // Usamos el color de éxito
              className="bg-exito-verde rounded-full py-4 shadow-lg items-center flex-1"
              onPress={handleGoToComplete} // <-- Navega a la pantalla de Bitácora
            >
              <Text className="text-texto-claro text-lg font-bold">
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" /> 
                Finalizar Servicio
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
    </SafeAreaView>
  );
};

// Componente auxiliar reutilizado (Corregido para mostrar el Label)
const InfoRow = ({ icon, label, value, onPress }) => (
  <TouchableOpacity 
    className="flex-row items-center justify-between py-2"
    onPress={onPress}
    disabled={!onPress}
  >
    <View className="flex-row items-center flex-1">
      <Ionicons name={icon} size={20} color="#6B7280" />
      <View className="ml-4">
        {/* 💡 Corrección: Añadimos el Label aquí */}
        {label && <Text className="text-xs text-gray-500">{label}</Text>}
        <Text className="text-base font-medium text-texto-oscuro">{value}</Text>
      </View>
    </View>
    {onPress && (
        <Ionicons name="chevron-forward-outline" size={24} color="#6B7280" />
    )}
  </TouchableOpacity>
);

export default JobDetailScreen;