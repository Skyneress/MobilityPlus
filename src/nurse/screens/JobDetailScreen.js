import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

const PRIMARY_COLOR = "#3A86FF"; 
const TEXT_DARK = "#1F2937";
const GRAY_ACCENT = "#E5E7EB";
const ERROR_COLOR = "#EF4444"; 
const SUCCESS_COLOR = "#4CAF50";

// Componente para una sección de información
const DetailSection = ({ title, children }) => (
  <View className="bg-white p-4 rounded-xl shadow-md mb-4 border border-gris-acento">
    <Text className="text-lg font-bold text-az-primario mb-3">{title}</Text>
    {children}
  </View>
);

const JobDetailScreen = ({ navigation, route }) => {
  const appointment = route.params?.appointment; 

  const [loadingAccept, setLoadingAccept] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);

  // Lógica para Aceptar el trabajo
  const handleAcceptJob = async () => {
    if (!appointment) return;
    setLoadingAccept(true);

    try {
      const appointmentRef = doc(db, "citas", appointment.id);
      await updateDoc(appointmentRef, {
        status: 'aceptada', // <-- CAMBIO DE ESTADO
        updatedAt: serverTimestamp()
      });
      
      Alert.alert('Cita Aceptada', 'El paciente será notificado. Ahora comienza tu viaje.');
      navigation.navigate('NurseHome'); // Volvemos al panel
      
    } catch (error) {
      console.error("Error al aceptar la cita: ", error);
      Alert.alert("Error", "No se pudo actualizar el estado de la cita.");
    } finally {
      setLoadingAccept(false);
    }
  };

  // Lógica para RECHAZAR el trabajo (CORREGIDA)
  const handleRejectJob = async () => {
    if (!appointment) return;
    // IMPORTANTE: NO llamamos a setLoadingReject(true) aquí. Lo hacemos solo si el usuario confirma.

    Alert.alert(
      "Rechazar Solicitud", 
      "¿Estás seguro de que quieres rechazar este servicio? El paciente será notificado.",
      [
        // Opción 1: CANCELAR
        { 
          text: "Cancelar", 
          style: "cancel", 
          // Si el usuario cancela, no hacemos nada con el estado de carga, 
          // ya que no lo activamos aún. Esto resuelve el problema.
        },
        // Opción 2: SÍ, RECHAZAR
        { 
          text: "Sí, Rechazar", 
          style: "destructive",
          onPress: async () => {
            // Activamos la carga SÓLO si el usuario confirma el rechazo.
            setLoadingReject(true); 

            try {
              const appointmentRef = doc(db, "citas", appointment.id);
              await updateDoc(appointmentRef, {
                status: 'rechazada', // <-- CAMBIO DE ESTADO
                updatedAt: serverTimestamp()
              });
              Alert.alert('Solicitud Rechazada', 'El paciente ha sido notificado.');
              navigation.navigate('NurseHome'); // Vuelve al panel
            } catch (error) {
              console.error("Error al rechazar la cita: ", error);
              Alert.alert("Error", "No se pudo rechazar la cita.");
            } finally {
              // Desactivamos la carga al finalizar la operación.
              setLoadingReject(false);
            }
          }
        }
      ]
    );
  };

  // 💡 VALIDACIÓN DE ERROR (PARA EL CASO DE QUE NO SE PASEN LOS PARÁMETROS)
  if (!appointment) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-fondo-claro p-4">
        <Ionicons name="alert-circle-outline" size={40} color={ERROR_COLOR} />
        <Text className="text-xl font-bold text-texto-oscuro mt-4 text-center">
          Error: Solicitud no encontrada.
        </Text>
        <Text className="text-gray-500 mt-2 text-center">
          Asegúrate de que la cita se cargó correctamente desde el panel.
        </Text>
        <TouchableOpacity 
          className="bg-az-primario rounded-full py-2 px-4 mt-6"
          onPress={() => navigation.navigate('NurseHome')}
        >
          <Text className="text-texto-claro font-semibold">Volver al Panel</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Renderizado con datos reales
  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
      
      {/* Encabezado */}
      <View className="flex-row items-center px-4 py-5 bg-az-primario rounded-b-lg shadow-md">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        {/* Usamos optional chaining para asegurar que 'id' exista antes de substring */}
        <Text className="text-xl font-bold text-texto-claro ml-4">Solicitud #{appointment.id?.substring(0, 6)}</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        
        {/* Ubicación del Servicio (sin Mapa - Texto) */}
        <DetailSection title="Ubicación del Servicio">
          <View className="flex-row items-center mb-2">
            <Ionicons name="location-outline" size={20} color={TEXT_DARK} />
            <Text className="text-base text-texto-oscuro ml-2 font-medium">{appointment.address}</Text>
          </View>
          
          {/* MARCADOR DE MAPA (QUITADO) */}
          <View className="w-full h-32 bg-gris-acento rounded-lg items-center justify-center mt-2">
            <Text className="text-gray-500 text-lg">Mapa de Ruta Aquí</Text>
            <Text className="text-sm text-gray-400">(Funcionalidad omitida)</Text>
          </View>
        </DetailSection>

        {/* Detalles del Paciente (Datos Reales) */}
        <DetailSection title="Detalles del Paciente">
          <InfoRow icon="person-outline" label="Nombre" value={appointment.patientName} />
          <InfoRow icon="call-outline" label="Contacto" value={appointment.patientPhoneNumber || "No disponible"} />
          <InfoRow icon="cash-outline" label="Tarifa Estimada" value={`$${appointment.price} CLP`} />
        </DetailSection>
        
        {/* Detalles del Servicio (Datos Reales) */}
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

      {/* Botones de Acción Flotantes (Aceptar y Rechazar) */}
      <View className="absolute bottom-0 w-full p-4 bg-white border-t border-gris-acento shadow-xl">
        <View className="flex-row justify-between space-x-3">
          
          {/* Botón RECHAZAR */}
          <TouchableOpacity
            className="bg-error-rojo/10 rounded-full py-4 flex-1 items-center border border-error-rojo"
            onPress={handleRejectJob}
            disabled={loadingReject || loadingAccept}
          >
            {loadingReject ? (
              <ActivityIndicator color={ERROR_COLOR} />
            ) : (
              <Text className="text-error-rojo text-lg font-bold">Rechazar</Text>
            )}
          </TouchableOpacity>

          {/* Botón ACEPTAR */}
          <TouchableOpacity
            className="bg-az-primario rounded-full py-4 flex-1 items-center shadow-lg"
            onPress={handleAcceptJob}
            disabled={loadingReject || loadingAccept}
          >
            {loadingAccept ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-texto-claro text-lg font-bold">Aceptar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      
    </SafeAreaView>
  );
};

// Componente auxiliar reutilizado
const InfoRow = ({ icon, label, value, onPress }) => (
  <TouchableOpacity 
    className="flex-row items-center justify-between py-2"
    onPress={onPress}
    disabled={!onPress}
  >
    <View className="flex-row items-center flex-1">
      <Ionicons name={icon} size={20} color="#6B7280" />
      <View className="ml-4">
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