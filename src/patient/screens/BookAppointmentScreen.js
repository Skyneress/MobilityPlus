import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Alert, 
  TextInput,
  ActivityIndicator,
  Platform
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import { Picker } from '@react-native-picker/picker';
// Importamos las funciones de Firestore para crear la cita
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
// Importamos el hook de autenticación para saber QUÉ paciente está reservando
import { useAuth } from '../../context/AuthContext';

const PRIMARY_COLOR = "#3A86FF"; 
const TEXT_DARK = "#1F2937";
const PLACEHOLDER_COLOR = "#9ca3af";

const BookAppointmentScreen = ({ route, navigation }) => {
  // 1. Recibir datos del profesional desde la pantalla anterior
  const { professional } = route.params; 
  const { userId } = useAuth(); // Obtenemos el ID del paciente logueado

  // 2. Estados del formulario
  const [selectedService, setSelectedService] = useState(professional.serviciosOfrecidos[0] || '');
  const [appointmentDate, setAppointmentDate] = useState(''); // Ej: "20 de Noviembre"
  const [appointmentTime, setAppointmentTime] = useState(''); // Ej: "14:30 PM"
  const [medicalNotes, setMedicalNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // 3. Lógica para crear la cita en Firestore
  const handleConfirmBooking = async () => {
    if (!userId) {
      Alert.alert("Error", "No se pudo identificar al usuario. Intenta iniciar sesión de nuevo.");
      return;
    }
    
    if (!selectedService || !appointmentDate || !appointmentTime) {
      Alert.alert("Campos incompletos", "Por favor, selecciona un servicio, fecha y hora.");
      return;
    }

    setBookingLoading(true);

    try {
      // 4. Creamos el documento en la colección "citas"
      // (Firestore la creará si no existe)
      const newAppointment = {
        patientUid: userId,
        nurseUid: professional.id, // ID del profesional
        
        // Nombres (para mostrar fácil en las listas)
        patientName: 'Nombre Paciente (Pendiente)', // Lo ideal es tomarlo del AuthContext
        nurseName: `${professional.nombre} ${professional.apellido}`,
        
        serviceType: selectedService,
        price: professional.precioConsulta,
        
        address: 'Dirección Paciente (Pendiente)', // Tomar de user.direccion
        notes: medicalNotes,
        
        // Tiempos y Estado
        requestedDate: `${appointmentDate} - ${appointmentTime}`,
        createdAt: serverTimestamp(),
        status: 'pendiente' // Estados: pendiente -> aceptada -> completada -> cancelada
      };

      await addDoc(collection(db, "citas"), newAppointment);

      setBookingLoading(false);
      Alert.alert(
        "¡Solicitud Enviada!",
        `Tu solicitud de cita con ${professional.nombre} ha sido enviada. Serás notificado cuando la acepte.`
      );
      // Regresamos al Home (o al historial de citas)
      navigation.navigate('PatientHome'); 

    } catch (error) {
      console.error("Error al crear la cita: ", error);
      setBookingLoading(false);
      Alert.alert("Error", "No se pudo crear la cita. Intenta de nuevo.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-fondo-claro">
      {/* Encabezado */}
      <View className="flex-row items-center px-4 py-5 bg-az-primario rounded-b-lg shadow-md">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-texto-claro ml-4">Reservar Cita</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        
        {/* Resumen del Profesional */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-sm text-gray-500 mb-1">Estás reservando con:</Text>
          <Text className="text-xl font-bold text-texto-oscuro">{professional.nombre} {professional.apellido}</Text>
          <Text className="text-base text-az-primario">{professional.especialidadNombre || professional.especialidad}</Text>
        </View>
        
        {/* 1. Selección de Servicio */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-lg font-bold text-az-primario mb-3">1. Selecciona el Servicio</Text>
          <View className="w-full border border-gris-acento rounded-lg bg-fondo-claro overflow-hidden">
            <Picker
              selectedValue={selectedService}
              onValueChange={(itemValue) => setSelectedService(itemValue)}
              style={{ height: 50, color: TEXT_DARK }} 
              itemStyle={{ color: TEXT_DARK }}
            >
              {professional.serviciosOfrecidos.map((servicio, index) => (
                  <Picker.Item key={index} label={servicio} value={servicio} />
              ))}
            </Picker>
          </View>
        </View>

        {/* 2. Fecha y Hora */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-lg font-bold text-az-primario mb-3">2. Elige Fecha y Hora</Text>
          <Text className="text-xs text-gray-500 mb-2">(En una app real, usaríamos un calendario. Por ahora, usa texto)</Text>
          
          <TextInput
            className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-fondo-claro text-texto-oscuro mb-3"
            placeholder="Fecha (Ej: Lunes 20 de Noviembre)"
            placeholderTextColor={PLACEHOLDER_COLOR}
            value={appointmentDate}
            onChangeText={setAppointmentDate}
          />
          <TextInput
            className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-fondo-claro text-texto-oscuro"
            placeholder="Hora (Ej: 14:30 PM)"
            placeholderTextColor={PLACEHOLDER_COLOR}
            value={appointmentTime}
            onChangeText={setAppointmentTime}
          />
        </View>
        
        {/* 3. Notas Adicionales */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-lg font-bold text-az-primario mb-3">3. Notas Adicionales (Opcional)</Text>
          <TextInput
            className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-fondo-claro text-texto-oscuro h-24"
            placeholder="Describe brevemente tu necesidad..."
            placeholderTextColor={PLACEHOLDER_COLOR}
            multiline
            textAlignVertical="top"
            value={medicalNotes}
            onChangeText={setMedicalNotes}
          />
        </View>

        {/* Resumen de Costo */}
        <View className="flex-row justify-between items-center bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-lg font-bold text-texto-oscuro">Costo del Servicio:</Text>
          <Text className="text-xl font-bold text-exito-verde">${professional.precioConsulta || 0} CLP</Text>
        </View>

        {/* Espacio para el botón flotante */}
        <View className="h-24" />

      </ScrollView>

      {/* Botón de Acción Flotante */}
      <View className="w-full p-4 bg-white border-t border-gris-acento shadow-xl">
        <TouchableOpacity
          className="bg-az-primario rounded-full py-4 shadow-lg items-center"
          onPress={handleConfirmBooking}
          disabled={bookingLoading}
        >
          {bookingLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-texto-claro text-lg font-bold">
              Confirmar Solicitud
            </Text>
          )}
        </TouchableOpacity>
      </View>
      
    </SafeAreaView>
  );
};

export default BookAppointmentScreen;