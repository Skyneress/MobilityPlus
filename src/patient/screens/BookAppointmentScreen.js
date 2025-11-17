import React, { useState, useEffect } from 'react';
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
import { collection, addDoc, serverTimestamp, GeoPoint } from 'firebase/firestore'; 
import { db } from '../../config/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';

const PRIMARY_COLOR = "#3A86FF"; 
const TEXT_DARK = "#1F2937";
const PLACEHOLDER_COLOR = "#9ca3af";

const BookAppointmentScreen = ({ route, navigation }) => {
  const { professional } = route.params; 
  // 💡 Obtenemos el perfil del AuthContext
  const { userId, userProfile } = useAuth(); 

  // Estados de Ubicación
  const [address, setAddress] = useState(userProfile?.direccion || ''); 
  const [locationCoords, setLocationCoords] = useState(null); 
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState('pending'); // Nueva bandera

  // Estados de Formulario
  const [selectedService, setSelectedService] = useState(professional.serviciosOfrecidos[0] || '');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Estados para Fecha y Hora (nativos)
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  // Para Web (Inputs de Texto)
  const [appointmentDateText, setAppointmentDateText] = useState(''); 
  const [appointmentTimeText, setAppointmentTimeText] = useState(''); 

  // --- Funciones del Calendario Nativo ---
  const onChangeNative = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === 'ios' ? true : false); 
    if (event.type === 'set' && selectedDate) {
      setDate(currentDate);
      // Opcional: Actualizar textos para la UI
      setAppointmentDateText(currentDate.toLocaleDateString('es-ES'));
      setAppointmentTimeText(currentDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
    }
  };

  const showMode = (currentMode) => {
    setShowPicker(true);
    setPickerMode(currentMode);
  };
  const showDatepicker = () => showMode('date');
  const showTimepicker = () => showMode('time');
  // --- FIN Funciones Calendario Nativo ---


  // Función de GPS (Actualizada para usar el estado)
  const handleGetLocation = async () => {
    setLoadingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus('denied');
        Alert.alert('Permiso denegado', 'Se necesita permiso de ubicación para obtener tu dirección actual.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;
      setLocationCoords(new GeoPoint(latitude, longitude)); 

      let addressResult = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (addressResult.length > 0) {
        const { street, city, region } = addressResult[0];
        const formattedAddress = `${street}, ${city}, ${region}`;
        setAddress(formattedAddress); 
      }
      setLocationStatus('success');

    } catch (error) {
      console.error("Error al obtener ubicación:", error);
      setLocationStatus('error');
      Alert.alert("Error", "No se pudo obtener la ubicación.");
    } finally {
      setLoadingLocation(false);
    }
  };
  
  // useEffect para iniciar la búsqueda de ubicación
  useEffect(() => {
      // Si la plataforma no es web, iniciamos la búsqueda de ubicación al cargar
      if (Platform.OS !== 'web') {
          handleGetLocation();
      } else {
          // En web, asumimos 'success' por defecto para que el usuario pueda escribir manualmente
          setLocationStatus('success');
      }
  }, []); 

  // Lógica de creación de cita (ACTUALIZADA)
  const handleConfirmBooking = async () => {
    if (!userId) { Alert.alert("Error", "No se pudo identificar al usuario."); return; }
    
    // 💡 1. Determinación de la Fecha/Hora Final (Web vs Nativo)
    let finalTimestamp = date; 
    let finalRequestedDate = date.toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });

    if (Platform.OS === 'web') {
      if (!appointmentDateText || !appointmentTimeText) {
         Alert.alert("Campos incompletos", "Por favor, ingresa fecha y hora.");
         return;
      }
      finalRequestedDate = `${appointmentDateText} - ${appointmentTimeText}`;
      finalTimestamp = serverTimestamp(); // Usamos la hora del servidor en web
    }
    
    // 💡 2. Validación final (incluye la verificación de ubicación)
    if (!selectedService || !finalRequestedDate || !address) {
      Alert.alert("Campos incompletos", "Por favor, completa todos los campos.");
      return;
    }
    if (Platform.OS !== 'web' && locationStatus !== 'success') {
        Alert.alert("Error de Ubicación", "Por favor, espera a que el GPS obtenga tu ubicación o reintenta.");
        return;
    }

    setBookingLoading(true);

    try {
      const newAppointment = {
        patientUid: userId,
        nurseUid: professional.id, 
        
        patientName: `${userProfile?.nombre} ${userProfile?.apellido}` || 'Paciente',
        nurseName: `${professional.nombre} ${professional.apellido}`,
        
        serviceType: selectedService,
        price: professional.precioConsulta,
        
        address: address, 
        location: locationCoords, // Guardamos las coordenadas (solo si se usó el GPS)
        
        notes: medicalNotes,
        appointmentTimestamp: finalTimestamp,
        requestedDate: finalRequestedDate,
        createdAt: serverTimestamp(),
        status: 'pendiente'
      };

      await addDoc(collection(db, "citas"), newAppointment);

      setBookingLoading(false);
      Alert.alert("¡Solicitud Enviada!", `Tu solicitud ha sido enviada.`);
      navigation.navigate('PatientHome'); 

    } catch (error) {
      console.error("Error al crear la cita: ", error);
      setBookingLoading(false);
      Alert.alert("Error", "No se pudo crear la cita.");
    }
  };
  
  // Helper para mostrar el estado del GPS
  const getLocationIcon = () => {
    switch (locationStatus) {
        case 'success': return <Ionicons name="location-sharp" size={20} color="#10B981" />; // Verde (Éxito)
        case 'fetching': return <ActivityIndicator size="small" color={PRIMARY_COLOR} />;
        case 'denied': case 'error': return <Ionicons name="warning" size={20} color="#EF4444" />; // Rojo (Error/Denegado)
        case 'pending': default: return <Ionicons name="navigate-circle-outline" size={20} color="#F59E0B" />; // Amarillo (Pendiente)
    }
  }

  const getLocationText = () => {
    switch (locationStatus) {
        case 'success': return `Ubicación obtenida. Listo.`;
        case 'fetching': return 'Obteniendo ubicación actual...';
        case 'denied': return 'Permiso denegado. Ingresa manualmente.';
        case 'error': return 'Error al obtener ubicación. Reintenta.';
        case 'pending': default: return 'Esperando permiso de ubicación...';
    }
  }


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

        {/* 💡 6. Fecha y Hora (CON LÓGICA DE PLATAFORMA) */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-lg font-bold text-az-primario mb-3">2. Elige Fecha y Hora</Text>
          
          {Platform.OS === 'web' ? (
            // --- VERSIÓN WEB (INPUTS DE TEXTO) ---
            <View>
              <Text className="text-xs text-gray-500 mb-2">(Usa formato de texto para Fecha y Hora)</Text>
              <TextInput
                className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-fondo-claro text-texto-oscuro mb-3"
                placeholder="Fecha (Ej: 20 de Noviembre)"
                placeholderTextColor={PLACEHOLDER_COLOR}
                value={appointmentDateText}
                onChangeText={setAppointmentDateText}
              />
              <TextInput
                className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-fondo-claro text-texto-oscuro"
                placeholder="Hora (Ej: 14:30 PM)"
                placeholderTextColor={PLACEHOLDER_COLOR}
                value={appointmentTimeText}
                onChangeText={setAppointmentTimeText}
              />
            </View>
          ) : (
            // --- VERSIÓN NATIVA (BOTONES DE PICKER) ---
            <View className="flex-row justify-between space-x-2">
              <TouchableOpacity 
                onPress={showDatepicker} 
                className="flex-1 bg-fondo-claro border border-gris-acento rounded-lg p-3 items-center"
              >
                <Text className="text-texto-oscuro font-semibold">
                  Fecha: {date.toLocaleDateString('es-ES')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={showTimepicker} 
                className="flex-1 bg-fondo-claro border border-gris-acento rounded-lg p-3 items-center"
              >
                <Text className="text-texto-oscuro font-semibold">
                  Hora: {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 3. Ubicación del Servicio */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-lg font-bold text-az-primario mb-3">3. Ubicación del Servicio</Text>
          
          {/* Input de Dirección (siempre visible para edición) */}
          <TextInput
            className="w-full border border-gris-acento rounded-lg px-4 py-3 bg-fondo-claro text-texto-oscuro mb-3"
            placeholder={Platform.OS === 'web' ? 'Ingresa tu dirección manualmente' : 'Dirección obtenida por GPS o ingresada'}
            placeholderTextColor={PLACEHOLDER_COLOR}
            value={address}
            onChangeText={setAddress}
            // En la web, el botón GPS no aparece, así que no hay problema en escribir
            editable={locationStatus !== 'fetching'} 
          />
          
          {/* Botón GPS - SOLO APARECE EN NATIVO */}
          {Platform.OS !== 'web' && (
            <TouchableOpacity
              className={`rounded-full py-3 mt-3 flex-row justify-center items-center border ${locationStatus === 'success' ? 'bg-green-50 border-green-400' : 'bg-az-primario/10 border-az-primario'}`}
              onPress={handleGetLocation}
              disabled={loadingLocation || locationStatus === 'fetching'}
            >
              {loadingLocation ? (
                <ActivityIndicator color={PRIMARY_COLOR} />
              ) : (
                <>
                  <Ionicons name="locate-outline" size={20} color={locationStatus === 'success' ? '#10B981' : PRIMARY_COLOR} />
                  <Text className={`font-semibold text-base ml-2 ${locationStatus === 'success' ? 'text-green-600' : 'text-az-primario'}`}>
                    {getLocationText()}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
        
        {/* 4. Notas Adicionales */}
        <View className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gris-acento">
          <Text className="text-lg font-bold text-az-primario mb-3">4. Notas Adicionales (Opcional)</Text>
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

        <View className="h-24" />
      </ScrollView>

      {/* 💡 7. El Componente DateTimePicker (oculto) */}
      {/* Esto solo se mostrará en Nativo (iOS/Android) */}
      {showPicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={pickerMode}
          is24Hour={false}
          display="default"
          onChange={onChangeNative}
        />
      )}

      {/* Botón de Acción Flotante */}
      <View className="w-full p-4 bg-white border-t border-gris-acento shadow-xl">
        <TouchableOpacity
          className="bg-az-primario rounded-full py-4 shadow-lg items-center"
          onPress={handleConfirmBooking}
          // En nativo, desactivamos si no hay GPS; en web, solo por el loading
          disabled={bookingLoading || (Platform.OS !== 'web' && locationStatus !== 'success')}
        >
          {bookingLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-texto-claro text-lg font-bold">
              Confirmar Solicitud
            </Text>
          )}
        </TouchableOpacity>
        {Platform.OS !== 'web' && locationStatus !== 'success' && locationStatus !== 'fetching' && (
            <Text className="text-center text-sm text-red-500 mt-2">
                * Se requiere ubicación GPS para confirmar la cita.
            </Text>
        )}
      </View>
      
    </SafeAreaView>
  );
};

export default BookAppointmentScreen;